import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { accessSync, mkdirSync, copyFileSync } from 'node:fs'
import { rwModify } from 'nodejs-pkg-tools'

const ws = dirname(fileURLToPath(import.meta.url))
const dist = 'dist'

const { errors } = rwModify({
  mode: 'over_error',
  exclude: [
    'scripts',
    'devDependencies',
    'type',
    'private'
  ],
  sample: {
    type: 'commonjs'
  }
}, join(ws, 'package.json'), join(ws, dist, 'package.json'))
if (errors.isFatalError) {
  throw new Error(errors.errors.join('\n\n'))
}

function copy (src, dest) {
  const dir = dirname(dest)
  try {
    accessSync(dir)
  } catch (_) {
    mkdirSync(dir, { recursive: true })
  }
  copyFileSync(src, dest)
}

for (const item of [/*'.vscodeignore', */'LICENSE.md', 'README.md', 'assets/icon.png']) {
  copy(join(ws, item), join(ws, dist, item))
}
