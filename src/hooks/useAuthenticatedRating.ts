import { useMemo } from "react";
import { StateBackedClient } from "@statebacked/client";
import {
  ratingMachineName,
  aggregateRatingMachineName,
} from "../features/authenticated-rating/constants";
import { Rating, useRating } from "./useRating";

export type UseAuthenticatedRatingProps = {
  orgId: string;
  itemId: string;
  userId: string;
  identityProviderToken: string | (() => Promise<string>);
  tokenProviderService?: string;
};

export type AuthenticatedRating = Rating;

export const useAuthenticatedRating = ({
  orgId,
  identityProviderToken,
  tokenProviderService,
  userId,
  ...props
}: UseAuthenticatedRatingProps): AuthenticatedRating => {
  const client = useMemo(
    () =>
      new StateBackedClient({
        identityProviderToken: identityProviderToken,
        orgId: orgId,
        tokenProviderService: tokenProviderService ?? "headless-state-backed",
      }),
    [orgId, identityProviderToken, tokenProviderService],
  );

  return useRating({
    ...props,
    client,
    userId,
    ratingMachineName,
    aggregateRatingMachineName,
  });
};
