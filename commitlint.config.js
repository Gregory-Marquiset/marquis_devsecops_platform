module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', //  New fonctionnality
        'fix', //  Bug fix
        'docs', //  Documentation
        'style', //  Formatting
        'refactor', //  Refactoring
        'perf', //  Performance
        'test', //  Tests
        'chore', //  Maintenance
        'ci', //  CI/CD
        'sec', //  Security
      ],
    ],
  },
};
