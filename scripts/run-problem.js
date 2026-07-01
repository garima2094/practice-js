#!/usr/bin/env node

const readline = require("readline");
const fs = require("fs");
const {
  findProblems,
  filterProblems,
  getProblemById,
  runSolution,
} = require("./lib/problems");

function formatProblemLine(problem, index) {
  const label = problem.number
    ? `[${problem.number}] ${problem.title}`
    : problem.title;
  return `  ${String(index + 1).padStart(2)}. ${label}  (${problem.relativePath.replace(/\\/g, "/")})`;
}

function printProblems(problems) {
  console.log("\nProblems:\n");
  problems.forEach((problem, index) => {
    console.log(formatProblemLine(problem, index));
  });
  console.log("");
}

function readFile(relativeLabel, filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`\nNo ${relativeLabel} found at ${filePath}\n`);
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");
  const border = "-".repeat(60);
  console.log(`\n${border}`);
  console.log(relativeLabel);
  console.log(filePath.replace(/\\/g, "/"));
  console.log(border);
  console.log(content);
  if (!content.endsWith("\n")) console.log("");
  console.log(border);
}

function runSolutionInTerminal(problem) {
  console.log(`\nRunning: ${problem.relativePath.replace(/\\/g, "/")}/solution.js\n`);

  const result = runSolution(problem);

  if (result.error) {
    console.error(`\nFailed to run solution: ${result.error}\n`);
    return;
  }

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  if (result.exitCode !== 0) {
    console.log(`\nExited with code ${result.exitCode}\n`);
  } else {
    console.log("\nDone.\n");
  }
}

function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function ask(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function showProblemMenu(rl, problem) {
  while (true) {
    console.log(`\nSelected: ${problem.title}`);
    console.log(`Path: leetcode/${problem.relativePath.replace(/\\/g, "/")}`);
    console.log("\n  [p] View problem.md");
    console.log("  [s] View solution.js");
    console.log("  [r] Run solution.js");
    console.log("  [b] Back to list\n");

    const action = (await ask(rl, "Choose action: ")).trim().toLowerCase();

    if (action === "p") {
      readFile("problem.md", problem.problemPath);
    } else if (action === "s") {
      readFile("solution.js", problem.solutionPath);
    } else if (action === "r") {
      runSolutionInTerminal(problem);
    } else if (action === "b" || action === "q") {
      return;
    } else {
      console.log("\nInvalid choice. Use p, s, r, or b.\n");
    }
  }
}

async function interactiveMode(problems) {
  if (problems.length === 0) {
    console.log("\nNo problems found under leetcode/. Add a folder with solution.js first.\n");
    return;
  }

  const rl = createInterface();

  try {
    while (true) {
      printProblems(problems);
      const input = (await ask(
        rl,
        "Enter number, search term, or q to quit: "
      )).trim();

      if (!input || input.toLowerCase() === "q") {
        break;
      }

      if (/^\d+$/.test(input)) {
        const index = Number(input) - 1;
        if (index < 0 || index >= problems.length) {
          console.log("\nInvalid number. Try again.\n");
          continue;
        }
        await showProblemMenu(rl, problems[index]);
        continue;
      }

      const matches = filterProblems(problems, input);
      if (matches.length === 0) {
        console.log(`\nNo problems matched "${input}".\n`);
        continue;
      }

      if (matches.length === 1) {
        await showProblemMenu(rl, matches[0]);
        continue;
      }

      console.log(`\nMultiple matches for "${input}":\n`);
      matches.forEach((problem, index) => {
        console.log(formatProblemLine(problem, index));
      });
      console.log("");
    }
  } finally {
    rl.close();
  }
}

function printUsage() {
  console.log(`
Usage:
  npm run run                 Interactive picker
  npm run run -- list         List all problems
  npm run run -- 2620         Open problem by number or search
  npm run run -- 2620 --run   Run solution directly
  npm run run -- 2620 --view  View problem.md
  npm run run -- 2620 --code  View solution.js
  npm run ui                  Open browser UI
`);
}

async function cliMode(problems, args) {
  if (args[0] === "list") {
    printProblems(problems);
    return;
  }

  if (args[0] === "help" || args[0] === "--help" || args[0] === "-h") {
    printUsage();
    return;
  }

  const query = args[0];
  const matches = filterProblems(problems, query);

  if (matches.length === 0) {
    console.error(`\nNo problem found for "${query}".\n`);
    process.exit(1);
  }

  const problem =
    matches.length === 1
      ? matches[0]
      : matches.find((p) => p.number === query) || matches[0];

  if (
    matches.length > 1 &&
    !matches.some((p) => p.number === query || p.folderName === query)
  ) {
    console.log(`\nMultiple matches for "${query}":\n`);
    matches.forEach((item, index) => console.log(formatProblemLine(item, index)));
    console.log("\nBe more specific, e.g. npm run run -- 2620-counter\n");
    process.exit(1);
  }

  const flag = args[1];
  if (flag === "--run" || flag === "-r") {
    runSolutionInTerminal(problem);
    return;
  }

  if (flag === "--view" || flag === "-v") {
    readFile("problem.md", problem.problemPath);
    return;
  }

  if (flag === "--code" || flag === "-s") {
    readFile("solution.js", problem.solutionPath);
    return;
  }

  const rl = createInterface();
  try {
    await showProblemMenu(rl, problem);
  } finally {
    rl.close();
  }
}

async function main() {
  const problems = findProblems();
  const args = process.argv.slice(2);

  if (args.length === 0) {
    await interactiveMode(problems);
    return;
  }

  await cliMode(problems, args);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
