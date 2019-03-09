import { castArray, get, omit } from 'lodash'
import readPkg from 'read-pkg'
import {
  TContext,
  IGhpagesPluginConfig,
  TAnyMap
} from './interface'
import { DEFAULT_BRANCH,
  DEFAULT_SRC,
  DEFAULT_MSG,
  DEFAULT_DST,
  PLUGIN_PATH
} from './defaults'

export {
  DEFAULT_BRANCH,
  DEFAULT_SRC,
  DEFAULT_MSG,
  DEFAULT_DST,
  PLUGIN_PATH
}

export const GITHIB_REPO_PATTERN = /.*github\.com\/([A-Za-z0-9-]+\/[\w.-]+)\.git$/

export const extractRepoName = (repoUrl: string): string => {
  return (GITHIB_REPO_PATTERN.exec(repoUrl) || [])[1]
}

export const getRepoName = (): string => {
  const pkg = readPkg.sync()
  const repoUrl = get(pkg, 'repository.url') || get(pkg, 'repository', '')

  return extractRepoName(repoUrl)
}

export const getToken = (env: TAnyMap) => env.GH_TOKEN || env.GITHUB_TOKEN

export const getRepo = (context: TContext): string => {
  const { env } = context
  const repoName = getRepoName()
  const token = getToken(env)

  return repoName && `https://${token}@github.com/${repoName}.git`
}

export const resolveConfig = (pluginConfig: TAnyMap, context: TContext, path = PLUGIN_PATH, step?: string): IGhpagesPluginConfig => {
  const { env } = context
  const opts = resolveOptions(pluginConfig, context, path, step)
  const token = getToken(env)
  const repo = getRepo(context)

  return {
    src: opts.src || DEFAULT_SRC,
    dst: opts.dst || DEFAULT_DST,
    msg: opts.msg || DEFAULT_MSG,
    branch: opts.branch || DEFAULT_BRANCH,
    token,
    repo
  }
}

export const resolveOptions = (pluginConfig: TAnyMap, context: TContext, path = PLUGIN_PATH, step?: string): TAnyMap => {
  const { options } = context
  const base = omit(pluginConfig, 'branch')
  const extra = step && options[step] && castArray(options[step])
    .find(config => get(config, 'path') === path) || {}

  return { ...base, ...extra }
}
