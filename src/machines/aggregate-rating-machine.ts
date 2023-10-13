import { assign, createMachine } from "xstate";

export type Event = {
  type: "addToRating";
  rating: number;
  count: number;
};

export type Context = {
  item: string;
  public: {
    totalRating: number;
    count: number;
  };
};

// Represents the aggregate rating by all raters
export const makeAggregateRatingMachine = (id: string) =>
  createMachine({
    id,
    schema: {
      context: {} as Context,
      events: {} as Event,
    },
    context: {
      item: "",
      public: {
        totalRating: 0,
        count: 0,
      },
    },
    initial: "aggregating",
    states: {
      aggregating: {
        on: {
          addToRating: {
            actions: [
              assign({
                public: (ctx, event) => ({
                  totalRating: ctx.public.totalRating + event.rating,
                  count: ctx.public.count + event.count,
                }),
              }),
            ],
          },
        },
      },
    },
  });
