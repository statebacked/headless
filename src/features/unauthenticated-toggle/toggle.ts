import { AllowRead, AllowWrite } from "@statebacked/machine";
import { Context, makeToggleMachine } from "../../machines/toggle-machine";
import { toggleMachineName } from "./constants";

// only the user can read
export const allowRead: AllowRead<Context> = ({ authContext, context }) =>
  authContext.did === context.user;

// we only accept writes from the user and ensure the machine instance name is correct
export const allowWrite: AllowWrite<Context> = ({
  authContext,
  context,
  machineInstanceName,
}) =>
  authContext.did === context.user &&
  machineInstanceName === `${context.user}-${context.item}`;

export default makeToggleMachine(toggleMachineName);
