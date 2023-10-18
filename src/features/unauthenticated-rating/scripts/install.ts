#!/usr/bin/env node

import { aggregateRatingMachineName, ratingMachineName } from "../constants.js";
import { createMachine } from "../../../install-utils.js";

install();

function install() {
  Promise.all([
    createMachine(ratingMachineName, "unauthenticated-rating", "rating"),
    createMachine(
      aggregateRatingMachineName,
      "unauthenticated-rating",
      "aggregate-rating",
    ),
  ])
    .then(() => {
      console.log("Installed unauthenticated-rating");
    })
    .catch((err) => {
      console.error("Failed to install unauthenticated-rating", err);
      process.exit(1);
    });
}
