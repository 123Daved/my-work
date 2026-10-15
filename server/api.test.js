import test from "node:test";
import assert from "node:assert/strict";
import worker from "./worker.js";
import { generateProfilePayload } from "./deepseek.js";
import { generateLoveraChatPayload } from "./lovera-chat.js";

const answers = Object.fromEntries(Array.from({ length: 14 }, (_, i) => [`Q${i + 1}`, "A"]));
const pagesOrigin = "https://123daved.github.io";

test("both AI features always request Flash, including with stale Pro configuration", async (t) => {
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    const body = JSON.parse(options.body);
    calls.push({ url, body });
    return Response.json({ choices: [{ message: {
      content: body.response_format ? "{}" : "我在，慢慢说。",
    } }] });
  });
  const profile = await generateProfilePayload({ answers, apiKey: "test-key", model: "deepseek-v4-pro" });
  assert.equal(profile.body.source, "deepseek");
  assert.equal(profile.body.profile.model, "deepseek-flash");
  const chat = await generateLoveraChatPayload({
    body: { messages: [{ role: "me", text: "你好" }] },
    apiKey: "test-key", model: "deepseek-v4-pro",
  });
  assert.equal(chat.status, 200);
  assert.equal(calls.length, 2);
  for (const call of calls) {
    assert.equal(call.url, "https://api.deepseek.com/chat/completions");
    assert.equal(call.body.model, "deepseek-flash");
    assert.equal(call.body.thinking.type, "disabled");
  }
});

test("Pages preflight and API errors retain exact-origin CORS headers", async () => {
  const preflight = await worker.fetch(new Request("https://example.com/api/chat", {
    method: "OPTIONS", headers: { Origin: pagesOrigin, "Access-Control-Request-Method": "POST" },
  }), {});
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get("Access-Control-Allow-Origin"), pagesOrigin);
  const unavailable = await worker.fetch(new Request("https://example.com/api/chat", {
    method: "POST", headers: { Origin: pagesOrigin, "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "me", text: "你好" }] }),
  }), {});
  assert.equal(unavailable.status, 503);
  assert.equal(unavailable.headers.get("Access-Control-Allow-Origin"), pagesOrigin);
  assert.equal(unavailable.headers.get("Vary"), "Origin");
});

test("unrelated origins cannot call the API", async () => {
  const response = await worker.fetch(new Request("https://example.com/api/chat", {
    method: "OPTIONS", headers: { Origin: "https://unrelated.example" },
  }), {});
  assert.equal(response.status, 403);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), null);
});

test("health reports configuration and Flash without exposing the secret", async () => {
  const response = await worker.fetch(new Request("https://example.com/api/health"), {
    DEEPSEEK_API_KEY: "never-expose-this", DEEPSEEK_MODEL: "deepseek-v4-pro",
  });
  assert.deepEqual(await response.json(), { ok: true, deepseekConfigured: true, model: "deepseek-flash" });
});

test("missing credentials preserve local profile fallback", async () => {
  const result = await generateProfilePayload({ answers });
  assert.equal(result.status, 200);
  assert.equal(result.body.source, "local-fallback");
  assert.equal((await generateProfilePayload({ answers: {} })).status, 400);
});
