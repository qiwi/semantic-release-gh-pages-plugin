/** @module semantic-release-gh-pages-plugin */

import { publish as ghpagePublish } from 'gh-pages'
import { ILogger, TAnyMap } from './interface'

/**
 * @private
 */
export const OK = { status: 'OK' }

/**
 * @private
 */
export const publish = (src: string, opts: TAnyMap, logger: ILogger) => new Promise((resolve, reject) => {
  ghpagePublish(src, opts, (err?: any) => {
    if (err) {
      logger.error('Publish docs failure', err)
      reject(err)

    } else {
      logger.log(`Docs published successfully, branch=${opts.branch}, src=${src}, dst=${opts.dest}`)
      resolve(OK)
    }
  })
})
