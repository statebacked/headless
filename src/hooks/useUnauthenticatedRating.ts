import { useMemo } from "react";
import { StateBackedClient } from "@statebacked/client";
import {
  ratingMachineName,
  aggregateRatingMachineName,
} from "../features/unauthenticated-rating/constants";
import { Rating, useRating } from "./useRating";
import { useUserId } from "./useUserId";

export type UseUnauthenticatedRatingProps = {
  orgId: string;
  itemId: string;
  userId?: string;
  localStorageKey?: string;
};

export type UnauthenticatedRating = Rating;

export const useUnauthenticatedRating = (
  props: UseUnauthenticatedRatingProps,
): UnauthenticatedRating => {
  const userId = useUserId({
    localStorageKey: props.localStorageKey,
    userId: props.userId,
  });

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

  return useRating({
    ...props,
    client,
    userId,
    ratingMachineName,
    aggregateRatingMachineName,
  });
};
