module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation
        'style', // Formatting, missing semi colons, etc
        'refactor', // Code refactoring
        'perf', // Performance improvements
        'test', // Adding tests
        'build', // Build system or external dependencies
        'ci', // CI configuration
        'chore', // Maintenance
        'revert', // Revert to a commit
      ],
    ],
    'subject-case': [0], // Disable case checking for subject
    'body-max-line-length': [0], // Disable max line length for body
  },
};
