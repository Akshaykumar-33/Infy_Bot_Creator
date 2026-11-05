# Infy_bot

Grok-powered orchestrator on Cursor Agent SDK. Routes work to three specialist Grok bots:

- **email** — draft, send, search, summarize, label, reply
- **teams** — post messages, create meetings, search chats, notify channels
- **calendar** — list upcoming events/meetings with full details, schedule, free slots, reschedule, reminders

## Layout

- `bot/agent.ts` / `bot/instructions.md` — Infy_bot orchestrator (Grok, high reasoning)
- `bot/subagents/{email,teams,calendar}/` — specialist Grok bots (`fast`)
- `bot/tools/` — Microsoft Graph-backed tools (Agent SDK: tools live on the parent; subagents inherit them)
- `bot/lib/graph/` — Graph client + mock fixtures
- `evals/` — routing and upcoming-events smoke cases

## Setup

```bash
npm install
cp .env.example .env
# Set CURSOR_API_KEY (or run: npx @grok/agent-sdk login)
# Optionally set MICROSOFT_* for live Graph; otherwise mocks are used
```

## Run

```bash
npx @grok/agent-sdk validate --dir .
npx @grok/agent-sdk info --dir . --json
npx @grok/agent-sdk tool call list_upcoming_events --dir . --input '{}'
npx @grok/agent-sdk dev --dir .
# Playground: http://127.0.0.1:3000/playground
npm run check
```

Model turns and evals need a Cursor credential. `validate`, `info`, and `tool call` do not.

## Mock vs live Graph

| Mode | When | Behavior |
|------|------|----------|
| Mock | Any of `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_TENANT_ID` missing | Deterministic fixtures (`mode: "mock"`) |
| Live | All three set | Calls Microsoft Graph; failures return structured errors |

## Example prompts

- “Draft an email to alex@contoso.com about the Q2 review.”
- “Post a Teams update in Engineering that the deploy finished.”
- “What are all my upcoming meetings? Include attendees and join links.”
