import {
  DEFAULT_BRANCH,
  DEFAULT_DST,
  DEFAULT_ENTERPRISE,
  DEFAULT_MSG,
  DEFAULT_PULL_TAGS_BRANCH,
  DEFAULT_SRC,
  DEFAULT_PATTERN,
  // getRepo,
  extractRepoDomain,
  extractRepoName,
  getRepoUrl,
  getUrlFromPackage,
  PLUGIN_PATH,
  resolveConfig,
  resolveOptions,
} from '../../main/ts/config'
import { TAnyMap, TContext } from '../../main/ts/interface'

describe('config', () => {
  const repositoryUrl = getUrlFromPackage()
  const cwd = process.cwd()
  const logger = {
    log (msg: string, ...vars: any[]) { console.log(vars || msg) },
    error (msg: string, ...vars: any[]) { console.log(vars || msg) }
  } as unknown as TContext['logger']
  const branch = {
    name: 'master'
  }
  const globalConfig = {
    branch: 'master',
    branches: [],
    tagFormat: 'v{{version}}',
    repositoryUrl,
    plugins: []
  }

  it('exposes defaults', () => {
    ([DEFAULT_BRANCH,
      PLUGIN_PATH,
      DEFAULT_DST,
      DEFAULT_MSG,
      DEFAULT_SRC,
      DEFAULT_PULL_TAGS_BRANCH
    ]).forEach(v => expect(v).toEqual(expect.any(String)))
  })

  describe('#resolveOptions', () => {
    it('extends config with extra options if target `path` & `step` exist', () => {
      const step = 'publish'
      const path = PLUGIN_PATH
      const pluginConfig = {
        foo: 'bar',
        baz: 'qux',
        enterprise: true
      }
      const context: TContext = {
        logger,
        branch,
        options: {
          ...globalConfig,
          [step]: [
            { path, foo: 'BAR' }
          ]
        },
        cwd,
        env: { GH_TOKEN: 'token' }
      }

      const config = resolveOptions(pluginConfig, context, path, step)

      expect(config).toEqual({
        foo: 'BAR',
        baz: 'qux',
        path,
        enterprise: true
      })
    })

    it('returns config as is if no path/step match found', () => {
      const pluginConfig = {
        foo: 'bar',
        baz: 'qux'
      }
      const context: TContext = {
        logger,
        branch,
        options: {
          ...globalConfig
        },
        cwd,
        env: { GH_TOKEN: 'token' }
      }

      const config = resolveOptions(pluginConfig, context)

      expect(config).toEqual(pluginConfig)
    })
  })

  describe('#resolveConfig', () => {
    it('extracts meaningful props only', async () => {
      const step = 'publish'
      const path = PLUGIN_PATH
      const token = 'token'
      const pluginConfig = {
        foo: 'bar',
        baz: 'qux',
        msg: 'doc update',
        branch: 'master', // NOTE must be omitted,
        repositoryUrl: 'https://enterprise.com/org/repo.git',
        pullTagsBranch: 'dev'
      }
      const extra = {
        enterprise: true,
        src: 'docsdocs',
        dst: 'root'
      }
      const context = {
        logger,
        branch,
        options: {
          ...globalConfig,
          [step]: [
            { path, foo: 'BAR', ...extra }
          ]
        },
        cwd,
        env: { GH_TOKEN: token }
      }

      const config = await resolveConfig(pluginConfig, context, path, step)

      expect(config).toEqual({
        add: undefined,
        ciBranch: 'master',
        dotfiles: undefined,
        src: 'docsdocs',
        dst: 'root',
        enterprise: true,
        docsBranch: DEFAULT_BRANCH,
        msg: 'doc update',
        token,
        repo: `https://${token}@enterprise.com/org/repo.git`,
        pullTagsBranch: 'dev',
        pattern: DEFAULT_PATTERN,
      })
    })

    it('overrides `docBranch` with `branches` value if defined', async () => {
      const step = 'publish'
      const path = PLUGIN_PATH
      const token = 'token'
      const pluginConfig = {
        foo: 'bar',
        baz: 'qux',
        msg: 'doc update',
        branch: 'master',             // NOTE will be omitted,
        branches: ['master', 'beta'], // NOTE will be omitted,
        repositoryUrl: 'https://enterprise.com/org/repo.git'
      }
      const extra = {
        enterprise: true,
        src: 'docsdocs',
        dst: 'root',
        branch: 'aaa',
        branches: [['foo', 'bar'], ['baz', 'qux']],
      }
      const context = {
        logger,
        options: {
          ...globalConfig,
          [step]: [
            { path, foo: 'BAR', ...extra }
          ]
        },
        cwd,
        branch: { name: 'foo' },
        env: { GH_TOKEN: token }
      }

      const config = await resolveConfig(pluginConfig, context, path, step)

      expect(config).toEqual({
        src: 'docsdocs',
        dst: 'root',
        enterprise: true,
        ciBranch: 'foo',
        docsBranch: 'bar',
        msg: 'doc update',
        token,
        repo: `https://${token}@enterprise.com/org/repo.git`,
        pullTagsBranch: 'foo',
        pattern: DEFAULT_PATTERN,
      })
    })

    it('fills empty values with defaults', async () => {
      const step = 'publish'
      const path = PLUGIN_PATH
      const token = 'token'
      const pluginConfig = {
        foo: 'bar',
        baz: 'qux'
      }
      const context = {
        logger,
        branch,
        options: {
          ...globalConfig,
          [step]: [
            { path, foo: 'BAR' }
          ]
        },
        cwd,
        env: { GITHUB_TOKEN: token }
      }
      process.env.DEBUG = 'true'
      const config = await resolveConfig(pluginConfig, context, undefined, step)
      delete process.env.DEBUG

      expect(config).toEqual({
        add: undefined,
        ciBranch: 'master',
        docsBranch: DEFAULT_BRANCH,
        dotfiles: undefined,
        dst: DEFAULT_DST,
        enterprise: DEFAULT_ENTERPRISE,
        msg: DEFAULT_MSG,
        src: DEFAULT_SRC,
        token,
        repo: repositoryUrl,
        pullTagsBranch: DEFAULT_PULL_TAGS_BRANCH,
        pattern: DEFAULT_PATTERN,
      })
    })

    it('issues/248: injects `branches` opt to config', async () => {
      const _cfg = {
        branches: [
          ['main', 'gh-pages'],
          ['alpha', 'gh-pages-alpha'],
          ['beta', 'gh-pages-beta']
        ]
      }
      const context = {
        env: {},
        branch: {name: 'alpha'},
        logger,
        cwd,
        options: {
          branch: 'master',
          branches: [],
          repositoryUrl: 'https://secure@github-enterprise-repo-url.com/foo/bar.git',
          tagFormat: 'v${version}',
          plugins: []
        }
      }
      const cfg = await resolveConfig(_cfg, context)

      expect(cfg.docsBranch).toEqual('gh-pages-alpha')
    })

    it('issues/60', async () => {
      const step = 'publish'
      const path = PLUGIN_PATH
      const pluginConfig = {
        branch: 'master',
        repositoryUrl: 'https://secure@github-enterprise-repo-url.com/foo/bar.git',
        tagFormat: 'v${version}',
        _: [],
        $0: 'node_modules\\semantic-release\\bin\\semantic-release.js',
        enterprise: 'true',
        src: 'dist/web'
      }
      const context = {
        logger,
        cwd,
        env: {},
        branch: {name: 'master'},
        options: {
          branch: 'master',
          branches: [],
          repositoryUrl: 'https://secure@github-enterprise-repo-url.com/foo/bar.git',
          tagFormat: 'v${version}',
          plugins: [
            '@semantic-release/commit-analyzer',
            '@semantic-release/release-notes-generator',
            '@semantic-release/npm',
            '@semantic-release/github'
          ],
          verifyConditions: [
            '@semantic-release/github',
            [
              '@qiwi/semantic-release-gh-pages-plugin',
              {
                enterprise: 'true',
                src: 'dist/web'
              }
            ]
          ],
          publish: [
            {
              path: '@semantic-release/exec',
              cmd: 'nuget pack dist/package -Version ${nextRelease.version}'
            },
            {
              path: '@semantic-release/github',
              assets: '*.nupkg'
            },
            [
              '@qiwi/semantic-release-gh-pages-plugin',
              {
                enterprise: 'true',
                src: 'dist/web'
              }
            ]
          ],
          _: [],
          $0: 'node_modules\\semantic-release\\bin\\semantic-release.js'
        }
      }

      const config = await resolveConfig(pluginConfig, context, path, step)

      expect(config).toEqual({
        docsBranch: DEFAULT_BRANCH,
        ciBranch: 'master',
        dst: DEFAULT_DST,
        enterprise: true,
        msg: DEFAULT_MSG,
        src: 'dist/web',
        token: 'secure',
        repo: `https://secure@github-enterprise-repo-url.com/foo/bar.git`,
        pullTagsBranch: DEFAULT_PULL_TAGS_BRANCH,
        pattern: DEFAULT_PATTERN,
      })
    })
  })

  it('#extractRepoName returns proper values', () => {
    const cases: Array<[string, string?]> = [
      ['https://github.com/qiwi/semantic-release-gh-pages-plugin.git', 'qiwi/semantic-release-gh-pages-plugin'],
      ['https://github.com/qiwi/FormattableTextView.git', 'qiwi/FormattableTextView'],
      ['https://github.com/tesT123/R.e-po.git', 'tesT123/R.e-po'],
      ['https://github.com/tesT123%%/foo.git', undefined],
      ['https://github.com/foo/bar/baz.git', 'foo/bar/baz'],
      ['git+https://github.com/qiwi/uniconfig.git', 'qiwi/uniconfig'],
      ['git@github.com:qiwi/consul-service-discovery.git', 'qiwi/consul-service-discovery'],
      ['ssh://git@github.com/qiwi/consul-service-discovery.git', 'qiwi/consul-service-discovery'],
      ['git+ssh://git@github.com/qiwi/consul-service-discovery.git', 'qiwi/consul-service-discovery'],
      ['https://github.qiwi.com/qiwi/foo.git', 'qiwi/foo'],
      ['http://github.qiwi.com/qiwi/foo.git', 'qiwi/foo'],
      // ['http://github.qi&wi.com/qiwi/foo.git', undefined],
      // ['github.qiwi.com/qiwi/foo', 'qiwi/foo'],
      ['https://qiwigithub.com/qiwi/foo.git', 'qiwi/foo'],
      ['https://qiwigithub.ru/qiwi/foo.git', 'qiwi/foo'],
      ['git@github.qiwi.com:m-pismenskiy/semrel.git', 'm-pismenskiy/semrel'],
      // ['qiwigithub/qiwi/bar.git', undefined],
      ['', undefined]
    ]

    cases.forEach(([input = '', result]) => expect(extractRepoName(input)).toBe(result))
  })

  it('#extractRepoDomain returns proper values', () => {
    const cases: Array<[string, string?]> = [
      ['git@asd.com:m-pismenskiy/semrel.git', 'asd.com'],
      ['https://qiwi.com/qiwi/foo.git', 'qiwi.com'],
      ['http://qiwi.github.com/qiwi/foo.git', 'qiwi.github.com'],
      ['http://barbar.ru/qiwi/foo.git', 'barbar.ru'],
      ['git+http://barfoo.ru/qiwi/foo.git', 'barfoo.ru'],
      ['git+http://bar-foo.ru/qiwi/foo.git', 'bar-foo.ru'],
      ['http://bar/qiwi/foo.git', 'bar']
    ]

    cases.forEach(([input, result]) => expect(extractRepoDomain(input)).toBe(result))
  })

  describe('#getRepoUrl', () => {
    it('returns proper value', () => {
      const cases: Array<{pluginConfig: TAnyMap, context: TContext, enterprise?: boolean, result: string}> =
        [
          {
            pluginConfig: {},
            context: {
              branch,
              logger,
              options: {
                ...globalConfig
              },
              cwd,
              env: { REPO_URL: 'foo' }
            },
            result: getUrlFromPackage()
          },
          {
            pluginConfig: {},
            context: {
              branch,
              logger,
              options: {
                ...globalConfig,
                repositoryUrl: 'bar'
              },
              cwd,
              env: {}
            },
            enterprise: true,
            result: 'bar'
          },
          {
            pluginConfig: {
              repositoryUrl: 'https://baz.com/foo/bar'
            },
            context: {
              branch,
              logger,
              options: {
                ...globalConfig
              },
              cwd,
              env: {
                GH_TOKEN: 'token'
              }
            },
            enterprise: true,
            result: 'https://token@baz.com/foo/bar.git'
          },
          {
            pluginConfig: {},
            context: {
              logger,
              branch,
              options: {
                ...globalConfig
              },
              cwd,
              env: {}
            },
            result: repositoryUrl
          },
          {
            pluginConfig: {},
            context: {
              logger,
              branch,
              options: {
                ...globalConfig,
                repositoryUrl: ''
              },
              cwd,
              env: {
                GITHUB_TOKEN: 'secret',
                REPO_URL: 'https://qux.com/foo/bar'
              }
            },
            enterprise: true,
            result: 'https://secret@qux.com/foo/bar.git'
          },
          {
            pluginConfig: {},
            context: {
              logger,
              branch,
              options: {
                ...globalConfig,
                repositoryUrl: 'https://git.io/fjYhK'
              },
              cwd,
              env: {}
            },
            result: 'https://github.com/qiwi/semantic-release-gh-pages-plugin'
          }
        ]

      return Promise.all(
        cases.map(({ pluginConfig, context, result, enterprise }) =>
          expect(getRepoUrl(pluginConfig, context, !!enterprise)).resolves.toBe(result)
        )
      )
    })
  })
})
