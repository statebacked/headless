import { AllowRead, AllowWrite } from "@statebacked/machine";
import {
  Context,
  makeAggregateRatingMachine,
} from "../../machines/aggregate-rating-machine";
import { aggregateRatingMachineName, ratingMachineName } from "./constants";

// anyone with access can read
export const allowRead: AllowRead = () => true;

// anyone can create us but we only accept writes from the rating machine
export const allowWrite: AllowWrite<Context> = ({
  machineInstanceName,
  authContext: { stateBackedSender },
  context,
  type,
}) =>
  (type === "initialization" && context.item === machineInstanceName) ||
  (!!stateBackedSender &&
    stateBackedSender.machineName === ratingMachineName &&
    stateBackedSender.machineInstanceName.endsWith(context.item));

export default makeAggregateRatingMachine(aggregateRatingMachineName);
