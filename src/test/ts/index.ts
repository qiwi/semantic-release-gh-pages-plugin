import { ICallable } from '@qiwi/substrate-types'
import AggregateError from 'aggregate-error'
import fs from 'node:fs'
import path from 'node:path'

import {
  DEFAULT_BRANCH,
  DEFAULT_DST,
  DEFAULT_ENTERPRISE,
  DEFAULT_MSG,
  DEFAULT_PULL_TAGS_BRANCH,
  DEFAULT_SRC,
  DEFAULT_PATTERN,
  PLUGIN_PATH
} from '../../main/ts'
import { getUrlFromPackage } from '../../main/ts/config'
import { TAnyMap, TContext } from '../../main/ts/interface'

const TEMP = path.resolve(__dirname, '../temp')
const DOCS_AS_FILE = TEMP + '/testFile'
const DOCS_ERR = TEMP + '/error'
const cwd = process.cwd()

beforeAll(() => {
  if (!fs.existsSync(DEFAULT_SRC)) {
    fs.mkdirSync(DEFAULT_SRC, { recursive: true })
  }

  if (!fs.existsSync(DOCS_ERR)) {
    fs.mkdirSync(DOCS_ERR,{ recursive: true })
  }

  if (!fs.existsSync(DOCS_AS_FILE)) {
    fs.writeFileSync(DOCS_AS_FILE, '')
  }
})

afterAll(() => {
  fs.rmdirSync(DOCS_ERR)
  fs.unlinkSync(DOCS_AS_FILE)
})

