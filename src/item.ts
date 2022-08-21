import { commands } from 'vscode'
import {
  type TItemConfigChanges,
  type TSearchEngineNames,
  type TSearchEngineChanges
} from './config.js'
import { Emitter } from './emitter.js'
import {
  type MakeUri,
  templateParse
} from './templateParse.js'
import { getSelected } from './getSelected.js'

class ItemConfig extends Emitter<TItemConfigChanges> {

  #name: TSearchEngineNames
  #enabled: boolean
  #queryTemplate: string

  constructor(
    name: TSearchEngineNames,
    enabled: boolean,
    queryTemplate: string
  ) {
    super()
    this.#name = name
    this.#enabled = enabled
    this.#queryTemplate = queryTemplate
  }

  get name (): TSearchEngineNames {
    return this.#name
  }
  get enabled (): boolean {
    return this.#enabled
  }
  get queryTemplate (): string {
    return this.#queryTemplate
  }

  _updateEnable (enabled: boolean): void {
    if (this.#enabled === enabled) return
    this.#enabled = enabled
    this._emit('enabled', { type: 'enabled', enabled })
  }

  _updateConfig (enabled: boolean, queryTemplate: string): void {
    let type: null | 'change' | 'enabled' | 'queryTemplate' = null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const e: any = {}
    if (this.#enabled !== enabled) {
      this.#enabled = enabled
      e.enabled = enabled
      type = 'enabled'
    }
    if (this.#queryTemplate !== queryTemplate) {
      this.#queryTemplate = queryTemplate
      e.queryTemplate = queryTemplate
      type = type ? 'change' : 'queryTemplate'
    }
    if (type) this._emit(type, { type, ...e })
  }
}

class SearchItem extends Emitter<TSearchEngineChanges> {

  #item: ItemConfig
  #enabled = false
  #makeUri: null | MakeUri = null
  #handler: null | (() => void) = null

  constructor(item: ItemConfig) {
    super()
    this.#item = item
    this.#makeUri = templateParse(item.queryTemplate)
    this.#enabled = this.#makeUri ? item.enabled : false

    item.on('change', ({ enabled, queryTemplate }) => {
      this.#makeUri = templateParse(queryTemplate)
      this.#handler = null
      enabled ? this.#updateAndEnable() : this.#disable()
    })
    item.on('enabled', ({ enabled }) => {
      enabled ? this.#enable() : this.#disable()
    })
    item.on('queryTemplate', ({ queryTemplate }) => {
      this.#makeUri = templateParse(queryTemplate)
      this.#handler = null
      if (this.#enabled) this.#updateAndEnable()
    })
  }

  get name (): TSearchEngineNames {
    return this.#item.name
  }
  get enabled (): boolean {
    return this.#enabled
  }

  #createHandler (): null | (() => void) {
    if (!this.#handler) {
      const makeUri = this.#makeUri
      if (!makeUri) return null
      this.#handler = () => {
        const txt = getSelected()
        if (!txt) return
        const uri = makeUri(txt)
        if (!uri) return
        commands.executeCommand('vscode.open', uri)
      }
    }
    return this.#handler
  }

  #updateAndEnable (): void {
    const handler = this.#createHandler()
    if (!handler) return
    this.#enabled = true
    this._emit('enabled', { type: 'enabled', name: this.name, enabled: true, handler })
  }

  #enable (): void {
    if (this.#enabled) return
    this.#updateAndEnable()
  }

  #disable (): void {
    if (!this.#enabled) return
    this.#enabled = false
    this._emit('enabled', { type: 'enabled', name: this.name, enabled: false })
  }

  /**
   * Возвратит обработчик, только если enabled.
   */
  tryGetHandler (): null | (() => void) {
    return this.#enabled ? this.#createHandler() : null
  }

  deactivate (): void {
    this._clearEmitter()
  }
}

export {
  ItemConfig,
  SearchItem
}
