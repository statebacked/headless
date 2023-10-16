import * as url from "node:url";
import * as path from "node:path";
import { spawn } from "node:child_process";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

function featureMachinePath(featureName: string, machineName: string) {
  return path.join(__dirname, "features", featureName, machineName + ".js");
}

export function createMachine(
  machineName: string,
  featureName: string,
  featureMachineName: string,
) {
  const rootPath = path.join(__dirname, "..");
  return new Promise((res, rej) => {
    const proc = spawn(
      "smply",
      [
        "machines",
        "create",
        "--machine",
        machineName,
        "--node",
        featureMachinePath(featureName, featureMachineName),
      ],
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
