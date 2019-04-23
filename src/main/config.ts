import { castArray, get, omit } from 'lodash'
import readPkg from 'read-pkg'
import request from 'sync-request'
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

export const GITHUB_REPO_PATTERN = /.*github\.com\/([A-Za-z0-9-]+\/[\w.-]+?)(\.git)?$/

export const GITIO_REPO_PATTERN = /^https:\/\/git\.io\/[A-Za-z0-9-]+/

export const extractRepoName = (repoUrl: string): string => {
  if (GITIO_REPO_PATTERN.test(repoUrl)) {
    const res: any = request('GET', repoUrl, { followRedirects: false, timeout: 5000 })
    return extractRepoName(res.headers.location)
  }
  return (GITHUB_REPO_PATTERN.exec(repoUrl) || [])[1]
}

export const getRepoUrl = (pluginConfig: TAnyMap, context: TContext): string => {
  const { env } = context
  const urlFronEnv = env.REPO_URL
  const urlFromStepOpts = pluginConfig.repositoryUrl
  const urlFromOpts = get(context, 'options.repositoryUrl')
  const urlFromPackage = getUrlFromPackage()

  return urlFronEnv || urlFromStepOpts || urlFromOpts || urlFromPackage
}

export const getUrlFromPackage = () => {
  const pkg = readPkg.sync()
  return get(pkg, 'repository.url') || get(pkg, 'repository', '')
}

export const getToken = (env: TAnyMap) => env.GH_TOKEN || env.GITHUB_TOKEN

export const getRepo = (pluginConfig: TAnyMap, context: TContext): string => {
  const { env } = context
  const repoUrl = getRepoUrl(pluginConfig, context)
  const repoName = extractRepoName(repoUrl)
  const token = getToken(env)

  return repoName && `https://${token}@github.com/${repoName}.git`
}

export const resolveConfig = (pluginConfig: TAnyMap, context: TContext, path = PLUGIN_PATH, step?: string): IGhpagesPluginConfig => {
  const { env } = context
  const opts = resolveOptions(pluginConfig, context, path, step)
  const token = getToken(env)
  const repo = getRepo(pluginConfig, context)

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
