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
          <span />
          <span />
          <span />
        </span>
        <div className="toolbar__titles">
          <h1 className="toolbar__title">BOT WORKFLOW DESIGNER</h1>
          <p className="toolbar__tagline">Compose bots · wire routines · extract skills</p>
        </div>
      </div>

      <label className="toolbar__name">
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
          <strong>{botCount}</strong> bots
        </span>
        <span>
          <strong>{linkCount}</strong> links
        </span>
      </div>

      <div className="toolbar__actions">
        <button type="button" className="btn btn--primary" onClick={onAddBot}>
          Add bot
        </button>
        <button type="button" className="btn" onClick={onExport}>
          Export JSON
        </button>
        <button type="button" className="btn btn--accent" onClick={onExtractSkill}>
          Extract skill
        </button>
        <label className="btn btn--file">
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
          Clear
        </button>
      </div>
    </header>
  )
}
