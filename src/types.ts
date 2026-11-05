import type { Edge, Node } from '@xyflow/react'

export type LinkKind = 'next' | 'loop' | 'shared'

export type BotData = {
  name: string
  function: string
  routine: string[]
}

export type BotNode = Node<BotData, 'bot'>

export type LinkData = {
  kind: LinkKind
  label: string
}

export type BotEdge = Edge<LinkData>

export type WorkflowBot = {
  id: string
  name: string
  function: string
  routine: string[]
  position: { x: number; y: number }
}

export type WorkflowLink = {
  id: string
  source: string
  target: string
  kind: LinkKind
  label: string
}

export type Workflow = {
  name: string
  bots: WorkflowBot[]
  links: WorkflowLink[]
}

export const LINK_KINDS: LinkKind[] = ['next', 'loop', 'shared']

export function emptyWorkflow(name = 'Untitled workflow'): Workflow {
  return { name, bots: [], links: [] }
}
