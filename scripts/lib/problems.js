const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const config = require("./config");

const ROOT = path.join(__dirname, "..", "..");
const LEETCODE_DIR = path.join(ROOT, "leetcode");

function isInsideBase(baseDir, targetDir) {
  const base = path.resolve(baseDir);
  const target = path.resolve(targetDir);
  return target === base || target.startsWith(base + path.sep);
}

function extractNumber(folderName) {
  const match = folderName.match(/^(\d+)/);
  return match ? match[1] : null;
}

function extractTitle(problemPath) {
  if (!fs.existsSync(problemPath)) return null;
  const firstLine = fs.readFileSync(problemPath, "utf8").split("\n")[0];
  return firstLine.replace(/^#\s*/, "").trim() || null;
}

function findProblems(dir = LEETCODE_DIR) {
  const problems = [];

  function walk(currentDir) {
    if (!fs.existsSync(currentDir)) return;

    const solutionPath = path.join(currentDir, "solution.js");
    if (fs.existsSync(solutionPath)) {
      const relativePath = path.relative(LEETCODE_DIR, currentDir);
      const folderName = path.basename(currentDir);
      const problemPath = path.join(currentDir, "problem.md");
      problems.push({
        id: relativePath.replace(/\\/g, "/"),
        dir: currentDir,
        relativePath,
        folderName,
        number: extractNumber(folderName),
        title: extractTitle(problemPath) || folderName,
        problemPath,
        solutionPath,
      });
      return;
    }

    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        walk(path.join(currentDir, entry.name));
      }
    }
  }

  walk(dir);
  return problems.sort((a, b) => {
    if (a.number && b.number) return Number(a.number) - Number(b.number);
    if (a.number) return -1;
    if (b.number) return 1;
    return a.relativePath.localeCompare(b.relativePath);
  });
}

function filterProblems(problems, query) {
  const q = query.toLowerCase();
  return problems.filter((problem) => {
    return (
      problem.folderName.toLowerCase().includes(q) ||
      problem.title.toLowerCase().includes(q) ||
      problem.relativePath.toLowerCase().includes(q) ||
      (problem.number && problem.number.includes(q))
    );
  });
}

function getProblemById(id) {
  const relativePath = decodeURIComponent(id).replace(/\\/g, "/");
  const fullDir = path.resolve(LEETCODE_DIR, relativePath);

  if (!isInsideBase(LEETCODE_DIR, fullDir)) {
    return null;
  }

  const solutionPath = path.join(fullDir, "solution.js");
  if (!fs.existsSync(solutionPath)) {
    return null;
  }

  const problemPath = path.join(fullDir, "problem.md");
  const folderName = path.basename(fullDir);

  return {
    id: relativePath,
    dir: fullDir,
    relativePath,
    folderName,
    number: extractNumber(folderName),
    title: extractTitle(problemPath) || folderName,
    problemPath,
    solutionPath,
    problem: fs.existsSync(problemPath)
      ? fs.readFileSync(problemPath, "utf8")
      : "",
    solution: fs.readFileSync(solutionPath, "utf8"),
  };
}

function trimOutput(text) {
  if (!text || text.length <= config.maxOutputBytes) {
    return text || "";
  }

  return `${text.slice(0, config.maxOutputBytes)}\n\n[Output truncated]`;
}

function runSolution(problem) {
  const result = spawnSync(process.execPath, [problem.solutionPath], {
    cwd: problem.dir,
    encoding: "utf8",
    env: process.env,
    timeout: config.runTimeoutMs,
  });

  if (result.error?.code === "ETIMEDOUT") {
    return {
      stdout: trimOutput(result.stdout),
      stderr: trimOutput(result.stderr),
      exitCode: 1,
      error: `Execution timed out after ${config.runTimeoutMs}ms`,
    };
  }

  return {
    stdout: trimOutput(result.stdout),
    stderr: trimOutput(result.stderr),
    exitCode: result.status ?? 1,
    error: result.error ? result.error.message : null,
  };
}

module.exports = {
  LEETCODE_DIR,
  findProblems,
  filterProblems,
  getProblemById,
  runSolution,
};
