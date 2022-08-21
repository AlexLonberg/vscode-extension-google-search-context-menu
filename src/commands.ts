import {
  type ExtensionContext,
  commands
} from 'vscode'
import {
  type TSearchEngineNames,
  type TCommandNames,
  globalExtId
} from './config.js'

class CommandRegister {

  #enabled = new Map<TCommandNames, { dispose (): unknown }>()

  enableSearchEngine (name: TSearchEngineNames, handler: (() => void)): void {
    const cn = `${globalExtId}.search.${name}` as const
    const d = this.#enabled.get(cn)
    if (d) d.dispose()
    else commands.executeCommand('setContext', `${cn}._enabled`, true)
    this.#enabled.set(cn, commands.registerCommand(cn, handler))
  }

  updateSearchEngine (name: TSearchEngineNames, handler: (() => void)): void {
    this.enableSearchEngine(name, handler)
  }

  disableSearchEngine (name: TSearchEngineNames): void {
    const cn = `${globalExtId}.search.${name}` as const
    const d = this.#enabled.get(cn)
    if (d) {
      d.dispose()
      this.#enabled.delete(cn)
      commands.executeCommand('setContext', `${cn}._enabled`, false)
    }
  }

  deactivate (): void {
    for (const [cn, d] of this.#enabled) {
      d.dispose()
      commands.executeCommand('setContext', `${cn}._enabled`, false)
    }
    this.#enabled.clear()
  }
}

let _commands: null | CommandRegister = null

function getCommands (ctx: ExtensionContext): CommandRegister {
  if (!_commands) _commands = new CommandRegister()
  ctx.subscriptions.push({
    dispose () { _commands?.deactivate() }
  })
  return _commands
}

export {
  type CommandRegister,
  getCommands
}
