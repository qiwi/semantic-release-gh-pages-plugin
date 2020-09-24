/** @module semantic-release-gh-pages-plugin */

import { ILogger, TAnyMap } from './interface'
import compile from 'lodash.template'

/**
 * @private
 */
export const render = (template: string, context: TAnyMap, logger: ILogger) => {
  try {
    return compile(template)(context)
  } catch (err) {
    logger.error('lodash.template render failure', err)

    return template
  }
}
