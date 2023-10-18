import { StateBackedClient } from "@statebacked/client";
import { useMemo } from "react";

export type UseAuthenticatedClientProps = {
  orgId: string;
  identityProviderToken: string | (() => Promise<string>);
  tokenProviderService?: string;
};

const defaultTokenProviderService = "headless-state-backed";

export const useAuthenticatedClient = ({
  orgId,
  identityProviderToken,
  tokenProviderService,
}: UseAuthenticatedClientProps) => {
  const client = useMemo(
    () =>
      new StateBackedClient({
        identityProviderToken: identityProviderToken,
        orgId: orgId,
        tokenProviderService:
          tokenProviderService ?? defaultTokenProviderService,
      }),
    [orgId, identityProviderToken, tokenProviderService],
  );

  return client;
};
