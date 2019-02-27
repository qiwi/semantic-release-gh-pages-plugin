# @qiwi/semantic-release-gh-pages-plugin
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
        "msg": "update docs v$npm_package_version"
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
