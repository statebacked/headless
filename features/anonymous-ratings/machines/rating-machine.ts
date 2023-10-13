import { assign, createMachine, pure } from "xstate";
import { sendTo as persistentSendTo } from "@statebacked/machine";
import { aggregateRatingMachineName, ratingMachineName } from "../constants";

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
  rating: number | null;
};

// Represents a single rating of an item by a rater.
// Must be named: <rater>-<item>
export const ratingMachine = createMachine({
  id: ratingMachineName,
  initial: "unrated",
  schema: {
    context: {} as Context,
    events: {} as Event,
  },
  context: {
    item: "",
    rater: "",
    rating: null,
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
              rating: (_, event) => getRating(event),
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
            const ratingChange = rating - ctx.rating!;
            return [
              assign({ rating }),
              persistentSendTo(
                {
                  type: "statebacked.instance",
                  id: "aggregate-rating-machine",
                  machineName: aggregateRatingMachineName,
                  machineInstanceName: ctx.item,
                },
                (_, event) => ({
                  type: "addToRating",
                  rating: ratingChange,
                  count: 0,
                }),
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
