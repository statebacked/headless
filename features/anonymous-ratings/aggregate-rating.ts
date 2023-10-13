import { AllowRead, AllowWrite } from "@statebacked/machine";
import {
  Context,
  aggregateRatingMachine,
} from "./machines/aggregate-rating-machine";
import { ratingMachineName } from "./constants";

// anyone with access can read
export const allowRead: AllowRead = () => true;

// we only accept writes from the rating machine
export const allowWrite: AllowWrite<Context> = ({
  authContext: { stateBackedSender },
  context,
}) =>
  !!stateBackedSender &&
  stateBackedSender.machineName === ratingMachineName &&
  stateBackedSender.machineInstanceName.endsWith(context.item);

export default aggregateRatingMachine;
