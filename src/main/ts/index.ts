/** @module semantic-release-gh-pages-plugin */

import AggregateError from 'aggregate-error'
import fs from 'node:fs'
import { isEqual } from 'lodash'
import path from 'node:path'

import { resolveConfig } from './config'
import { publish as ghpagesPublish } from './ghpages'
import { IPushOpts,TContext } from './interface'
import { render } from './tpl'

export * from './defaults'

let _config: any

export const verifyConditions = async (pluginConfig: any, context: TContext) => {
  const { logger } = context
  const config = await resolveConfig(pluginConfig, context, undefined, 'publish')
  const { token, repo, src, ciBranch, docsBranch } = config

  if (!docsBranch) {
    logger.log(`gh-pages [skipped]: 'docsBranch' is empty for ${ciBranch}`)
    return
  }

  logger.log('verify gh-pages config')


  if (!token) {
    throw new AggregateError(['env.GH_TOKEN is required by gh-pages plugin'])
  }

  if (!repo) {
    throw new AggregateError(['package.json repository.url does not match github.com pattern'])
  }

  if (!fs.existsSync(src) || !fs.lstatSync(src).isDirectory()) {
    logger.error('Resolved docs src path=', path.resolve(src))
    throw new AggregateError(['docs source directory does not exist'])
  }

  Object.assign(pluginConfig, config)

  _config = config
}

export const publish = async (pluginConfig: any, context: TContext) => {
  const config = await resolveConfig(pluginConfig, context, undefined, 'publish')
  const { logger, env, cwd } = context
  const { msg, docsBranch, ciBranch } = config
  const message = render(msg, context, logger)
  const pushOpts: IPushOpts = {
    ...config,
    message,
    logger,
    env,
    cwd
  }

  if (!docsBranch) {
    logger.log(`gh-pages [skipped]: 'docsBranch' is empty for ${ciBranch}`)
    return
  }

  if (!isEqual(_config, config)) {
    await verifyConditions(pluginConfig, context)
  }

  logger.log('Publishing docs via gh-pages')

  return ghpagesPublish(pushOpts)
}

export default {
  verifyConditions,
  publish
}
