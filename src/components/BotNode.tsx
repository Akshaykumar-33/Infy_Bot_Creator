import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { BotNode as BotNodeType } from '../types'

export function BotNode({ data, selected }: NodeProps<BotNodeType>) {
  const steps = data.routine ?? []
  const preview = steps.slice(0, 3)
  const hasFunction = Boolean(data.function?.trim())

  return (
    <div className={`bot-node${selected ? ' is-selected' : ''}${hasFunction ? '' : ' is-draft'}`}>
      <div className="bot-node__sheen" aria-hidden />
      <Handle
        type="target"
        position={Position.Top}
        id="in-top"
        className="bot-handle bot-handle--soft"
      />
      <Handle type="target" position={Position.Left} id="in-left" className="bot-handle" />

      <div className="bot-node__top">
        <span className="bot-node__eyebrow">Bot</span>
        <span className="bot-node__chip">{steps.length} step{steps.length === 1 ? '' : 's'}</span>
      </div>
      <div className="bot-node__name">{data.name || 'Untitled bot'}</div>
      <p className="bot-node__function">
        {hasFunction ? data.function : 'Define this bot’s function'}
      </p>

      {preview.length > 0 ? (
        <ol className="bot-node__routine">
          {preview.map((step, i) => (
            <li key={`${i}-${step}`}>
              <span>{i + 1}</span>
              {step || `Step ${i + 1}`}
            </li>
          ))}
          {steps.length > 3 && <li className="bot-node__more">+{steps.length - 3} more</li>}
        </ol>
      ) : (
        <div className="bot-node__meta">No routine yet — add steps in the inspector</div>
      )}

      <Handle type="source" position={Position.Right} id="out-right" className="bot-handle" />
      <Handle
        type="source"
        position={Position.Bottom}
        id="out-bottom"
        className="bot-handle bot-handle--soft"
      />
    </div>
  )
}
