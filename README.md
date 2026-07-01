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

```bash
node leetcode/2026/07-july/01-two-sum/solution.js
```

Solutions export a `solve` function and include a small `main()` with sample tests when you run the file directly.

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
