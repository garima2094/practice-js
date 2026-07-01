const problemListEl = document.getElementById("problem-list");
const searchEl = document.getElementById("search");
const emptyStateEl = document.getElementById("empty-state");
const problemViewEl = document.getElementById("problem-view");
const problemMetaEl = document.getElementById("problem-meta");
const problemTitleEl = document.getElementById("problem-title");
const problemPathEl = document.getElementById("problem-path");
const problemContentEl = document.getElementById("problem-content");
const solutionContentEl = document.getElementById("solution-content");
const outputContentEl = document.getElementById("output-content");
const runBtn = document.getElementById("run-btn");
const copyBtn = document.getElementById("copy-btn");
const modeBannerEl = document.getElementById("mode-banner");
const paginationEl = document.getElementById("pagination");
const prevPageBtn = document.getElementById("prev-page");
const nextPageBtn = document.getElementById("next-page");
const pageInfoEl = document.getElementById("page-info");

const PAGE_SIZE = 15;

let problems = [];
let selectedId = null;
let currentSolution = "";
let currentPage = 1;
let appConfig = { allowRun: true };

function renderMarkdown(text) {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/^\|(.+)\|$/gm, (line) => `<p>${line}</p>`)
    .replace(/\n\n/g, "<br><br>");
}

function setActiveTab(tabName) {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === tabName);
  });

  document.querySelectorAll(".panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === `panel-${tabName}`);
  });
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatProblemPrefix(problem) {
  return problem.number ? `LC ${problem.number}` : "Practice";
}

function getFilteredProblems() {
  const query = searchEl.value.trim();
  return query ? problems.filter((problem) => matchesSearch(problem, query)) : problems;
}

function getPaginationState(filtered) {
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, total);

  return {
    items: filtered.slice(startIndex, endIndex),
    total,
    totalPages,
    startIndex,
    endIndex,
  };
}

function ensurePageForProblem(id) {
  const filtered = getFilteredProblems();
  const index = filtered.findIndex((problem) => problem.id === id);
  if (index >= 0) {
    currentPage = Math.floor(index / PAGE_SIZE) + 1;
  }
}

function renderPagination({ total, totalPages, startIndex, endIndex }) {
  if (total === 0 || totalPages <= 1) {
    paginationEl.classList.add("hidden");
    return;
  }

  paginationEl.classList.remove("hidden");
  pageInfoEl.textContent = `${startIndex + 1}-${endIndex} of ${total} · Page ${currentPage}/${totalPages}`;
  prevPageBtn.disabled = currentPage <= 1;
  nextPageBtn.disabled = currentPage >= totalPages;
}

function renderProblemList() {
  const filtered = getFilteredProblems();
  const pagination = getPaginationState(filtered);

  problemListEl.innerHTML = "";

  if (pagination.total === 0) {
    problemListEl.innerHTML = "<li class='empty-state'>No problems found.</li>";
    renderPagination(pagination);
    return;
  }

  for (const problem of pagination.items) {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = `problem-item${problem.id === selectedId ? " active" : ""}`;
    button.title = `${formatProblemPrefix(problem)} ${problem.title}`;
    button.innerHTML = `<span class="problem-label"><span class="problem-prefix">${formatProblemPrefix(problem)}</span> ${escapeHtml(problem.title)}</span>`;
    button.addEventListener("click", () => selectProblem(problem.id));
    li.appendChild(button);
    problemListEl.appendChild(li);
  }

  renderPagination(pagination);
}

function applyAppConfig() {
  if (!appConfig.allowRun) {
    runBtn.disabled = true;
    runBtn.textContent = "Run disabled";
    modeBannerEl.textContent =
      "Read-only mode: browse problems and solutions. Running code is disabled in production.";
    modeBannerEl.classList.remove("hidden");
    return;
  }

  runBtn.disabled = false;
  runBtn.textContent = "Run solution";
  modeBannerEl.classList.add("hidden");
}

async function loadConfig() {
  const response = await fetch("/api/config");
  if (!response.ok) {
    throw new Error("Failed to load app config");
  }

  appConfig = await response.json();
  applyAppConfig();
}

