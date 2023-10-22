import { assign, createMachine } from "xstate";

export type Event = {
  type: "set";
  settings: Record<string, unknown>;
};

export type Context = {
  user: string;
  namespace: string;
  public: {
    settings: Record<string, unknown>;
  };
};

export const makeSettingsMachine = (id: string) =>
  createMachine({
    id,
    initial: "settings",
    schema: {
      events: {} as Event,
      context: {} as Context,
    },
    context: {
      user: "",
      namespace: "",
      public: {
        settings: {},
      },
    },
    states: {
      settings: {
        on: {
          set: {
            actions: assign({
              public: (ctx: Context, event: Event) => ({
                ...ctx.public,
                settings: {
                  ...ctx.public.settings,
                  ...event.settings,
                },
              }),
            }),
          },
        },
      },
    },
  });
