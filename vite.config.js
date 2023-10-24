import { defineConfig } from "vite";

// vite.config.js
export default defineConfig({
  base: '/niivue-bet/',
  assetsInclude: ['**/*.nii', "**/*.wasm"]
})