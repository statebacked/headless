import { toggleMachineName } from "../features/unauthenticated-toggle/constants";
import { useUserId } from "./useUserId";
import { Toggle, useToggle } from "./useToggle";
import { useUnauthenticatedClient } from "./useUnauthenticatedClient";

export type UseUnauthenticatedToggleProps = {
  orgId: string;
  itemId: string;
  userId?: string;
  localStorageKey?: string;
};

export type UnauthenticatedToggle = Toggle;

export const useUnauthenticatedToggle = (
  props: UseUnauthenticatedToggleProps,
): UnauthenticatedToggle => {
  const userId = useUserId({
    localStorageKey: props.localStorageKey,
    userId: props.userId,
  });

  const client = useUnauthenticatedClient({
    userId,
    orgId: props.orgId,
    localStorageKey: props.localStorageKey,
  });

  return useToggle({
    ...props,
    client,
    userId,
    toggleMachineName,
  });
};
