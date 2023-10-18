import { useState, useEffect, useCallback } from "react";
import { StateBackedClient } from "@statebacked/client";
import { toValidIdentifier } from "../utils";

export type UseToggleProps = {
  client: StateBackedClient;
  itemId: string;
  userId: string;
  toggleMachineName: string;
};

export type Toggle = {
  state: "loading" | "error" | "data";
  error?: Error;
  value: boolean;
  isLoading: boolean;
  isError: boolean;
  toggle: () => Promise<void>;
  turnOn: () => Promise<void>;
  turnOff: () => Promise<void>;
  set: (value: boolean) => Promise<void>;
};

export const useToggle = ({
  client,
  userId,
  toggleMachineName,
  ...props
}: UseToggleProps): Toggle => {
  const [toggled, setToggled] = useState<"loading" | Error | boolean>(
    "loading",
  );

  const itemId = toValidIdentifier(props.itemId);

  const instanceName = toggleMachineInstanceName({
    userId,
    itemId,
  });

  useEffect(() => {
    const abort = new AbortController();

    (async () => {
      try {
        setToggled("loading");
        const toggleState = await client.machineInstances.getOrCreate(
          toggleMachineName,
          instanceName,
          () => ({
            context: {
              item: itemId,
              user: userId,
            },
          }),
          abort.signal,
        );
        setToggled(toggleState.state === "on");
      } catch (e) {
        if (abort.signal.aborted) {
          return;
        }
        setToggled(e);
      }
    })();

    return () => {
      abort.abort();
    };
  }, [itemId, userId, instanceName]);

  const toggle = useCallback(async () => {
    setToggled(!toggled);

    await client.machineInstances.sendEvent(toggleMachineName, instanceName, {
      event: {
        type: "toggle",
      },
    });
  }, [toggled, instanceName]);

  const set = useCallback(
    async (value: boolean) => {
      setToggled(value);

      await client.machineInstances.sendEvent(toggleMachineName, instanceName, {
        event: {
          type: value ? "turnOn" : "turnOff",
        },
      });
    },
    [instanceName],
  );

  const turnOn = useCallback(async () => set(true), [set]);

  const turnOff = useCallback(async () => set(false), [set]);

  const state =
    toggled === "loading"
      ? "loading"
      : toggled instanceof Error
      ? "error"
      : "data";

  return {
    state,
    value: toggled === true,
    isError: state === "error",
    isLoading: state === "loading",
    error: toggled instanceof Error ? toggled : undefined,
    toggle,
    set,
    turnOn,
    turnOff,
  };
};

const toggleMachineInstanceName = ({
  userId,
  itemId,
}: {
  userId: string;
  itemId: string;
}) => `${userId}-${itemId}`;
