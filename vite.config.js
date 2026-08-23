import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { createProfileMiddleware } from "./server/deepseek.js";
import { createLoveraChatMiddleware } from "./server/lovera-chat.js";

export default defineConfig(async ({ command, mode }) => {
  const env = command === "serve" ? loadEnv(mode, process.cwd(), "") : {};
  const profileMiddleware = createProfileMiddleware({
    apiKey: env.DEEPSEEK_API_KEY,
    model: env.DEEPSEEK_MODEL || "deepseek-v4-flash",
  });
  const loveraChatMiddleware = createLoveraChatMiddleware({
    apiKey: env.DEEPSEEK_API_KEY,
    model: env.DEEPSEEK_CHAT_MODEL || env.DEEPSEEK_MODEL || "deepseek-v4-flash",
  });
  const deepseekPlugin = {
    name: "heart-islands-deepseek-profile",
    configureServer(server) {
      server.middlewares.use("/api/profile", profileMiddleware);
      server.middlewares.use("/api/chat", loveraChatMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use("/api/profile", profileMiddleware);
      server.middlewares.use("/api/chat", loveraChatMiddleware);
    },
  };

  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    envDir: command === "serve" ? process.cwd() : "./scripts/empty-env",
    plugins: [react(), deepseekPlugin, cloudflare()],
    server: {
      host: true,
      port: 5173,
    },
  };
});
