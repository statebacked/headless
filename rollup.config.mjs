import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/index.ts",
  output: [
    {
      dir: "lib",
      format: "cjs",
      sourcemap: true,
    },
    {
      dir: "esm",
      format: "es",
      sourcemap: true,
    },
  ],
  plugins: [
    typescript(),
  ],
};
