import { ICallable } from '@qiwi/substrate'

import { IPushOpts, TAnyMap } from '../../main/ts/interface'

describe('ghpages', () => {
  const fakeExeca = jest.fn(() => Promise.resolve())
  let pullTags: any

  beforeAll(() => {
    jest.resetModules()
    jest.mock('execa', () => fakeExeca)
    jest.mock('gh-pages', () => ({
      clean: () => { /* noop */ },
      publish: jest.fn((_src: string, _opts: TAnyMap, cb: ICallable) => cb())
    }))

    pullTags = require('../../main/ts/ghpages').pullTags
  })

  afterEach(fakeExeca.mockClear)

  afterAll(() => {
    jest.unmock('gh-pages')
    jest.unmock('execa')
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
    branch: 'stub',
    msg: 'stub'
  }

  describe('#pullTags', () => {
    it('does nothing if `opts.pullTagsBranch === \'\'`', async () => {
      const opts: IPushOpts = {
        ...pushOptsStub,
        pullTagsBranch: ''
      }
      expect(await pullTags(opts)).toBeUndefined()
      expect(fakeExeca).not.toHaveBeenCalled()
    })

    it('invokes execa with proper args', async () => {
      const opts: IPushOpts = {
        ...pushOptsStub,
        pullTagsBranch: 'foo'
      }
      const execaOpts = {
        cwd: opts.cwd,
        env: opts.env
      }

      await pullTags(opts)
      expect(fakeExeca).toHaveBeenCalledWith(
        'git',
        [
          'pull',
          '--tags',
          '--force',
          opts.repo,
          opts.pullTagsBranch
        ],
        execaOpts
      )
    })
  })
})
