/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Uri } from 'vscode'
import { queryPlaceholder } from './config.js'

type MakeUri = ((txt: string) => (null | Uri))
const templatesMap = new Map<string, null | MakeUri>()

/**
 * @param tpl Строка вида `https://www.google.com/search?q={SELECTION} site:https://foo.com/`
 */
function templateParse (tpl: string): null | MakeUri {
  if (templatesMap.has(tpl)) return templatesMap.get(tpl)!

  const splitted = tpl.split(queryPlaceholder, 2)
  if (splitted.length < 2) {
    templatesMap.set(tpl, null)
    return null
  }

  const se = splitted[0]!
  const ss = splitted[1]!.trim().length ? splitted[1]! : ''

  const mu = (txt: string): (null | Uri) => {
    try {
      return Uri.parse(se + encodeURIComponent(txt + ss))
    } catch (_) { /**/ }
    return null
  }
  templatesMap.set(tpl, mu)
  return mu
}

export {
  type MakeUri,
  templateParse
}
