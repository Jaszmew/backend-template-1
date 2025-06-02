import js from "@eslint/js"
import pluginTs from "@typescript-eslint/eslint-plugin"
import parserTs from "@typescript-eslint/parser"
import prettier from "eslint-plugin-prettier"

export default [
  js.configs.recommended,
  {
    files: ["**/*.ts"],
    plugins: {
      "@typescript-eslint": pluginTs,
      prettier: prettier,
    },
    languageOptions: {
      parser: parserTs,
      parserOptions: {
        project: "./tsconfig.json",
      },
      env: {
        node: true,
        es2021: true,
      },
    },
    rules: {
      ...pluginTs.configs.recommended.rules,
      "prettier/prettier": "error",
      quotes: ["error", "double"],
      semi: ["error", "never"],
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: false,
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
    ignores: ["node_modules/*", "docs/*", "dist/*", "scripts/*"],
  },
]
