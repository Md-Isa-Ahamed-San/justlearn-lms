import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // Catch undefined variables (including missing imports)
      "no-undef": "error",
      
      // Catch unused variables
      "no-unused-vars": "error",
      
      // Additional helpful rules
      "no-console": "warn", // Optional: warn about console.log
      "prefer-const": "error",
    },
    languageOptions: {
      globals: {
        // Define global variables that are available
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        global: "readonly",
        // Add other globals you use
      },
    },
  },
];

export default eslintConfig;