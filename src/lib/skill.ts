import type { Workflow, WorkflowBot, WorkflowLink } from '../types'

function slugify(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'bot-workflow'
  )
}

function botById(workflow: Workflow, id: string): WorkflowBot | undefined {
  return workflow.bots.find((b) => b.id === id)
}

function linkLabel(link: WorkflowLink): string {
  return link.label?.trim() || link.kind
}

function describeOutgoing(workflow: Workflow, botId: string): string {
  const outs = workflow.links.filter((l) => l.source === botId)
  if (outs.length === 0) return '- No outgoing links.'

  return outs
    .map((link) => {
      const target = botById(workflow, link.target)
      const name = target?.name ?? link.target
      return `- **${link.kind}** (${linkLabel(link)}) → **${name}**`
    })
    .join('\n')
}

function describeIncoming(workflow: Workflow, botId: string): string {
  const ins = workflow.links.filter((l) => l.target === botId)
  if (ins.length === 0) return '- No incoming links.'

  return ins
    .map((link) => {
      const source = botById(workflow, link.source)
      const name = source?.name ?? link.source
      return `- From **${name}** via **${link.kind}** (${linkLabel(link)})`
    })
    .join('\n')
}

function topologySummary(workflow: Workflow): string {
  const next = workflow.links.filter((l) => l.kind === 'next').length
  const loop = workflow.links.filter((l) => l.kind === 'loop').length
  const shared = workflow.links.filter((l) => l.kind === 'shared').length
  return [
    `- Bots: **${workflow.bots.length}**`,
    `- Next arrows: **${next}**`,
    `- Loop arrows: **${loop}**`,
    `- Shared arrows: **${shared}**`,
  ].join('\n')
}

function orderedBotSections(workflow: Workflow): string {
  if (workflow.bots.length === 0) {
    return '_No bots defined yet._'
  }

  return workflow.bots
    .map((bot, index) => {
      const routine =
        bot.routine.length === 0
          ? '- _(no routine steps)_'
          : bot.routine.map((step, i) => `${i + 1}. ${step}`).join('\n')

      return `### ${index + 1}. ${bot.name || 'Untitled bot'}

**Function:** ${bot.function?.trim() || '_(undefined)_'}

**Routine:**
${routine}

**Incoming:**
${describeIncoming(workflow, bot.id)}

**Outgoing:**
${describeOutgoing(workflow, bot.id)}`
    })
    .join('\n\n')
}

function executionGuide(workflow: Workflow): string {
  const starts = workflow.bots.filter(
    (bot) => !workflow.links.some((l) => l.target === bot.id && l.kind === 'next'),
  )
  const startNames =
    starts.length > 0
      ? starts.map((b) => `**${b.name}**`).join(', ')
      : 'any bot (graph has no clear start)'

  return `1. Begin at ${startNames}.
2. For the active bot, perform its **function**, then run its **routine** steps in order.
3. Follow **next** arrows for the normal path.
4. Follow **loop** arrows to retry or re-enter an earlier bot; avoid infinite loops unless the routine says otherwise.
5. Use **shared** arrows for cross-cutting handoffs (escalation, common helpers, shared context).
6. Stop when a bot has no outgoing **next** link and no further loop/shared action is required.`
}

/** Build a Cursor-style SKILL.md from the designed bot workflow. */
export function workflowToSkillMarkdown(workflow: Workflow): string {
  const skillName = slugify(workflow.name)
  const description =
    `Run the "${workflow.name}" bot workflow: ${workflow.bots.length} bot(s) with functions, routines, next/loop/shared links.`.slice(
      0,
      200,
    )

  return `---
name: ${skillName}
description: ${description}
---

# ${workflow.name || 'Bot Workflow'}

This skill encodes a multi-bot workflow designed in **BOT WORKFLOW DESIGNER**.
Treat each bot as a role: honor its function, run its routine in order, then follow the typed arrows.

## Topology

${topologySummary(workflow)}

## How to execute

${executionGuide(workflow)}

## Bots

${orderedBotSections(workflow)}

## Link legend

| Kind | Meaning |
|------|---------|
| next | Primary sequence between bots |
| loop | Retry / re-entry path (often back to an earlier bot) |
| shared | Common / cross-cutting arrow (escalation, shared helper) |

## Embedded workflow JSON

\`\`\`json
${JSON.stringify(workflow, null, 2)}
\`\`\`
`
}

export function downloadSkill(workflow: Workflow): void {
  const markdown = workflowToSkillMarkdown(workflow)
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'SKILL.md'
  a.click()
  URL.revokeObjectURL(url)
}

export { slugify }
