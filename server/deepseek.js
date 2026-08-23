import { interpret } from "../src/engine/interpreter.js";
import { PROFILE_SKILL_VERSION, PROFILE_SYSTEM_PROMPT, buildProfilePrompt } from "./profile-skill.js";

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const ANSWER_KEYS = Array.from({ length: 14 }, (_, index) => `Q${index + 1}`);
const BLOCK_TYPES = new Set(["opening", "core_longing", "relationship_need", "tension", "red_line", "growth_edge", "closing"]);
const EMPHASIS_TYPES = new Set(["normal", "soft", "accent", "hero"]);
const CONFIDENCE_TYPES = new Set(["low", "medium", "medium_high", "high"]);
const FORBIDDEN_DIAGNOSIS = /(人格障碍|心理疾病|精神疾病|创伤后应激|依恋障碍|你患有|你有病)/;

function validateAnswers(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return ANSWER_KEYS.every((key) => ["A", "B", "C"].includes(value[key]));
}

function trimText(value, maxLength = 240) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function validEvidenceSet(answers) {
  return new Set(ANSWER_KEYS.map((questionId) => `${questionId}-${answers[questionId]}`));
}

function normalizeEvidence(value, allowed, fallback = [], minLength = 1) {
  const evidence = Array.isArray(value)
    ? [...new Set(value.filter((item) => typeof item === "string" && allowed.has(item)))]
    : [];
  return evidence.length >= minLength ? evidence : fallback;
}

function normalizeClaim(candidate, fallback, allowed, minEvidence = 1) {
  const summary = trimText(candidate?.summary, 260);
  if (!summary || FORBIDDEN_DIAGNOSIS.test(summary)) return fallback;
  return {
    summary,
    evidence: normalizeEvidence(candidate?.evidence, allowed, fallback.evidence, minEvidence),
  };
}

function normalizeInsightProfile(candidate, baseProfile, allowed) {
  const fallback = baseProfile.insight_profile;
  const safetyNeeds = Array.isArray(candidate?.safety_needs)
    ? candidate.safety_needs
      .slice(0, 3)
      .map((item, index) => normalizeClaim(item, fallback.safety_needs[index] || fallback.safety_needs[0], allowed))
    : fallback.safety_needs;
  const redLines = Array.isArray(candidate?.red_lines)
    ? candidate.red_lines
      .slice(0, 2)
      .map((item, index) => normalizeClaim(item, fallback.red_lines[index] || fallback.red_lines[0], allowed))
    : fallback.red_lines;
  const tensions = Array.isArray(candidate?.tensions)
    ? candidate.tensions.slice(0, 2).map((item, index) => {
      const local = fallback.tensions[index] || fallback.tensions[0];
      const needA = trimText(item?.need_a, 100);
      const needB = trimText(item?.need_b, 100);
      const interpretation = trimText(item?.interpretation, 260);
      if (!needA || !needB || !interpretation || FORBIDDEN_DIAGNOSIS.test(interpretation)) return local;
      return {
        need_a: needA,
        need_b: needB,
        interpretation,
        evidence: normalizeEvidence(item?.evidence, allowed, local.evidence, 2),
      };
    })
    : fallback.tensions;

  return {
    top_dimensions: baseProfile.deterministic_profile.top_dimensions,
    core_longing: normalizeClaim(candidate?.core_longing, fallback.core_longing, allowed, 2),
    relationship_style: normalizeClaim(candidate?.relationship_style, fallback.relationship_style, allowed, 2),
    safety_needs: safetyNeeds.length ? safetyNeeds : fallback.safety_needs,
    red_lines: redLines.length ? redLines : fallback.red_lines,
    tensions: tensions.length ? tensions : fallback.tensions,
    growth_edge: normalizeClaim(candidate?.growth_edge, fallback.growth_edge, allowed, 2),
    confidence: CONFIDENCE_TYPES.has(candidate?.confidence) ? candidate.confidence : fallback.confidence,
    uncertainties: Array.isArray(candidate?.uncertainties)
      ? candidate.uncertainties.map((item) => trimText(item, 140)).filter(Boolean).slice(0, 3)
      : fallback.uncertainties,
  };
}

