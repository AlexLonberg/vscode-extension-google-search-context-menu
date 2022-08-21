import { type ExtensionContext } from 'vscode'
import { getCommands } from './commands.js'
import { getSearchEngines } from './search.js'
import { getSetting } from './settings.js'

function activate (ctx: ExtensionContext): void | Promise<void> {
  const settings = getSetting(ctx)
  const engines = getSearchEngines(ctx, settings.items)
  const commands = getCommands(ctx)

  for (const { name, handler } of engines.getEnabled()) {
    commands.enableSearchEngine(name, handler)
  }
  engines.on('enabled', (e): void => {
    if (e.enabled) commands.enableSearchEngine(e.name, e.handler)
    else commands.disableSearchEngine(e.name)
  })
}

function deactivate () { /**/ }

export {
  activate,
  deactivate
}
