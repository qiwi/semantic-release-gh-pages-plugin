export const catchToSmth = (fn: Function, smth?: any) => {
  return (...args: any[]) => {
    try {
      return fn(...args)
    } catch {

      return smth
    }
  }
}
