# Agent tooling: Graphify and Ponytail

This repo uses two external agent-side tools. Neither ships in the published
`@personal-ui/ui` bundle, and neither is a runtime dependency of the component
library or the lab.

| Tool | What it is | License | Runtime dependency? |
| --- | --- | --- | --- |
| [Graphify](https://github.com/Graphify-Labs/graphify) | Python CLI + agent skill that parses the repo into a queryable knowledge graph | Apache-2.0 / MIT | No |
| [Ponytail](https://github.com/DietrichGebert/ponytail) | Agent skill/ruleset that enforces the smallest complete change | MIT | No |

They are checked in so every agent session sees them; the generated graph itself
is ignored by git.

## Graphify

Graphify parses code with tree-sitter AST locally. No LLM, no API key, and no
network access are needed for a code-only graph. It writes three outputs:

- `graphify-out/graph.json` — the graph (nodes, edges, communities).
- `graphify-out/GRAPH_REPORT.md` — god nodes, communities, suggested questions.
- `graphify-out/graph.html` — interactive browser view.

### Install (once per machine)

Requires Python 3.10+.

```bash
python -m pip install graphifyy   # package is graphifyy (double y); CLI is graphify
```

If the `graphify` command is not on `PATH` (common on Windows after a user
install), use `python -m graphify`. The npm scripts below already do.

### Repo integration

- `.opencode/skills/graphify/` — project-scoped skill and reference files,
  installed with `python -m graphify install --project --platform opencode`.
- `.opencode/plugins/graphify.js` — injects a one-time reminder before the first
  shell command of a session when the graph exists.
- `AGENTS.md` — the query-first rules agents follow.
- `graphify-out/` — generated, ignored by git.

### Commands

```bash
npm run graph:update                 # build or refresh from the current tree
npm run graph:query -- "how does the survey builder work?"
npm run graph:explain -- "SurveyBuilder"
npm run graph:path -- "SurveyBuilder" "evaluateCondition"
```

Equivalent CLI forms: `graphify update .`, `graphify query "<q>"`,
`graphify explain "<concept>"`, `graphify path "A" "B"`.

Refresh the graph after structural changes (new modules, moved files, renamed
exports). Plain edits are covered by the next update; the graph is a navigation
aid, not a source of truth.

To rebuild the skill after a Graphify upgrade:

```bash
python -m graphify install --project --platform opencode
```

## Ponytail

Ponytail is a prompt, not a library. The vendored copy is
`.opencode/skills/ponytail/SKILL.md` (MIT). It makes agents:

1. Read the code the change touches before editing.
2. Prefer existing components, tokens, and helpers over new code.
3. Skip unrequested abstractions, options, and dependencies.
4. Keep validation, error handling, security, accessibility, and tests.

Project commands:

- `/ponytail lite|full|ultra|off` — set intensity.
- `/ponytail-review` — review the current diff for bugs, risk, scale, tests, and
  bloat.
- `/ponytail-audit` — run the same review across the repo.

The ruleset also lives in the "Working style (Ponytail)" section of `AGENTS.md`
so it applies even when the skill is not explicitly invoked.

### Updating

Replace `.opencode/skills/ponytail/SKILL.md` and the `.opencode/command/ponytail*.md`
files from the upstream repo, then re-check the `AGENTS.md` summary against the
new ruleset. Upstream: <https://github.com/DietrichGebert/ponytail>.

## Why not add them as npm dependencies?

Graphify is a Python tool that produces build-time analysis artifacts; Ponytail
is an instruction set for agents. Adding either to `package.json` would ship dead
weight to consumers, require Python or an agent plugin at install time, and give
the library no runtime capability. Keeping them project-scoped keeps the
published package unchanged.
