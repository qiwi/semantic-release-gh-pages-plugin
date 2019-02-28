import { TContext } from './interface'
import { resolveConfig } from './config'

export const verifyConditions = async (pluginConfig: any, context: TContext) => {
  const config = resolveConfig(pluginConfig, context, undefined, 'publish')

  if (!config.token) {
    throw new Error('env.GH_TOKEN is required by gh-pages plugin')
  }
}

export const publish = async (pluginConfig: any, context: TContext) => {
  const config = resolveConfig(pluginConfig, context, undefined, 'publish')

  console.log('args=', config)
}

export default {
  verifyConditions,
  publish
}
