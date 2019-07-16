/** @module semantic-release-gh-pages-plugin */

import { Context } from 'semantic-release'

export type TAnyMap = {
  [key: string]: any
}

export type TContext = Context & {
  env: TAnyMap,
  options: TAnyMap & {
    publish?: Array<any>,
    verifyConditions?: Array<any>
  }
}

export interface IGhpagesPluginConfig {
  src: string,
  dst: string,
  branch: string,
  msg: string,
  token?: string,
  repo?: string,
  enterprise?: boolean
}

export interface ILogger {
  log: (message: string, ...vars: any[]) => void,
  error: (message: string, ...vars: any[]) => void,
}
