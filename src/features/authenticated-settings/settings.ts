import { AllowRead, AllowWrite } from "@statebacked/machine";
import { Context, makeSettingsMachine } from "../../machines/settings-machine";
import { settingsMachineName } from "./constants";

// only the user can read
export const allowRead: AllowRead<Context> = ({ authContext, context }) =>
  authContext.sub === context.user;

// we only accept writes from the user and ensure the machine instance name is correct
export const allowWrite: AllowWrite<Context> = ({
  authContext,
  context,
  machineInstanceName,
}) =>
  authContext.sub === context.user &&
  machineInstanceName === `${context.user}-${context.namespace}`;

export default makeSettingsMachine(settingsMachineName);
