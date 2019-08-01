import {
  PLUGIN_PATH,
  DEFAULT_BRANCH,
  DEFAULT_DST,
  DEFAULT_MSG,
  DEFAULT_SRC,
  DEFAULT_ENTERPRISE,
  resolveOptions,
  resolveConfig,
  extractRepoName,
  getUrlFromPackage,
  getRepoUrl,
  getRepo,
  extractRepoDomain
} from '../../main/ts/config'

import { TAnyMap, TContext } from '../../main/ts/interface'

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
      const context: TContext = {
        logger,
        options: {
          ...globalConfig,
          [step]: [
            { path, foo: 'BAR' }
          ]
        },
        cwd: process.cwd(),
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
        cwd: process.cwd(),
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
        enterprise: true,
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
        cwd: process.cwd(),
        env: { GH_TOKEN: token }
      }

      const config = resolveConfig(pluginConfig, context, path, step)

      expect(config).toEqual({
        src: 'docsdocs',
        dst: 'root',
        enterprise: true,
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
        cwd: process.cwd(),
        env: { GITHUB_TOKEN: token }
      }
      const config = resolveConfig(pluginConfig, context, undefined, step)

      expect(config).toEqual({
        branch: DEFAULT_BRANCH,
        dst: DEFAULT_DST,
        enterprise: DEFAULT_ENTERPRISE,
        msg: DEFAULT_MSG,
        src: DEFAULT_SRC,
        token,
        repo: `https://${token}@github.com/${repoName}.git`
      })
    })
  })

  it('#extractRepoName returns proper values', () => {
    const cases: Array<[string, string?]> = [
      ['https://github.com/qiwi/semantic-release-gh-pages-plugin.git', 'qiwi/semantic-release-gh-pages-plugin'],
      ['https://github.com/qiwi/FormattableTextView.git', 'qiwi/FormattableTextView'],
      ['https://github.com/tesT123/R.e-po.git', 'tesT123/R.e-po'],
      ['https://github.com/tesT123%%/foo.git', undefined],
      ['https://github.com/foo/bar/baz.git', undefined],
      ['git+https://github.com/qiwi/uniconfig.git', 'qiwi/uniconfig'],
      ['git@github.com:qiwi/consul-service-discovery.git', 'qiwi/consul-service-discovery'],
      ['ssh://git@github.com:qiwi/consul-service-discovery.git', 'qiwi/consul-service-discovery'],
      ['https://github.qiwi.com/qiwi/foo.git', 'qiwi/foo'],
      ['http://github.qiwi.com/qiwi/foo.git', 'qiwi/foo'],
      ['http://github.qi&wi.com/qiwi/foo.git', undefined],
      ['github.qiwi.com/qiwi/foo', 'qiwi/foo'],
      ['qiwigithub.com/qiwi/foo.git', 'qiwi/foo'],
      ['https://qiwigithub.com/qiwi/foo.git', 'qiwi/foo'],
      ['https://qiwigithub.ru/qiwi/foo.git', 'qiwi/foo'],
      ['qiwigithub.com/qiwi/foo', 'qiwi/foo'],
      ['qiwigithub/qiwi/bar.git', undefined],
      ['', undefined]
    ]

    cases.forEach(([input = '', result]) => expect(extractRepoName(input)).toBe(result))
  })

  it('#extractRepoDomain returns proper values', () => {
    const cases: Array<[string, string?]> = [
      ['asd.com/qiwi/foo.git', 'asd.com'],
      ['https://qiwi.com/qiwi/foo.git', 'qiwi.com'],
      ['http://qiwi.github.com/qiwi/foo.git', 'qiwi.github.com'],
      ['http://barbar.ru/qiwi/foo.git', 'barbar.ru'],
      ['git+http://barfoo.ru/qiwi/foo.git', 'barfoo.ru'],
      ['git+http://bar-foo.ru/qiwi/foo.git', 'bar-foo.ru'],
      ['http://bar/qiwi/foo.git', undefined]
    ]

    cases.forEach(([input, result]) => expect(extractRepoDomain(input)).toBe(result))
  })

  it('#getRepo returns proper repo url with token', () => {
    const cases = [
      {
        pluginConfig: {
          enterprise: true
        },
        context: {
          logger,
          options: {
            ...globalConfig
          },
          cwd: process.cwd(),
          env: {
            REPO_URL: 'qiwigithub.com/qiwi/foo.git',
            GH_TOKEN: 'foo'
          }
        },
        result: 'https://foo@qiwigithub.com/qiwi/foo.git'
      },
      {
        pluginConfig: {
          enterprise: true
        },
        context: {
          logger,
          options: {
            ...globalConfig
          },
          cwd: process.cwd(),
          env: {
            REPO_URL: 'https://github.qiwi.com/qiwi/foo.git',
            GH_TOKEN: 'foo'
          }
        },
        result: 'https://foo@github.qiwi.com/qiwi/foo.git'
      },
      {
        pluginConfig: {
          enterprise: true
        },
        context: {
          logger,
          options: {
            ...globalConfig
          },
          cwd: process.cwd(),
          env: {
            REPO_URL: 'http://github.qiwi.com/qiwi/foo',
            GH_TOKEN: 'foo'
          }
        },
        result: 'https://foo@github.qiwi.com/qiwi/foo.git'
      }
    ]

    cases.forEach(({ pluginConfig, context, result }) => expect(getRepo(pluginConfig, context)).toBe(result))
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
          },
          {
            pluginConfig: {},
            context: {
              logger,
              options: {
                ...globalConfig
              },
              env: {
                GH_URL: 'bat'
              }
            },
            result: 'bat'
          },
          {
            pluginConfig: {},
            context: {
              logger,
              options: {
                ...globalConfig
              },
              env: {
                GITHUB_URL: 'qux'
              }
            },
            result: 'qux'
          },
          {
            pluginConfig: {},
            context: {
              logger,
              options: {
                ...globalConfig,
                repositoryUrl: 'https://git.io/fjYhK'
              },
              env: {}
            },
            result: 'https://github.com/qiwi/semantic-release-gh-pages-plugin'
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
