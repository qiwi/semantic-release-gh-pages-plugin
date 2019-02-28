import AggregateError from 'aggregate-error'
import { sync as readPkg } from 'read-pkg'
import { TContext } from './interface'
import { resolveConfig } from './config'

export const verifyConditions = async (pluginConfig: any, context: TContext) => {
  const config = resolveConfig(pluginConfig, context, undefined, 'publish')

  if (!config.token) {
    throw new AggregateError(['env.GH_TOKEN is required by gh-pages plugin'])
  }
}

export const publish = async (pluginConfig: any, context: TContext) => {
  const config = resolveConfig(pluginConfig, context, undefined, 'publish')
  const { repository } = readPkg()

  console.log('args=', config, repository)
}

export default {
  verifyConditions,
  publish
}
