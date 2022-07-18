const { resolve } = require("path");

module.exports = {
  root: true,
  parserOptions: {
    extraFileExtensions: [".vue"],
    parser: "@typescript-eslint/parser",
    project: resolve(__dirname, "./tsconfig.json"),
    tsconfigRootDir: __dirname,
    ecmaVersion: 2018,
    sourceType: "module"
  },
  env: {
    browser: true
  },
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:vue/vue3-essential",
    "standard"
  ],
  plugins: ["@typescript-eslint", "vue"],
  globals: {
    ga: "readonly",
    cordova: "readonly",
    __statics: "readonly",
    __QUASAR_SSR__: "readonly",
    __QUASAR_SSR_SERVER__: "readonly",
    __QUASAR_SSR_CLIENT__: "readonly",
    __QUASAR_SSR_PWA__: "readonly",
    process: "readonly",
    Capacitor: "readonly",
    chrome: "readonly"
  },
  rules: {
    "generator-star-spacing": "off",
    "arrow-parens": "off",
    "@typescript-eslint/camelcase": "off",
    "@typescript-eslint/no-var-requires": "off",
    camelcase: "off",
    "one-var": "off",
    "no-void": "off",
    "multiline-ternary": "off",
    "import/first": "off",
    "import/namespace": "error",
    "import/default": "error",
    "import/export": "error",
    "import/extensions": "off",
    "import/no-unresolved": "off",
    "import/no-extraneous-dependencies": "off",
    "prefer-promise-reject-errors": "off",
    quotes: ["warn", "double", { avoidEscape: true }],
    semi: "off",
    "space-before-function-paren": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-empty-function": "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off"
  }
};
