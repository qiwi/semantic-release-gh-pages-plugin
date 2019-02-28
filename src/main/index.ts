import {castArray, defaultTo, get} from 'lodash'
import { TContext } from './interface'
import { resolveConfig } from './config'

export const verifyConditions = async (pluginConfig: any, context: TContext) => {
  const { options } = context

  if (options.publish) {
    const ghpagesPlugin = castArray(options.publish)
      .find(config => get(config, 'path') === '@qiwi/semantic-release-gh-pages-plugin') || {}

    pluginConfig.branch = defaultTo(pluginConfig.branch, ghpagesPlugin.branch)
    pluginConfig.src = defaultTo(pluginConfig.src, ghpagesPlugin.src)
    pluginConfig.dst = defaultTo(pluginConfig.dst, ghpagesPlugin.dst)
    pluginConfig.msg = defaultTo(pluginConfig.msg, ghpagesPlugin.msg)
  }

  const config = resolveConfig(pluginConfig, context)

  if (!config.token) {
    throw new Error('env.GH_TOKEN is required by gh-pages plugin')
  }
}

export const publish = async (pluginConfig: any, context: TContext) => {
  const { options } = context
  const config = resolveConfig(pluginConfig, context)

  console.log('args=', config, options)
}

export default {
  verifyConditions,
  publish
}
