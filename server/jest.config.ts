export default {
  clearMocks: true,
  coverageProvider: "v8",
  preset: "ts-jest/presets/js-with-ts",
  setupFiles: ["dotenv/config"],
  transform: {
    "^.+\\.mjs$": "ts-jest",
  },
  // The glob patterns Jest uses to detect test files
  testMatch: ["**/tests/*.test.ts"],
};
