import { ILogger, TAnyMap } from './interface'
import dot from 'dot'

export const render = (template: string, context: TAnyMap, logger: ILogger) => {
  try {
    return dot.template(template)(context)

  } catch (err) {
    logger.error('dot-template render failure', err)

    return template
  }
}
