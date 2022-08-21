import { type ExtensionContext } from 'vscode'
import {
  type TSearchEngineNames,
  type TSearchEngineChanges,
  googleTemplate,
  configEngineNames
} from './config.js'
import { Emitter } from './emitter.js'
import { ItemConfig, SearchItem } from './item.js'

class SearchEngines extends Emitter<TSearchEngineChanges>{

  /**
   *   + 0 - Только один пункт Google
   *   + 1 - (default) Submenu
   */
  #mode: 0 | 1 = 1
  #google = new ItemConfig('Google', false, googleTemplate)
  #subitemGoogle = new ItemConfig('SubitemGoogle', true, googleTemplate)
  #items = new Map<TSearchEngineNames, SearchItem>([
    ['Google', new SearchItem(this.#google)],
    ['SubitemGoogle', new SearchItem(this.#subitemGoogle)]
  ])

  constructor(items: Iterable<ItemConfig>) {
    super()
    for (const item of items) {
      this.#items.set(item.name, new SearchItem(item))
    }
    this.#checkMode()
    this.#onEvent()
  }

  #switchGoogleItems (): void {
    const s = this.#mode === 1
    this.#google._updateEnable(!s)
    this.#subitemGoogle._updateEnable(s)
  }

  #checkMode (): void {
    const mode = configEngineNames.some((name) => this.#items.get(name)?.enabled) ? 1 : 0
    if (this.#mode !== mode) {
      this.#mode = mode
      this.#switchGoogleItems()
    }
  }

  #onEvent (): void {
    for (const item of this.#items.values()) {
      item.on('enabled', (e) => {
        this.#checkMode()
        this._emit('enabled', e)
      })
    }
  }

  *getEnabled (): Iterable<{ name: TSearchEngineNames, handler: () => void }> {
    for (const [name, item] of this.#items) {
      const handler = item.tryGetHandler()
      if (handler) yield { name, handler }
    }
  }

  deactivate (): void {
    this._clearEmitter()
    for (const item of this.#items.values()) {
      item.deactivate()
    }
  }
}

let _searchEngines: null | SearchEngines = null

function getSearchEngines (ctx: ExtensionContext, items: Iterable<ItemConfig>): SearchEngines {
  if (!_searchEngines) _searchEngines = new SearchEngines(items)
  ctx.subscriptions.push({
    dispose () { _searchEngines?.deactivate() }
  })
  return _searchEngines
}

export {
  type SearchEngines,
  getSearchEngines
}