function normalizePoem(candidate, baseProfile, allowed) {
  const fallbackBlocks = baseProfile.poem_blocks;
  const sourceBlocks = Array.isArray(candidate?.poem_blocks) && candidate.poem_blocks.length === 6
    ? candidate.poem_blocks
    : fallbackBlocks;
  let heroPhraseCount = 0;
  const poemBlocks = sourceBlocks.map((block, blockIndex) => {
    const local = fallbackBlocks[blockIndex] || fallbackBlocks[0];
    const sourceLines = Array.isArray(block?.lines) && block.lines.length > 0
      ? block.lines.slice(0, 3)
      : local.lines;
    let heroLineSeen = false;
    const lines = sourceLines.map((line, lineIndex) => {
      const localLine = local.lines[lineIndex] || local.lines[0];
      const text = trimText(line?.text, 100) || localLine.text;
      let emphasis = EMPHASIS_TYPES.has(line?.emphasis) ? line.emphasis : localLine.emphasis;
      if (emphasis === "hero") {
        if (heroLineSeen) emphasis = "normal";
        heroLineSeen = true;
      }
      return { text, emphasis };
    });
    const blockText = lines.map((line) => line.text).join("\n");
    const heroPhrases = Array.isArray(block?.hero_phrases)
      ? block.hero_phrases
        .map((phrase) => trimText(phrase, 28))
        .filter((phrase) => phrase && blockText.includes(phrase))
        .slice(0, 1)
      : [];
    const acceptedHeroPhrases = heroPhraseCount < 4 ? heroPhrases : [];
    heroPhraseCount += acceptedHeroPhrases.length;

    return {
      id: trimText(block?.id, 48) || local.id,
      type: BLOCK_TYPES.has(block?.type) ? block.type : local.type,
      lines,
      hero_phrases: acceptedHeroPhrases,
      delay_ms: blockIndex * 650,
    };
  });
  const draftPoem = poemBlocks
    .map((block) => block.lines.map((line) => line.text).join("\n"))
    .join("\n\n");
  const evidenceUsed = normalizeEvidence(candidate?.evidence_used, allowed, baseProfile.evidence_used);

  if (FORBIDDEN_DIAGNOSIS.test(draftPoem)) {
    return {
      draft_poem: baseProfile.draft_poem,
      poem_blocks: fallbackBlocks,
      evidence_used: baseProfile.evidence_used,
    };
  }

  return {
    draft_poem: draftPoem,
    poem_blocks: poemBlocks,
    evidence_used: evidenceUsed,
  };
}

function mergeAiResult(baseProfile, candidate, answers) {
  const allowed = validEvidenceSet(answers);
  const insightProfile = normalizeInsightProfile(candidate?.insight_profile, baseProfile, allowed);
  const poem = normalizePoem(candidate, baseProfile, allowed);
  const firstSafetyNeed = insightProfile.safety_needs[0]?.summary || baseProfile.modules.security;
  const firstRedLine = insightProfile.red_lines[0]?.summary || baseProfile.modules.landmine;
  const firstTension = insightProfile.tensions[0];
  const modules = {
    ...baseProfile.modules,
    core: insightProfile.core_longing.summary,
    security: firstSafetyNeed,
    landmine: firstRedLine,
    dual: firstTension
      ? { title: `${firstTension.need_a}，也${firstTension.need_b}`, body: firstTension.interpretation }
      : baseProfile.modules.dual,
    growthAdvice: [insightProfile.growth_edge.summary, ...baseProfile.modules.growthAdvice.slice(1)],
  };

  return {
    ...baseProfile,
    modules,
    insight_profile: insightProfile,
    ...poem,
    shareLine: `${modules.name}：${insightProfile.core_longing.summary}`,
    generatedBy: "deepseek",
    model: "deepseek-v4-flash",
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
        { role: "system", content: PROFILE_SYSTEM_PROMPT },
        { role: "user", content: buildProfilePrompt(answers, baseProfile) },
      ],
      response_format: { type: "json_object" },
      thinking: { type: "disabled" },
      temperature: 0.3,
      max_tokens: 1800,
      stream: false,
    }),
    signal: AbortSignal.timeout(20000),
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

function localFallback(baseProfile) {
  return {
    ...baseProfile,
    generatedBy: "local",
    model: "deterministic-local",
    profileVersion: PROFILE_SKILL_VERSION,
  };
}

export async function generateProfilePayload({ answers, apiKey, model = "deepseek-v4-flash" }) {
  if (!validateAnswers(answers)) {
    return { status: 400, body: { error: "需要提交完整的 14 道答案" } };
  }

  const startedAt = Date.now();
  const baseProfile = interpret(answers);

  if (!apiKey) {
    return {
      status: 200,
      body: {
        profile: localFallback(baseProfile),
        source: "local-fallback",
        warning: "在线生成暂时不可用，已使用同一套证据规则生成本地结果。",
        timingMs: Date.now() - startedAt,
      },
    };
  }

  try {
    const candidate = await callDeepSeek({ answers, baseProfile, apiKey, model });
    return {
      status: 200,
      body: {
        profile: mergeAiResult(baseProfile, candidate, answers),
        source: "deepseek",
        timingMs: Date.now() - startedAt,
      },
    };
  } catch (error) {
    console.error("Profile generation failed:", error.message);
    return {
      status: 200,
      body: {
        profile: localFallback(baseProfile),
        source: "local-fallback",
        warning: "在线生成暂时不可用，已立即使用同一套证据规则返回结果。",
        timingMs: Date.now() - startedAt,
      },
    };
  }
}

export function createProfileMiddleware({ apiKey, model = "deepseek-v4-flash" }) {
  return async function profileMiddleware(req, res) {
    if (req.method !== "POST") {
      sendJson(res, 405, { error: "Method not allowed" });
      return;
    }

    try {
      const { answers } = await readJson(req);
      const result = await generateProfilePayload({ answers, apiKey, model });
      sendJson(res, result.status, result.body);
    } catch (error) {
      sendJson(res, 400, { error: error.message || "请求格式错误" });
    }
  };
}
