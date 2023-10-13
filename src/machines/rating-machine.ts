import { assign, createMachine, pure } from "xstate";
import { sendTo as persistentSendTo } from "@statebacked/machine";

const maxRating = 5;

export type Event = {
  type: "rate";
  item: string;
  rater: string;
  rating: number;
};

export type Context = {
  item: string;
  rater: string;
  public: {
    rating: number | null;
  };
};

// Represents a single rating of an item by a rater.
// Must be named: <rater>-<item>
export const makeRatingMachine = (
  id: string,
  aggregateRatingMachineName: string,
) =>
  createMachine({
    id,
    initial: "unrated",
    schema: {
      context: {} as Context,
      events: {} as Event,
    },
    context: {
      item: "",
      rater: "",
      public: {
        rating: null,
      },
    },
    states: {
      unrated: {
        on: {
          rate: {
            target: "rated",
            actions: [
              assign({
                item: (_, event) => event.item,
                rater: (_, event) => event.rater,
                public: (_, event) => ({
                  rating: getRating(event),
                }),
              }),
              persistentSendTo(
                ((ctx: Context) => ({
                  type: "statebacked.instance",
                  id: "aggregate-rating-machine",
                  machineName: aggregateRatingMachineName,
                  machineInstanceName: ctx.item,
                })) as any,
                (_, event) => ({
                  type: "addToRating",
                  rating: getRating(event),
                  count: 1,
                }),
              ),
            ],
          },
        },
      },
      rated: {
        on: {
          rate: {
            actions: pure((ctx, event) => {
              const rating = getRating(event);
              const ratingChange = rating - ctx.public.rating!;
              return [
                assign({
                  public: {
                    rating,
                  },
                }),
                persistentSendTo(
                  {
                    type: "statebacked.instance",
                    id: "aggregate-rating-machine",
                    machineName: aggregateRatingMachineName,
                    machineInstanceName: ctx.item,
                  },
                  {
                    type: "addToRating",
                    rating: ratingChange,
                    count: 0,
                  },
                ),
              ];
            }),
          },
        },
      },
    },
  });

const getRating = (event: Event) =>
  Math.max(0, Math.min(event.rating, maxRating));
