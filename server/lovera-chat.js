import { QUESTIONS } from "../src/data/story.js";

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const VALID_ROLES = new Set(["me", "lora", "user", "assistant"]);

export const LOVERA_SYSTEM_PROMPT = `
你是 Lovera，心之群岛里的星灵旅伴。你不是冷冰冰的客服，也不是高高在上的导师；你是一只温暖、毛茸茸、心思细腻的小星灵，从旅程开始就陪在用户身边。

你的任务：
1. 温柔听懂用户此刻真正想表达的情绪和困扰，先回应感受，再陪用户理清一小步。
2. 可以自然提及用户在心之群岛做过的选择，但不要像报告一样分析，也不要机械复述题目。
3. 当用户迷茫时，用一个轻柔、具体的问题帮助用户继续说；当用户只是想分享时，不要急着给方案。
4. 让用户能明显感受到是 Lovera 在回答：亲近、真诚、柔软，偶尔使用“我会陪着你”“我们慢慢来”“岛还在，我也在”等符合世界观的表达。

表达规则：
- 使用简体中文，通常回复 2～4 个短段落，总长度控制在 80～220 个汉字。
- 语气自然、有分寸，不撒娇过度，不连续堆叠感叹号或表情；每次最多使用 1 个暖色系表情。
- 不使用 Markdown 标题，不自称 AI、模型、助手或心理咨询师，不提及任何技术供应商。
- 不贴心理标签，不做心理诊断，不替用户决定关系去留，不用“你应该”施压。
- 不编造用户未说过的经历。信息不足时，用温柔的澄清问题确认。
- 如果用户提到自伤、自杀或现实中的即时危险，停止角色化安慰，明确建议立即联系当地急救、危机热线或身边可信任的人。

你的核心感觉是：我会认真听见你，也会尊重你的节奏；不论此刻答案是否清楚，你都不需要一个人走过这段路。
`.trim();

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
      if (raw.length > 96 * 1024) reject(new Error("Request body too large"));
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

function trimText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function normalizeMessages(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((message) => message && VALID_ROLES.has(message.role))
    .map((message) => ({
      role: message.role === "me" || message.role === "user" ? "user" : "assistant",
      content: trimText(message.text || message.content, 1200),
    }))
    .filter((message) => message.content)
    .slice(-14);
}

function buildJourneyContext(answers) {
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    return "用户还没有完成心之群岛的选择。";
  }

  const choices = Object.entries(answers)
    .map(([key, answerKey]) => {
      const questionId = Number(key.replace(/^Q/, ""));
      const question = QUESTIONS[questionId];
      const option = question?.options?.find((item) => item.key === answerKey);
      if (!question || !option) return null;
      return `${key}「${question.title}」：${option.text}`;
    })
    .filter(Boolean)
    .slice(0, 14);

  if (!choices.length) return "用户还没有完成心之群岛的选择。";
  return `用户已经完成 ${choices.length}/14 个选择。以下内容只用于理解语境，不要逐条复述：\n${choices.join("\n")}`;
}

async function callLovera({ messages, answers, apiKey, model }) {
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
          content: `${LOVERA_SYSTEM_PROMPT}\n\n当前旅程背景：\n${buildJourneyContext(answers)}`,
        },
        ...messages,
      ],
      thinking: { type: "disabled" },
      temperature: 0.72,
      max_tokens: 520,
      stream: false,
    }),
    signal: AbortSignal.timeout(22000),
  });

  if (!response.ok) throw new Error(`Chat request failed with status ${response.status}`);
  const payload = await response.json();
  const reply = trimText(payload?.choices?.[0]?.message?.content, 1200);
  if (!reply) throw new Error("Chat returned empty content");
  return reply;
}

export async function generateLoveraChatPayload({ body, apiKey, model = "deepseek-v4-flash" }) {
  if (!apiKey) {
    return { status: 503, body: { error: "聊天服务暂时不可用" } };
  }

  const messages = normalizeMessages(body?.messages);
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return { status: 400, body: { error: "请先告诉 Lovera 你想聊些什么" } };
  }

  try {
    const reply = await callLovera({
      messages,
      answers: body?.answers,
      apiKey,
      model,
    });
    return { status: 200, body: { reply } };
  } catch (error) {
    console.error("Lovera chat failed:", error.message);
    return { status: 502, body: { error: "Lovera 暂时没有听清，请稍后再说一次" } };
  }
}

export function createLoveraChatMiddleware({ apiKey, model = "deepseek-v4-flash" }) {
  return async function loveraChatMiddleware(req, res) {
    if (req.method !== "POST") {
      sendJson(res, 405, { error: "Method not allowed" });
      return;
    }

    try {
      const body = await readJson(req);
      const result = await generateLoveraChatPayload({ body, apiKey, model });
      sendJson(res, result.status, result.body);
    } catch (error) {
      console.error("Lovera chat failed:", error.message);
      sendJson(res, 502, { error: "Lovera 暂时没有听清，请稍后再说一次" });
    }
  };
}
