#!/usr/bin/env node

const { execSync } = require("child_process");

const PORT = process.env.PORT || 3456;

function getListeningPids(port) {
  try {
    const output = execSync(`netstat -ano | findstr :${port}`, {
      encoding: "utf8",
    });
    const pids = new Set();

    for (const line of output.split(/\r?\n/)) {
      const match = line.trim().match(/LISTENING\s+(\d+)$/);
      if (match) pids.add(match[1]);
    }

    return [...pids];
  } catch {
    return [];
  }
}

const pids = getListeningPids(PORT);

if (pids.length === 0) {
  console.log(`\nNo server is running on port ${PORT}.\n`);
  process.exit(0);
}

for (const pid of pids) {
  execSync(`taskkill /PID ${pid} /F`, { stdio: "inherit" });
  console.log(`Stopped process ${pid} on port ${PORT}`);
}

console.log("");
