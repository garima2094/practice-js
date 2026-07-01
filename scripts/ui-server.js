#!/usr/bin/env node

const http = require("http");
const fs = require("fs");
const path = require("path");
const config = require("./lib/config");
const { findProblems, getProblemById, runSolution } = require("./lib/problems");

const ROOT = path.join(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const MAX_PORT = config.port + config.maxPortAttempts;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
};

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function sendText(res, status, text) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(text);
}

function setSecurityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");

  if (config.isProduction) {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'self'; frame-ancestors 'none'"
    );
  }
}

function serveStatic(urlPath, res) {
  const safePath = path
    .normalize(urlPath)
    .replace(/^(\.\.[/\\])+/, "")
    .replace(/^[/\\]+/, "");

  const filePath = path.join(PUBLIC_DIR, safePath === "" ? "index.html" : safePath);
  const publicRoot = path.resolve(PUBLIC_DIR);
  const resolved = path.resolve(filePath);

  if (!resolved.startsWith(publicRoot + path.sep) && resolved !== publicRoot) {
    sendText(res, 404, "Not found");
    return;
  }

  if (!fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) {
    sendText(res, 404, "Not found");
    return;
  }

  const ext = path.extname(resolved);
  if (!MIME_TYPES[ext]) {
    sendText(res, 403, "Forbidden");
    return;
  }

  res.writeHead(200, { "Content-Type": MIME_TYPES[ext] });
  res.end(fs.readFileSync(resolved));
}

function handleApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/health") {
    sendJson(res, 200, {
      status: "ok",
      environment: config.nodeEnv,
      allowRun: config.allowRun,
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/config") {
    sendJson(res, 200, {
      environment: config.nodeEnv,
      allowRun: config.allowRun,
      version: require("../package.json").version,
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/problems") {
    const problems = findProblems().map(({ id, number, title, relativePath }) => ({
      id,
      number,
      title,
      path: relativePath.replace(/\\/g, "/"),
    }));
    sendJson(res, 200, problems);
    return;
  }

  const problemMatch = url.pathname.match(/^\/api\/problems\/(.+?)(?:\/run)?$/);
  if (!problemMatch) {
    sendJson(res, 404, { error: "Not found" });
    return;
  }

  const problemId = problemMatch[1];
  const isRun = url.pathname.endsWith("/run");
  const problem = getProblemById(problemId);

  if (!problem) {
    sendJson(res, 404, { error: "Problem not found" });
    return;
  }

  if (isRun) {
    if (!config.allowRun) {
      sendJson(res, 403, {
        error: "Running solutions is disabled in this environment.",
      });
      return;
    }

    if (req.method !== "POST") {
      sendJson(res, 405, { error: "Method not allowed" });
      return;
    }

    const result = runSolution(problem);
    sendJson(res, 200, result);
    return;
  }

  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  sendJson(res, 200, {
    id: problem.id,
    number: problem.number,
    title: problem.title,
    path: problem.relativePath.replace(/\\/g, "/"),
    problem: problem.problem,
    solution: problem.solution,
  });
}

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    setSecurityHeaders(res);

    if (url.pathname.startsWith("/api/")) {
      handleApi(req, res, url);
      return;
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      sendText(res, 405, "Method not allowed");
      return;
    }

    serveStatic(url.pathname === "/" ? "index.html" : url.pathname, res);
  } catch (error) {
    console.error("Request failed:", error);
    if (!res.headersSent) {
      sendJson(res, 500, { error: "Internal server error" });
    }
  }
});

let currentPort = config.port;

function startServer(port) {
  currentPort = port;

  server.listen(port, () => {
    if (!config.isProduction && port !== config.port) {
      console.log(`\nPort ${config.port} was in use. Using ${port} instead.`);
    }

    console.log(`\nLeetCode Practice UI running at http://localhost:${port}`);
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`Run solutions: ${config.allowRun ? "enabled" : "disabled"}`);
    console.log("\nPress Ctrl+C to stop.\n");
  });
}

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    if (!config.isProduction && currentPort < MAX_PORT) {
      startServer(currentPort + 1);
      return;
    }

    console.error(`\nPort ${currentPort} is already in use.`);
    if (!config.isProduction) {
      console.error('Run "npm run ui:stop" to stop the existing server.');
    }
    process.exit(1);
  }

  throw error;
});

function shutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down...`);
  server.close(() => process.exit(0));
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer(config.port);
