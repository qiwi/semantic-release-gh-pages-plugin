/** @module semantic-release-gh-pages-plugin */

import { template as compile } from 'lodash'

import { ILogger, TAnyMap } from './interface'

/**
 * @private
 */
export const render = (template: string, context: TAnyMap, logger: ILogger): string => {
  try {
    return compile(template)(context)
  } catch (err) {
    logger.error('lodash.template render failure', err)

    return template
  }
}
