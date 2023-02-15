module.exports = {
  extends: "erb",
  rules: {
    // A temporary hack related to IDE not resolving correct package.json
    "import/no-extraneous-dependencies": "off",
    "react/react-in-jsx-scope": "off",
    "react/jsx-filename-extension": "off",
    "import/extensions": "off",
    "import/no-unresolved": "off",
    "import/no-import-module-exports": "off",
    "no-console": "off",
    "react/prop-types": "off",
    "no-use-before-define": "off",
    "no-underscore-dangle": "off",
    "jsx-a11y/label-has-associated-control": "off",
    // 'react/no-array-index-key': 'off',
    // disable prettier rules
    "prettier/prettier": "off",
    "no-promise-executor-return": "off",
    "import/prefer-default-export": "off",
    "react/no-array-index-key": "off",
    camelcase: "off",
    "consistent-return": "off",
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
    createDefaultProgram: true,
  },
  settings: {
    "import/resolver": {
      // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
      node: {},
      webpack: {
        config: require.resolve("./.erb/configs/webpack.config.eslint.ts"),
      },
      typescript: {},
    },
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
  },
};
