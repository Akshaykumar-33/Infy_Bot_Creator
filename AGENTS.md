# Infy_bot

Agent SDK project (`@grok/agent-sdk`). Served agent prompt: `bot/instructions.md`.

## Loop

```bash
npx @grok/agent-sdk validate --dir .
npx @grok/agent-sdk info --dir . --json
npx @grok/agent-sdk tool call list_upcoming_events --dir . --input '{}'
npx @grok/agent-sdk run --dir . --message "..."
npx @grok/agent-sdk eval --dir .
npm run check
```

Use Node, never Bun.

## Layout

- Parent: Infy_bot orchestrator — routes to `email`, `teams`, `calendar` subagents
- Tools: `bot/tools/` (parent surface; subagents inherit — do not put tools under `bot/subagents/*/tools/`)
- Shared Graph helpers: `bot/lib/graph/`
- Evals: project-root `evals/`

## Do not

- Invent Graph side effects in instructions; trust tool results
- Add npm deps unless required
- Point `serve` at a parent folder that contains sibling agents
