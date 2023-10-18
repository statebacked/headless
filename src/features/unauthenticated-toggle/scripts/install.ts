#!/usr/bin/env node

import { toggleMachineName } from "../constants.js";
import { createMachine } from "../../../install-utils.js";

install();

function install() {
  Promise.all([
    createMachine(toggleMachineName, "authenticated-toggle", "toggle"),
  ])
    .then(() => {
      console.log("Installed authenticated-toggle");
    })
    .catch((err) => {
      console.error("Failed to install authenticated-toggle", err);
      process.exit(1);
    });
}
