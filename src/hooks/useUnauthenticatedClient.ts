import { useMemo } from "react";
import { StateBackedClient } from "@statebacked/client";

export type UseUnauthenticatedClientProps = {
  orgId: string;
  userId: string;
  localStorageKey?: string;
};

export const useUnauthenticatedClient = ({
  userId,
  orgId,
}: UseUnauthenticatedClientProps) => {
  const client = useMemo(
    () =>
      new StateBackedClient({
        anonymous: {
          orgId,
          getDeviceId() {
            return userId;
          },
          getSessionId() {
            return userId;
          },
        },
      }),
    [orgId, userId],
  );

  return client;
};
