import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [vue()],
  build: {
    cssCodeSplit: false,
    lib: {
      entry: "src/index.ts",
      formats: ["es", "cjs"],
      fileName: (format) => format === "es" ? "emodal.js" : "emodal.cjs",
      cssFileName: "emodal",
    },
    rollupOptions: {
      external: ["@vueuse/core", "bootstrap", "vue"],
    },
  },
});
