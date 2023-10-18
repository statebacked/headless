import {
  ratingMachineName,
  aggregateRatingMachineName,
} from "../features/unauthenticated-rating/constants";
import { Rating, useRating } from "./useRating";
import { useUserId } from "./useUserId";
import { useUnauthenticatedClient } from "./useUnauthenticatedClient";

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

  const client = useUnauthenticatedClient({
    orgId: props.orgId,
    userId,
    localStorageKey: props.localStorageKey,
  });

  return useRating({
    ...props,
    client,
    userId,
    ratingMachineName,
    aggregateRatingMachineName,
  });
};