async function loadProblems() {
  const response = await fetch("/api/problems");
  if (!response.ok) {
    throw new Error("Failed to load problems");
  }

  problems = await response.json();
  currentPage = 1;
  renderProblemList();
}

async function selectProblem(id) {
  selectedId = id;
  ensurePageForProblem(id);
  renderProblemList();

  const response = await fetch(`/api/problems/${encodeURIComponent(id)}`);
  if (!response.ok) {
    throw new Error("Failed to load problem");
  }

  const data = await response.json();

  emptyStateEl.classList.add("hidden");
  problemViewEl.classList.remove("hidden");

  problemMetaEl.textContent = data.number ? `LeetCode #${data.number}` : "Practice problem";
  problemTitleEl.textContent = data.title;
  problemPathEl.textContent = `leetcode/${data.path}`;
  problemContentEl.innerHTML = data.problem
    ? renderMarkdown(data.problem)
    : "<p>No problem.md found.</p>";
  solutionContentEl.textContent = data.solution;
  currentSolution = data.solution;
  copyBtn.textContent = "Copy code";
  copyBtn.disabled = !data.solution;
  outputContentEl.textContent = appConfig.allowRun
    ? "Run the solution to see output here."
    : "Running solutions is disabled in this environment.";
  outputContentEl.className = "output-block";
  setActiveTab("problem");
}

function matchesSearch(problem, query) {
  const q = query.toLowerCase();
  return (
    problem.title.toLowerCase().includes(q) ||
    problem.path.toLowerCase().includes(q) ||
    (problem.number && problem.number.includes(q))
  );
}

async function runCurrentProblem() {
  if (!selectedId || !appConfig.allowRun) return;

  runBtn.disabled = true;
  outputContentEl.textContent = "Running...";
  outputContentEl.className = "output-block";
  setActiveTab("output");

  try {
    const response = await fetch(`/api/problems/${encodeURIComponent(selectedId)}/run`, {
      method: "POST",
    });
    const result = await response.json();

    if (!response.ok) {
      outputContentEl.textContent = result.error || "Failed to run solution.";
      outputContentEl.className = "output-block error";
      return;
    }

    const parts = [];
    if (result.stdout) parts.push(result.stdout.trimEnd());
    if (result.stderr) parts.push(result.stderr.trimEnd());
    if (result.error) parts.push(`Error: ${result.error}`);

    if (parts.length === 0) {
      parts.push(
        result.exitCode === 0
          ? "Finished with no output.\nTip: wrap test calls in console.log(...)."
          : `Exited with code ${result.exitCode}`
      );
    }

    outputContentEl.textContent = parts.join("\n\n");
    outputContentEl.className =
      result.exitCode === 0 ? "output-block success" : "output-block error";
  } catch (error) {
    outputContentEl.textContent = `Failed to run: ${error.message}`;
    outputContentEl.className = "output-block error";
  } finally {
    applyAppConfig();
  }
}

searchEl.addEventListener("input", () => {
  currentPage = 1;
  renderProblemList();
});

prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage -= 1;
    renderProblemList();
  }
});

nextPageBtn.addEventListener("click", () => {
  const { totalPages } = getPaginationState(getFilteredProblems());
  if (currentPage < totalPages) {
    currentPage += 1;
    renderProblemList();
  }
});

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => setActiveTab(tab.dataset.tab));
});

runBtn.addEventListener("click", runCurrentProblem);

async function copySolution() {
  if (!currentSolution) return;

  try {
    await navigator.clipboard.writeText(currentSolution);
    copyBtn.textContent = "Copied!";
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = currentSolution;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    copyBtn.textContent = "Copied!";
  }

  setTimeout(() => {
    copyBtn.textContent = "Copy code";
  }, 2000);
}

copyBtn.addEventListener("click", copySolution);

Promise.all([loadConfig(), loadProblems()]).catch((error) => {
  problemListEl.innerHTML = `<li class="empty-state">${error.message}</li>`;
});
