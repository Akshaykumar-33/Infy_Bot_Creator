import type { BotEdge, BotNode, LinkKind, Workflow } from '../types'
import { emptyWorkflow } from '../types'

const STORAGE_KEY = 'bot-workflow-designer:v1'

export function workflowToGraph(workflow: Workflow): {
  nodes: BotNode[]
  edges: BotEdge[]
} {
  const nodes: BotNode[] = workflow.bots.map((bot) => ({
    id: bot.id,
    type: 'bot',
    position: bot.position,
    data: {
      name: bot.name,
      function: bot.function,
      routine: bot.routine,
    },
  }))

  const edges: BotEdge[] = workflow.links.map((link) => ({
    id: link.id,
    source: link.source,
    target: link.target,
    sourceHandle: link.kind === 'loop' ? 'out-bottom' : 'out-right',
    targetHandle: link.kind === 'loop' ? 'in-top' : 'in-left',
    label: link.label || link.kind,
    data: { kind: link.kind, label: link.label },
    ...edgeStyleForKind(link.kind),
  }))

  return { nodes, edges }
}

export function graphToWorkflow(
  name: string,
  nodes: BotNode[],
  edges: BotEdge[],
): Workflow {
  return {
    name,
    bots: nodes.map((node) => ({
      id: node.id,
      name: node.data.name,
      function: node.data.function,
      routine: node.data.routine,
      position: node.position,
    })),
    links: edges.map((edge) => {
      const kind = (edge.data?.kind ?? 'next') as LinkKind
      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        kind,
        label: edge.data?.label ?? '',
      }
    }),
  }
}

export function edgeStyleForKind(kind: LinkKind) {
  if (kind === 'loop') {
    return {
      type: 'bezier' as const,
      animated: true,
      style: { stroke: 'var(--edge-loop)', strokeDasharray: '6 4', strokeWidth: 2 },
      labelStyle: { fill: 'var(--edge-loop)', fontWeight: 600, fontSize: 11 },
      labelBgStyle: { fill: 'var(--surface)', fillOpacity: 0.92 },
    }
  }
  if (kind === 'shared') {
    return {
      type: 'smoothstep' as const,
      animated: false,
      style: { stroke: 'var(--edge-shared)', strokeWidth: 2.5, strokeDasharray: '2 6' },
      labelStyle: { fill: 'var(--edge-shared)', fontWeight: 600, fontSize: 11 },
      labelBgStyle: { fill: 'var(--surface)', fillOpacity: 0.92 },
    }
  }
  return {
    type: 'smoothstep' as const,
    animated: false,
    style: { stroke: 'var(--edge-next)', strokeWidth: 2 },
    labelStyle: { fill: 'var(--ink-muted)', fontWeight: 500, fontSize: 11 },
    labelBgStyle: { fill: 'var(--surface)', fillOpacity: 0.92 },
  }
}

export function loadWorkflow(): Workflow {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return sampleWorkflow()
    const parsed = JSON.parse(raw) as Workflow
    if (!parsed || !Array.isArray(parsed.bots) || !Array.isArray(parsed.links)) {
      return sampleWorkflow()
    }
    return {
      name: parsed.name || 'Untitled workflow',
      bots: parsed.bots,
      links: parsed.links,
    }
  } catch {
    return sampleWorkflow()
  }
}

export function saveWorkflow(workflow: Workflow): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workflow))
}

export function exportWorkflowJson(workflow: Workflow): string {
  return JSON.stringify(workflow, null, 2)
}

export function parseWorkflowJson(text: string): Workflow {
  const parsed = JSON.parse(text) as Workflow
  if (!parsed || !Array.isArray(parsed.bots) || !Array.isArray(parsed.links)) {
    throw new Error('Invalid workflow JSON')
  }
  return {
    name: parsed.name || 'Imported workflow',
    bots: parsed.bots.map((bot) => ({
      id: String(bot.id),
      name: bot.name || 'Bot',
      function: bot.function || '',
      routine: Array.isArray(bot.routine) ? bot.routine.map(String) : [],
      position: {
        x: Number(bot.position?.x ?? 0),
        y: Number(bot.position?.y ?? 0),
      },
    })),
    links: parsed.links.map((link) => ({
      id: String(link.id),
      source: String(link.source),
      target: String(link.target),
      kind: normalizeKind(link.kind),
      label: link.label || '',
    })),
  }
}

function normalizeKind(kind: unknown): LinkKind {
  if (kind === 'loop' || kind === 'shared' || kind === 'next') return kind
  return 'next'
}

export function downloadWorkflow(workflow: Workflow): void {
  const blob = new Blob([exportWorkflowJson(workflow)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${slugify(workflow.name)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function slugify(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'workflow'
}

export function sampleWorkflow(): Workflow {
  return {
    name: 'Sample bot network',
    bots: [
      {
        id: 'bot-intake',
        name: 'Intake Bot',
        function: 'Collect user request and classify intent',
        routine: ['Greet user', 'Capture request', 'Tag intent'],
        position: { x: 80, y: 160 },
      },
      {
        id: 'bot-router',
        name: 'Router Bot',
        function: 'Route work to specialist bots',
        routine: ['Read intent', 'Choose specialist', 'Hand off payload'],
        position: { x: 420, y: 160 },
      },
      {
        id: 'bot-fulfill',
        name: 'Fulfillment Bot',
        function: 'Complete the resolved task',
        routine: ['Execute action', 'Confirm result', 'Close ticket'],
        position: { x: 760, y: 160 },
      },
    ],
    links: [
      {
        id: 'e1',
        source: 'bot-intake',
        target: 'bot-router',
        kind: 'next',
        label: '',
      },
      {
        id: 'e2',
        source: 'bot-router',
        target: 'bot-fulfill',
        kind: 'next',
        label: '',
      },
      {
        id: 'e3',
        source: 'bot-fulfill',
        target: 'bot-intake',
        kind: 'loop',
        label: 'retry',
      },
      {
        id: 'e4',
        source: 'bot-intake',
        target: 'bot-fulfill',
        kind: 'shared',
        label: 'escalation',
      },
    ],
  }
}

export { emptyWorkflow, STORAGE_KEY }
