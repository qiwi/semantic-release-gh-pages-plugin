import { render } from '../../main/ts/tpl'

describe('tpl', () => {
  const error = jest.fn((...vars: any[]) => { console.log(vars) })
  const logger = {
    log (msg: string, ...vars: any[]) { console.log(vars || msg) },
    error
  }

  it('inject data to string', () => {
    expect(render('foo <%= bar %>', { bar: 'baz' }, logger)).toBe('foo baz')
  })

  it('returns template as is on failure', () => {
    const res = render('foo <%= bar.baz %>', { a: { b: 'c' } }, logger)

    expect(error).toHaveBeenCalledWith('lodash.template render failure', expect.any(Object))
    expect(res).toBe('foo <%= bar.baz %>')
  })
})
