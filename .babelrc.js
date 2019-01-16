const { BABEL_ENV, NODE_ENV } = process.env;
const cjs = BABEL_ENV === 'cjs' || NODE_ENV === 'test';

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
        loose: true,
        targets: '> 1%, not dead',
      },
    ],
  ],

  plugins: [
    '@babel/plugin-proposal-object-rest-spread',
    cjs && '@babel/plugin-transform-modules-commonjs',
  ].filter(Boolean),

  env: {
    test: {
      presets: ['@babel/preset-env'],
    },
  },
};
