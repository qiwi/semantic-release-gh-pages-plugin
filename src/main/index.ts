import AggregateError from 'aggregate-error'
import { TContext } from './interface'
import { resolveConfig } from './config'
import { publish as ghpagesPublish } from './ghpages'

export * from 'defaults'

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
}

export const publish = async (pluginConfig: any, context: TContext) => {
  const config = resolveConfig(pluginConfig, context, undefined, 'publish')
  const { logger } = context

  logger.log('Publishing docs via gh-pages')

  return ghpagesPublish(config.src, {
    repo: config.repo,
    branch: config.branch,
    message: config.msg,
    dest: config.dst
  }, logger)
}

export default {
  verifyConditions,
  publish
}
