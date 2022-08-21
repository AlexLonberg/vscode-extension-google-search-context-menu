const globalExtId = 'googleSearchContextMenu'
const queryPlaceholder = /\{\s*SELECTION\s*\}/
const googleTemplate = 'https://www.google.com/search?q={SELECTION}'

const defaultConfig = {
  items: {
    StackOverflow: {
      enabled: true,
      queryTemplate: 'https://www.google.com/search?q={SELECTION} site:https://stackoverflow.com/'
    },
    MDNWeb: {
      enabled: true,
      queryTemplate: 'https://www.google.com/search?q={SELECTION} site:https://developer.mozilla.org/'
    },
    Microsoft: {
      enabled: true,
      queryTemplate: 'https://www.google.com/search?q={SELECTION} site:https://docs.microsoft.com/'
    },
    RustLang: {
      enabled: true,
      queryTemplate: 'https://www.google.com/search?q={SELECTION} site:https://doc.rust-lang.org/'
    },
    Python: {
      enabled: true,
      queryTemplate: 'https://www.google.com/search?q={SELECTION} site:https://docs.python.org/'
    },
    GoLang: {
      enabled: true,
      queryTemplate: 'https://www.google.com/search?q={SELECTION} site:https://go.dev/doc/'
    },
    NodeJS: {
      enabled: true,
      queryTemplate: 'https://www.google.com/search?q={SELECTION} site:https://nodejs.org/api/'
    }
  }
}

const configEngineNames = [
  'StackOverflow',
  'MDNWeb',
  'Microsoft',
  'RustLang',
  'Python',
  'GoLang',
  'NodeJS'
] as const
type TConfigEngineNames = (typeof configEngineNames)[number]

const searchEngineNames = [
  'Google',
  'SubitemGoogle',
  ...configEngineNames
] as const
type TSearchEngineNames = (typeof searchEngineNames)[number]

type TCommandNames = `${typeof globalExtId}.search.${TSearchEngineNames}`

type TItemConfig = {
  queryTemplate: string
  enabled: boolean
}

type TItemConfigChanges =
  ({ type: 'change' } & TItemConfig) |
  { type: 'enabled', enabled: boolean } |
  { type: 'queryTemplate', queryTemplate: string }

type TSearchEngineChanges = {
  type: 'enabled'
  name: TSearchEngineNames
} & ({ enabled: true, handler: () => void } | { enabled: false })

export {
  globalExtId,
  queryPlaceholder,
  googleTemplate,
  defaultConfig,
  // 
  type TConfigEngineNames,
  type TSearchEngineNames,
  type TCommandNames,
  type TItemConfig,
  type TItemConfigChanges,
  type TSearchEngineChanges,
  configEngineNames,
  searchEngineNames
}
