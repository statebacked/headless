import { useState, useEffect, useCallback } from "react";
import { StateBackedClient } from "@statebacked/client";
import { toValidIdentifier } from "../utils";
import { Context, Event } from "../machines/settings-machine";

export type UseSettingsProps<T extends Record<string, unknown>> = {
  client: StateBackedClient;
  namespace: string;
  userId: string;
  settingsMachineName: string;
  defaultValue: T;
};

export type Settings<T extends Record<string, unknown>> = {
  state: "loading" | "error" | "data";
  error?: Error;
  value: T;
  isLoading: boolean;
  isError: boolean;
  set: (value: Partial<T>) => Promise<void>;
};

export const useSettings = <T extends Record<string, unknown>>({
  client,
  userId,
  settingsMachineName,
  ...props
}: UseSettingsProps<T>): Settings<T> => {
  const [remoteSettings, setRemoteSettings] = useState<
    "loading" | Error | Partial<T>
  >("loading");

  const namespace = toValidIdentifier(props.namespace);

  const instanceName = settingsMachineInstanceName({
    userId,
    namespace,
  });

  useEffect(() => {
    const abort = new AbortController();

    (async () => {
      try {
        setRemoteSettings("loading");
        const settingsState = await client.machineInstances.getOrCreate(
          settingsMachineName,
          instanceName,
          () => ({
            context: {
              namespace,
              user: userId,
            },
          }),
          abort.signal,
        );
        const ctx = settingsState.publicContext as Context["public"];
        setRemoteSettings(ctx.settings as Partial<T>);
      } catch (e) {
        if (abort.signal.aborted) {
          return;
        }
        setRemoteSettings(e);
      }
    })();

    return () => {
      abort.abort();
    };
  }, [namespace, userId, instanceName]);

  const set = useCallback(
    async (value: Partial<T>) => {
      setRemoteSettings(
        remoteSettings !== "loading" && !(remoteSettings instanceof Error)
          ? mergeSettings(remoteSettings, value)
          : value,
      );

      const event: Event = {
        type: "set",
        settings: value,
      };

      await client.machineInstances.sendEvent(
        settingsMachineName,
        instanceName,
        {
          event,
        },
      );
    },
    [instanceName, remoteSettings],
  );

  const [state, value] =
    remoteSettings === "loading"
      ? (["loading", props.defaultValue] as const)
      : remoteSettings instanceof Error
      ? (["error", props.defaultValue] as const)
      : (["data", mergeSettings(props.defaultValue, remoteSettings)] as const);

  return {
    state,
    value,
    isError: state === "error",
    isLoading: state === "loading",
    error: remoteSettings instanceof Error ? remoteSettings : undefined,
    set,
  };
};

const settingsMachineInstanceName = ({
  userId,
  namespace,
}: {
  userId: string;
  namespace: string;
}) => `${userId}-${namespace}`;

const mergeSettings = <T extends Record<string, unknown>>(
  defaultValue: T,
  remoteSettings: Partial<T>,
): T => {
  return {
    ...defaultValue,
    ...remoteSettings,
  };
};
