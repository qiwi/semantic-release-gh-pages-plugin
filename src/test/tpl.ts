import { render } from '../main/tpl'

describe('tpl', () => {
  const error = jest.fn((...vars: any[]) => { console.log(vars) })
  const logger = {
    log (msg: string, ...vars: any[]) { console.log(vars || msg) },
    error
  }

  it('inject data to string', () => {
    expect(render('foo {{=it.bar}}', { bar: 'baz' }, logger)).toBe('foo baz')
  })

  it('returns template as is on failure', () => {
    const res = render('foo {{=it.bar.baz}}', { a: { b: 'c' } }, logger)

    expect(error).toHaveBeenCalledWith('dot-template render failure', expect.any(Object))
    expect(res).toBe('foo {{=it.bar.baz}}')
  })
})
