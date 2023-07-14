# @qiwi/semantic-release-gh-pages-plugin

[![CI](https://github.com/qiwi/semantic-release-gh-pages-plugin/workflows/CI/badge.svg)](https://github.com/qiwi/semantic-release-gh-pages-plugin/actions)
[![Test Coverage](https://api.codeclimate.com/v1/badges/c149b0666dda28813aa4/test_coverage)](https://codeclimate.com/github/qiwi/semantic-release-gh-pages-plugin/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/c149b0666dda28813aa4/maintainability)](https://codeclimate.com/github/qiwi/semantic-release-gh-pages-plugin/maintainability)
[![npm (tag)](https://img.shields.io/npm/v/@qiwi/semantic-release-gh-pages-plugin/latest.svg)](https://www.npmjs.com/package/@qiwi/semantic-release-gh-pages-plugin)

gh-pages publishing plugin for [semantic-release](https://github.com/semantic-release/semantic-release)

| Step               | Description |
|--------------------|-------------|
| `verifyConditions` | Verify the presence of the `GH_TOKEN` set via [environment variables](#environment-variables). |
| `publish`          | Pushes commit to the [documentation branch](#options) |

## Install
```bash
# yarn
yarn add @qiwi/semantic-release-gh-pages-plugin --dev
# npm
npm i @qiwi/semantic-release-gh-pages-plugin -D
```

## Usage
Describe plugin configuration in [package.json / .releaserc.js](https://github.com/semantic-release/semantic-release/blob/master/docs/01-usage/plugins.md#plugins-configuration-options)
```json
{
  "release": {
    "branch": "master",
    "verifyConditions": [
      "@semantic-release/changelog",
      "@semantic-release/npm",
      "@semantic-release/git",
      "@qiwi/semantic-release-gh-pages-plugin"
    ],
    "publish": [
      "@semantic-release/npm",
      "@semantic-release/github",
      [
        "@qiwi/semantic-release-gh-pages-plugin",
        {
          "msg": "updated",
          "branch": "docs"
        }
      ]
    ]
  }
}
```
or even shorter if default settings are used:
```json
{
  "release": {
    "branch": "master",
    "plugins": [
      "@semantic-release/release-notes-generator",
      "@semantic-release/changelog",
      "@semantic-release/git",
      "@semantic-release/github",
      "@semantic-release/npm",
      "@qiwi/semantic-release-gh-pages-plugin"
    ]
  }
}
```

## Configuration
### Environment variables

| Variable                     | Description                                               |
|------------------------------|-----------------------------------------------------------|
| `GH_TOKEN` or `GITHUB_TOKEN` | **Required.** The token used to authenticate with GitHub. |

### Options

| Option           | Description                                                                                                                                                 | Default                                                                                                                                    |
|------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| `msg`            | Commit message template                                                                                                                                     | `docs updated <%= nextRelease.gitTag %>`                                                                                                   |
| `src`            | Documentation directory                                                                                                                                     | `docs`<br/><br/>**NOTE** don't forget to run docs builder (`yarn docs`, `yarn typedoc`, etc) as a part of your build step or any other way |
| `dst`            | Destination directory                                                                                                                                       | `.` (root)                                                                                                                                 |
| `branch`         | Docs branch to push                                                                                                                                         | `gh-pages`                                                                                                                                 |
| `branches`       | Optional list of src-to-target branches association. If defined it suppresses `branch` option. For example, `[['master', 'gh-pages'], ['beta', beta-docs]]` | undefined                                                                                                                                  |
| `repositoryUrl`  | Repository url                                                                                                                                              | inherited from .git                                                                                                                        |
| `enterprise`     | Disables host assertion for GitHub Enterprise domains                                                                                                       | `false`                                                                                                                                    |
| `pullTagsBranch` | Target branch for tags fetching hook. If '' empty string, skips this action                                                                                 | `globalConfig.branch` \|\| `master`                                                                                                        |
| `dotfiles`       | gh-pages [dotfiles](https://github.com/tschaub/gh-pages#optionsdotfiles) option                                                                             | `false`                                                                                                                                    |
| `add`            | gh-pages [add](https://github.com/tschaub/gh-pages#optionsadd) option                                                                                       | `false`                                                                                                                                    |

## License
[MIT](./LICENSE)
