import AggregateError from 'aggregate-error'
import {
  DEFAULT_SRC,
  DEFAULT_MSG,
  PLUGIN_PATH
} from '../main/defaults'

describe('index', () => {
  const logger = {
    log (msg: string, ...vars: any[]) { console.log(vars || msg) },
    error (msg: string, ...vars: any[]) { console.log(vars || msg) }
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

      it('asserts repository.url', async  () => {
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
        publish: jest.fn(() => {})
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

      const res = await publish(pluginConfig, context)

      expect(ghpagesPublish).toHaveBeenCalledWith(DEFAULT_SRC, {
        repo: getRepo(context),
        branch: 'doc-branch',
        message: DEFAULT_MSG,
        dest: 'root'
      })
      expect(res).toBeUndefined()
    })
  })
})
