import { generateProfilePayload } from "./deepseek.js";
import { generateLoveraChatPayload } from "./lovera-chat.js";

const RATE_LIMITS = {
  "/api/profile": { limit: 8, windowMs: 60_000 },
  "/api/chat": { limit: 24, windowMs: 60_000 },
};
const requestBuckets = new Map();

function jsonResponse(status, body, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...extraHeaders,
    },
  });
}

async function readRequestJson(request, maxBytes = 96 * 1024) {
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > maxBytes) throw new Error("Request body too large");
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > maxBytes) {
    throw new Error("Request body too large");
  }
  try {
    return JSON.parse(raw || "{}");
  } catch {
    throw new Error("Invalid JSON body");
  }
}

function rateLimitResponse(request, pathname) {
  const policy = RATE_LIMITS[pathname];
  if (!policy) return null;

  const clientId = request.headers.get("CF-Connecting-IP") || "unknown";
  const now = Date.now();
  const key = `${pathname}:${clientId}`;
  const current = requestBuckets.get(key);
  const bucket = !current || now >= current.resetAt
    ? { count: 0, resetAt: now + policy.windowMs }
    : current;
  bucket.count += 1;
  requestBuckets.set(key, bucket);

  if (requestBuckets.size > 2_000) {
    for (const [bucketKey, value] of requestBuckets) {
      if (now >= value.resetAt) requestBuckets.delete(bucketKey);
    }
  }

  if (bucket.count <= policy.limit) return null;
  return jsonResponse(
    429,
    { error: "请求有些频繁，请稍等一会儿再试" },
    { "Retry-After": String(Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))) },
  );
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (pathname === "/api/health") {
      return jsonResponse(200, {
        ok: true,
        deepseekConfigured: Boolean(env.DEEPSEEK_API_KEY),
      });
    }

    if (pathname === "/api/profile" || pathname === "/api/chat") {
      if (request.method !== "POST") {
        return jsonResponse(405, { error: "Method not allowed" }, { Allow: "POST" });
      }

      const limited = rateLimitResponse(request, pathname);
      if (limited) return limited;

      try {
        const body = await readRequestJson(request);
        if (pathname === "/api/profile") {
          const result = await generateProfilePayload({
            answers: body.answers,
            apiKey: env.DEEPSEEK_API_KEY,
            model: env.DEEPSEEK_MODEL || "deepseek-v4-flash",
          });
          return jsonResponse(result.status, result.body);
        }

        const result = await generateLoveraChatPayload({
          body,
          apiKey: env.DEEPSEEK_API_KEY,
          model: env.DEEPSEEK_CHAT_MODEL || env.DEEPSEEK_MODEL || "deepseek-v4-flash",
        });
        return jsonResponse(result.status, result.body);
      } catch (error) {
        return jsonResponse(400, { error: error.message || "请求格式错误" });
      }
    }

    return env.ASSETS.fetch(request);
  },
};
