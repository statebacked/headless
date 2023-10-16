import { useMemo, useState, useEffect, useCallback } from "react";
import { StateBackedClient, errors } from "@statebacked/client";
import { useLocalStorage } from "./useLocalStorage";
import {
  ratingMachineName,
  aggregateRatingMachineName,
} from "../features/unauthenticated-ratings/constants";
import type { Context as AggregateRatingContext } from "../machines/aggregate-rating-machine";
import type { Context as RatingContext } from "../machines/rating-machine";

const defaultLocalStorageKey = "headless-rating-user-id";

export type UseUnauthenticatedRatingProps = {
  orgId: string;
  itemId: string;
  userId?: string;
  localStorageKey?: string;
};

export type UnauthenticatedRating = {
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

export const useUnauthenticatedRating = (
  props: UseUnauthenticatedRatingProps,
): UnauthenticatedRating => {
  const [rating, setRating] = useState<
    "loading" | "unrated" | Error | { count: number; totalRating: number }
  >("loading");
  const [userRating, setUserRating] = useState<
    "loading" | "unrated" | Error | number
  >("loading");
  const [userId] = useLocalStorage(
    props.localStorageKey ?? defaultLocalStorageKey,
    () => props.userId ?? crypto.randomUUID(),
  );
  const client = useMemo(
    () =>
      new StateBackedClient({
        anonymous: {
          orgId: props.orgId,
          getDeviceId() {
            return userId;
          },
          getSessionId() {
            return userId;
          },
        },
      }),
    [props.orgId, userId],
  );

  useEffect(() => {
    const abort = new AbortController();

    (async () => {
      try {
        setRating("loading");
        const ratingState = await client.machineInstances.getOrCreate(
          aggregateRatingMachineName,
          props.itemId,
          () => ({
            context: {
              item: props.itemId,
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
  }, [props.itemId]);

  useEffect(() => {
    const abort = new AbortController();

    (async () => {
      try {
        setUserRating("loading");
        const userRatingState = await client.machineInstances.get(
          ratingMachineName,
          ratingMachineInstanceName({ userId, itemId: props.itemId }),
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
  }, [props.itemId, userId]);

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
        itemId: props.itemId,
      });
      const userRatingState = await client.machineInstances.getOrCreate(
        ratingMachineName,
        instanceName,
        () => ({
          context: {
            item: props.itemId,
            rater: userId,
          },
        }),
      );
      await client.machineInstances.sendEvent(ratingMachineName, instanceName, {
        event: {
          type: "rate",
          item: props.itemId,
          rater: userId,
          rating,
        },
      });
    },
    [rating, userId, props.itemId, userRating],
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