describe('index', () => {
  const log = jest.fn((...vars: any[]) => { console.log(vars) })
  const error = jest.fn((...vars: any[]) => { console.log(vars) })
  const repositoryUrl = getUrlFromPackage()
  const logger = {
    log,
    error
  } as unknown as TContext['logger']
  const globalConfig = {
    branch: 'master',
    branches: [],
    tagFormat: 'v{{version}}',
    repositoryUrl,
    plugins: []
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
      const { getRepoUrl } = require('../../main/ts/config')
      const context = {
        logger,
        options: {
          ...globalConfig,
          [step]: [{ path }]
        },
        cwd,
        env: { GITHUB_TOKEN: token }
      }
      const result = await verifyConditions(pluginConfig, context)

      expect(pluginConfig).toEqual({
        docsBranch: DEFAULT_BRANCH,
        msg: DEFAULT_MSG,
        dst: DEFAULT_DST,
        src: DEFAULT_SRC,
        pattern: DEFAULT_PATTERN,
        enterprise: DEFAULT_ENTERPRISE,
        repo: await getRepoUrl(pluginConfig, context, DEFAULT_ENTERPRISE),
        token,
        pullTagsBranch: DEFAULT_PULL_TAGS_BRANCH
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
        cwd,
        env: { GITHUB_TOKEN: undefined }
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

      it('asserts enterprise url', async () => {
        const AggregateError = require('aggregate-error')
        const { verifyConditions } = require('../../main/ts')
        const context = {
          logger,
          options: {
            ...globalConfig,
            [step]: [[path, { enterprise: true }]],
            repositoryUrl: 'https://github.com/qiwi/foobar.git'
          },
          cwd,
          env: { GITHUB_TOKEN: token }
        }

        await expect(verifyConditions(pluginConfig, context))
          .rejects.toEqual(new AggregateError(['repo refers to `github.com` but enterprise url is expected']))
      })
    })
  })

  describe('publish', () => {
    const fakeExeca = jest.fn(() => Promise.resolve())

    beforeAll(() => {
      jest.resetModules()
      jest.mock('gh-pages', () => ({
        clean: () => { /* noop */ },
        publish: jest.fn((src: string, opts: TAnyMap, cb: ICallable): void => {
          // NOTE If cb gets some value, this triggers error flow
          if (src === DOCS_ERR) {
            // eslint-disable-next-line
            cb({
              src,
              opts
            })
          } else {
            cb()
          }
        })
      }))
      jest.mock('execa', () => fakeExeca)
    })

    afterEach(fakeExeca.mockClear)

    afterAll(() => {
      jest.unmock('gh-pages')
      jest.unmock('execa')
      jest.resetModules()
    })

    it('performs commit to docs branch via gh-pages util', async () => {
      const { publish: ghpagesPublish } = require('gh-pages')
      const { publish } = require('../../main/ts')
      const { getRepoUrl, resolveConfig } = require('../../main/ts/config')
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
      const context: TContext = {
        logger,
        cwd,
        branch: {name: 'master'},
        // nextRelease: {},
        options: {
          ...globalConfig,
          [step]: [{ path, ...extra }]
        },
        env: { GITHUB_TOKEN: token }
      }
      const expectedOpts = {
        repo: await getRepoUrl(pluginConfig, context, false),
        branch: 'doc-branch',
        message: 'docs updated v{{=it.nextRelease.gitTag}}',
        dest: 'root',
        src: DEFAULT_PATTERN,
      }
      const execaOpts = {
        cwd,
        env: {
          GITHUB_TOKEN: 'token'
        }
      }

      const res = await publish(pluginConfig, context)
      const resolvedConfig = await resolveConfig(pluginConfig, context)

      expect(fakeExeca).toHaveBeenCalledWith(
        'git',
        [
          'pull',
          '--tags',
          '--force',
          expectedOpts.repo,
          resolvedConfig.pullTagsBranch
        ],
        execaOpts
      )

      expect(log).toHaveBeenCalledWith('Publishing docs via gh-pages')
      expect(log).toHaveBeenCalledWith('Docs published successfully, branch=doc-branch, src=docs, dst=root')

      expect(ghpagesPublish).toHaveBeenCalledWith(DEFAULT_SRC, expectedOpts, expect.any(Function))
      expect(res).toBe(OK)
    })

    it('skips verification step if config has not been changed', async () => {
      const { publish, verifyConditions } = require('../../main/ts')
      const pluginConfig = {}
      const context: TContext = {
        logger,
        branch: {name: 'master'},
        options: {
          ...globalConfig,
          [step]: [{ path }]
        },
        cwd,
        env: { GITHUB_TOKEN: token }
      }

      await verifyConditions(pluginConfig, context)
      await publish(pluginConfig, context)

      expect(log).toHaveBeenCalledWith('Publishing docs via gh-pages')
      expect(log).toHaveBeenCalledWith('Docs published successfully, branch=gh-pages, src=docs, dst=.')
    })

    it('throws rejection on gh-pages fail', async () => {
      const { publish } = require('../../main/ts')
      const { getRepoUrl } = require('../../main/ts/config')
      const pluginConfig = {
        foo: 'bar',
        baz: 'qux'
      }
      const context = {
        logger,
        options: {
          ...globalConfig,
          [step]: [{ path, src: DOCS_ERR }] // NOTE see jest.mock('gh-pages') above
        },
        cwd,
        env: { GITHUB_TOKEN: token + 'foo' }
      }
      const expectedOpts = {
        repo: await getRepoUrl(pluginConfig, context, false),
        branch: DEFAULT_BRANCH,
        message: DEFAULT_MSG,
        dest: DEFAULT_DST,
        src: DEFAULT_PATTERN,
      }
      const expected = {
        src: DOCS_ERR,
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
      const AggregateError = require('aggregate-error')
      const context = {
        logger,
        options: {
          ...globalConfig,
          [step]: [{ path, src: 'notExistingDirectory' }]
        },
        cwd,
        env: { GITHUB_TOKEN: token }
      }

      await expect(publish({}, context))
        .rejects.toEqual(new AggregateError(['docs source directory does not exist']))
    })

    it('throws an error when docs is a file rather than directory', async () => {
      const { publish } = require('../../main/ts')
      const AggregateError = require('aggregate-error')
      const context = {
        logger,
        options: {
          ...globalConfig,
          [step]: [{ path, src: DOCS_AS_FILE }]
        },
        cwd,
        env: { GITHUB_TOKEN: token }
      }

      await expect(publish({}, context))
        .rejects.toEqual(new AggregateError(['docs source directory does not exist']))
    })
  })
})
