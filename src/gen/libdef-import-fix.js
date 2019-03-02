import {resolve} from 'path'
import { argv } from 'yargs'
import assert from 'assert'
import {sync as replaceSync} from 'replace-in-file'

const {flow, dts} = argv
const DTS = resolve(dts)
const IMPORT_MAIN_PATTERN = /\timport main = require\('(.+)'\);/g
const IMPORT_MAIN_LINE_PATTERN = /^\timport main = require\('(.+)'\);$/
const BROKEN_MODULE_NAME = /(declare module '.+\/lib\/es5\/)[^/]*\/src\/main\/index'.+/
const REFERENCE = /\/\/\/.+/

assert(!!dts, ' `dts` file path should be specified')

const options = {
  files: DTS,
  from: [
    '\texport = main;',
    IMPORT_MAIN_PATTERN,
    BROKEN_MODULE_NAME,
    REFERENCE,
    /^\s*[\r\n]/gm
  ],
  to: [
    '',
    line => {
      const [, name] = IMPORT_MAIN_LINE_PATTERN.exec(line)
      return `	export * from '${name}';`
    },
    line => {
      const [, module] = BROKEN_MODULE_NAME.exec(line)
      return `${module}index' {`
    },
    '',
    ''
  ],
}

const changes = replaceSync(options);
console.log('Modified files:', changes.join(', '));

