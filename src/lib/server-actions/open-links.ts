"use server";

import { exec } from "node:child_process";

export const openLinks = async (links: Array<string>) => {
  const operatingSystem = process.platform;
  let osSpecificCommand = "start";

  switch (operatingSystem) {
    case "darwin": // For macOS
      osSpecificCommand = "open";
      break;
    case "win32": // For Windows
      osSpecificCommand = "start";
      break;
    case "linux": // For linux
      osSpecificCommand = "xdg-open";
      break;

    default:
      osSpecificCommand = "xdg-open";
      break;
  }

  const command =
    `${osSpecificCommand} ` + links.join(` && ${osSpecificCommand} `);

  exec(command);
};
