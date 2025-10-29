import globals from "globals";
import pluginReactConfig from "eslint-plugin-react/configs/jsx-runtime.js";
import { fixupConfigRules } from "@eslint/compat";

export default [
  { files: ["**/*.{js,jsx}"] },
  { languageOptions: { parser: "babel-eslint" } },
  { languageOptions: { globals: globals.browser } },
  ...fixupConfigRules(pluginReactConfig),
  {
    settings: {
        react: {
            version: "detect"
        }
    },
    rules: {
        // Enforce the use of single quotes for strings
        "quotes": ["error", "single"],
        // Enforce semicolons at the end of statements
        "semi": ["error", "always"],
        // Recommended React Rules
        "react/jsx-uses-vars": "error",
        "react/jsx-uses-react": "error",
        "react/react-in-jsx-scope": "off", // Required for modern React (React 17+)
        // Custom Rules for a cleaner structure
        "no-unused-vars": "warn",
        "no-console": ["warn", { "allow": ["warn", "error"] }],
    }
  }
];
