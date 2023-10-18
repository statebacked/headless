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

  try {
    if (command === "list") {
      await list();
      return;
    }

    if (command === "setup-auth") {
      await setupAuth();
      return;
    }

    if (command !== "install") {
      console.error(
        `State Backed Headless provides a suite of ready-made backend features, exposed via simple React hooks.
  You can install any feature into your free State Backed organization and then use the corresponding hook in your frontend.

  Usage: 

  To install a feature:
    npx @statebacked/headless install [feature...]
    
  To list available features:
    npx @statebacked/headless list

  To setup authentication to allow Headless features to verify your users' identities:
    npx @statebacked/headless setup-auth auth0 --domain '<YOUR_AUTH0_DOMAIN>'

    or

    npx @statebacked/headless setup-auth cognito --user-pool-id '<YOUR_COGNITO_USER_POOL_ID>'  --region '<AWS_REGION_FOR_USER_POOL>'

    or

    npx @statebacked/headless setup-auth supabase --project '<SUPABASE_PROJCET_ID>' --secret '<SUPABASE_JWT_SECRET>'
  `,
      );
      process.exit(1);
      return;
    }

    // install

    const features = argv.slice(1); // remove "install"
    const orgId = await setup();
    await install(features);

    console.log("IMPORTANT: pass this orgId to your headless hooks: " + orgId);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

async function setupAuth() {
  const authProvider = argv[1];
  const args = argsToMap(argv.slice(2));

  await setup();

  const idpArgs =
    authProvider === "auth0"
      ? [
          "upsert-auth0",
          "--domain",
          args["domain"],
          "--mapping",
          '{"sub.$": "$.sub"}',
        ]
      : authProvider === "cognito"
      ? [
          "upsert-cognito",
          "--user-pool-id",
          args["user-pool-id"],
          "--region",
          args["region"],
          "--mapping",
          '{"sub.$": "$.sub"}',
        ]
      : authProvider === "supabase"
      ? [
          "upsert-supabase",
          "--project",
          args["project"],
          "--secret",
          args["secret"],
          "--mapping",
          '{"sub.$": "$.sub"}',
        ]
      : null;

  if (!idpArgs) {
    console.error(`Invalid auth provider: ${authProvider}`);
    process.exit(1);
    return;
  }

  const idpPromise = new Promise((res, rej) => {
    spawn("smply", ["identity-providers", ...idpArgs], {
      shell: false,
      stdio: "ignore",
    }).on("exit", (code) => {
      if (code === 0) {
        res(null);
      } else {
        rej(new Error("failed to create identity provider"));
      }
    });
  });

  await Promise.all([idpPromise, ensureTokenProvider()]);

  console.log("Authorization setup complete.");
}

async function ensureTokenProvider() {
  const tokenProviders = await new Promise<Array<any>>((res, rej) => {
    const parts = [];
    spawn("smply", ["token-providers", "list"], { shell: false, stdio: "pipe" })
      .on("exit", (code) => {
        if (code === 0) {
          res(JSON.parse(Buffer.concat(parts).toString("utf8")));
        } else {
          rej(new Error("failed to retrieve token providers"));
        }
      })
      .stdout.on("data", (data) => {
        parts.push(data);
      });
  });

  const headlessServiceName = "headless-state-backed";

  const hasHeadlessProvider = tokenProviders.some(
    (tp) => tp.name === headlessServiceName,
  );
  if (hasHeadlessProvider) {
    return;
  }

  const keyOutput = await new Promise<string>((res, rej) => {
    const parts = [];
    spawn(
      "smply",
      ["keys", "create", "--name", headlessServiceName, "--use", "production"],
      { shell: false, stdio: "pipe" },
    )
      .on("exit", (code) => {
        if (code === 0) {
          res(Buffer.concat(parts).toString("utf8"));
        } else {
          rej(new Error("failed to create key"));
        }
      })
      .stdout.on("data", (data) => {
        parts.push(data);
      });
  });

  const keyId = JSON.parse(keyOutput.split("\n").slice(1).join("\n")).id;

  await new Promise((res, rej) => {
    spawn(
      "smply",
      [
        "token-providers",
        "upsert",
        "--service",
        headlessServiceName,
        "--mapping",
        '{"sub.$": "$.sub"}',
        "--key",
        keyId,
      ],
      { shell: false, stdio: "ignore" },
    ).on("exit", (code) => {
      if (code === 0) {
        res(null);
      } else {
        rej(new Error("failed to create token provider"));
      }
    });
  });
}

function argsToMap(args: Array<string>): Record<string, string> {
  const map: Record<string, string> = {};

  for (let i = 0; i < args.length; i = i + 2) {
    const arg = args[i];
    if (!arg.startsWith("--")) {
      console.error("invalid argument: " + arg);
      throw new Error("invalid argument: " + arg);
    }

    map[arg.slice(2)] = args[i + 1];
  }

  return map;
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
