# LeetCode Daily Practice (JavaScript)

A repo to track LeetCode problems solved day by day.

## Folder structure

```
leetcode/
  YYYY/
    MM-month/
      DD-slug/
        problem.md    # problem statement, notes, approach, complexity
        solution.js   # your solution
```

**Example**

```
leetcode/2026/07-july/01-two-sum/
  problem.md
  solution.js
```

- **YYYY** — year (e.g. `2026`)
- **MM-month** — month folder (e.g. `07-july`)
- **DD-slug** — day + kebab-case title (e.g. `01-two-sum`, `15-3sum`)

## Add a new problem

### Option 1: Use the scaffold script (recommended)

```bash
node scripts/new-problem.js two-sum
```

With LeetCode metadata:

```bash
node scripts/new-problem.js two-sum --number 1 --difficulty Easy --topic "Array, Hash Table"
```

Optional flags:

| Flag | Description |
|------|-------------|
| `--number` | LeetCode problem number |
| `--difficulty` | Easy, Medium, or Hard |
| `--topic` | Tags (comma-separated) |
| `--date` | Override date (`YYYY-MM-DD`, default: today) |

### Option 2: Copy templates manually

1. Copy `templates/problem.md` and `templates/solution.js`
2. Create a folder under `leetcode/YYYY/MM-month/DD-slug/`
3. Fill in the files

## Run a solution

### Browser UI (recommended)

Start the local web UI, then open it in your browser:

```bash
npm run ui
```

Open [http://localhost:3456](http://localhost:3456)

- Browse and search problems in the sidebar
- View **Problem**, **Solution**, and **Output** tabs
- Click **Run solution** to execute `solution.js` with Node

### Interactive terminal runner

Pick a problem, view `problem.md` / `solution.js`, and run it from the terminal:

```bash
npm run run
```

You will see a numbered list. Enter a number or search term (e.g. `2620`, `counter`, `closures`).

Inside a problem:

| Key | Action |
|-----|--------|
| `p` | View `problem.md` |
| `s` | View `solution.js` |
| `r` | Run `solution.js` |
| `b` | Back to list |

### Quick commands

```bash
npm run list                  # list all problems
npm run run -- 2620           # open a problem by number or name
npm run run -- 2620 --run     # run solution directly
npm run run -- 2620 --view    # show problem.md
npm run run -- 2620 --code    # show solution.js
```

### Run a file directly

```bash
node leetcode/2026/july/closures/2620-counter/solution.js
```

Tip: wrap test calls in `console.log(...)` so output shows when you run the file.

## Conventions

- One folder per problem per day (re-solves on another day → new dated folder or add a note in `problem.md`)
- Keep `problem.md` for the statement, approach, and time/space complexity
- Keep `solution.js` focused on code; use the header comment for quick metadata
- Commit after each session, e.g. `feat: solve two-sum (LC #1)`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run new -- <slug>` | Scaffold a new problem for today |
| `npm run new -- <slug> --number 1` | Scaffold with LeetCode number |
| `npm run ui` | Open browser UI at http://localhost:3456 |
| `npm run run` | Interactive problem picker + runner |
| `npm run list` | List all problems |
| `npm run run -- <search> --run` | Run a solution by number or name |

## Deployment

When you have enough problems, deploy as a **read-only reference site** (recommended for public use).

### What is production-ready now

- `npm start` for hosting platforms (Render, Railway, etc.)
- `/api/health` health check endpoint
- Security headers and safe file serving
- **Run disabled in production** by default (prevents arbitrary code execution)
- Execution timeout and output limits when run is enabled
- `render.yaml` included for one-click Render deploy

### Deploy to Render

1. Push this repo to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Connect the repo (Render will detect `render.yaml`)
4. Deploy — visitors can browse problems and solutions

### Environment variables

Copy `.env.example` for local reference:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3456` | Server port |
| `NODE_ENV` | `development` | Set to `production` when deployed |
| `ALLOW_RUN` | `true` locally, `false` in production | Enable/disable Run button |
| `RUN_TIMEOUT_MS` | `5000` | Max solution runtime |
| `MAX_OUTPUT_BYTES` | `65536` | Max stdout/stderr size |

For a public portfolio, keep `ALLOW_RUN=false`. Enable run only on private/local environments.
