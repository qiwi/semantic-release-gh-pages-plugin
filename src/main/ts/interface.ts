/** @module semantic-release-gh-pages-plugin */

import { Context } from 'semantic-release'

export type TAnyMap = {
  [key: string]: any
}

export type TStringMap = {
  [key: string]: string
}

export type TContext = Context & {
  env: TStringMap,
  cwd: string,
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
  currentBranch?: string,
  pullBranch?: boolean
}

export interface IPushOpts extends IGhpagesPluginConfig {
  message: string
  logger: ILogger,
  env: TAnyMap,
  cwd: string
}

export interface ILogger {
  log: (message: string, ...vars: any[]) => void,
  error: (message: string, ...vars: any[]) => void,
}
