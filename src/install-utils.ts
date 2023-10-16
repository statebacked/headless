import * as url from "node:url";
import * as path from "node:path";
import { spawn } from "node:child_process";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

function machinePath(machineName: string) {
  return path.join(__dirname, "machines", machineName + ".js");
}

export function createMachine(machineName: string, localMachineName: string) {
  const rootPath = path.join(__dirname, "..");
  console.log("MACHINE PATH", machinePath(localMachineName));
  return new Promise((res, rej) => {
    const proc = spawn(
      "smply",
      [
        "machines",
        "create",
        "--machine",
        machineName,
        "--node",
        machinePath(localMachineName),
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
