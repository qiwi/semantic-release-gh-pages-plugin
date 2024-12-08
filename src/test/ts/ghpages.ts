import { ICallable } from '@qiwi/substrate-types'

import { IPushOpts, TAnyMap } from '../../main/ts/interface'

describe('ghpages', () => {
  const _$ = jest.fn(() => Promise.resolve())
  const __$ = jest.fn(() => _$)
  let pullTags: any

  beforeAll(() => {
    jest.resetModules()
    jest.mock('zurk', () => ({$: __$}))
    jest.mock('gh-pages', () => ({
      clean: () => { /* noop */ },
      publish: jest.fn((_src: string, _opts: TAnyMap, cb: ICallable) => cb())
    }))

    pullTags = require('../../main/ts/ghpages').pullTags
  })

  afterEach(_$.mockClear)

  afterAll(() => {
    jest.unmock('gh-pages')
    jest.unmock('zurk')
    jest.resetModules()
  })

  const pushOptsStub = {
    message: 'stub',
    logger: console,
    env: {},
    repo: 'repo',
    cwd: 'stub',
    src: 'stub',
    dst: 'stub',
    ciBranch: 'stub',
    docsBranch: 'stub',
    msg: 'stub'
  }

  describe('#pullTags', () => {
    it('does nothing if `opts.pullTagsBranch === \'\'`', async () => {
      const opts: IPushOpts = {
        ...pushOptsStub,
        pullTagsBranch: ''
      }
      expect(await pullTags(opts)).toBeUndefined()
      expect(_$).not.toHaveBeenCalled()
    })

    it('invokes zurk with proper args', async () => {
      const opts: IPushOpts = {
        ...pushOptsStub,
        pullTagsBranch: 'foo'
      }

      await pullTags(opts)
      expect(_$).toHaveBeenCalledWith(["git pull --tags --force ", " ", ""], "repo", "foo")
      expect(__$).toHaveBeenCalledWith({
        cwd: opts.cwd,
        env: opts.env,
        shell: false
      })
    })
  })
})
