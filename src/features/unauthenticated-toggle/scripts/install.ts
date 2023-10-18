#!/usr/bin/env node

import { toggleMachineName } from "../constants.js";
import { createMachine } from "../../../install-utils.js";

install();

function install() {
  Promise.all([
    createMachine(toggleMachineName, "unauthenticated-toggle", "toggle"),
  ])
    .then(() => {
      console.log("Installed unauthenticated-toggle");
    })
    .catch((err) => {
      console.error("Failed to install unauthenticated-toggle", err);
      process.exit(1);
    });
}
