import {queuefy} from '../../main/ts/queuefy'

describe('queuefy', () => {
  it('returns queuefied fn', async () => {
    let success = 0
    const target = (param?: any) => new Promise(resolve =>
      setTimeout(() => {
        success++
        resolve(success + param)
      }, Math.random() * 100)
    )
    const fn = queuefy(target)
    const [r1, r2, r3, r4, r5] = await Promise.all([
      fn(4),
      fn(3),
      fn(2),
      fn(1),
      fn(0)
    ])

    expect(r1).toBe(5)
    expect(r2).toBe(5)
    expect(r3).toBe(5)
    expect(r4).toBe(5)
    expect(r5).toBe(5)
  })

  it('handles err and passes through', async () => {
    let count = 0
    const target = (param?: any) => new Promise((resolve, reject) =>
      setTimeout(() => {
        count++
        if (param === 'fail') {
          reject(param + count)
        } else {
          resolve(param + count)
        }
      }, Math.random() * 100)
    )
    const fn = queuefy(target)

    const [r1, r2, r3, r4, r5] = await Promise.all([
      fn('ok'),
      fn('fail').catch(v => v),
      fn('ok'),
      fn('ok'),
      fn('fail').catch(v => v)
    ])

    expect(r1).toBe('ok1')
    expect(r2).toBe('fail2')
    expect(r3).toBe('ok3')
    expect(r4).toBe('ok4')
    expect(r5).toBe('fail5')
  })

  it('captures thrown exceptions', async () => {
    const target = (): any => { throw 'foo' }
    const fn = queuefy(target)

    expect(await fn().catch((e: any) => e)).toBe('foo')
  })
})
