import { TContext, IGhpagesPluginConfig, TAnyMap } from './interface'
import { castArray, get } from 'lodash'
import {sync as readPkg} from 'read-pkg';

export const PLUGIN_PATH = '@qiwi/semantic-release-gh-pages-plugin'
export const DEFAULT_BRANCH = 'gh-pages'
export const DEFAULT_SRC = 'docs'
export const DEFAULT_DST = '.'
export const DEFAULT_MSG = 'update docs v$npm_package_version'

export const resolveConfig = (pluginConfig: TAnyMap, context: TContext, path = PLUGIN_PATH, step?: string): IGhpagesPluginConfig => {
  const { env } = context
  const opts = resolveOptions(pluginConfig, context, path, step)
  const { repository: {url} } = readPkg()
  const repo = 'dd'

  return {
    src: opts.src || DEFAULT_SRC,
    dst: opts.dst || DEFAULT_DST,
    msg: opts.msg || DEFAULT_MSG,
    branch: opts.branch || DEFAULT_BRANCH,
    token: env.GH_TOKEN || env.GITHUB_TOKEN,
    repo
  }
}

export const resolveOptions = (pluginConfig: TAnyMap, context: TContext, path = PLUGIN_PATH, step?: string): TAnyMap => {
  const { options } = context
  const extra = step && options[step] && castArray(options[step])
    .find(config => get(config, 'path') === path) || {}

  return { ...pluginConfig, ...extra }
}
