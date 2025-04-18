/** @module semantic-release-gh-pages-plugin */

import { $ } from 'zurk'
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

  return $({
    env: opts.env,
    cwd: opts.cwd,
    shell: false
  })`git pull --tags --force ${repo} ${pullTagsBranch}`
    .catch(console.error)
}

/**
 * @private
 */
export const pushPages = (opts: IPushOpts) => new Promise((resolve, reject) => {
  const { src, logger , repo, docsBranch, dst, message, add, dotfiles, pattern } = opts
  const ghpagesOpts: PublishOptions = {
    repo,
    branch: docsBranch,
    dest: dst,
    message,
    add,
    dotfiles,
    src: pattern,
  }

  ghpagePublish(src, ghpagesOpts, (err?: any) => {
    if (err) {
      logger.error('Publish docs failure', err)
      reject(err)

    } else {
      logger.log(`Docs published successfully, branch=${ghpagesOpts.branch}, src=${src}, pattern=${ghpagesOpts.src}, dst=${ghpagesOpts.dest}`)
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
