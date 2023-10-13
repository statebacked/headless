import { AllowRead, AllowWrite } from "@statebacked/machine";
import { Context, ratingMachine } from "./machines/rating-machine";

// only the rater can read
export const allowRead: AllowRead<Context> = ({ authContext, context }) =>
  authContext.did === context.rater;

// we only accept writes from the rater and ensure the machine instance name is correct
export const allowWrite: AllowWrite<Context> = ({
  authContext,
  context,
  machineInstanceName,
}) =>
  authContext.did === context.rater &&
  machineInstanceName === `${context.rater}-${context.item}`;

export default ratingMachine;
