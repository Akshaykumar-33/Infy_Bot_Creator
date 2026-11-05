# BOT WORKFLOW DESIGNER

Lightweight local web app to **visualize bots**, define each bot’s **function** and **routine**, **link** bots with **next / loop / shared** arrows, and **extract** the graph as a Cursor **skill** (`SKILL.md`).

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Workflow

1. **Add bot** — place bots on the canvas
2. **Select a bot** — set name, function, and ordered routine steps
3. **Drag handles** — link bots (`next` by default; side handles for sequence, top/bottom for loops)
4. **Select a link** — change kind to `loop` or `shared`, add a label
5. **Extract skill** — download `SKILL.md` encoding the whole network for an agent
6. **Export / Import** — workflow JSON round-trip; auto-saves to `localStorage`

## Link kinds

| Kind | Look | Use |
|------|------|-----|
| `next` | solid | Normal sequence |
| `loop` | dashed + animated | Retry / re-entry |
| `shared` | dotted | Escalation / common path |

## Skill output

**Extract skill** writes a Cursor-style `SKILL.md` with:

- YAML frontmatter (`name`, `description`)
- Topology summary and execution guide
- Per-bot function, routine, incoming/outgoing links
- Embedded workflow JSON

Drop the file into an agent skills folder (e.g. `.cursor/skills/<name>/SKILL.md`) to reuse the designed workflow.

No backend required — pure frontend.
