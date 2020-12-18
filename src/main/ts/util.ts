import { ICallable } from '@qiwi/substrate'

export const catchToSmth = (fn: ICallable, smth?: any) => {
  return (...args: any[]) => {
    try {
      return fn(...args)
    } catch {

      return smth
    }
  }
}

export const anyDefined = (...args: any[]) => args.find(item => typeof item !== 'undefined')
