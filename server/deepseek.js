import { interpret } from "../src/engine/interpreter.js";
import { PROFILE_SKILL_VERSION, PROFILE_SYSTEM_PROMPT, buildProfilePrompt } from "./profile-skill.js";

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const ANSWER_KEYS = Array.from({ length: 14 }, (_, index) => `Q${index + 1}`);
const STRING_FIELDS = [
  "name",
  "opening",
  "core",
  "heartTrigger",
  "logic",
  "beLoved",
  "youLove",
  "security",
  "closeness",
  "autonomy",
  "conflictFirst",
  "conflictRepair",
  "conflictDiff",
  "commitment",
  "hidden",
  "landmine",
  "manual",
  "closing",
];
const LIST_FIELDS = ["strengths", "risks", "partner", "growthAdvice"];

function validateAnswers(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return ANSWER_KEYS.every((key) => ["A", "B", "C"].includes(value[key]));
}

function trimText(value, maxLength = 420) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function trimList(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim().slice(0, 180))
    .filter(Boolean)
    .slice(0, 5);
}

function mergeAiResult(baseProfile, candidate) {
  const modules = { ...baseProfile.modules };

  for (const field of STRING_FIELDS) {
    const next = trimText(candidate?.[field]);
    if (next) modules[field] = next;
  }

  for (const field of LIST_FIELDS) {
    const next = trimList(candidate?.[field]);
    if (next.length) modules[field] = next;
  }

  const dualTitle = trimText(candidate?.dual?.title, 80);
  const dualBody = trimText(candidate?.dual?.body, 360);
  if (dualTitle && dualBody) modules.dual = { title: dualTitle, body: dualBody };

  return {
    ...baseProfile,
    modules,
    shareLine: `${modules.name}：${modules.core}`,
    generatedBy: "deepseek",
    profileVersion: PROFILE_SKILL_VERSION,
  };
}

async function callDeepSeek({ answers, baseProfile, apiKey, model }) {
  const response = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: PROFILE_SYSTEM_PROMPT,
        },
        { role: "user", content: buildProfilePrompt(answers, baseProfile) },
      ],
      response_format: { type: "json_object" },
      thinking: { type: "disabled" },
      temperature: 0.35,
      max_tokens: 3600,
      stream: false,
    }),
    signal: AbortSignal.timeout(28000),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek request failed with status ${response.status}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) throw new Error("DeepSeek returned empty content");

  return JSON.parse(content);
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 64 * 1024) reject(new Error("Request body too large"));
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(raw || "{}"));
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

export function createProfileMiddleware({ apiKey, model = "deepseek-v4-flash" }) {
  return async function profileMiddleware(req, res) {
    if (req.method !== "POST") {
      sendJson(res, 405, { error: "Method not allowed" });
      return;
    }

    try {
      const { answers } = await readJson(req);
      if (!validateAnswers(answers)) {
        sendJson(res, 400, { error: "需要提交完整的 14 道答案" });
        return;
      }

      const startedAt = Date.now();
      const baseProfile = interpret(answers);

      if (!apiKey) {
        sendJson(res, 200, {
          profile: { ...baseProfile, generatedBy: "local", profileVersion: PROFILE_SKILL_VERSION },
          source: "local-fallback",
          warning: "DeepSeek API 尚未配置，已使用本地规则库生成结果。",
          timingMs: Date.now() - startedAt,
        });
        return;
      }

      try {
        const candidate = await callDeepSeek({ answers, baseProfile, apiKey, model });
        sendJson(res, 200, {
          profile: mergeAiResult(baseProfile, candidate),
          source: "deepseek",
          timingMs: Date.now() - startedAt,
        });
      } catch (error) {
        console.error("DeepSeek profile generation failed:", error.message);
        sendJson(res, 200, {
          profile: { ...baseProfile, generatedBy: "local", profileVersion: PROFILE_SKILL_VERSION },
          source: "local-fallback",
          warning: "DeepSeek 暂时不可用，已立即使用本地规则库返回结果。",
          timingMs: Date.now() - startedAt,
        });
      }
    } catch (error) {
      sendJson(res, 400, { error: error.message || "请求格式错误" });
    }
  };
}
