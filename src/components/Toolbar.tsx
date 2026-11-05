import { Icon } from './Icons'

type ToolbarProps = {
  workflowName: string
  botCount: number
  linkCount: number
  onNameChange: (name: string) => void
  onAddBot: () => void
  onExport: () => void
  onExtractSkill: () => void
  onImport: (file: File) => void
  onClear: () => void
}

export function Toolbar({
  workflowName,
  botCount,
  linkCount,
  onNameChange,
  onAddBot,
  onExport,
  onExtractSkill,
  onImport,
  onClear,
}: ToolbarProps) {
  return (
    <header className="toolbar">
      <div className="toolbar__brand">
        <span className="toolbar__mark" aria-hidden>
          <Icon name="workflow" size={18} />
        </span>
        <div className="toolbar__titles">
          <h1 className="toolbar__title">BOT WORKFLOW DESIGNER</h1>
          <p className="toolbar__tagline">Compose bots · wire routines · extract skills</p>
        </div>
      </div>

      <label className="toolbar__name">
        <span className="toolbar__name-icon" aria-hidden>
          <Icon name="spark" size={14} />
        </span>
        <span className="sr-only">Workflow name</span>
        <input
          value={workflowName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Workflow name"
          spellCheck={false}
        />
      </label>

      <div className="toolbar__stats" aria-label="Workflow stats">
        <span>
          <Icon name="bots" size={14} />
          <strong>{botCount}</strong> bots
        </span>
        <span>
          <Icon name="link" size={14} />
          <strong>{linkCount}</strong> links
        </span>
      </div>

      <div className="toolbar__actions">
        <button type="button" className="btn btn--primary" onClick={onAddBot}>
          <Icon name="add" size={16} />
          Add bot
        </button>
        <button type="button" className="btn" onClick={onExport}>
          <Icon name="export" size={16} />
          Export JSON
        </button>
        <button type="button" className="btn btn--accent" onClick={onExtractSkill}>
          <Icon name="extract" size={16} />
          Extract skill
        </button>
        <label className="btn btn--file">
          <Icon name="import" size={16} />
          Import
          <input
            type="file"
            accept="application/json,.json"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onImport(file)
              e.target.value = ''
            }}
          />
        </label>
        <button type="button" className="btn btn--ghost" onClick={onClear}>
          <Icon name="clear" size={16} />
          Clear
        </button>
      </div>
    </header>
  )
}
