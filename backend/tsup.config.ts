import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  outDir: "dist",
  format: ["cjs"],
  target: "node22",
  clean: true,
  sourcemap: true,
  dts: true,
  tsconfig: "tsconfig.json",
  skipNodeModulesBundle: true,
  esbuildOptions(options) {
    options.alias = {
      "@config": "./src/config",
      "@controllers": "./src/controllers",
      "@entity": "./src/entity",
      "@models": "./src/models",
      "@routes": "./src/routes",
      "@utils": "./src/utils",
      "@services": "./src/services",
    };
  },
});
