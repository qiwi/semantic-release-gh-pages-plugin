import { factory, TInsideOutPromise } from 'inside-out-promise'

export type IAsyncFn = (...args: any[]) => Promise<any>

export type ITask = {
  args: any[],
  iop: TInsideOutPromise
}
export type ITaskQueue = Array<ITask>

export const invoke = (fn: IAsyncFn, task: ITask, next: any) => {
  const { iop, args } = task

  try {
    fn(...args)
      .then(v => {
        iop.resolve(v) && next()

      })
      .catch(v => {
        iop.reject(v) && next()
      })

  } catch (e) {
    iop.reject(e)
    next()
  }
}

export const queuefy = <T extends IAsyncFn>(fn: T): T => {
  const queue: ITaskQueue = []
  const processQueue = (): void => {
    const task = queue[0]

    if (!task) {
      return
    }

    invoke(fn, task, next)
  }
  const next = () => {
    queue.shift()
    processQueue()
  }

  return ((...args: any[]): any => {
    const iop = factory()

    queue.push({ args, iop })

    if (queue.length === 1) {
      processQueue()
    }

    return iop
  }) as T
}
