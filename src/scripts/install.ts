#!/usr/bin/env node

import * as url from "node:url";
import { spawn } from "node:child_process";
import * as path from "node:path";
import * as readline from "node:readline/promises";
import * as fs from "node:fs/promises";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const argv = process.argv.slice(2); // remove ["node", "install.mjs"]

main();

async function main() {
  const command = argv.length === 0 ? "list" : argv[0];

  if (command === "list") {
    await list();
    return;
  }

  if (command !== "install") {
    console.error(
      "usage: `npx @statebacked/headless install [feature...]` or `npx @statebacked/headless list`",
    );
    process.exit(1);
    return;
  }

  // install

  const features = argv.slice(1); // remove "install"
  const orgId = await setup();
  await install(features);

  console.log("IMPORTANT: pass this orgId to your headless hooks: " + orgId);
}

async function list() {
  const features = await fs.readdir(path.join(__dirname, "..", "features"));
  console.log("Available features:");
  console.log(" - " + features.join("\n - "));
  console.log("");
  console.log(
    "To install a feature, run `npx @statebacked/headless install <feature>`",
  );
}

async function setup() {
  await ensureLoggedIn();
  const orgId = await ensureDefaultOrg();
  return orgId;
}

async function ensureDefaultOrg(): Promise<string> {
  const orgs = await new Promise<Array<any>>((res, rej) => {
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
    const orgParts = [];
    return new Promise<string>((res, rej) => {
      spawn("smply", ["orgs", "create", "--name", "Headless"], {
        shell: false,
        stdio: "inherit",
      })
        .on("exit", (code) => {
          if (code === 0) {
            res(JSON.parse(Buffer.concat(orgParts).toString("utf8")).orgId);
          } else {
            rej();
          }
        })
        .stdout.on("data", (data) => {
          orgParts.push(data);
        });
    });
  }

  if (orgCount > 0) {
    const defaultOrg = await new Promise<string | null>((res, rej) => {
      const parts = [];
      spawn("smply", ["orgs", "default", "get"], {
        shell: false,
        stdio: "pipe",
      })
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
      const useDefault = await rl.question(
        `Use ${defaultOrg} as the default organization? [Y/n] `,
      );
      if (useDefault.toLowerCase() === "y" || useDefault === "") {
        rl.close();
        return defaultOrg;
      }
    }

    console.log(
      "You have multiple organizations. Please select one to use as the default.",
    );
    console.log(JSON.stringify(orgs, null, 2));
    const orgId = await rl.question(
      "Enter the ID of the organization to use: ",
    );
    rl.close();

    await new Promise((res, rej) => {
      spawn("smply", ["orgs", "default", "set", "--org", orgId], {
        shell: false,
        stdio: "ignore",
      }).on("exit", (code) => {
        if (code === 0) {
          res(null);
        } else {
          rej();
        }
      });
    });

    return orgId;
  }
}

async function ensureLoggedIn() {
  const isLoggedIn = await new Promise((res, rej) => {
    spawn("smply", ["whoami"], { shell: false, stdio: "ignore" }).on(
      "exit",
      (code) => {
        res(code === 0);
      },
    );
  });

  if (isLoggedIn) {
    return;
  }

  console.log(
    "Log in or create a StateBacked.dev account to manage headless features.",
  );

  await new Promise((res, rej) => {
    spawn("smply", ["login"], { shell: false, stdio: "inherit" }).on(
      "exit",
      (code) => {
        if (code === 0) {
          res(null);
        } else {
          rej();
        }
      },
    );
  });
}

function install(features: Array<string>) {
  return Promise.all(
    features.map(
      (feature) =>
        new Promise((res, rej) => {
          spawn(
            "node",
            [
              path.join(
                __dirname,
                "..",
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
          ).on("exit", (exitCode) => {
            if (exitCode === 0) {
              res(null);
            } else {
              rej();
            }
          });
        }),
    ),
  )
    .then(() => {
      console.log("Installed features");
    })
    .catch((err) => {
      console.error("Failed to install features", err);
    });
}
