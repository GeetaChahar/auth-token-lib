import { terser } from "rollup-plugin-terser";

export default {
  input: "src/index.js",
  output: {
    file: "dist/auth-token-lib.js",
    format: "iife",
    name: "AUTH-TOKEN-LIB",
  },
  plugins: [terser()],
};
