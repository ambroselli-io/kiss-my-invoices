import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode, ssrBuild }) => {
  if (command === "serve") {
    return {
      plugins: [react()],
      root: "src/renderer",
    };
  }
  // command === 'build'
  return {
    plugins: [react()],
    root: "src/renderer",
    base: "https://ambroselli-io.github.io/kiss-my-invoices/",
    build: {
      outDir: "../../dist",
    },
  };
});
