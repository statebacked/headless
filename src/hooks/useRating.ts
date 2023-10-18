import { useState, useEffect, useCallback } from "react";
import { StateBackedClient, errors } from "@statebacked/client";
import type { Context as AggregateRatingContext } from "../machines/aggregate-rating-machine";
import type { Context as RatingContext } from "../machines/rating-machine";
import { toValidIdentifier } from "../utils";

export type UseRatingProps = {
  client: StateBackedClient;
  itemId: string;
  userId: string;
  ratingMachineName: string;
  aggregateRatingMachineName: string;
};

export type Rating = {
  state: "loading" | "unrated" | "error" | "rated";
  error?: Error;
  rating?: number;
  isLoading: boolean;
  isError: boolean;
  hasRating: boolean;
  hasUserRated: boolean;
  userRating?: number;
  ratingCount?: number;
  rate: (rating: number) => Promise<void>;
};

export const useRating = ({
  client,
  userId,
  ratingMachineName,
  aggregateRatingMachineName,
  ...props
}: UseRatingProps): Rating => {
  const [rating, setRating] = useState<
    "loading" | "unrated" | Error | { count: number; totalRating: number }
  >("loading");
  const [userRating, setUserRating] = useState<
    "loading" | "unrated" | Error | number
  >("loading");

  const itemId = toValidIdentifier(props.itemId);

  useEffect(() => {
    const abort = new AbortController();

    (async () => {
      try {
        setRating("loading");
        const ratingState = await client.machineInstances.getOrCreate(
          aggregateRatingMachineName,
          itemId,
          () => ({
            context: {
              item: itemId,
            },
          }),
          abort.signal,
        );
        const ctx =
          ratingState.publicContext as AggregateRatingContext["public"];
        if (ctx.count === 0) {
          setRating("unrated");
          return;
        }
        setRating({ count: ctx.count, totalRating: ctx.totalRating });
      } catch (e) {
        if (abort.signal.aborted) {
          return;
        }
        setRating(e);
      }
    })();

    return () => {
      abort.abort();
    };
  }, [itemId]);

  useEffect(() => {
    const abort = new AbortController();

    (async () => {
      try {
        setUserRating("loading");
        const userRatingState = await client.machineInstances.get(
          ratingMachineName,
          ratingMachineInstanceName({ userId, itemId }),
          abort.signal,
        );

        const ctx = userRatingState.publicContext as RatingContext["public"];
        setUserRating(ctx.rating);
      } catch (e) {
        if (abort.signal.aborted) {
          return;
        }

        if (e instanceof errors.NotFoundError) {
          setUserRating("unrated");
          return;
        }

        setUserRating(e);
      }
    })();

    return () => {
      abort.abort();
    };
  }, [itemId, userId]);

  const rate = useCallback(
    async (newRating: number) => {
      setUserRating(newRating);
      setRating((rating) => {
        if (
          rating === "loading" ||
          rating === "unrated" ||
          rating instanceof Error
        ) {
          return rating;
        }

        if (typeof userRating === "number") {
          // user has already rated
          return {
            count: rating.count,
            totalRating: rating.totalRating + newRating - userRating,
          };
        }

        // user is rating for the first time
        return {
          count: rating.count + 1,
          totalRating: rating.totalRating + newRating,
        };
      });

      const instanceName = ratingMachineInstanceName({
        userId,
        itemId,
      });
      const userRatingState = await client.machineInstances.getOrCreate(
        ratingMachineName,
        instanceName,
        () => ({
          context: {
            item: itemId,
            rater: userId,
          },
        }),
      );
      await client.machineInstances.sendEvent(ratingMachineName, instanceName, {
        event: {
          type: "rate",
          item: itemId,
          rater: userId,
          rating: newRating,
        },
      });
    },
    [rating, userId, itemId, userRating],
  );

  const state =
    rating === "loading"
      ? "loading"
      : rating === "unrated"
      ? "unrated"
      : rating instanceof Error
      ? "error"
      : "rated";

  return {
    state,
    hasRating: state === "rated",
    isError: state === "error",
    isLoading: state === "loading",
    error: rating instanceof Error ? rating : undefined,
    rating:
      typeof rating === "object" && !(rating instanceof Error)
        ? rating.totalRating / rating.count
        : undefined,
    ratingCount:
      typeof rating === "object" && !(rating instanceof Error)
        ? rating.count
        : undefined,
    hasUserRated: typeof userRating === "number",
    userRating: typeof userRating === "number" ? userRating : undefined,
    rate,
  };
};

const ratingMachineInstanceName = ({
  userId,
  itemId,
}: {
  userId: string;
  itemId: string;
}) => `${userId}-${itemId}`;
