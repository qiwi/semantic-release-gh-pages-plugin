# @qiwi/semantic-release-gh-pages-plugin

[![Build Status](https://travis-ci.com/qiwi/semantic-release-gh-pages-plugin.svg?branch=master)](https://travis-ci.com/qiwi/semantic-release-gh-pages-plugin)
[![npm (tag)](https://img.shields.io/npm/v/@qiwi/semantic-release-gh-pages-plugin/latest.svg)](https://www.npmjs.com/package/@qiwi/semantic-release-gh-pages-plugin)
[![dependencyStatus](https://img.shields.io/david/qiwi/semantic-release-gh-pages-plugin.svg?maxAge=300)](https://david-dm.org/qiwi/semantic-release-gh-pages-plugin)
[![Test Coverage](https://api.codeclimate.com/v1/badges/c149b0666dda28813aa4/test_coverage)](https://codeclimate.com/github/qiwi/semantic-release-gh-pages-plugin/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/c149b0666dda28813aa4/maintainability)](https://codeclimate.com/github/qiwi/semantic-release-gh-pages-plugin/maintainability)
[![Greenkeeper badge](https://badges.greenkeeper.io/qiwi/semantic-release-gh-pages-plugin.svg)](https://greenkeeper.io/)
[![CodeStyle](https://img.shields.io/badge/code%20style-tslint--config--qiwi-brightgreen.svg)](https://github.com/qiwi/tslint-config-qiwi)

gh-pages publishing plugin for [semantic-release](https://github.com/semantic-release/semantic-release)

| Step               | Description |
|--------------------|-------------|
| `verifyConditions` | Verify the presence of the `GH_TOKEN` set via [environment variables](#environment-variables). |
| `publish`          | Pushes commit to the [documentation branch](#options) |

### Install
```bash
yarn add @qiwi/semantic-release-gh-pages-plugin --dev
```
or
```bash
npm add @qiwi/semantic-release-gh-pages-plugin -D
```

### Usage

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
      {
        "path": "@qiwi/semantic-release-gh-pages-plugin",
        "msg": "updated",
        "branch": "docs"
      }
    ]
  }
}
```

### Configuration
##### Environment variables

| Variable                     | Description                                               |
|------------------------------| --------------------------------------------------------- |
| `GH_TOKEN` or `GITHUB_TOKEN` | **Required.** The token used to authenticate with GitHub. |

##### Options

| Option          | Description                                             | Default |
|-----------------|---------------------------------------------------------| --------|
| `msg`           | Commit message template                                 | `updated v{{=it.nextRelease.gitTag}}` |
| `src`           | Documentation directory                                 | `docs`<br/><br/>**NOTE** don't forget to run docs builder (`yarn docs`, `yarn typedoc`, etc) as a part of your build step or any other way|
| `dst`           | Destination directory                                   | `.` (root) |
| `branch`        | Docs branch to push                                     | `gh-pages` |
| `repositoryUrl` | Repository url                                          | inherited from .git |
| `enterprise`    | Disables host assertion for GitHub Enterprise domains   | false      |

