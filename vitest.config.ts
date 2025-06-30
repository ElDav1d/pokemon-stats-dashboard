import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { glob } from "glob";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [...glob.sync("./src/**/setupTests.ts")],
    include: ["**/*.{test,spec}.{ts,tsx}"],
  },
});
