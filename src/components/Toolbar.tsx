type ToolbarProps = {
  workflowName: string
  onNameChange: (name: string) => void
  onAddBot: () => void
  onExport: () => void
  onExtractSkill: () => void
  onImport: (file: File) => void
  onClear: () => void
}

export function Toolbar({
  workflowName,
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
        <span className="toolbar__mark" aria-hidden />
        <h1 className="toolbar__title">BOT WORKFLOW DESIGNER</h1>
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
