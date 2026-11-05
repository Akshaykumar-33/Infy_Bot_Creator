import type { Workflow, WorkflowBot, WorkflowLink } from '../types'

export type SkillFormat = 'md' | 'json' | 'txt' | 'pack'

export type SkillArtifact = {
  filename: string
  mime: string
  content: string
}

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

function startBots(workflow: Workflow): WorkflowBot[] {
  return workflow.bots.filter(
    (bot) => !workflow.links.some((l) => l.target === bot.id && l.kind === 'next'),
  )
}

function executionGuide(workflow: Workflow): string {
  const starts = startBots(workflow)
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

function skillMeta(workflow: Workflow) {
  const name = slugify(workflow.name)
  const description =
    `Run the "${workflow.name}" bot workflow: ${workflow.bots.length} bot(s) with functions, routines, next/loop/shared links.`.slice(
      0,
      200,
    )
  return { name, description }
}

/** Build a Cursor-style SKILL.md from the designed bot workflow. */
export function workflowToSkillMarkdown(workflow: Workflow): string {
  const { name, description } = skillMeta(workflow)

  return `---
name: ${name}
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

/** Structured skill JSON for agents / tooling. */
export function workflowToSkillJson(workflow: Workflow): string {
  const { name, description } = skillMeta(workflow)
  const starts = startBots(workflow)

  const payload = {
    skill: {
      name,
      title: workflow.name || 'Bot Workflow',
      description,
      version: '1.0.0',
      source: 'BOT WORKFLOW DESIGNER',
      formats: ['SKILL.md', 'skill.json', 'skill.txt'],
    },
    topology: {
      bots: workflow.bots.length,
      links: workflow.links.length,
      next: workflow.links.filter((l) => l.kind === 'next').length,
      loop: workflow.links.filter((l) => l.kind === 'loop').length,
      shared: workflow.links.filter((l) => l.kind === 'shared').length,
      starts: starts.map((b) => ({ id: b.id, name: b.name })),
    },
    bots: workflow.bots.map((bot) => ({
      id: bot.id,
      name: bot.name,
      function: bot.function,
      routine: bot.routine,
      position: bot.position,
      incoming: workflow.links
        .filter((l) => l.target === bot.id)
        .map((l) => ({
          id: l.id,
          from: l.source,
          kind: l.kind,
          label: l.label,
        })),
      outgoing: workflow.links
        .filter((l) => l.source === bot.id)
        .map((l) => ({
          id: l.id,
          to: l.target,
          kind: l.kind,
          label: l.label,
        })),
    })),
    links: workflow.links,
    workflow,
    markdown: workflowToSkillMarkdown(workflow),
  }

  return JSON.stringify(payload, null, 2)
}

/** Plain-text skill brief for quick paste into prompts. */
export function workflowToSkillText(workflow: Workflow): string {
  const { name, description } = skillMeta(workflow)
  const lines: string[] = [
    `SKILL: ${name}`,
    description,
    '',
    `Workflow: ${workflow.name}`,
    executionGuide(workflow).replace(/\*\*/g, ''),
    '',
    'BOTS',
  ]

  for (const [index, bot] of workflow.bots.entries()) {
    lines.push(`${index + 1}. ${bot.name}`)
    lines.push(`   Function: ${bot.function || '(undefined)'}`)
    if (bot.routine.length) {
      lines.push(`   Routine: ${bot.routine.map((s, i) => `${i + 1}) ${s}`).join('; ')}`)
    } else {
      lines.push('   Routine: (none)')
    }
    const outs = workflow.links.filter((l) => l.source === bot.id)
    if (outs.length) {
      lines.push(
        `   Links: ${outs
          .map((l) => {
            const t = botById(workflow, l.target)?.name ?? l.target
            return `${l.kind}->${t}${l.label ? `(${l.label})` : ''}`
          })
          .join(', ')}`,
      )
    }
    lines.push('')
  }

  return lines.join('\n').trim() + '\n'
}

function downloadBlob(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function buildSkillArtifacts(
  workflow: Workflow,
  formats: SkillFormat[],
): SkillArtifact[] {
  const base = slugify(workflow.name)
  const selected = new Set(formats)
  const artifacts: SkillArtifact[] = []

  if (selected.has('md') || selected.has('pack')) {
    artifacts.push({
      filename: 'SKILL.md',
      mime: 'text/markdown;charset=utf-8',
      content: workflowToSkillMarkdown(workflow),
    })
  }

  if (selected.has('json') || selected.has('pack')) {
    artifacts.push({
      filename: `${base}.skill.json`,
      mime: 'application/json;charset=utf-8',
      content: workflowToSkillJson(workflow),
    })
  }

  if (selected.has('txt') || selected.has('pack')) {
    artifacts.push({
      filename: `${base}.skill.txt`,
      mime: 'text/plain;charset=utf-8',
      content: workflowToSkillText(workflow),
    })
  }

  if (selected.has('pack')) {
    artifacts.push({
      filename: `${base}.skill-pack.json`,
      mime: 'application/json;charset=utf-8',
      content: JSON.stringify(
        {
          name: base,
          title: workflow.name,
          extractedAt: new Date().toISOString(),
          files: artifacts.map((a) => ({
            filename: a.filename,
            content: a.content,
          })),
          workflow,
        },
        null,
        2,
      ),
    })
  }

  return artifacts
}

export async function downloadSkillFormats(
  workflow: Workflow,
  formats: SkillFormat[],
): Promise<void> {
  const artifacts = buildSkillArtifacts(workflow, formats)
  for (const [index, artifact] of artifacts.entries()) {
    downloadBlob(artifact.filename, artifact.content, artifact.mime)
    if (index < artifacts.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 180))
    }
  }
}

/** @deprecated Prefer downloadSkillFormats */
export function downloadSkill(workflow: Workflow): void {
  void downloadSkillFormats(workflow, ['md'])
}

export { slugify }
