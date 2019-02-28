import { TContext, IGhpagesPluginConfig  } from './interface'
import { castArray, defaultTo, get } from 'lodash'

export const PLUGIN_PATH = '@qiwi/semantic-release-gh-pages-plugin'
export const DEFAULT_BRANCH = 'gh-pages'
export const DEFAULT_SRC = 'docs'
export const DEFAULT_DST = '.'
export const DEFAULT_MSG = 'update docs v$npm_package_version'

export const resolveConfig = (pluginConfig: IGhpagesPluginConfig , { env }: TContext): IGhpagesPluginConfig  => {
  return {
    src: pluginConfig.src || DEFAULT_SRC,
    dst: pluginConfig.dst || DEFAULT_DST,
    msg: pluginConfig.msg || DEFAULT_MSG,
    branch: pluginConfig.branch || DEFAULT_BRANCH,
    token: env.GH_TOKEN || env.GITHUB_TOKEN
  }
}

export const resolveOptions = (pluginConfig: IGhpagesPluginConfig, context: TContext, path = PLUGIN_PATH, step: string) => {
  const { options } = context

  if (options[step]) {
    const pluginOpts = castArray(options[step])
      .find(config => get(config, 'path') === path) || {}

    return {
      branch: defaultTo(pluginConfig.branch, pluginOpts.branch),
      src: defaultTo(pluginConfig.src, pluginOpts.src),
      dst: defaultTo(pluginConfig.dst, pluginOpts.dst),
      msg: defaultTo(pluginConfig.msg, pluginOpts.msg)
    }
  }

  return pluginConfig
}
