import { publish as ghpagePublish } from 'gh-pages'
import { TAnyMap } from './interface'

export const publish = (dst: string, opts: TAnyMap) => new Promise((resolve, reject) => {
  ghpagePublish(dst, opts, (err?: any) => {
    if (err) {
      reject(err)
    } else {
      resolve('OK')
    }
  })
})
