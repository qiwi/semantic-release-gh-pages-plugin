import { ICallable } from '@qiwi/substrate'

export const catchToSmth = (fn: ICallable, smth?: any) => {
  return (...args: any[]) => {
    try {
      return fn(...args)
    } catch (e) {
      console.warn(e)
      return smth
    }
  }
}

export const anyDefined = (...args: any[]) => args.find(item => item !== undefined)
