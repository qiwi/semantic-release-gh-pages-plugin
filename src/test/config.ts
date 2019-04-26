import {
  PLUGIN_PATH,
  DEFAULT_BRANCH,
  DEFAULT_DST,
  DEFAULT_MSG,
  DEFAULT_SRC,
  resolveOptions,
  resolveConfig,
  extractRepoName,
  getUrlFromPackage,
  getRepoUrl
} from '../main/config'

import { TAnyMap, TContext } from '../main/interface'

describe('config', () => {
  const repositoryUrl = getUrlFromPackage()
  const logger = {
    log (msg: string, ...vars: any[]) { console.log(vars || msg) },
    error (msg: string, ...vars: any[]) { console.log(vars || msg) }
  }
  const globalConfig = {
    branch: 'master',
    tagFormat: 'v{{version}}',
    repositoryUrl
  }
  const repoName = extractRepoName(repositoryUrl)

  it('exposes defaults', () => {
    ([DEFAULT_BRANCH,
      PLUGIN_PATH,
      DEFAULT_DST,
      DEFAULT_MSG,
      DEFAULT_SRC
    ]).forEach(v => expect(v).toEqual(expect.any(String)))
  })

  describe('#resolveOptions', () => {
    it('extends config with extra options if target `path` & `step` exist', () => {
      const step = 'publish'
      const path = PLUGIN_PATH
      const pluginConfig = {
        foo: 'bar',
        baz: 'qux'
      }
      const context = {
        logger,
        options: {
          ...globalConfig,
          [step]: [
            { path, foo: 'BAR' }
          ]
        },
        env: { GH_TOKEN: 'token' }
      }

      const config = resolveOptions(pluginConfig, context, path, step)

      expect(config).toEqual({
        foo: 'BAR',
        baz: 'qux',
        path
      })
    })

    it('returns config as is if no path/step match found', () => {
      const pluginConfig = {
        foo: 'bar',
        baz: 'qux'
      }
      const context = {
        logger,
        options: {
          ...globalConfig
        },
        env: { GH_TOKEN: 'token' }
      }

      const config = resolveOptions(pluginConfig, context)

      expect(config).toEqual(pluginConfig)
    })
  })

  describe('#resolveConfig', () => {
    it('extracts meaningful props only', () => {
      const step = 'publish'
      const path = PLUGIN_PATH
      const token = 'token'
      const pluginConfig = {
        foo: 'bar',
        baz: 'qux',
        msg: 'doc update',
        branch: 'master' // NOTE must be omitted
      }
      const extra = {
        src: 'docsdocs',
        dst: 'root'
      }
      const context = {
        logger,
        options: {
          ...globalConfig,
          [step]: [
            { path, foo: 'BAR', ...extra }
          ]
        },
        env: { GH_TOKEN: token }
      }

      const config = resolveConfig(pluginConfig, context, path, step)

      expect(config).toEqual({
        src: 'docsdocs',
        dst: 'root',
        branch: DEFAULT_BRANCH,
        msg: 'doc update',
        token,
        repo: `https://${token}@github.com/${repoName}.git`
      })
    })

    it('fills empty values with defaults', () => {
      const step = 'publish'
      const path = PLUGIN_PATH
      const token = 'token'
      const pluginConfig = {
        foo: 'bar',
        baz: 'qux'
      }
      const context = {
        logger,
        options: {
          ...globalConfig,
          [step]: [
            { path, foo: 'BAR' }
          ]
        },
        env: { GITHUB_TOKEN: token }
      }
      const config = resolveConfig(pluginConfig, context, undefined, step)

      expect(config).toEqual({
        branch: DEFAULT_BRANCH,
        dst: DEFAULT_DST,
        msg: DEFAULT_MSG,
        src: DEFAULT_SRC,
        token,
        repo: `https://${token}@github.com/${repoName}.git`
      })
    })
  })

  it('#extractRepoName returns proper values', () => {
    const cases = [
      ['https://github.com/qiwi/semantic-release-gh-pages-plugin.git', 'qiwi/semantic-release-gh-pages-plugin'],
      ['https://github.com/qiwi/FormattableTextView.git', 'qiwi/FormattableTextView'],
      ['https://github.com/tesT123/R.e-po.git', 'tesT123/R.e-po'],
      ['https://github.com/tesT123%%/foo.git', undefined],
      ['https://github.com/foo/bar/baz.git', undefined],
      ['https://git.io/fjYhK', 'qiwi/semantic-release-gh-pages-plugin'],
      ['https://git.io/wrongShortcut', undefined],
      ['http://git.io/fjYhK', undefined],
      ['git.io/fjYhK', undefined],
      ['git+https://github.com/qiwi/uniconfig.git', 'qiwi/uniconfig'],
      ['git@github.com:qiwi/consul-service-discovery.git', 'qiwi/consul-service-discovery'],
      ['ssh://git@github.com:qiwi/consul-service-discovery.git', 'qiwi/consul-service-discovery']
    ]

    cases.forEach(([input = '', result]) => expect(extractRepoName(input)).toBe(result))
  })

  describe('#getRepoUrl', () => {
    it('returns proper value', () => {
      const cases: Array<{pluginConfig: TAnyMap, context: TContext, result: string}> =
        [
          {
            pluginConfig: {},
            context: {
              logger,
              options: {
                ...globalConfig
              },
              env: { REPO_URL: 'foo' }
            },
            result: 'foo'
          },
          {
            pluginConfig: {},
            context: {
              logger,
              options: {
                ...globalConfig,
                repositoryUrl: 'bar'
              },
              env: {}
            },
            result: 'bar'
          },
          {
            pluginConfig: {
              repositoryUrl: 'baz'
            },
            context: {
              logger,
              options: {
                ...globalConfig
              },
              env: {}
            },
            result: 'baz'
          },
          {
            pluginConfig: {},
            context: {
              logger,
              options: {
                ...globalConfig
              },
              env: {}
            },
            result: repositoryUrl
          }
        ]

      cases.forEach(({
        pluginConfig,
        context,
        result
      }) => {

        expect(getRepoUrl(pluginConfig, context)).toBe(result)
      })
    })
  })
})
