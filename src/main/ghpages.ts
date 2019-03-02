import { publish as ghpagePublish } from 'gh-pages'
import { ILogger, TAnyMap } from './interface'

export const OK = { status: 'OK' }

export const publish = (src: string, opts: TAnyMap, logger: ILogger) => new Promise((resolve, reject) => {
  ghpagePublish(src, opts, (err?: any) => {
    if (err) {
      logger.error('Publish docs failure', err)
      reject(err)

    } else {
      logger.log(`Docs published successfully, branch=${opts.branch}, src=${src}, dst=${opts.dest}`)
      resolve(OK)
    }
  })
})
