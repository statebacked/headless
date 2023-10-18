import { Toggle, useToggle } from "./useToggle";
import { toggleMachineName } from "../features/authenticated-toggle/constants";
import { useAuthenticatedClient } from "./useAuthenticatedClient";

export type UseAuthenticatedToggleProps = {
  orgId: string;
  itemId: string;
  userId: string;
  identityProviderToken: string | (() => Promise<string>);
  tokenProviderService?: string;
};

export type AuthenticatedToggle = Toggle;

export const useAuthenticatedToggle = ({
  userId,
  itemId,
  ...props
}: UseAuthenticatedToggleProps): AuthenticatedToggle => {
  const client = useAuthenticatedClient(props);

  return useToggle({
    client,
    userId,
    itemId,
    toggleMachineName,
  });
};
