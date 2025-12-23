/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['./react.js', 'next/core-web-vitals'],
  rules: {
    // Next.js specific
    '@next/next/no-html-link-for-pages': 'error',
  },
};
