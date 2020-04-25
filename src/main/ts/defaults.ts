/** @module semantic-release-gh-pages-plugin */

export const PLUGIN_PATH: string = '@qiwi/semantic-release-gh-pages-plugin'
export const DEFAULT_BRANCH: string = 'gh-pages'
export const DEFAULT_SRC: string = 'docs'
export const DEFAULT_DST: string = '.'
export const DEFAULT_MSG: string = 'docs updated {{=it.nextRelease.gitTag}}'
export const DEFAULT_ENTERPRISE: boolean = false
export const DEFAULT_PULL_TAGS_BRANCH = 'master'
