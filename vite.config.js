import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { createProfileMiddleware } from "./server/deepseek.js";
import { createLoveraChatMiddleware } from "./server/lovera-chat.js";

export default defineConfig(async ({ command, mode }) => {
  const isGitHubPages = mode === "github-pages";
  const env = command === "serve" ? loadEnv(mode, process.cwd(), "") : {};
  const profileMiddleware = createProfileMiddleware({
    apiKey: env.DEEPSEEK_API_KEY,
  });
  const loveraChatMiddleware = createLoveraChatMiddleware({
    apiKey: env.DEEPSEEK_API_KEY,
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

  const deploymentPlugins = [];
  if (!isGitHubPages) {
    const { cloudflare } = await import("@cloudflare/vite-plugin");
    deploymentPlugins.push(cloudflare());
  }

  return {
    define: {
      "import.meta.env.VITE_API_BASE_URL": JSON.stringify(isGitHubPages
        ? "https://heart-islands-lovera.sharp-tapir-4242.chatgpt.site"
        : ""),
    },
    envDir: command === "serve" ? process.cwd() : "./scripts/empty-env",
    plugins: [react(), deepseekPlugin, ...deploymentPlugins],
    server: {
      host: true,
      port: 5173,
    },
  };
});
