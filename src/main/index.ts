import AggregateError from 'aggregate-error'
import { TContext } from './interface'
import { resolveConfig } from './config'
import { publish as ghpagesPublish } from './ghpages'
import { render } from './tpl'
import { isEqual } from 'lodash'

export * from './defaults'

let _config: any

export const verifyConditions = async (pluginConfig: any, context: TContext) => {
  const { logger } = context
  const config = resolveConfig(pluginConfig, context, undefined, 'publish')

  logger.log('verify gh-pages config')

  if (!config.token) {
    throw new AggregateError(['env.GH_TOKEN is required by gh-pages plugin'])
  }

  if (!config.repo) {
    throw new AggregateError(['package.json repository.url does not match github.com pattern'])
  }

  Object.assign(pluginConfig, config)

  _config = config
}

export const publish = async (pluginConfig: any, context: TContext) => {
  const config = resolveConfig(pluginConfig, context, undefined, 'publish')
  const { logger } = context
  const message = render(config.msg, context, logger)

  if (!isEqual(_config, config)) {
    await verifyConditions(pluginConfig, context)
  }

  logger.log('Publishing docs via gh-pages')

  return ghpagesPublish(config.src, {
    repo: config.repo,
    branch: config.branch,
    dest: config.dst,
    message
  }, logger)
}

export default {
  verifyConditions,
  publish
}
