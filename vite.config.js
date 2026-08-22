import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { createProfileMiddleware } from "./server/deepseek.js";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const profileMiddleware = createProfileMiddleware({
    apiKey: env.DEEPSEEK_API_KEY,
    model: env.DEEPSEEK_MODEL || "deepseek-v4-flash",
  });
  const deepseekPlugin = {
    name: "heart-islands-deepseek-profile",
    configureServer(server) {
      server.middlewares.use("/api/profile", profileMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use("/api/profile", profileMiddleware);
    },
  };

  return {
    plugins: [react(), deepseekPlugin],
    server: {
      host: true,
      port: 5173,
    },
  };
});
