import type { BotEdge, BotNode, LinkKind } from '../types'
import { LINK_KINDS } from '../types'
import { Icon, type IconName } from './Icons'

type InspectorProps = {
  selectedBot: BotNode | null
  selectedEdge: BotEdge | null
  onUpdateBot: (id: string, patch: Partial<BotNode['data']>) => void
  onUpdateEdge: (id: string, patch: { kind?: LinkKind; label?: string }) => void
  onDeleteBot: (id: string) => void
  onDeleteEdge: (id: string) => void
}

const KIND_META: Record<LinkKind, { icon: IconName; label: string }> = {
  next: { icon: 'next', label: 'sequence' },
  loop: { icon: 'loop', label: 'retry / re-entry' },
  shared: { icon: 'shared', label: 'common path' },
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
        <div className="inspector__empty-art" aria-hidden>
          <span className="inspector__empty-orb">
            <Icon name="bot" size={28} />
          </span>
          <span className="inspector__empty-orb inspector__empty-orb--delay">
            <Icon name="link" size={22} />
          </span>
          <span className="inspector__empty-orb inspector__empty-orb--delay2">
            <Icon name="extract" size={20} />
          </span>
        </div>
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
          <h2>
            <Icon name="link" size={18} />
            Link
          </h2>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => onDeleteEdge(selectedEdge.id)}
          >
            <Icon name="delete" size={14} />
            Delete
          </button>
        </div>

        <div className="kind-pills" role="group" aria-label="Link kind">
          {LINK_KINDS.map((k) => (
            <button
              key={k}
              type="button"
              className={`kind-pill kind-pill--${k}${kind === k ? ' is-active' : ''}`}
              onClick={() => onUpdateEdge(selectedEdge.id, { kind: k })}
            >
              <Icon name={KIND_META[k].icon} size={15} />
              {k}
            </button>
          ))}
        </div>

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
          {LINK_KINDS.map((k) => (
            <li key={k}>
              <Icon name={KIND_META[k].icon} size={14} className={`legend__icon legend__icon--${k}`} />
              {k} — {KIND_META[k].label}
            </li>
          ))}
        </ul>
      </aside>
    )
  }

  if (!selectedBot) return null

  const routine = selectedBot.data.routine ?? []

  return (
    <aside className="inspector">
      <div className="inspector__header">
        <h2>
          <span className="inspector__title-avatar" aria-hidden>
            <Icon name="bot" size={16} />
          </span>
          Bot
        </h2>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => onDeleteBot(selectedBot.id)}
        >
          <Icon name="delete" size={14} />
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
        <span>
          <Icon name="function" size={12} /> Function
        </span>
        <textarea
          value={selectedBot.data.function}
          onChange={(e) => onUpdateBot(selectedBot.id, { function: e.target.value })}
          placeholder="What this bot does"
          rows={3}
        />
      </label>

      <div className="field">
        <div className="field__row">
          <span>
            <Icon name="steps" size={12} /> Routine
          </span>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() =>
              onUpdateBot(selectedBot.id, {
                routine: [...routine, `Step ${routine.length + 1}`],
              })
            }
          >
            <Icon name="add" size={13} />
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
                  <Icon name="up" size={14} />
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
                  <Icon name="down" size={14} />
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label="Remove step"
                  onClick={() => {
                    onUpdateBot(selectedBot.id, {
                      routine: routine.filter((_, i) => i !== index),
                    })
                  }}
                >
                  <Icon name="close" size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
