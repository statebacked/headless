#!/usr/bin/env node

import { settingsMachineName } from "../constants.js";
import { createMachine } from "../../../install-utils.js";

install();

function install() {
  Promise.all([
    createMachine(settingsMachineName, "unauthenticated-settings", "settings"),
  ])
    .then(() => {
      console.log("Installed unauthenticated-settings");
    })
    .catch((err) => {
      console.error("Failed to install unauthenticated-settings", err);
      process.exit(1);
    });
}
