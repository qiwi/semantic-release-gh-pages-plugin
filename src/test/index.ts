import AggregateError from 'aggregate-error'
import { TAnyMap } from '../main/interface'
import {
  DEFAULT_SRC,
  DEFAULT_DST,
  DEFAULT_MSG,
  DEFAULT_BRANCH,
  PLUGIN_PATH
} from '../main/defaults'

describe('index', () => {
  const log = jest.fn((...vars: any[]) => { console.log(vars) })
  const error = jest.fn((...vars: any[]) => { console.log(vars) })
  const logger = {
    log,
    error
  }
  const globalConfig = {
    branch: 'master',
    repositoryUrl: 'foobar',
    tagFormat: 'v{{version}}'
  }
  const step = 'publish'
  const path = PLUGIN_PATH
  const token = 'token'
  const pluginConfig = {}

  afterEach(() => {
    log.mockClear()
    error.mockClear()
  })

  describe('verifyConditions', () => {
    it('returns void if everything is ok', async () => {
      const { verifyConditions } = require('../main')
      const context = {
        logger,
        options: {
          ...globalConfig,
          [step]: [{ path }]
        },
        env: { GITHUB_TOKEN: token }
      }

      await expect(verifyConditions(pluginConfig, context)).resolves.toBeUndefined()
    })

    it('asserts GH_TOKEN', async () => {
      const { verifyConditions } = require('../main')
      const context = {
        logger,
        options: {
          ...globalConfig,
          [step]: [{ path }]
        },
        env: { GITHUB_TOKEN: null }
      }

      await expect(verifyConditions(pluginConfig, context))
        .rejects.toEqual(new AggregateError(['env.GH_TOKEN is required by gh-pages plugin']))
    })

    describe('repo check', () => {
      beforeAll(() => {
        jest.resetModules()
        jest.mock('read-pkg', () => ({
          sync: () => ({
            repository: 'git@gerrit.qiwi.com:internal/semantic-release-gh-pages-plugin.git'
          })
        }))
      })

      afterAll(() => {
        jest.unmock('read-pkg')
        jest.resetModules()
      })

      it('asserts repository.url', async () => {
        const AggregateError = require('aggregate-error')
        const { verifyConditions } = require('../main')
        const context = {
          logger,
          options: {
            ...globalConfig,
            [step]: [{ path }]
          },
          env: { GITHUB_TOKEN: token }
        }

        await expect(verifyConditions(pluginConfig, context))
          .rejects.toEqual(new AggregateError(['package.json repository.url does not match github.com pattern']))
      })
    })
  })

  describe('publish', () => {
    beforeAll(() => {
      jest.resetModules()
      jest.mock('gh-pages', () => ({
        publish: jest.fn((src: string, opts: TAnyMap, cb: Function) => {
          if (src === 'error') {
            cb({
              src,
              opts
            })
          } else {
            cb()
          }
        })
      }))
    })

    afterAll(() => {
      jest.unmock('gh-pages')
      jest.resetModules()
    })

    it('performs commit to docs branch via gh-pages util', async () => {
      const { publish: ghpagesPublish } = require('gh-pages')
      const { publish } = require('../main')
      const { getRepo } = require('../main/config')
      const { OK } = require('../main/ghpages')
      const pluginConfig = {
        foo: 'bar',
        baz: 'qux'
      }
      const extra = {
        dst: 'root',
        branch: 'doc-branch'
      }
      const context = {
        logger,
        options: {
          ...globalConfig,
          [step]: [{ path, ...extra }]
        },
        env: { GITHUB_TOKEN: token }
      }
      const expectedOpts = {
        repo: getRepo(context),
        branch: 'doc-branch',
        message: DEFAULT_MSG,
        dest: 'root'
      }

      const res = await publish(pluginConfig, context)

      expect(log).toHaveBeenCalledWith('Publishing docs via gh-pages')
      expect(log).toHaveBeenCalledWith('Docs published successfully, branch=doc-branch, src=docs, dst=root')

      expect(ghpagesPublish).toHaveBeenCalledWith(DEFAULT_SRC, expectedOpts, expect.any(Function))
      expect(res).toBe(OK)
    })

    it('throws rejection on fail', async () => {
      const { publish } = require('../main')
      const { getRepo } = require('../main/config')
      const pluginConfig = {
        foo: 'bar',
        baz: 'qux'
      }
      const context = {
        logger,
        options: {
          ...globalConfig,
          [step]: [{ path, src: 'error' }]
        },
        env: { GITHUB_TOKEN: token }
      }
      const expectedOpts = {
        repo: getRepo(context),
        branch: DEFAULT_BRANCH,
        message: DEFAULT_MSG,
        dest: DEFAULT_DST
      }
      const expected = {
        src: 'error',
        opts: expectedOpts
      }

      try {
        await publish(pluginConfig, context)

      } catch (e) {
        expect(error).toHaveBeenCalledWith('Publish docs failure', expected)
        expect(e).toEqual(expected)
      }
    })
  })
})
