#!/usr/bin/env node

import * as url from "node:url";
import { spawn } from "node:child_process";
import * as path from "node:path";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

install();

function install() {
  const features = process.argv.slice(2); // remove ["node", "install.mjs"]
  Promise.all(
    features.map((feature) => {
      new Promise((res, rej) => {
        const proc = spawn(
          "node",
          [
            path.join(
              __dirname,
              "..",
              "dist",
              "features",
              feature,
              "scripts",
              "install.js",
            ),
          ],
          {
            shell: false,
            stdio: "inherit",
          },
        );

        proc.on("exit", () => {
          if (proc.exitCode === 0) {
            res();
          } else {
            rej();
          }
        });
      });
    }),
  )
    .then(() => {
      console.log("Installed features");
    })
    .catch((err) => {
      console.error("Failed to install features", err);
    });
}
