import { useMemo } from "react";
import { StateBackedClient } from "@statebacked/client";
import { Toggle, useToggle } from "./useToggle";
import { toggleMachineName } from "../features/authenticated-toggle/constants";

export type UseAuthenticatedToggleProps = {
  orgId: string;
  itemId: string;
  userId: string;
  identityProviderToken: string | (() => Promise<string>);
  tokenProviderService?: string;
};

export type AuthenticatedToggle = Toggle;

export const useAuthenticatedToggle = ({
  orgId,
  identityProviderToken,
  tokenProviderService,
  userId,
  itemId,
}: UseAuthenticatedToggleProps): AuthenticatedToggle => {
  const client = useMemo(
    () =>
      new StateBackedClient({
        identityProviderToken: identityProviderToken,
        orgId: orgId,
        tokenProviderService: tokenProviderService ?? "headless-state-backed",
      }),
    [orgId, identityProviderToken, tokenProviderService],
  );

  return useToggle({
    client,
    userId,
    itemId,
    toggleMachineName,
  });
};
