import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type OnSelectionChangeParams,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useCallback, useMemo } from 'react'
import type { BotEdge, BotNode } from '../types'
import { BotNode as BotNodeView } from './BotNode'

type CanvasProps = {
  nodes: BotNode[]
  edges: BotEdge[]
  onNodesChange: (changes: NodeChange<BotNode>[]) => void
  onEdgesChange: (changes: EdgeChange<BotEdge>[]) => void
  onConnect: (connection: Connection) => void
  onSelectionChange: (params: OnSelectionChangeParams<BotNode, BotEdge>) => void
}

export function Canvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onSelectionChange,
}: CanvasProps) {
  const nodeTypes = useMemo(() => ({ bot: BotNodeView }), [])

  const handleSelectionChange = useCallback(
    (params: OnSelectionChangeParams) => {
      onSelectionChange(params as OnSelectionChangeParams<BotNode, BotEdge>)
    },
    [onSelectionChange],
  )

  return (
    <div className="canvas-shell">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={handleSelectionChange}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        deleteKeyCode={['Backspace', 'Delete']}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          id="grid"
          variant={BackgroundVariant.Lines}
          gap={28}
          size={1}
          color="var(--canvas-grid)"
        />
        <Controls showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          nodeColor="var(--accent)"
          maskColor="color-mix(in srgb, var(--ink) 18%, transparent)"
        />
      </ReactFlow>
    </div>
  )
}
