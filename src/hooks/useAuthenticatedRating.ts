import {
  ratingMachineName,
  aggregateRatingMachineName,
} from "../features/authenticated-rating/constants";
import { Rating, useRating } from "./useRating";
import { useAuthenticatedClient } from "./useAuthenticatedClient";

export type UseAuthenticatedRatingProps = {
  orgId: string;
  itemId: string;
  userId: string;
  identityProviderToken: string | (() => Promise<string>);
  tokenProviderService?: string;
};

export type AuthenticatedRating = Rating;

export const useAuthenticatedRating = ({
  userId,
  ...props
}: UseAuthenticatedRatingProps): AuthenticatedRating => {
  const client = useAuthenticatedClient(props);

  return useRating({
    ...props,
    client,
    userId,
    ratingMachineName,
    aggregateRatingMachineName,
  });
};
