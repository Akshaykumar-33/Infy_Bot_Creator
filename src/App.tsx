import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type OnSelectionChangeParams,
} from '@xyflow/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Canvas } from './components/Canvas'
import { Inspector } from './components/Inspector'
import { Toolbar } from './components/Toolbar'
import { downloadSkill } from './lib/skill'
import {
  downloadWorkflow,
  edgeStyleForKind,
  emptyWorkflow,
  graphToWorkflow,
  loadWorkflow,
  parseWorkflowJson,
  saveWorkflow,
  workflowToGraph,
} from './lib/storage'
import type { BotEdge, BotNode, LinkKind } from './types'

function newBotId(): string {
  return `bot-${crypto.randomUUID().slice(0, 8)}`
}

function newEdgeId(): string {
  return `link-${crypto.randomUUID().slice(0, 8)}`
}

export default function App() {
  const initial = useMemo(() => {
    const workflow = loadWorkflow()
    const graph = workflowToGraph(workflow)
    return { name: workflow.name, ...graph }
  }, [])

  const [workflowName, setWorkflowName] = useState(initial.name)
  const [nodes, setNodes] = useState<BotNode[]>(initial.nodes)
  const [edges, setEdges] = useState<BotEdge[]>(initial.edges)
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null)
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)

  useEffect(() => {
    const workflow = graphToWorkflow(workflowName, nodes, edges)
    saveWorkflow(workflow)
  }, [workflowName, nodes, edges])

  const selectedBot = useMemo(
    () => nodes.find((n) => n.id === selectedBotId) ?? null,
    [nodes, selectedBotId],
  )
  const selectedEdge = useMemo(
    () => edges.find((e) => e.id === selectedEdgeId) ?? null,
    [edges, selectedEdgeId],
  )

  const onNodesChange = useCallback((changes: NodeChange<BotNode>[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds))
  }, [])

  const onEdgesChange = useCallback((changes: EdgeChange<BotEdge>[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds))
  }, [])

  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return
    const kind: LinkKind = 'next'
    const edge: BotEdge = {
      id: newEdgeId(),
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle ?? undefined,
      targetHandle: connection.targetHandle ?? undefined,
      label: kind,
      data: { kind, label: '' },
      ...edgeStyleForKind(kind),
    }
    setEdges((eds) => addEdge(edge, eds))
  }, [])

  const onSelectionChange = useCallback(
    ({ nodes: selNodes, edges: selEdges }: OnSelectionChangeParams<BotNode, BotEdge>) => {
      setSelectedBotId(selNodes[0]?.id ?? null)
      setSelectedEdgeId(selNodes.length ? null : (selEdges[0]?.id ?? null))
    },
    [],
  )

  const handleAddBot = useCallback(() => {
    const id = newBotId()
    const offset = nodes.length * 36
    const bot: BotNode = {
      id,
      type: 'bot',
      position: { x: 120 + offset, y: 120 + offset },
      data: {
        name: `Bot ${nodes.length + 1}`,
        function: '',
        routine: [],
      },
    }
    setNodes((nds) => [...nds, bot])
    setSelectedBotId(id)
    setSelectedEdgeId(null)
  }, [nodes.length])

  const handleUpdateBot = useCallback((id: string, patch: Partial<BotNode['data']>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...patch } } : node,
      ),
    )
  }, [])

  const handleUpdateEdge = useCallback(
    (id: string, patch: { kind?: LinkKind; label?: string }) => {
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id !== id) return edge
          const kind = patch.kind ?? edge.data?.kind ?? 'next'
          const label = patch.label ?? edge.data?.label ?? ''
          return {
            ...edge,
            label: label || kind,
            data: { kind, label },
            sourceHandle: kind === 'loop' ? 'out-bottom' : 'out-right',
            targetHandle: kind === 'loop' ? 'in-top' : 'in-left',
            ...edgeStyleForKind(kind),
          }
        }),
      )
    },
    [],
  )

  const handleDeleteBot = useCallback((id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id))
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id))
    setSelectedBotId(null)
  }, [])

  const handleDeleteEdge = useCallback((id: string) => {
    setEdges((eds) => eds.filter((e) => e.id !== id))
    setSelectedEdgeId(null)
  }, [])

  const handleExport = useCallback(() => {
    downloadWorkflow(graphToWorkflow(workflowName, nodes, edges))
  }, [workflowName, nodes, edges])

  const handleExtractSkill = useCallback(() => {
    downloadSkill(graphToWorkflow(workflowName, nodes, edges))
  }, [workflowName, nodes, edges])

  const handleImport = useCallback(async (file: File) => {
    try {
      const text = await file.text()
      const workflow = parseWorkflowJson(text)
      const graph = workflowToGraph(workflow)
      setWorkflowName(workflow.name)
      setNodes(graph.nodes)
      setEdges(graph.edges)
      setSelectedBotId(null)
      setSelectedEdgeId(null)
    } catch {
      window.alert('Could not import that file. Use a valid workflow JSON export.')
    }
  }, [])

  const handleClear = useCallback(() => {
    if (!window.confirm('Clear the canvas? This removes all bots and links.')) return
    const empty = emptyWorkflow(workflowName || 'Untitled workflow')
    const graph = workflowToGraph(empty)
    setNodes(graph.nodes)
    setEdges(graph.edges)
    setSelectedBotId(null)
    setSelectedEdgeId(null)
  }, [workflowName])

  return (
    <div className="app">
      <Toolbar
        workflowName={workflowName}
        onNameChange={setWorkflowName}
        onAddBot={handleAddBot}
        onExport={handleExport}
        onExtractSkill={handleExtractSkill}
        onImport={handleImport}
        onClear={handleClear}
      />
      <div className="workspace">
        <Canvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onSelectionChange={onSelectionChange}
        />
        <Inspector
          selectedBot={selectedBot}
          selectedEdge={selectedEdge}
          onUpdateBot={handleUpdateBot}
          onUpdateEdge={handleUpdateEdge}
          onDeleteBot={handleDeleteBot}
          onDeleteEdge={handleDeleteEdge}
        />
      </div>
    </div>
  )
}
