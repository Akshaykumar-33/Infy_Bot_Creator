import type { BotEdge, BotNode, LinkKind } from '../types'
import { LINK_KINDS } from '../types'

type InspectorProps = {
  selectedBot: BotNode | null
  selectedEdge: BotEdge | null
  onUpdateBot: (id: string, patch: Partial<BotNode['data']>) => void
  onUpdateEdge: (id: string, patch: { kind?: LinkKind; label?: string }) => void
  onDeleteBot: (id: string) => void
  onDeleteEdge: (id: string) => void
}

export function Inspector({
  selectedBot,
  selectedEdge,
  onUpdateBot,
  onUpdateEdge,
  onDeleteBot,
  onDeleteEdge,
}: InspectorProps) {
  if (!selectedBot && !selectedEdge) {
    return (
      <aside className="inspector inspector--empty">
        <p className="inspector__hint">
          Select a bot to define its function and routine, or a link for next / loop / shared
          arrows. When ready, use <strong>Extract skill</strong> for MD, JSON, TXT, or a full pack.
        </p>
      </aside>
    )
  }

  if (selectedEdge && !selectedBot) {
    const kind = selectedEdge.data?.kind ?? 'next'
    const label = selectedEdge.data?.label ?? ''

    return (
      <aside className="inspector">
        <div className="inspector__header">
          <h2>Link</h2>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => onDeleteEdge(selectedEdge.id)}>
            Delete
          </button>
        </div>

        <label className="field">
          <span>Kind</span>
          <select
            value={kind}
            onChange={(e) => onUpdateEdge(selectedEdge.id, { kind: e.target.value as LinkKind })}
          >
            {LINK_KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Label</span>
          <input
            value={label}
            onChange={(e) => onUpdateEdge(selectedEdge.id, { label: e.target.value })}
            placeholder={kind}
          />
        </label>

        <p className="inspector__meta">
          {selectedEdge.source} → {selectedEdge.target}
        </p>
        <ul className="legend">
          <li>
            <span className="legend__swatch legend__swatch--next" /> next — sequence
          </li>
          <li>
            <span className="legend__swatch legend__swatch--loop" /> loop — retry / re-entry
          </li>
          <li>
            <span className="legend__swatch legend__swatch--shared" /> shared — common path
          </li>
        </ul>
      </aside>
    )
  }

  if (!selectedBot) return null

  const routine = selectedBot.data.routine ?? []

  return (
    <aside className="inspector">
      <div className="inspector__header">
        <h2>Bot</h2>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => onDeleteBot(selectedBot.id)}>
          Delete
        </button>
      </div>

      <label className="field">
        <span>Name</span>
        <input
          value={selectedBot.data.name}
          onChange={(e) => onUpdateBot(selectedBot.id, { name: e.target.value })}
          placeholder="Bot name"
        />
      </label>

      <label className="field">
        <span>Function</span>
        <textarea
          value={selectedBot.data.function}
          onChange={(e) => onUpdateBot(selectedBot.id, { function: e.target.value })}
          placeholder="What this bot does"
          rows={3}
        />
      </label>

      <div className="field">
        <div className="field__row">
          <span>Routine</span>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() =>
              onUpdateBot(selectedBot.id, {
                routine: [...routine, `Step ${routine.length + 1}`],
              })
            }
          >
            Add step
          </button>
        </div>
        <ul className="routine-list">
          {routine.length === 0 && <li className="routine-list__empty">No steps yet</li>}
          {routine.map((step, index) => (
            <li key={`${selectedBot.id}-step-${index}`} className="routine-item">
              <span className="routine-item__index">{index + 1}</span>
              <input
                value={step}
                onChange={(e) => {
                  const next = [...routine]
                  next[index] = e.target.value
                  onUpdateBot(selectedBot.id, { routine: next })
                }}
              />
              <div className="routine-item__actions">
                <button
                  type="button"
                  className="icon-btn"
                  disabled={index === 0}
                  aria-label="Move up"
                  onClick={() => {
                    if (index === 0) return
                    const next = [...routine]
                    ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
                    onUpdateBot(selectedBot.id, { routine: next })
                  }}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  disabled={index === routine.length - 1}
                  aria-label="Move down"
                  onClick={() => {
                    if (index >= routine.length - 1) return
                    const next = [...routine]
                    ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
                    onUpdateBot(selectedBot.id, { routine: next })
                  }}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label="Remove step"
                  onClick={() => {
                    onUpdateBot(
                      selectedBot.id,
                      { routine: routine.filter((_, i) => i !== index) },
                    )
                  }}
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
