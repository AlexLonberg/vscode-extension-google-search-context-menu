import { Range, window } from 'vscode'

function getSelected (): null | string {
  const textEditor = window.activeTextEditor
  if (!textEditor) return null
  const activeSelection = textEditor.selection
  if (activeSelection.isEmpty) return null
  const text = textEditor.document
    .getText(new Range(activeSelection.start, activeSelection.end))
    .replace(/\s+/g, ' ').trim()
  return text || null
}

export {
  getSelected
}
