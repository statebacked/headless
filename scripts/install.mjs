#!/usr/bin/env node

import * as url from "node:url";
import { spawn } from "node:child_process";
import * as path from "node:path";
import * as readline from "node:readline/promises";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

main();

async function main() {
  await setup();
  await install();
}

async function setup() {
  await ensureLoggedIn();
  await ensureDefaultOrg();
}

async function ensureDefaultOrg() {
  const orgs = await new Promise((res, rej) => {
    const orgsParts = [];
    spawn("smply", ["orgs", "list"], { shell: false, stdio: "pipe" })
      .on("exit", (code) => {
        if (code !== 0) {
          console.log(code);
          rej(new Error("failed to retrieve orgs"));
          return;
        }

        const orgs = JSON.parse(Buffer.concat(orgsParts).toString("utf8"));

        res(orgs);
      })
      .stdout.on("data", (data) => {
        orgsParts.push(data);
      });
  });

  const orgCount = orgs.length;

  if (orgCount === 0) {
    await new Promise((res, rej) => {
      spawn("smply", ["orgs", "create", "--name", "Headless"], { shell: false, stdio: "inherit" }).on("exit", (code) => {
        if (code === 0) {
          res();
        } else {
          rej();
        }
      });
    });

    return;
  }

  if (orgCount > 0) {
    const defaultOrg = await new Promise((res, rej) => {
      const parts = [];
      spawn("smply", ["orgs", "default", "get"], { shell: false, stdio: "pipe" })
        .on("exit", (code) => {
          if (code !== 0) {
            console.log(code);
            rej(new Error("failed to retrieve default org"));
            return;
          }

          const defaultOrg = Buffer.concat(parts).toString("utf8");

          if (defaultOrg.startsWith("org_")) {
            res(defaultOrg.trim());
          } else {
            res(null);
          }
        })
        .stdout.on("data", (data) => {
          parts.push(data);
        });
    });

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    if (defaultOrg) {
      const useDefault = await rl.question(`Use ${defaultOrg} as the default organization? [Y/n] `);
      if (useDefault.toLowerCase() === "y" || useDefault === "") {
        rl.close();
        return;
      }
    }

    console.log("You have multiple organizations. Please select one to use as the default.");
    console.log(JSON.stringify(orgs, null, 2));
    const orgId = await rl.question("Enter the ID of the organization to use: ");
    rl.close();

    await new Promise((res, rej) => {
      spawn("smply", ["orgs", "default", "set", "--org", orgId], { shell: false, stdio: "ignore" }).on("exit", (code) => {
        if (code === 0) {
          res();
        } else {
          rej();
        }
      });
    });
  }
}

async function ensureLoggedIn() {
  const isLoggedIn = await new Promise((res, rej) => {
    spawn("smply", ["whoami"], { shell: false, stdio: "ignore" }).on("exit", (code) => {
      res(code === 0)
    });
  });

  if (isLoggedIn) {
    return;
  }

  console.log("Log in or create a StateBacked.dev account to manage headless features.")

  await new Promise((res, rej) => {
    spawn("smply", ["login"], { shell: false, stdio: "inherit" }).on("exit", (code) => {
      if (code === 0) {
        res();
      } else {
        rej();
      }
    });
  });
}

function install() {
  const features = process.argv.slice(2); // remove ["node", "install.mjs"]
  return Promise.all(
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
