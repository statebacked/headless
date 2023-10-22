#!/usr/bin/env node

import { settingsMachineName } from "../constants.js";
import { createMachine } from "../../../install-utils.js";

install();

function install() {
  Promise.all([
    createMachine(settingsMachineName, "authenticated-settings", "settings"),
  ])
    .then(() => {
      console.log("Installed authenticated-settings");
    })
    .catch((err) => {
      console.error("Failed to install authenticated-settings", err);
      process.exit(1);
    });
}
