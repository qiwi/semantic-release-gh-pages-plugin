import {Context} from 'semantic-release'
import {castArray, defaultTo, get} from 'lodash'

export type TContext = Context & {
  options: {
    publish: Array<any>,
    verifyConditions: Array<any>
  }
}

export const verifyConditions = async (pluginConfig: any, context: TContext) => {
  const { options } = context

  if (options.publish) {
    const ghpagesPlugin = castArray(options.publish)
      .find(config => get(config, 'path') === '@qiwi/semantic-release-gh-pages-plugin') || {}

    pluginConfig.branch = defaultTo(pluginConfig.branch, ghpagesPlugin.branch)
    pluginConfig.dst = defaultTo(pluginConfig.dst, ghpagesPlugin.dst)
    pluginConfig.msg = defaultTo(pluginConfig.msg, ghpagesPlugin.msg)
  }
}

export const publish = async (pluginConfig: any, context: TContext) => {
  const { options } = context

  console.log('args=', pluginConfig, options)
}

export default {
  verifyConditions,
  publish
}
