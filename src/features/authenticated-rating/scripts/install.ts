#!/usr/bin/env node

import { aggregateRatingMachineName, ratingMachineName } from "../constants.js";
import { createMachine } from "../../../install-utils.js";

install();

function install() {
  Promise.all([
    createMachine(ratingMachineName, "authenticated-rating", "rating"),
    createMachine(
      aggregateRatingMachineName,
      "authenticated-rating",
      "aggregate-rating",
    ),
  ])
    .then(() => {
      console.log("Installed authenticated-rating");
    })
    .catch((err) => {
      console.error("Failed to install authenticated-rating", err);
      process.exit(1);
    });
}
