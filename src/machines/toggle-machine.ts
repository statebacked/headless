import { createMachine } from "xstate";

export type Event =
  | {
      type: "toggle";
    }
  | {
      type: "turnOn";
    }
  | {
      type: "turnOff";
    };

export type Context = {
  item: string;
  user: string;
  public: {};
};

export const makeToggleMachine = (id: string) =>
  createMachine({
    id,
    schema: {
      context: {} as Context,
      events: {} as Event,
    },
    context: {
      item: "",
      user: "",
      public: {},
    },
    initial: "on",
    on: {
      turnOn: "on",
      turnOff: "off",
    },
    states: {
      on: {
        on: {
          toggle: "off",
        },
      },
      off: {
        on: {
          toggle: "on",
        },
      },
    },
  });
