#!/usr/bin/env node

import * as url from "node:url";
import { spawn } from "node:child_process";
import * as path from "node:path";
import { aggregateRatingMachineName, ratingMachineName } from "../constants.js";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

install();

function install() {
  const root = path.join(__dirname, "..", "..", "..", "..");
  const ratingMachinePath = path.join(__dirname, "..", "rating.js");
  const aggregateRatingMachinePath = path.join(
    __dirname,
    "..",
    "aggregate-rating.js",
  );

  Promise.all([
    createMachine(root, ratingMachinePath, ratingMachineName),
    createMachine(root, aggregateRatingMachinePath, aggregateRatingMachineName),
  ])
    .then(() => {
      console.log("Installed anonymous-ratings");
    })
    .catch((err) => {
      console.error("Failed to install anonymous-ratings", err);
    });
}

function createMachine(rootPath, machinePath, machineName) {
  return new Promise((res, rej) => {
    const proc = spawn(
      "smply",
      ["machines", "create", "--machine", machineName, "--node", machinePath],
      {
        shell: false,
        cwd: rootPath,
        stdio: "inherit",
      },
    );

    proc.on("exit", (code) => {
      if (proc.exitCode === 0) {
        res(null);
      } else {
        rej(new Error("failed to create machine: " + proc.exitCode));
      }
    });
  });
}
