import { useMemo } from "react";
import { StateBackedClient } from "@statebacked/client";
import { useLocalStorage } from "./useLocalStorage";
import {
  ratingMachineName,
  aggregateRatingMachineName,
} from "../features/unauthenticated-ratings/constants";
import { toValidIdentifier } from "../utils";
import { Rating, useRating } from "./useRating";

const defaultLocalStorageKey = "headless-rating-user-id";

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
  const [userId] = useLocalStorage(
    props.localStorageKey ?? defaultLocalStorageKey,
    () =>
      props.userId ? toValidIdentifier(props.userId) : crypto.randomUUID(),
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

  return useRating({
    ...props,
    client,
    userId,
    ratingMachineName,
    aggregateRatingMachineName,
  })
};
