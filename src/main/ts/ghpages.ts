/** @module semantic-release-gh-pages-plugin */

import { publish as ghpagePublish } from 'gh-pages'
import execa from 'execa'
import { IPushOpts, TAnyMap } from './interface'

/**
 * @private
 */
export const OK = { status: 'OK' }

/**
 * @private
 */
export const pullTags = (opts: IPushOpts): Promise<any> => {
  const repo = '' + opts.repo
  const execaOpts = {
    env: opts.env,
    cwd: opts.cwd
  }

  return execa('git', ['pull', '--tags', '--force', repo], execaOpts)
}

/**
 * @private
 */
export const gropLocalBranch = (opts: IPushOpts): Promise<any> => {
  const { branch } = opts
  const execaOpts = {
    env: opts.env,
    cwd: opts.cwd
  }

  return execa('git', ['branch', '-d', branch, '|| exit 0'], execaOpts)
}

/**
 * @private
 */
export const pushPages = (opts: IPushOpts) => new Promise((resolve, reject) => {
  const { src, logger } = opts
  const ghpagesOpts: TAnyMap = {
    repo: opts.repo,
    branch: opts.branch,
    dest: opts.dst,
    message: opts.message
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
export const publish = (opts: IPushOpts) => pullTags(opts)
  .then(() => gropLocalBranch(opts))
  .then(() => pushPages(opts))
