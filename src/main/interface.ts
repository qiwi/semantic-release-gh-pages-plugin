import {Context} from 'semantic-release'

export type TContext = Context & {
  env: {
    [key: string]: any
  },
  options: {
    publish: Array<any>,
    verifyConditions: Array<any>,
    [key: string]: any
  }
}

export interface IGhpagesPluginConfig {
  src?: string,
  dst?: string,
  branch?: string,
  msg?: string,
  token?: string
}