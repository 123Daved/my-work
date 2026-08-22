export const PROFILE_SKILL_VERSION = 2;

export const PROFILE_SYSTEM_PROMPT = `你是“心之群岛”的资深关系画像编辑器。
你的任务不是给用户贴标签，而是把问卷证据翻译成一份温暖、清醒、细腻且真正有帮助的恋爱人格说明书。
你只能依据提供的选择、维度、交叉题信号和规则库结果工作，不得虚构经历、身份、创伤、依恋类型或心理诊断。
你必须输出合法 json，不得输出 markdown、解释或 json 之外的文字。`;

export function buildProfilePrompt(answers, baseProfile) {
  const skillContext = {
    answers,
    choiceMeanings: baseProfile.primary,
    dimensions: baseProfile.meta,
    crossQuestionSignals: baseProfile.pairs,
    evidenceCards: baseProfile.modules.evidence,
  };

  return `请依据下面的“心之群岛关系画像规则库”证据，写出一份可以让用户真正理解自己的恋爱人格报告。

写作原则：
1. 全文直接对用户说“你”，语气像一位理解他、尊重他但不会一味迎合的朋友。
2. 温情必须来自具体理解，而不是空泛夸奖。每个重要结论尽量包含：外在表现、内在需要、关系中的影响。
3. 明确区分“你希望怎样被爱”和“你通常怎样去爱别人”，注意两者可能并不对称。
4. 对矛盾选择进行温柔解释：它们可能发生在不同情境或不同阶段，而不是说用户前后不一。
5. 优势要具体；风险不责备用户；成长建议必须能执行，不能只写“多沟通”。
6. 不使用 MBTI、星座、依恋障碍、人格障碍等未经问卷支持的标签，不做心理诊断。
7. 不复述题目故事，不堆砌形容词，不在不同字段重复同一句结论。
8. 只输出合法 json 对象，字段必须与下面完全一致。

内容要求：
- name：7～14 个汉字，温暖、有画面感，但不能玄学。
- opening：120～200 字，像写给用户的一封开场短笺，先让用户感到被理解。
- core：50～90 字，一句话讲清最核心的关系动力。
- heartTrigger：100～180 字，分析什么会让用户心动，以及背后的原因。
- logic、beLoved、youLove：各 140～240 字，分别分析爱情底层逻辑、希望被爱的方式、主动爱人的方式。
- security：120～200 字，分析安全感来自哪里、什么会让连接感动摇。
- closeness、autonomy：各 100～180 字，分别解释靠近需求与个人边界，两者不能被写成简单对立。
- conflictFirst、conflictRepair、conflictDiff：各 90～160 字，覆盖冲突当下、真正想要的修复、两者之间的差异。
- commitment：120～200 字，分析承诺节奏、自由与共同成长。
- hidden、landmine：各 120～200 字，写出不容易说出口的需求与关系雷区。
- dual：title 不超过 18 字；body 120～200 字，解释一个看似矛盾但真实共存的特点。
- strengths、risks、partner、growthAdvice：每组 3～4 条；每条必须具体，约 35～80 字。
- manual：50～100 字，用第一人称写给未来伴侣，能够直接说出口。
- closing：100～180 字，以温暖但不煽情的方式收束，给用户一种“我可以更懂自己”的力量。

JSON 输出结构：
{
  "name": "有边界的暖灯守望者",
  "opening": "写给用户的开场短笺",
  "core": "一句话人格核心",
  "heartTrigger": "心动触发与原因",
  "logic": "爱情底层逻辑",
  "beLoved": "希望怎样被爱",
  "youLove": "会怎样爱一个人",
  "security": "安全感来源",
  "closeness": "亲密接近需求",
  "autonomy": "自主边界需求",
  "conflictFirst": "冲突中的第一反应",
  "conflictRepair": "真正想要的修复",
  "conflictDiff": "即时反应与长期需求的差异",
  "commitment": "承诺、自由与未来",
  "hidden": "隐藏需求",
  "landmine": "关系雷区",
  "dual": { "title": "看似矛盾的特征", "body": "具体解释" },
  "strengths": ["优势一", "优势二", "优势三"],
  "risks": ["风险一", "风险二", "风险三"],
  "partner": ["伴侣特质一", "伴侣特质二", "伴侣特质三"],
  "growthAdvice": ["可执行建议一", "可执行建议二", "可执行建议三"],
  "manual": "给未来伴侣的一句话使用说明",
  "closing": "写给用户的结尾"
}

规则库证据：
${JSON.stringify(skillContext)}`;
}
