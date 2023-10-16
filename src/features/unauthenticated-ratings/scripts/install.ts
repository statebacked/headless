#!/usr/bin/env node

import { aggregateRatingMachineName, ratingMachineName } from "../constants.js";
import { createMachine } from "../../../install-utils.js";

install();

function install() {
  Promise.all([
    createMachine(ratingMachineName, "unauthenticated-ratings", "rating"),
    createMachine(
      aggregateRatingMachineName,
      "unauthenticated-ratings",
      "aggregate-rating",
    ),
  ])
    .then(() => {
      console.log("Installed unauthenticated-ratings");
    })
    .catch((err) => {
      console.error("Failed to install unauthenticated-ratings", err);
      process.exit(1);
    });
}
