import AggregateError from 'aggregate-error'
import { verifyConditions, publish } from '../main'
import { PLUGIN_PATH } from '../main/config'

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
    it('asserts GH_TOKEN', async () => {
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

    it('returns void by default', async () => {
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
  })

  describe('publish', () => {
    it('performs commit to docs branch via gh-pages util', async () => {
      const context = {
        logger,
        options: {
          ...globalConfig,
          [step]: [{ path }]
        },
        env: { GITHUB_TOKEN: token }
      }

      await expect(publish(pluginConfig, context)).resolves.toBeUndefined()
    })
  })
})
