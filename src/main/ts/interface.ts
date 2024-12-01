/** @module semantic-release-gh-pages-plugin */

import { BranchSpec, Context } from 'semantic-release'


export interface ILogger {
  log: (message: string, ...vars: any[]) => void,
  error: (message: string, ...vars: any[]) => void,
}

export type TAnyMap = {
  [key: string]: any
}

export type TStringMap = {
  [key: string]: string
}

export type TContext = Context & {
  env: TStringMap,
  branch?: Exclude<BranchSpec, string>
  cwd: string,
  options: TAnyMap & {
    publish?: Array<any>,
    verifyConditions?: Array<any>
  }
}

export interface IGhpagesPluginConfig {
  src: string,
  dst: string,
  ciBranch: string,
  docsBranch: string,
  pullTagsBranch?: string
  msg: string,
  repo: string,
  token?: string,
  enterprise?: boolean,
  dotfiles?: boolean
  add?: boolean
  pattern?: string,
}

export interface IPushOpts extends IGhpagesPluginConfig {
  message: string
  logger: ILogger,
  env: TAnyMap,
  cwd: string
}
