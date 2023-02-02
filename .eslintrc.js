module.exports = {
  "env": {
    "browser": true,
    "es6": true,
    "jest": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "globals": {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly"
  },
  "parserOptions": {
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "plugins": [
    "@typescript-eslint"
  ],
  "rules": {
    "semi": [
      "error",
      "never"
    ],
    "camelcase": [
      "error",
      {
        "properties": "never"
      }
    ],
    "quotes": [
      "error",
      "double",
      {
        "avoidEscape": true
      }
    ],
    "dot-notation": "error",
    "eqeqeq": [
      "error",
      "always"
    ],
    "prefer-template": "error",
    "prefer-const": "error"
  }
}