/** @module semantic-release-gh-pages-plugin */

import { ILogger, TAnyMap } from './interface'
import * as dot from 'dot'

/**
 * @private
 */
export const render = (template: string, context: TAnyMap, logger: ILogger) => {
  try {
    return dot.template(template)(context)

  } catch (err) {
    logger.error('dot-template render failure', err)

    return template
  }
}
