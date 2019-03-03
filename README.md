# @qiwi/semantic-release-gh-pages-plugin

[![Build Status](https://travis-ci.com/qiwi/semantic-release-gh-pages-plugin.svg?branch=master)](https://travis-ci.com/qiwi/semantic-release-gh-pages-plugin)
[![coverage](https://img.shields.io/coveralls/qiwi/semantic-release-gh-pages-plugin.svg?maxAge=300)](https://coveralls.io/github/qiwi/semantic-release-gh-pages-plugin)
[![dependencyStatus](https://img.shields.io/david/qiwi/semantic-release-gh-pages-plugin.svg?maxAge=300)](https://david-dm.org/qiwi/semantic-release-gh-pages-plugin)
[![devDependencyStatus](https://img.shields.io/david/dev/qiwi/semantic-release-gh-pages-plugin.svg?maxAge=300)](https://david-dm.org/qiwi/semantic-release-gh-pages-plugin)
[![Test Coverage](https://api.codeclimate.com/v1/badges/c149b0666dda28813aa4/test_coverage)](https://codeclimate.com/github/qiwi/semantic-release-gh-pages-plugin/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/c149b0666dda28813aa4/maintainability)](https://codeclimate.com/github/qiwi/semantic-release-gh-pages-plugin/maintainability)
[![Greenkeeper badge](https://badges.greenkeeper.io/qiwi/semantic-release-gh-pages-plugin.svg)](https://greenkeeper.io/)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)


gh-pages publishing plugin for [semantic-release](https://github.com/semantic-release/semantic-release)

| Step               | Description |
|--------------------|-------------|
| `verifyConditions` | Verify the presence of the `GH_TOKEN` set via [environment variables](#environment-variables). |
| `publish`          | Pushes commit to the [documentation branch](#options) |

### Install
```bash
yarn add @qiwi/semantic-release-ghpages-plugin --dev
```

### Usage

```json
{
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/git",
    [
      "@qiwi/semantic-release-ghpages-plugin", 
      {
        "branch": "gh-pages",
        "src": "docs",
        "msg": "updated v{{=it.nextRelease.gitTag}}"
      }
    ]
  ]
}
```

### Configuration
##### Environment variables

| Variable                     | Description                                               |
|------------------------------| --------------------------------------------------------- |
| `GH_TOKEN` or `GITHUB_TOKEN` | **Required.** The token used to authenticate with GitHub. |

##### Options

| Option    | Description           | Default |
|-----------|-----------------------| --------|
| `msg`     | Commit message template | `update docs v$npm_package_version` |
| `src`     | Documentation directory | `docs`<br/><br/>**NOTE** don't forget to run docs builder (`yarn docs`, `yarn typedoc`, etc) as a part of your build step or any other way|
| `dst`     | Destination directory   | `.` (root) |
| `branch`  | Docs branch to push     | `gh-pages` |
