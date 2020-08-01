/** @module semantic-release-gh-pages-plugin */

import gitParse from 'git-url-parse'
import readPkg from 'read-pkg'
import request from 'sync-request'
import safeJsonStringify from 'safe-json-stringify'
import AggregateError from 'aggregate-error'
import dbg from 'debug'
import { castArray, omit } from 'lodash'
import { IGhpagesPluginConfig, TAnyMap, TContext } from './interface'
import { anyDefined, catchToSmth } from './util'
import {
  DEFAULT_BRANCH,
  DEFAULT_DST,
  DEFAULT_MSG,
  DEFAULT_SRC,
  PLUGIN_PATH,
  DEFAULT_ENTERPRISE,
  DEFAULT_PULL_TAGS_BRANCH
} from './defaults'

const debug = dbg('semantic-release:gh-pages')

export {
  DEFAULT_BRANCH,
  DEFAULT_SRC,
  DEFAULT_MSG,
  DEFAULT_DST,
  DEFAULT_ENTERPRISE,
  PLUGIN_PATH,
  DEFAULT_PULL_TAGS_BRANCH
}

const gitUrlParse = catchToSmth(gitParse, {})

export const GITIO_REPO_PATTERN = /^https:\/\/git\.io\/[A-Za-z0-9-]+$/

/**
 * @private
 */
export const extractRepoName = (repoUrl: string): string => {
  return gitUrlParse(repoUrl).full_name
}

/**
 * @private
 */
export const extractRepoDomain = (repoUrl: string): string => {
  return gitUrlParse(repoUrl).resource
}

/**
 * @private
 */
export const extractRepoToken = (repoUrl: string): string => {
  const repo = gitUrlParse(repoUrl)
  return repo.token || repo.user
}

/**
 * @private
 */
export const getRepoUrl = (pluginConfig: TAnyMap, context: TContext, enterprise: boolean): string => {
  const { env } = context
  const urlFromEnv = getRepoUrlFromEnv(env)
  const urlFromStepOpts = pluginConfig.repositoryUrl
  const urlFromOpts = context?.options?.repositoryUrl || ''
  const urlFromPackage = getUrlFromPackage()
  const reassemble = !!urlFromStepOpts || !urlFromOpts

  let url = urlFromStepOpts || urlFromOpts || urlFromEnv || urlFromPackage

  debug('getRepoUrl:')
  debug('urlFromEnv= %s', urlFromEnv)
  debug('urlFromStepOpts= %s', urlFromStepOpts)
  debug('urlFromOpts= %s', urlFromOpts)
  debug('urlFromPackage= %s', urlFromPackage)

  if (GITIO_REPO_PATTERN.test(url)) {
    const res: any = request('GET', urlFromOpts, { followRedirects: false, timeout: 5000 })
    url = res.headers.location
  }

  if (reassemble) {
    url = reassembleRepoUrl(url, context)
  }

  if (enterprise && extractRepoDomain(url) === 'github.com') {
    throw new AggregateError(['repo refers to `github.com` but enterprise url is expected'])
  }

  return url
}

/**
 * @private
 */
const getRepoUrlFromEnv = (env: TAnyMap) => env.REPO_URL

/**
 * @private
 */
export const getUrlFromPackage = (): string => {
  const pkg = readPkg.sync()
  return String(pkg?.repository?.url || pkg?.repository || '')
}

/**
 * @private
 */
export const getToken = (env: TAnyMap, repoUrl: string) => env.GH_TOKEN || env.GITHUB_TOKEN || extractRepoToken(repoUrl)

/**
 * @private
 */
export const reassembleRepoUrl = (redirectedUrl: string, context: TContext): string | undefined => {
  const { env } = context
  const repoName = extractRepoName(redirectedUrl)
  const repoDomain = extractRepoDomain(redirectedUrl)
  const token = getToken(env, redirectedUrl)

  return `https://${token}@${repoDomain}/${repoName}.git`
}

/**
 * @private
 */
export const resolveConfig = (pluginConfig: TAnyMap, context: TContext, path = PLUGIN_PATH, step?: string): IGhpagesPluginConfig => {
  const opts = resolveOptions(pluginConfig, context, path, step)
  const enterprise = Boolean(opts.enterprise || pluginConfig.enterprise || DEFAULT_ENTERPRISE)
  const repo = getRepoUrl(pluginConfig, context, enterprise)
  const pullTagsBranch = anyDefined(opts.pullTagsBranch, opts._branch, DEFAULT_PULL_TAGS_BRANCH)
  const token = getToken(context.env, repo)

  debug('resolveConfig args:')
  debug('pluginConfig= %O', safeJsonStringify(pluginConfig, null, 2))
  debug('path= %s', path)
  debug('step= %s', step)
  debug('pullTagsBranch= %s', pullTagsBranch)

  return {
    src: opts.src || DEFAULT_SRC,
    dst: opts.dst || DEFAULT_DST,
    msg: opts.msg || DEFAULT_MSG,
    branch: opts.branch || DEFAULT_BRANCH,
    enterprise,
    repo,
    token,
    pullTagsBranch
  }
}

/**
 * @private
 */
export const resolveOptions = (pluginConfig: TAnyMap, context: TContext, path = PLUGIN_PATH, step?: string): TAnyMap => {
  const { options } = context
  const base = omit(pluginConfig, 'branch')
  const extra = step && options[step] && castArray(options[step])
    .map(config => {
      if (Array.isArray(config)) {
        const [path, opts] = config

        return { ...opts, path }
      }

      return config
    })
    .find(config => config?.path === path) || {}

  return { ...base, ...extra, _branch: pluginConfig.branch }
}
