import { Settings, useSettings } from "./useSettings";
import { settingsMachineName } from "../features/authenticated-settings/constants";
import { useAuthenticatedClient } from "./useAuthenticatedClient";

export type UseAuthenticatedSettingsProps<T extends Record<string, unknown>> = {
  orgId: string;
  namespace?: string;
  defaultValue: T;
  userId: string;
  identityProviderToken: string | (() => Promise<string>);
  tokenProviderService?: string;
};

export type AuthenticatedSettings<T extends Record<string, unknown>> =
  Settings<T>;

export const useAuthenticatedSettings = <
  TSettings extends Record<string, unknown>,
>({
  userId,
  namespace,
  defaultValue,
  ...props
}: UseAuthenticatedSettingsProps<TSettings>): AuthenticatedSettings<TSettings> => {
  const client = useAuthenticatedClient(props);

  return useSettings({
    client,
    userId,
    namespace: namespace ?? "default",
    defaultValue,
    settingsMachineName,
  });
};
