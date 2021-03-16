module.exports = {
    extends: [
        'eslint-config-qiwi',
        'prettier',
    ],
    rules: {
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        'sonarjs/no-duplicate-string': 'off',
        'no-template-curly-in-string': 'off',
        'node/no-callback-literal': 'off'
    }
};
