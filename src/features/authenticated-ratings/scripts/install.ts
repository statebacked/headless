#!/usr/bin/env node

import { aggregateRatingMachineName, ratingMachineName } from "../constants.js";
import { createMachine } from "../../../install-utils.js";

install();

function install() {
  Promise.all([
    createMachine(ratingMachineName, "rating-machine"),
    createMachine(aggregateRatingMachineName, "aggregate-rating-machine"),
  ])
    .then(() => {
      console.log("Installed authenticated-ratings");
    })
    .catch((err) => {
      console.error("Failed to install authenticated-ratings", err);
      process.exit(1);
    });
}
