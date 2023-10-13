import { assign, createMachine } from "xstate";
import { aggregateRatingMachineName } from "../constants";

export type Event = {
  type: "addToRating";
  rating: number;
  count: number;
};

export type Context = {
  item: string;
  totalRating: number;
  count: number;
};

// Represents the aggregate rating by all raters
export const aggregateRatingMachine = createMachine({
  id: aggregateRatingMachineName,
  schema: {
    context: {} as Context,
    events: {} as Event,
  },
  context: {
    item: "",
    totalRating: 0,
    count: 0,
  },
  initial: "aggregating",
  states: {
    aggregating: {
      on: {
        addToRating: {
          actions: [
            assign({
              totalRating: (ctx, event) => ctx.totalRating + event.rating,
              count: (ctx, event) => ctx.count + event.count,
            }),
          ],
        },
      },
    },
  },
});
