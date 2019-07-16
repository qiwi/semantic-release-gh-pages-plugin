import AggregateError from 'aggregate-error'
import fs from 'fs'
import { TAnyMap } from '../../main/ts/interface'
import {
  DEFAULT_SRC,
  DEFAULT_DST,
  DEFAULT_MSG,
  DEFAULT_BRANCH,
  DEFAULT_ENTERPRISE,
  PLUGIN_PATH
} from '../../main/ts/defaults'
import { getUrlFromPackage } from '../../main/ts/config'

beforeAll(() => {
  if (!fs.existsSync(DEFAULT_SRC)) {
    fs.mkdirSync(DEFAULT_SRC)
  }

  if (!fs.existsSync('error')) {
    fs.mkdirSync('error')
  }

  if (!fs.existsSync('testFile')) {
    fs.closeSync(fs.openSync('testFile', 'w'))
  }
})

afterAll(() => {
  fs.rmdirSync(DEFAULT_SRC)
  fs.rmdirSync('error')
  fs.unlinkSync('testFile')
})

describe('index', () => {
  const log = jest.fn((...vars: any[]) => { console.log(vars) })
  const error = jest.fn((...vars: any[]) => { console.log(vars) })
  const repositoryUrl = getUrlFromPackage()
  const logger = {
    log,
    error
  }
  const globalConfig = {
    branch: 'master',
    tagFormat: 'v{{version}}',
    repositoryUrl
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
    it('populates plugin context with resolved config data and returns void', async () => {
      const { verifyConditions } = require('../../main/ts')
      const { getRepo } = require('../../main/ts/config')
      const context = {
        logger,
        options: {
          ...globalConfig,
          [step]: [{ path }]
        },
        env: { GITHUB_TOKEN: token }
      }
      const result = await verifyConditions(pluginConfig, context)

      expect(pluginConfig).toEqual({
        branch: DEFAULT_BRANCH,
        msg: DEFAULT_MSG,
        dst: DEFAULT_DST,
        src: DEFAULT_SRC,
        enterprise: DEFAULT_ENTERPRISE,
        repo: getRepo(pluginConfig, context),
        token
      })
      expect(result).toBeUndefined()
    })

    it('asserts GH_TOKEN', async () => {
      const { verifyConditions } = require('../../main/ts')
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
        const { verifyConditions } = require('../../main/ts')
        const context = {
          logger,
          options: {
            ...globalConfig,
            [step]: [{ path }],
            repositoryUrl: null
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
      const { publish } = require('../../main/ts')
      const { getRepo } = require('../../main/ts/config')
      const { OK } = require('../../main/ts/ghpages')
      const pluginConfig = {
        foo: 'bar',
        baz: 'qux'
      }
      const extra = {
        dst: 'root',
        branch: 'doc-branch',
        msg: 'docs updated v{{=it.nextRelease.gitTag}}'
      }
      const context = {
        logger,
        // nextRelease: {},
        options: {
          ...globalConfig,
          [step]: [{ path, ...extra }]
        },
        env: { GITHUB_TOKEN: token }
      }
      const expectedOpts = {
        repo: getRepo(pluginConfig, context),
        branch: 'doc-branch',
        message: 'docs updated v{{=it.nextRelease.gitTag}}',
        dest: 'root'
      }

      const res = await publish(pluginConfig, context)

      expect(log).toHaveBeenCalledWith('Publishing docs via gh-pages')
      expect(log).toHaveBeenCalledWith('Docs published successfully, branch=doc-branch, src=docs, dst=root')

      expect(ghpagesPublish).toHaveBeenCalledWith(DEFAULT_SRC, expectedOpts, expect.any(Function))
      expect(res).toBe(OK)
    })

    it('skips verification step if config has not been changed', async () => {
      const { publish, verifyConditions } = require('../../main/ts')
      const pluginConfig = {}
      const context = {
        logger,
        options: {
          ...globalConfig,
          [step]: [{ path }]
        },
        env: { GITHUB_TOKEN: token }
      }

      await verifyConditions(pluginConfig, context)
      await publish(pluginConfig, context)

      expect(log).toHaveBeenCalledWith('Publishing docs via gh-pages')
      expect(log).toHaveBeenCalledWith('Docs published successfully, branch=gh-pages, src=docs, dst=.')
    })

    it('throws rejection on gh-pages fail', async () => {
      const { publish } = require('../../main/ts')
      const { getRepo } = require('../../main/ts/config')
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
        env: { GITHUB_TOKEN: token + 'foo' }
      }
      const expectedOpts = {
        repo: getRepo(pluginConfig, context),
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
        expect(log).toHaveBeenCalledWith('verify gh-pages config')
        expect(error).toHaveBeenCalledWith('Publish docs failure', expected)
        expect(e).toEqual(expected)
      }
    })

    it('throws an error when docs directory does not exist', async () => {
      const { publish } = require('../../main/ts')
      const pluginConfig = {
        foo: 'bar',
        baz: 'qux'
      }
      const context = {
        logger,
        options: {
          ...globalConfig,
          [step]: [{ path, src: 'notExistingDirectory' }]
        },
        env: { GITHUB_TOKEN: token + 'foo' }
      }
      try {
        await publish(pluginConfig, context)
      } catch (e) {
        expect(e.message).toBe('docs directory does not exist')
      }
    })

    it('throws an error when docs is a file rather than directory', async () => {
      const { publish } = require('../../main/ts')
      const pluginConfig = {
        foo: 'bar',
        baz: 'qux'
      }
      const context = {
        logger,
        options: {
          ...globalConfig,
          [step]: [{ path, src: 'testFile' }]
        },
        env: { GITHUB_TOKEN: token + 'foo' }
      }
      try {
        await publish(pluginConfig, context)
      } catch (e) {
        expect(e.message).toBe('docs is a file rather than directory')
      }
    })
  })
})
