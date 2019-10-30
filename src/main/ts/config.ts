/** @module semantic-release-gh-pages-plugin */

import { castArray, get, omit } from 'lodash'
import readPkg from 'read-pkg'
import request from 'sync-request'
import { IGhpagesPluginConfig, TAnyMap, TContext } from './interface'
import {
  DEFAULT_BRANCH,
  DEFAULT_DST,
  DEFAULT_MSG,
  DEFAULT_SRC,
  PLUGIN_PATH,
  DEFAULT_ENTERPRISE
} from './defaults'

export {
  DEFAULT_BRANCH,
  DEFAULT_SRC,
  DEFAULT_MSG,
  DEFAULT_DST,
  DEFAULT_ENTERPRISE,
  PLUGIN_PATH
}

export const GITIO_REPO_PATTERN = /^https:\/\/git\.io\/[A-Za-z0-9-]+$/

export const REPO_PATTERN = /^(?:[\w+]+:\/\/)?(?:\w+@)?([\w-.]+\.\w+)[/:]([\w.-]+\/[\w.-]+?)(?:\.git)?$/

/**
 * @private
 */
export const extractRepoName = (repoUrl: string): string => {
  return (REPO_PATTERN.exec(repoUrl) || [])[2]
}

/**
 * @private
 */
export const extractRepoDomain = (repoUrl: string): string => {
  return (REPO_PATTERN.exec(repoUrl) || [])[1]
}

/**
 * @private
 */
export const getRepoUrl = (pluginConfig: TAnyMap, context: TContext): string => {
  const { env } = context
  const urlFromEnv = env.GH_URL || env.GITHUB_URL || env.REPO_URL
  const urlFromStepOpts = pluginConfig.repositoryUrl
  const urlFromOpts = get(context, 'options.repositoryUrl')
  const urlFromPackage = getUrlFromPackage()

  const url = urlFromEnv || urlFromStepOpts || urlFromOpts || urlFromPackage

  if (GITIO_REPO_PATTERN.test(url)) {
    const res: any = request('GET', urlFromOpts, { followRedirects: false, timeout: 5000 })
    return res.headers.location
  }

  return url
}

/**
 * @private
 */
export const getUrlFromPackage = () => {
  const pkg = readPkg.sync()
  return get(pkg, 'repository.url') || get(pkg, 'repository', '')
}

/**
 * @private
 */
export const getToken = (env: TAnyMap) => env.GH_TOKEN || env.GITHUB_TOKEN

/**
 * @private
 */
export const getRepo = (pluginConfig: TAnyMap, context: TContext, enterprise?: boolean): string | undefined => {
  const { env } = context
  const repoUrl = getRepoUrl(pluginConfig, context)
  const repoName = extractRepoName(repoUrl)
  const repoDomain = extractRepoDomain(repoUrl)
  const token = getToken(env)

  if (repoDomain !== 'github.com' && !enterprise) {
    return
  }

  return repoName && `https://${token}@${repoDomain}/${repoName}.git`
}

/**
 * @private
 */
export const resolveConfig = (pluginConfig: TAnyMap, context: TContext, path = PLUGIN_PATH, step?: string): IGhpagesPluginConfig => {
  const { env } = context
  const opts = resolveOptions(pluginConfig, context, path, step)
  const enterprise = Boolean(opts.enterprise || pluginConfig.enterprise || DEFAULT_ENTERPRISE)
  const token = getToken(env)
  const repo = getRepo(pluginConfig, context, enterprise)

  if (process.env.DEBUG) {
    const { logger } = context

    logger.log('resolveConfig args:')
    logger.log('context=', omit(context, 'env.GH_TOKEN', 'env.GITHUB_TOKEN'))
    logger.log('pluginConfig=', pluginConfig)
    logger.log('path=', path)
    logger.log('step=', step)
  }

  return {
    src: opts.src || DEFAULT_SRC,
    dst: opts.dst || DEFAULT_DST,
    msg: opts.msg || DEFAULT_MSG,
    branch: opts.branch || DEFAULT_BRANCH,
    enterprise,
    token,
    repo
  }
}

/**
 * @private
 */
export const resolveOptions = (pluginConfig: TAnyMap, context: TContext, path = PLUGIN_PATH, step?: string): TAnyMap => {
  const { options } = context
  const base = omit(pluginConfig, 'branch')
  const extra = step && options[step] && castArray(options[step])
    .find(config => get(config, 'path') === path) || {}

  return { ...base, ...extra }
}
