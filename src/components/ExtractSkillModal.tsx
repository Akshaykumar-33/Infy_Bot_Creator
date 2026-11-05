import { useEffect, useId, useState } from 'react'
import type { SkillFormat } from '../lib/skill'

type ExtractSkillModalProps = {
  open: boolean
  workflowName: string
  onClose: () => void
  onExtract: (formats: SkillFormat[]) => void
}

const OPTIONS: { id: SkillFormat; title: string; detail: string }[] = [
  {
    id: 'md',
    title: 'SKILL.md',
    detail: 'Cursor-style skill with frontmatter + execution guide',
  },
  {
    id: 'json',
    title: 'skill.json',
    detail: 'Structured skill payload for agents and tooling',
  },
  {
    id: 'txt',
    title: 'skill.txt',
    detail: 'Plain-text brief you can paste into a prompt',
  },
  {
    id: 'pack',
    title: 'Full pack',
    detail: 'MD + JSON + TXT plus a single skill-pack.json bundle',
  },
]

export function ExtractSkillModal({
  open,
  workflowName,
  onClose,
  onExtract,
}: ExtractSkillModalProps) {
  const titleId = useId()
  const [selected, setSelected] = useState<SkillFormat[]>(['md', 'json'])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const toggle = (id: SkillFormat) => {
    setSelected((prev) => {
      if (id === 'pack') return prev.includes('pack') ? [] : ['pack']
      const withoutPack = prev.filter((f) => f !== 'pack')
      return withoutPack.includes(id)
        ? withoutPack.filter((f) => f !== id)
        : [...withoutPack, id]
    })
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__glow" aria-hidden />
        <header className="modal__header">
          <div>
            <p className="modal__eyebrow">Extract skill</p>
            <h2 id={titleId}>{workflowName || 'Untitled workflow'}</h2>
          </div>
          <button type="button" className="icon-btn modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <p className="modal__lead">
          Choose the formats to download. Drop <code>SKILL.md</code> into an agent skills folder, or
          keep JSON/TXT for pipelines and prompts.
        </p>

        <ul className="extract-options">
          {OPTIONS.map((opt) => {
            const checked = selected.includes(opt.id)
            return (
              <li key={opt.id}>
                <label className={`extract-option${checked ? ' is-checked' : ''}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(opt.id)}
                  />
                  <span className="extract-option__body">
                    <span className="extract-option__title">{opt.title}</span>
                    <span className="extract-option__detail">{opt.detail}</span>
                  </span>
                </label>
              </li>
            )
          })}
        </ul>

        <footer className="modal__footer">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn--primary"
            disabled={selected.length === 0}
            onClick={() => onExtract(selected)}
          >
            Download {selected.length || 0} file{selected.length === 1 ? '' : 's'}
          </button>
        </footer>
      </div>
    </div>
  )
}
