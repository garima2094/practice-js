#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

function parseArgs(argv) {
  const positional = [];
  const options = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        options[key] = next;
        i++;
      } else {
        options[key] = true;
      }
    } else {
      positional.push(arg);
    }
  }

  return { positional, options };
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function titleCase(slug) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function fillTemplate(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");
}

function main() {
  const { positional, options } = parseArgs(process.argv.slice(2));
  const slug = positional[0];

  if (!slug) {
    console.error("Usage: node scripts/new-problem.js <slug> [--number N] [--difficulty Easy] [--topic tags] [--date YYYY-MM-DD]");
    process.exit(1);
  }

  const dateStr = options.date || new Date().toISOString().slice(0, 10);
  const [year, month, day] = dateStr.split("-").map(Number);
  const monthFolder = `${pad(month)}-${MONTHS[month - 1]}`;
  const folderName = `${pad(day)}-${slug}`;
  const problemDir = path.join("leetcode", String(year), monthFolder, folderName);

  if (fs.existsSync(problemDir)) {
    console.error(`Folder already exists: ${problemDir}`);
    process.exit(1);
  }

  const vars = {
    TITLE: titleCase(slug),
    SLUG: slug,
    NUMBER: options.number || "—",
    DIFFICULTY: options.difficulty || "—",
    TOPICS: options.topic || "—",
    DATE: dateStr,
  };

  const templatesDir = path.join("templates");
  const problemMd = fillTemplate(
    fs.readFileSync(path.join(templatesDir, "problem.md"), "utf8"),
    vars
  );
  const solutionJs = fillTemplate(
    fs.readFileSync(path.join(templatesDir, "solution.js"), "utf8"),
    vars
  );

  fs.mkdirSync(problemDir, { recursive: true });
  fs.writeFileSync(path.join(problemDir, "problem.md"), problemMd);
  fs.writeFileSync(path.join(problemDir, "solution.js"), solutionJs);

  console.log(`Created: ${problemDir}`);
  console.log(`  problem.md`);
  console.log(`  solution.js`);
}

main();
