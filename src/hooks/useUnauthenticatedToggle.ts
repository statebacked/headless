import { useMemo } from "react";
import { StateBackedClient } from "@statebacked/client";
import { toggleMachineName } from "../features/unauthenticated-toggle/constants";
import { useUserId } from "./useUserId";
import { Toggle, useToggle } from "./useToggle";

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

  return useToggle({
    ...props,
    client,
    userId,
    toggleMachineName,
  });
};
