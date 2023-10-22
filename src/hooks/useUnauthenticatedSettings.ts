import { toggleMachineName } from "../features/unauthenticated-toggle/constants";
import { useUserId } from "./useUserId";
import { useUnauthenticatedClient } from "./useUnauthenticatedClient";
import { Settings, useSettings } from "./useSettings";
import { settingsMachineName } from "../features/unauthenticated-settings/constants";

export type UseUnauthenticatedSettingsProps<T extends Record<string, unknown>> =
  {
    orgId: string;
    namespace?: string;
    defaultValue: T;
    userId?: string;
    localStorageKey?: string;
  };

export type UnauthenticatedSettings<T extends Record<string, unknown>> =
  Settings<T>;

export const useUnauthenticatedSettings = <
  TSettings extends Record<string, unknown>,
>(
  props: UseUnauthenticatedSettingsProps<TSettings>,
): UnauthenticatedSettings<TSettings> => {
  const userId = useUserId({
    localStorageKey: props.localStorageKey,
    userId: props.userId,
  });

  const client = useUnauthenticatedClient({
    userId,
    orgId: props.orgId,
    localStorageKey: props.localStorageKey,
  });

  return useSettings({
    ...props,
    client,
    userId,
    namespace: props.namespace ?? "default",
    defaultValue: props.defaultValue,
    settingsMachineName,
  });
};
