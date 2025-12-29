import reactPlugin from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Read version from package.json for injection in tests
import * as packageJson from "./package.json";

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
  plugins: [reactPlugin()] as any,
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/NextShift/**",
      "**/HdayPlanner/**",
    ],
    typecheck: {
      tsconfig: "./tsconfig.test.json",
    },
    coverage: {
      reporter: ["text", "lcov"],
    },
  },
});
