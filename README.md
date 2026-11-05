# BOT WORKFLOW DESIGNER

Lightweight local web app to **visualize bots**, define each bot’s **function** and **routine**, **link** bots with **next / loop / shared** arrows, and **extract** the graph as skill files (`SKILL.md`, JSON, TXT, or a full pack).

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
5. **Extract skill** — choose formats and download:
   - `SKILL.md` — Cursor-style skill with YAML frontmatter
   - `*.skill.json` — structured skill payload for agents/tooling
   - `*.skill.txt` — plain-text brief for prompts
   - **Full pack** — MD + JSON + TXT plus a `*.skill-pack.json` bundle
6. **Export / Import** — workflow JSON round-trip; auto-saves to `localStorage`

## Link kinds

| Kind | Look | Use |
|------|------|-----|
| `next` | solid | Normal sequence |
| `loop` | dashed + animated | Retry / re-entry |
| `shared` | dotted | Escalation / common path |

No backend required — pure frontend.
