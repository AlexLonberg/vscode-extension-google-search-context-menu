import {
  type ExtensionContext,
  type WorkspaceConfiguration,
  workspace
} from 'vscode'
import {
  type TConfigEngineNames,
  type TItemConfig,
  globalExtId,
  defaultConfig,
  configEngineNames
} from './config.js'
import { ItemConfig } from './item.js'

interface ISettings {
  readonly items: IterableIterator<ItemConfig>
  deactivate (): void
}

/**
 * @param wc Ключ по дефолту для items.
 */
function readItem (wc: WorkspaceConfiguration, name: TConfigEngineNames) {
  const section = defaultConfig.items[name]
  let queryTemplate = wc.get<string>(`items.${name}.queryTemplate`, section.queryTemplate)
  let enabled = false
  // Ошибка может возникнуть только при явном вмешательстве в код расширения.
  if (typeof queryTemplate !== 'string') {
    queryTemplate = ''
  } else {
    enabled = !!wc.get<boolean>(`items.${name}.enabled`, section.enabled)
  }
  return {
    queryTemplate,
    enabled
  }
}

function* readItems (): Iterable<[TConfigEngineNames, TItemConfig]> {
  const wc = workspace.getConfiguration(globalExtId)
  for (const name of configEngineNames) {
    yield [name, readItem(wc, name)]
  }
}

function createSettings (): ISettings {
  const itemConfig = new Map<TConfigEngineNames, ItemConfig>()

  for (const [name, { queryTemplate, enabled }] of readItems()) {
    itemConfig.set(name, new ItemConfig(name, enabled, queryTemplate))
  }

  function updateItems (): void {
    for (const [name, { queryTemplate, enabled }] of readItems()) {
      itemConfig.get(name)?._updateConfig(enabled, queryTemplate)
    }
  }

  const itemsSection = `${globalExtId}.items`
  const dis = workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration(itemsSection)) updateItems()
  })

  return {
    get items (): IterableIterator<ItemConfig> {
      return itemConfig.values()
    },
    deactivate (): void {
      dis.dispose()
    }
  }
}

let _setting: null | ISettings = null

function getSetting (ctx: ExtensionContext): ISettings {
  if (!_setting) _setting = createSettings()
  ctx.subscriptions.push({
    dispose () { _setting?.deactivate() }
  })
  return _setting
}

export {
  type ISettings,
  getSetting
}
