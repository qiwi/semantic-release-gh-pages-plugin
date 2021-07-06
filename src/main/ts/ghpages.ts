/** @module semantic-release-gh-pages-plugin */

import execa from 'execa'
import { clean, publish as ghpagePublish, PublishOptions } from 'gh-pages'
import { queuefy } from 'queuefy'

import { IPushOpts } from './interface'

/**
 * @private
 */
export const OK = { status: 'OK' }

/**
 * @private
 */
export const pullTags = (opts: IPushOpts): Promise<any> => {
  if (opts.pullTagsBranch === '') {
    return Promise.resolve()
  }

  const repo = '' + opts.repo
  const pullTagsBranch = '' + opts.pullTagsBranch
  const execaOpts = {
    env: opts.env,
    cwd: opts.cwd
  }

  return execa('git', [
    'pull',
    '--tags',
    '--force',
    repo,
    pullTagsBranch
  ], execaOpts)
    .catch(console.log)
}

/**
 * @private
 */
export const pushPages = (opts: IPushOpts) => new Promise((resolve, reject) => {
  const { src, logger } = opts
  const ghpagesOpts: PublishOptions = {
    repo: opts.repo,
    branch: opts.branch,
    dest: opts.dst,
    message: opts.message,
    add: opts.add,
    dotfiles: opts.dotfiles,
  }

  ghpagePublish(src, ghpagesOpts, (err?: any) => {
    if (err) {
      logger.error('Publish docs failure', err)
      reject(err)

    } else {
      logger.log(`Docs published successfully, branch=${ghpagesOpts.branch}, src=${src}, dst=${ghpagesOpts.dest}`)
      resolve(OK)
    }
  })
})

/**
 * @private
 */
export const _publish = (opts: IPushOpts) =>
  pullTags(opts)
    .then(() => pushPages(opts))
    .then(res => {
      clean()

      return res
    })

/**
 * @private
 */
export const publish = queuefy(_publish)
