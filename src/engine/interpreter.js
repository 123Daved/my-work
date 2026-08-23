const pick = (answers, n) => answers[`Q${n}`];

const WEIGHT = { A: 100, B: 55, C: 15 };
const INV = { A: 15, B: 55, C: 100 };

function avg(values) {
  const nums = values.filter((v) => Number.isFinite(v));
  if (!nums.length) return 60;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function clampDisplay(n) {
  return Math.max(58, Math.min(96, Math.round(n)));
}

function conf(evidenceCount, conflicted = false) {
  if (conflicted || evidenceCount <= 1) return "exploratory";
  if (evidenceCount === 2) return "medium";
  return "high";
}

function confPhrase(level) {
  if (level === "high") return "这一点在你的选择里反复出现。";
  if (level === "medium") return "你比较明显地表现出";
  return "你似乎有一些这样的倾向，但它可能比较依赖具体情境。";
}

const PRIMARY = {
  Q1: {
    A: { name: "细节回应型", need: "被记住、被理解、被认真关注" },
    B: { name: "行动投入型", need: "行动、成本、实际付出" },
    C: { name: "安静陪伴型", need: "共处、存在、不侵入式陪伴" },
  },
  Q2: {
    A: { name: "高接近偏好", need: "高共享、高连接、高互动" },
    B: { name: "连接独立型", need: "保持连接，同时保留个人空间" },
    C: { name: "自主亲密型", need: "明显的个人节奏与边界" },
  },
  Q3: {
    A: { name: "持续回应型", need: "通过持续交流维持连接感" },
    B: { name: "信任承诺型", need: "关键承诺可靠即可接受暂时失联" },
    C: { name: "稳定可预期型", need: "规则、约定和稳定反馈" },
  },
  Q4: {
    A: { name: "被重视 / 情绪确认", need: "关系受威胁时需要明显的情绪回应" },
    B: { name: "确定感", need: "压力来自信息缺失，想知道发生了什么" },
    C: { name: "行为稳定", need: "希望类似情况不再反复发生" },
  },
  Q5: {
    A: { name: "行动照顾型", need: "直接提供资源或解决问题" },
    B: { name: "陪伴照顾型", need: "提供时间、耐心和情绪容纳" },
    C: { name: "共建解决型", need: "把问题变成两个人共同解决的事" },
  },
  Q6: {
    A: { name: "体验导向", need: "用资源换当下体验和共同记忆" },
    B: { name: "平衡规划", need: "兼顾当下需要和未来储备" },
    C: { name: "安全储备", need: "风险控制、选择权与未来确定性" },
  },
  Q7: {
    A: { name: "关系弹性型", need: "愿意为伴侣临时调整原则" },
    B: { name: "协商型", need: "创造双方都可以接受的新方案" },
    C: { name: "原则一致型", need: "进入关系后仍维持关键资源原则" },
  },
  Q8: {
    A: { name: "直接表达", need: "不公平时倾向明确指出问题" },
    B: { name: "暂停降温", need: "情绪升高后倾向暂停互动" },
    C: { name: "防御撤退", need: "感到被攻击时用距离保护自己" },
  },
  Q9: {
    A: { name: "快速闭环", need: "不喜欢问题悬着，希望尽快解决" },
    B: { name: "暂停—回归型", need: "允许冷静，但要求之后重新沟通" },
    C: { name: "低冲突暴露", need: "并非所有问题都必须充分讨论" },
  },
  Q10: {
    A: { name: "控制敏感", need: "最不能接受自主空间被压缩" },
    B: { name: "模糊沟通敏感", need: "最不能接受长期不表达真实想法" },
    C: { name: "失约敏感", need: "最不能接受承诺与行为长期不一致" },
  },
  Q11: {
    A: { name: "被主动察觉", need: "希望对方主动发现自己的异常" },
    B: { name: "节奏被尊重", need: "希望被陪伴，同时自己决定何时表达" },
    C: { name: "行动安抚", need: "有时更希望通过行动重新连接" },
  },
  Q12: {
    A: { name: "高确定性承诺", need: "较愿意较快建立明确关系连接" },
    B: { name: "自主承诺", need: "希望明确承诺，同时保留独立空间" },
    C: { name: "渐进承诺", need: "需要时间和现实相处再建立长期承诺" },
  },
  Q13: {
    A: { name: "成长支持", need: "不希望伴侣因关系放弃重要发展" },
    B: { name: "共同经营", need: "同时维护个人发展与关系本身" },
    C: { name: "现实边界", need: "冲突时会认真计算自己的真实承受力" },
  },
  Q14: {
    A: { name: "回应型伴侣", need: "稳定、坦诚、回应、可沟通" },
    B: { name: "信任型伴侣", need: "自由、边界、信任、可靠" },
    C: { name: "伙伴型伴侣", need: "共建、行动、解决问题、成长" },
  },
};

function extractPrimary(answers) {
  const out = {};
  for (let i = 1; i <= 14; i += 1) {
    const key = `Q${i}`;
    const choice = pick(answers, i);
    out[key] = { choice, ...PRIMARY[key][choice] };
  }
  return out;
}

function computeMeta(answers) {
  const q = (n) => pick(answers, n);
  const w = (n, map = WEIGHT) => map[q(n)];

  const responsiveness = avg([
    q(1) === "A" ? 92 : q(1) === "B" ? 62 : 48,
    q(3) === "A" ? 94 : q(3) === "C" ? 70 : 42,
    q(4) === "A" ? 90 : q(4) === "B" ? 68 : 50,
    q(11) === "A" ? 88 : q(11) === "C" ? 60 : 46,
    q(14) === "A" ? 90 : q(14) === "B" ? 58 : 64,
  ]);

  const closeness = avg([
    w(2),
    q(3) === "A" ? 88 : q(3) === "B" ? 52 : 64,
    q(12) === "A" ? 90 : q(12) === "B" ? 62 : 48,
  ]);

  const autonomy = avg([
    INV[q(2)],
    q(10) === "A" ? 94 : q(10) === "B" ? 60 : 48,
    q(12) === "A" ? 28 : q(12) === "B" ? 86 : 78,
    q(13) === "A" ? 82 : q(13) === "B" ? 64 : 72,
    q(14) === "B" ? 90 : q(14) === "C" ? 58 : 50,
  ]);

  const predictability = avg([
    q(3) === "C" ? 94 : q(3) === "B" ? 78 : 46,
    q(4) === "C" ? 92 : q(4) === "B" ? 80 : 52,
    q(6) === "C" ? 90 : q(6) === "B" ? 70 : 38,
    q(7) === "C" ? 86 : q(7) === "B" ? 68 : 44,
    q(10) === "C" ? 92 : q(10) === "B" ? 74 : 48,
  ]);

  const repair = avg([
    q(8) === "A" ? 78 : q(8) === "B" ? 70 : 42,
    q(9) === "A" ? 92 : q(9) === "B" ? 88 : 40,
    q(9) === "A" ? 92 : q(9) === "B" ? 88 : 40,
  ]);

  const partnership = avg([
    q(5) === "C" ? 92 : q(5) === "A" ? 74 : 56,
    q(7) === "B" ? 90 : q(7) === "A" ? 70 : 48,
    q(9) === "A" || q(9) === "B" ? 82 : 44,
    q(13) === "B" ? 94 : q(13) === "A" ? 70 : 58,
    q(14) === "C" ? 94 : 58,
  ]);

  return {
    responsiveness,
    closeness,
    autonomy,
    predictability,
    repair,
    partnership,
  };
}

function levelOf(score) {
  if (score >= 78) return "较高";
  if (score >= 58) return "中等";
  return "较克制";
}

function pairNotes(answers) {
  const q = (n) => pick(answers, n);
  const notes = {};

  if (q(4) === "A" && q(11) === "B") {
    notes.q4q11 =
      "日常难过时你希望拥有自己的节奏，但一旦关系连接突然中断，会明显需要确认自己仍然被在乎。";
  } else if (q(4) === "A" && q(11) === "A") {
    notes.q4q11 = "无论是关系受威胁，还是自己悄悄难过，你都更希望被主动看见，而不是自己把需求说得很清楚。";
  } else if (q(4) === "B" && q(11) === "C") {
    notes.q4q11 = "你要先知道发生了什么；等情绪落地后，又更希望用一件具体的小事把连接接回来。";
  } else if (q(4) === "C" && q(11) === "B") {
    notes.q4q11 = "你表面上要空间和节奏，真正在意的是：同样的断裂不要反复发生。";
  } else {
    notes.q4q11 = `关系受威胁时你更需要「${PRIMARY.Q4[q(4)].need}」；自己难过时，则更希望「${PRIMARY.Q11[q(11)].need}」。两层需求可以同时成立。`;
  }

  if (q(6) === "C" && q(7) === "A") {
    notes.q6q7 = "平时谨慎，但面对重要关系时，原则会明显变软。";
  } else if (q(6) === "C" && q(7) === "B") {
    notes.q6q7 = "你有清楚的安全底线，同时愿意通过协商满足伴侣需求。";
  } else if (q(6) === "C" && q(7) === "C") {
    notes.q6q7 = "安全储备属于相对稳定的底层原则，进入关系后也不轻易改写。";
  } else if (q(6) === "A" && q(7) === "C") {
    notes.q6q7 = "你愿意为共同体验花钱，可一旦原则被挑战，又会把底线重新握紧。";
  } else if (q(7) === "B") {
    notes.q6q7 = "钱对你不是冷冰冰的数字，更像一份可以一起商量的共同资源。";
  } else {
    notes.q6q7 = `你自己偏向「${PRIMARY.Q6[q(6)].name}」，面对伴侣时则是「${PRIMARY.Q7[q(7)].name}」。`;
  }

  const combo89 = `${q(8)}${q(9)}`;
  const map89 = {
    AA: "高显性沟通、高闭环需求。",
    AB: "你能够表达边界，同时接受结构化修复。",
    AC: "你当下能把话说出来，事后却不一定想把每道裂缝都打开。",
    BA: "你会先降温，但心里仍希望问题尽快被收束。",
    BB: "较典型的冷静后修复模式：先离开火场，再回来把关系接上。",
    BC: "你可能具有一定的冲突回避倾向——先停，也不一定每次都说透。",
    CA: "冲突当下你容易撤退，事后却希望尽快把话说完。两拍并不一样。",
    CB: "即时防御较强，但长期修复意愿仍明显。你会离开，也会回来。",
    CC: "冲突压力下撤退与低暴露倾向都较明显。长期问题可能慢慢堆积，需要温柔地被看见。",
  };
  notes.q8q9 = map89[combo89];

  if (q(2) === "C" && q(12) === "B") {
    notes.q2q12 = "你并不抗拒长期关系，而是不希望承诺意味着失去个人空间。";
  } else if (q(12) === "B" && (q(13) === "A" || q(13) === "B")) {
    notes.q12q13 = "你要的承诺里，本来就装着对方的成长空间。";
  } else if (q(12) === "A" && q(13) === "C") {
    notes.q12q13 = "你愿意较快确定关系，可当爱情和人生选择冲突时，仍会认真计算自己能不能承受。";
  } else if (q(12) === "C" && q(13) === "B") {
    notes.q12q13 = "承诺对你是慢慢长出来的；一旦走进去，你又希望一起经营，而不是各走各的。";
  } else {
    notes.q12q13 = `承诺节奏上你偏向「${PRIMARY.Q12[q(12)].name}」；面对成长分岔时，你更接近「${PRIMARY.Q13[q(13)].name}」。`;
  }

  return notes;
}

function findDual(answers) {
  const q = (n) => pick(answers, n);

  if (q(1) === "C" && q(5) === "A") {
    return {
      title: "行动去爱，却希望被安静地爱",
      body: "你身上有一个很有意思的双重特征：自己表达爱时习惯解决问题、把资源递过去；被爱时，反而更容易被安静陪伴打动。看起来矛盾，其实分别对应两套需求——你给人的是行动，想收到的是存在。",
    };
  }
  if (q(1) === "A" && q(5) === "A") {
    return {
      title: "既要被理解，也会把爱做成行动",
      body: "你身上有一个很有意思的双重特征：你希望被记住、被认真对待，同时自己也习惯用实际行动去爱别人。接收爱和表达爱，走的不是同一条路，但都指向认真。",
    };
  }
  if (q(8) === "C" && q(9) === "B") {
    return {
      title: "会先离开，也会回来",
      body: "你身上有一个很有意思的双重特征：冲突当下容易退出现场保护自己，可冷静下来后仍希望关系被修复。第一反应是防御，真正想要的是回来。",
    };
  }
  if (q(8) === "C" && q(9) === "A") {
    return {
      title: "先保护自己，再把话说完",
      body: "看起来你既想逃，又想尽快闭环。实际上它们对应两个时刻：被攻击的瞬间需要距离，情绪落地后却受不了事情一直悬着。",
    };
  }
  if (q(2) === "C" && (q(12) === "A" || q(12) === "B")) {
    return {
      title: "要靠近，也要自己的岸",
      body: "你并不抗拒承诺。你抗拒的是：承诺变成失去节奏。亲密和自主在你这里不是反向的单轴，它们可以同时很高。",
    };
  }
  if (q(6) === "C" && (q(7) === "A" || q(7) === "B")) {
    return {
      title: "自己很谨慎，为爱会松一点",
      body: "你自己的资源管理偏谨慎，可亲密关系会提高原则弹性。安全储备仍在，只是面对这个人时，你会愿意重新谈。",
    };
  }
  if (q(4) === "A" && q(11) === "B") {
    return {
      title: "要空间，也要被确认没有离开",
      body: "日常你希望别人尊重你的节奏；可一旦连接突然中断，你又需要明确感到自己仍被在乎。空间和确认，对你缺一不可。",
    };
  }
  if (q(10) === "A" && q(3) === "A") {
    return {
      title: "既要回应，又最怕被管",
      body: "你需要被回应，来确认关系还在；同时又最不能接受被检查、被管理。你要的是看见，不是控制。",
    };
  }
  if (q(13) === "A" && q(12) === "A") {
    return {
      title: "确定得很快，却不愿对方停下成长",
      body: "你愿意把关系说清楚，却不希望这份清楚变成捆绑。承诺在你这里，应该给彼此更多路，而不是更少。",
    };
  }

  return {
    title: "选择整体非常一致",
    body: "你的选择整体非常一致。最稳定的人格特征是：你用可被理解的方式靠近一个人，也用同样清楚的方式保护自己。这种一致本身，就是关系里的可信度。",
  };
}

function generateName(answers, meta) {
  const q = (n) => pick(answers, n);

  if (q(8) === "C" && q(9) === "B") return "会回来的风暴修复师";
  if (q(1) === "C" && q(5) === "C" && meta.autonomy >= 70) return "安静可靠的星光同行者";
  if (q(6) === "C" && q(12) === "C") return "谨慎而温柔的长线旅人";
  if (q(14) === "C" && q(5) === "C") return "把爱落到行动里的共生旅伴";
  if (q(1) === "A" && q(3) === "A") return "高回应的萤火旅伴";
  if (q(10) === "A" && (q(12) === "B" || q(2) === "C")) return "有边界的暖灯守望者";
  if (q(14) === "B" && meta.autonomy >= 72) return "自由而坚定的风铃守望者";
  if (q(12) === "C" && q(13) === "B") return "慢热的星港共建者";

  const mods = [];
  if (q(10) === "A" || q(2) === "C") mods.push("有边界的");
  else if (q(6) === "C" || q(3) === "C") mods.push("谨慎而温柔的");
  else if (q(1) === "A" || q(3) === "A") mods.push("高回应的");
  else if (q(1) === "C") mods.push("安静可靠的");
  else if (q(12) === "C") mods.push("慢热的");
  else mods.push("温柔坚定的");

  let img = "星光";
  if (q(14) === "A") img = "暖灯";
  else if (q(14) === "B") img = "风铃";
  else if (q(14) === "C") img = "共生";
  else if (q(3) === "C") img = "星港";
  else if (q(3) === "A") img = "萤火";

  let role = "旅伴";
  if (q(5) === "C" || q(13) === "B") role = "共建者";
  else if (q(5) === "B" || q(11) === "B") role = "守望者";
  else if (q(12) === "C") role = "长线旅人";
  else if (q(8) === "C" && q(9) !== "C") role = "风暴修复师";

  return `${mods[0]}${img}${role}`;
}

function coreLine(answers, meta) {
  const q = (n) => pick(answers, n);
  if (q(2) !== "A" && (q(12) === "B" || q(10) === "A")) {
    return "你需要的不是时时刻刻黏在一起，而是即使各自走远，也能确认彼此始终在同一段关系里。";
  }
  if (q(8) === "C" && q(9) === "B") {
    return "你冲突时会先把自己护住，可真正想要的，是冷静之后还有人把你找回来。";
  }
  if (q(3) === "C" || q(4) === "C" || q(10) === "C") {
    return "你把爱理解成可预期的回来：说了就会做，离开了也会按约定出现。";
  }
  if (q(1) === "A" && q(3) === "A") {
    return "你需要被认真对待的感觉——不是被管理，而是被看见、被记住、被及时接住。";
  }
  if (q(14) === "C" || q(5) === "C") {
    return "你要的爱情不只是喜欢彼此，而是两个人能一起把生活里的问题扛过去。";
  }
  if (meta.closeness >= 75) {
    return "靠近对你不是负担，而是确认：这段关系此刻真实存在着。";
  }
  return "你用自己的节奏靠近一个人，也用同样清楚的边界，保护这份靠近可以长久。";
}

function loveLogic(answers) {
  const q = (n) => pick(answers, n);
  const bits = [];

  if (q(1) === "A") bits.push("爱首先是被记住——对方把你的细节放在心上");
  if (q(1) === "B") bits.push("爱首先是愿意花力气，而不是只把话说得漂亮");
  if (q(1) === "C") bits.push("爱首先是人在，而不必一直表演亲密");

  if (q(3) === "A") bits.push("连接需要持续被回应，沉默太久会让你失去坐标");
  if (q(3) === "B") bits.push("关键约定可靠，你就能把暂时的空白交给信任");
  if (q(3) === "C") bits.push("稳定的节奏和可预期的反馈，比高频情绪更让你安心");

  if (q(5) === "A") bits.push("你自己给出爱时，习惯把困难直接接下来");
  if (q(5) === "B") bits.push("你给出爱时，先把时间和情绪空间递过去");
  if (q(5) === "C") bits.push("你给出爱时，希望两个人站在同一侧看问题");

  if (q(14) === "A") bits.push("理想中的关系不让人猜测");
  if (q(14) === "B") bits.push("理想中的关系允许各自走路，却不失去彼此");
  if (q(14) === "C") bits.push("理想中的关系能一起把生活过下去");

  const text = bits.slice(0, 3).join("；") + "。";
  return text.length > 180 ? `${text.slice(0, 177)}…` : text;
}

function howToBeLoved(answers) {
  const q = (n) => pick(answers, n);
  const hit =
    q(1) === "A"
      ? "记住你随口说过的话、在小事上认真回应，最容易打动你。"
      : q(1) === "B"
        ? "愿意为你跑一趟、把事做成，比反复表白更打动你。"
        : "不侵入地待在你身边，一起看完一段沉默，最容易让你感到被爱。";

  const anxious =
    q(3) === "A"
      ? "焦虑时，你需要对方还在、还回应，而不是“你自己冷静一下”。"
      : q(3) === "B"
        ? "焦虑时，一句可靠的约定比连续追问更有效：告诉你什么时候会回来。"
        : "焦虑时，你需要可预期的节奏——什么时候联系、如何确认，比临时的热情更重要。";

  const hidden =
    q(11) === "A"
      ? "你未必会主动把难过说出口，却希望对方有足够敏锐，能先来问你。"
      : q(11) === "B"
        ? "你可能不会把需求说得很满：你要陪伴，也要自己决定何时开口。"
        : "你有时不会选择深谈，而是希望对方用一件具体的小事，把你们重新接上。";

  const threat =
    q(4) === "A"
      ? "关系像要断开时，你要的是情绪确认：你仍然被在乎。"
      : q(4) === "B"
        ? "关系像要断开时，你要的是确定感：到底发生了什么。"
        : "关系像要断开时，你要的不是一次解释，而是“别再这样反复”。";

  return `${hit}${anxious}${hidden}${threat}`;
}

function howYouLove(answers) {
  const q = (n) => pick(answers, n);
  const give =
    q(5) === "A"
      ? "你通常用行动付出：先把资源递过去，先把问题解决掉。"
      : q(5) === "B"
        ? "你通常用陪伴付出：先坐下来，让对方的情绪有地方放。"
        : "你通常把爱理解成共事：问题不是谁的，是我们的。";

  const money =
    q(7) === "A"
      ? "面对原则冲突，你可能为了这个人临时松动自己的底线。"
      : q(7) === "B"
        ? "面对原则冲突，你更想谈出一个双方都能接受的新方案。"
        : "面对原则冲突，你仍希望关键原则被守住，而不是用爱把规则抹掉。";

  const conflict =
    q(8) === "A"
      ? "被误解时你倾向把不公平说清楚。"
      : q(8) === "B"
        ? "被误解时你可能先停火，不让话在火上继续烧。"
        : "被误解时你可能先拉开距离，保护自己不再被继续伤到。";

  const growth =
    q(13) === "A"
      ? "你支持伴侣走向自己的路，不太希望对方为关系停下来。"
      : q(13) === "B"
        ? "你希望对方去成长，也希望你们一起设计这段关系如何跟上。"
        : "当关系与重大选择冲突，你会认真问自己：我能不能承受这样的距离和等待。";

  return `${give}${money}${conflict}${growth}`;
}

function distanceText(answers, meta) {
  const q = (n) => pick(answers, n);
  const close =
    q(2) === "A"
      ? "日常里你喜欢更高的共享和互动，靠近会让你感到关系是活的。"
      : q(2) === "B"
        ? "你希望保持连接，同时前后相随——看见彼此，不必一直并排。"
        : "你需要自己的步调。亲密不等于时时同步，对岸挥手也可以是爱。";

  const auto =
    q(10) === "A" || q(12) === "B" || q(2) === "C"
      ? "即使进入关系，你也需要维持选择权和节奏。被检查、被安排，会比偶尔的冷清更伤你。"
      : q(12) === "A"
        ? "你并不把承诺理解成失去自己，但你确实更愿意把两个人的航线尽快并在一起。"
        : "你会用时间确认承诺。空间对你不是拒绝，而是让关系长得更真实。";

  return {
    closeness: `${close}你的亲密接近需求${levelOf(meta.closeness)}。`,
    autonomy: `${auto}你的自主边界需求${levelOf(meta.autonomy)}。这两件事并不互为反面。`,
  };
}

function conflictText(answers) {
  const q = (n) => pick(answers, n);
  const first =
    q(8) === "A"
      ? "第一反应是把不公平说出来，让问题站到台面上。"
      : q(8) === "B"
        ? "第一反应是暂停降温。你不是立刻消失，而是先不让火烧得更大。"
        : "第一反应是防御撤退。距离在这一刻是保护，不是判决。";

  const repair =
    q(9) === "A"
      ? "真正想要的修复方式，是尽快把话说完，不让裂缝过夜。"
      : q(9) === "B"
        ? "真正想要的修复方式，是允许冷静，但必须回来。离开如果没有回归，你会空着。"
        : "真正想要的修复，不一定是充分讨论。有些问题，你希望它过去，而不是被反复打开。";

  const diff =
    q(8) !== "A" && q(9) === "A"
      ? "这两拍并不一样：当下你需要缓冲，事后你需要闭环。"
      : q(8) === "C" && q(9) === "B"
        ? "请把这两拍分开看：撤离是即时反应，回来才是你对关系的真实态度。"
        : q(8) === "A" && q(9) === "C"
          ? "你能在当下表达，却不一定想把每次冲突都做成深度复盘。"
          : "你的即时反应和修复意愿，方向大体一致。";

  return { first, repair, diff };
}

function hiddenNeed(answers) {
  const q = (n) => pick(answers, n);
  if (q(11) === "B" && q(3) !== "A") {
    return "你表面上希望别人给你空间，但真正让你安心的是——你拥有空间的时候，对方仍然没有离开。";
  }
  if (q(4) === "A") {
    return "你未必会把“请担心我一下”说出口，可关系一晃，你最想确认的其实是：我在你心里，仍然重要。";
  }
  if (q(4) === "C" || q(3) === "C") {
    return "你真正要的不是更多解释，而是一种可以依靠的重复：你说会回来，就真的会回来。";
  }
  if (q(11) === "A") {
    return "你可能很少主动把脆弱摊开。你在等一个人，足够安静，也足够敏锐，能在你说之前先走到你身边。";
  }
  return "你未必会把需求说得很完整。你在等关系自己证明：我被看见了，也不被吞没。";
}

function landmine(answers) {
  const q = (n) => pick(answers, n);
  if (q(10) === "A") {
    return "最容易损伤你信任的，不是偶尔的分开，而是自主空间被压缩——被反复查问、被管理、被当成需要看管的人。那会让亲密变成窒息，你开始怀疑自己在这段关系里还能不能做自己。";
  }
  if (q(10) === "B") {
    return "最容易损伤你信任的，是长期的模糊：永远“都可以”，却从不说出真实想法。你失去判断关系的依据，只能一个人猜，而猜会把人耗干。";
  }
  return "最容易损伤你信任的，是承诺与行为长期不一致。你不是不能等待，你不能忍受“说了却不当真”。每一次失约，都在告诉你关系无法被预期。";
}

function strengths(answers, meta) {
  const q = (n) => pick(answers, n);
  const list = [];
  if (q(7) === "B" || q(13) === "B" || q(5) === "C") {
    list.push("愿意把差异变成可以一起商量的现实问题，而不是谁对谁错。");
  }
  if (q(9) === "B" || (q(8) !== "C" && q(9) === "A")) {
    list.push("具有明显的修复意识：冲突可以发生，关系仍值得被重新拿起来。");
  }
  if (meta.autonomy >= 68 && (q(13) === "A" || q(12) === "B")) {
    list.push("能尊重伴侣的独立成长，不把爱理解成互相停住。");
  }
  if (meta.predictability >= 70) {
    list.push("很会建立稳定预期，让关系有节奏可依。");
  }
  if (q(5) === "B") {
    list.push("在对方困难时，你给得出时间和情绪空间。");
  }
  if (q(1) === "A") {
    list.push("对细节敏感，意味着你一旦爱一个人，也会把对方放得很认真。");
  }
  return list.slice(0, 3);
}

function risks(answers) {
  const q = (n) => pick(answers, n);
  const list = [];
  if (q(8) === "C" && q(9) === "C") {
    list.push("当冲突一再出现而双方都不打开时，你可能用距离把问题熬过去，裂缝会在看不见的地方变深。");
  } else if (q(8) === "C") {
    list.push("当被指责或感到攻击时，你可能先退场。如果没有约定“会回来”，对方会把保护读成放弃。");
  }
  if (q(10) === "A" && q(3) === "A") {
    list.push("当你既需要频繁回应、又最怕被管时，关系可能进入“再近一点 / 别控制我”的拉扯。");
  }
  if (q(6) === "C" && q(7) === "C") {
    list.push("当伴侣强烈需要共同体验时，你对安全储备的坚持可能被读成不够爱，需要把原则翻译成关心。");
  }
  if (q(11) === "B" || q(11) === "C") {
    list.push("当你难过却不说时，对方未必能准确读到。未被说出的需求，有时会变成委屈。");
  }
  if (q(9) === "C") {
    list.push("当问题被反复跳过，你可能以为过去了，关系却在积累未完成的句子。");
  }
  if (!list.length) {
    list.push("当对方的节奏和你不一致时，你可能用自己习惯的方式去爱，而未必先问对方真正要什么。");
  }
  return list.slice(0, 3);
}

function partnerProfile(answers) {
  const q = (n) => pick(answers, n);
  const traits = [];
  if (q(14) === "A" || q(3) === "A" || q(1) === "A") {
    traits.push("能够稳定回应，不让你靠猜测维持关系");
  }
  if (q(10) === "A" || q(2) === "C" || q(12) === "B" || q(14) === "B") {
    traits.push("尊重边界，把空间理解成信任而不是冷淡");
  }
  if (q(10) === "B" || q(14) === "A" || q(8) === "A") {
    traits.push("愿意表达真实想法，而不是用“都可以”把分歧藏起来");
  }
  if (q(5) === "A" || q(14) === "C" || q(1) === "B") {
    traits.push("有行动力，能把在乎做成可以看见的事");
  }
  if (q(7) === "B" || q(13) === "B" || q(5) === "C") {
    traits.push("愿意协商现实问题，而不是用情绪或沉默结束讨论");
  }
  if (q(9) === "A" || q(9) === "B") {
    traits.push("冲突后愿意回来修复，而不是让裂缝自己风化");
  }
  return traits.slice(0, 5);
}

function partnerManual(answers) {
  const q = (n) => pick(answers, n);
  if (q(8) === "C" && q(9) === "B") {
    return "如果我说想一个人待会儿，不代表我不爱你；给我一点时间，然后再来找我。";
  }
  if (q(10) === "A" || q(12) === "B") {
    return "我不需要你时时刻刻陪着我，但如果你答应会回来，请真的回来。";
  }
  if (q(3) === "A" || q(14) === "A") {
    return "你可以有自己的事，只是别让我一直猜你还在不在。回我一声，我就安了。";
  }
  if (q(4) === "C" || q(10) === "C") {
    return "你不必每次都解释得很动听，只要你说出口的事，后来真的会做到。";
  }
  if (q(11) === "A") {
    return "我难过的时候不一定会说。如果你察觉到我安静了，过来问一句，就很好。";
  }
  if (q(14) === "C" || q(5) === "C") {
    return "喜欢我很好，可我更想和你一起把眼前的事解决掉。站到我这一侧来。";
  }
  return "靠近我的时候请认真，给我空间的时候请稳定。这样我就知道，我是被爱着的。";
}

function evidenceCards(answers, meta) {
  const q = (n) => pick(answers, n);
  const cards = [];

  if (meta.autonomy >= 68) {
    cards.push({
      title: "自主边界需求明显",
      from: [q(2) === "C" ? "Q2C" : q(2) === "B" ? "Q2B" : null, q(10) === "A" ? "Q10A" : null, q(12) === "B" ? "Q12B" : q(12) === "C" ? "Q12C" : null]
        .filter(Boolean)
        .join("、"),
      body: "你并不抗拒承诺，但希望承诺能够容纳独立空间。被管理比被冷落更伤你。",
    });
  }
  if (meta.predictability >= 70) {
    cards.push({
      title: "稳定可预期需求较高",
      from: [q(3) === "C" ? "Q3C" : q(3) === "B" ? "Q3B" : null, q(4) === "C" ? "Q4C" : q(4) === "B" ? "Q4B" : null, q(10) === "C" ? "Q10C" : null, q(6) === "C" ? "Q6C" : null]
        .filter(Boolean)
        .join("、"),
      body: "这些选择共同说明，你比高频情绪表达更看重关系行为的一致性。",
    });
  }
  if (meta.responsiveness >= 72) {
    cards.push({
      title: "关系回应需求较高",
      from: [q(1) === "A" ? "Q1A" : null, q(3) === "A" ? "Q3A" : null, q(4) === "A" ? "Q4A" : null, q(14) === "A" ? "Q14A" : null]
        .filter(Boolean)
        .join("、"),
      body: "你需要明确感到“你理解我、在乎我、回应我”，不确定会比冲突更消耗你。",
    });
  }
  if (q(8) === "C" && (q(9) === "A" || q(9) === "B")) {
    cards.push({
      title: "即时防御与长期修复并存",
      from: `Q8${q(8)}、Q9${q(9)}`,
      body: "冲突当下你可能撤离以保护自己，情绪稳定后仍具有明显的关系修复需求。",
    });
  } else if (meta.repair >= 72) {
    cards.push({
      title: "冲突修复倾向明显",
      from: `Q8${q(8)}、Q9${q(9)}`,
      body: "你允许关系出现裂缝，也更愿意重新进入沟通，把关系接回去。",
    });
  }
  if (meta.partnership >= 72) {
    cards.push({
      title: "共建成长倾向明显",
      from: [q(5) === "C" ? "Q5C" : q(5) === "A" ? "Q5A" : null, q(7) === "B" ? "Q7B" : null, q(13) === "B" ? "Q13B" : null, q(14) === "C" ? "Q14C" : null]
        .filter(Boolean)
        .join("、"),
      body: "你比较倾向把爱情理解成两个人共同解决现实问题，而不只是情绪上的互相喜欢。",
    });
  }
  if (q(1) !== q(5) && q(1) && q(5)) {
    cards.push({
      title: "接收爱与表达爱并不对称",
      from: `Q1${q(1)}、Q5${q(5)}`,
      body: "你希望被爱的方式，和你习惯去爱的方式，不是同一套动作。这一点值得让伴侣知道。",
    });
  }

  return cards.filter((c) => c.from).slice(0, 5);
}

function partnerBars(answers, meta) {
  const q = (n) => pick(answers, n);
  return [
    {
      label: "情绪稳定",
      value: clampDisplay((meta.predictability + (q(9) === "B" ? 80 : 65)) / 2),
    },
    {
      label: "真诚沟通",
      value: clampDisplay(q(14) === "A" || q(10) === "B" ? 90 : q(8) === "A" ? 86 : 78),
    },
    {
      label: "给予空间",
      value: clampDisplay(meta.autonomy),
    },
    {
      label: "细腻体贴",
      value: clampDisplay(q(1) === "A" || q(11) === "A" ? 88 : q(5) === "B" ? 84 : 76),
    },
    {
      label: "共同成长",
      value: clampDisplay(meta.partnership),
    },
  ];
}

function radar(answers, meta) {
  const q = (n) => pick(answers, n);
  return [
    { label: "安全感需求", value: clampDisplay((meta.predictability + meta.responsiveness) / 2) },
    {
      label: "表达方式",
      value: clampDisplay(q(5) === "A" ? 82 : q(5) === "C" ? 86 : q(8) === "A" ? 80 : 70),
    },
    { label: "亲密接近", value: clampDisplay(meta.closeness) },
    { label: "冲突修复", value: clampDisplay(meta.repair) },
    {
      label: "心动触发",
      value: clampDisplay(q(1) === "A" ? 90 : q(1) === "B" ? 84 : 78),
    },
  ];
}

function warmOpening(name, core) {
  return `先谢谢你认真走完这段旅程。你的答案拼出的并不是一个简单标签，而是一种有层次的靠近方式。你像一位「${name}」：${core} 这份画像不是要规定你应该怎样爱，而是帮你看见，那些曾经难以说清的期待、边界和温柔，其实都有自己的来处。`;
}

function heartTriggerProfile(answers) {
  const q = (n) => pick(answers, n);
  const trigger =
    q(1) === "A"
      ? "你更容易被细节里的认真打动。对方记得一句随口的话，会让你确认自己不是被泛泛地喜欢，而是被具体地看见。"
      : q(1) === "B"
        ? "你更容易为真实投入而心动。对方愿意花时间、力气和成本，会比漂亮的表达更快抵达你心里。"
        : "你更容易被安静而稳定的陪伴打动。不必持续证明什么，只要对方愿意留在身边，你就能感到亲密。";
  const distance =
    q(2) === "A"
      ? "心动之后，你也更愿意用靠近和共享延续这份连接。"
      : q(2) === "B"
        ? "心动之后，你希望彼此看得见，同时保留各自的步调。"
        : "心动并不会让你放弃自己的节奏；能够尊重距离的人，反而更容易让你长久地靠近。";
  return `${trigger}${distance}`;
}

function securityProfile(answers) {
  const q = (n) => pick(answers, n);
  const rhythm =
    q(3) === "A"
      ? "持续的回应会让你确认关系仍在，过久的沉默容易让你失去坐标。"
      : q(3) === "B"
        ? "你不要求时时联系，但关键约定必须可靠；知道对方会在什么时候回来，你就能把空白交给信任。"
        : "可预期的节奏最能安定你。比起一阵热烈，你更相信稳定、重复而一致的回应。";
  const rupture =
    q(4) === "A"
      ? "当连接突然中断，你首先需要确认自己仍然被在乎。"
      : q(4) === "B"
        ? "当连接突然中断，你首先需要知道究竟发生了什么。"
        : "当连接突然中断，你真正关心的是类似的失联不要一再发生。";
  return `${rhythm}${rupture}安全感对你并不是控制对方，而是关系有迹可循。`;
}

function commitmentProfile(answers) {
  const q = (n) => pick(answers, n);
  const pace =
    q(12) === "A"
      ? "当你确认喜欢，你愿意较快给关系一个清楚的位置。"
      : q(12) === "B"
        ? "你并不抗拒明确承诺，但承诺必须能容纳独立空间和个人节奏。"
        : "你更相信从现实相处里慢慢长出的承诺，需要时间确认彼此是否真的适合长久同行。";
  const growth =
    q(13) === "A"
      ? "你希望爱能支持彼此向前，而不是要求任何一方为了关系停下成长。"
      : q(13) === "B"
        ? "你期待把成长和关系一起经营，在个人道路变化时重新设计两个人的相处方式。"
        : "当爱情与重大人生选择相撞，你会认真衡量自己的承受力；这不是不够爱，而是对现实负责。";
  return `${pace}${growth}`;
}

function practicalGrowthAdvice(answers) {
  const q = (n) => pick(answers, n);
  const advice = [];
  if (q(8) === "C" || q(8) === "B") {
    advice.push("需要暂停时，把“我想静一静”补完整为“我会在什么时候回来聊”，让距离成为缓冲，而不是失联。");
  } else {
    advice.push("指出问题时先说清自己的感受和需要，再讨论责任，能让你的坦率更容易被对方接住。");
  }
  if (q(11) !== "A") {
    advice.push("试着在委屈还很小的时候说出一个具体请求，不必等对方猜中，也不必一次解释所有情绪。");
  } else {
    advice.push("希望被主动察觉很真实，同时也可以给对方一个小提示，让理解不必完全依赖猜测。");
  }
  if (q(10) === "A") {
    advice.push("提前告诉伴侣哪些关心会让你温暖、哪些追问会像控制，把边界翻译成对方能够执行的相处方式。");
  } else {
    advice.push("建立固定的关系复盘时刻，把难以当场说清的期待放到安全、可预期的时间里讨论。");
  }
  return advice;
}

function warmClosing(answers) {
  const q = (n) => pick(answers, n);
  const ending =
    q(14) === "A"
      ? "你值得一段不需要反复猜测、能够坦诚回应的关系。"
      : q(14) === "B"
        ? "你值得一段既能安心靠近，也能自由呼吸的关系。"
        : "你值得一段不仅说喜欢，还愿意和你一起面对生活的关系。";
  return `${ending}更了解自己，并不会让爱变得理性而冰冷；恰恰相反，它会帮助你把真正的需要说得更温柔，也更清楚。愿你以后每一次靠近，都不必以弄丢自己为代价。`;
}

function oneLiner(profile) {
  return `${profile.name}：${profile.core}`;
}

const DIMENSION_CONFIG = {
  responsiveness: { label: "关系回应", questions: [1, 3, 4, 11, 14] },
  closeness: { label: "亲密接近", questions: [2, 3, 12] },
  autonomy: { label: "自由与边界", questions: [2, 10, 12, 13, 14] },
  predictability: { label: "稳定与可预期", questions: [3, 4, 6, 7, 10] },
  repair: { label: "冲突修复", questions: [8, 9] },
  partnership: { label: "共建与成长", questions: [5, 7, 9, 13, 14] },
};

const evidenceId = (answers, questionId) => `Q${questionId}-${pick(answers, questionId)}`;
const evidenceFor = (answers, questionIds) => questionIds.map((questionId) => evidenceId(answers, questionId));

function buildDeterministicProfile(answers, primary, meta) {
  const scores = Object.fromEntries(
    Object.keys(DIMENSION_CONFIG).map((dimensionId) => [dimensionId, meta[dimensionId]]),
  );
  const topDimensions = Object.entries(scores)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([id, score]) => ({
      id,
      label: DIMENSION_CONFIG[id].label,
      score,
      evidence: evidenceFor(answers, DIMENSION_CONFIG[id].questions),
    }));

  return {
    scores,
    top_dimensions: topDimensions,
    selected_answers: Object.entries(primary).map(([questionId, meaning]) => ({
      id: questionId,
      choice: meaning.choice,
      label: meaning.name,
      need: meaning.need,
      evidence: `${questionId}-${meaning.choice}`,
    })),
  };
}

function buildLocalInsightProfile(answers, deterministicProfile, modules) {
  const safetyEvidence = evidenceFor(answers, [3, 4, 11]);
  const relationshipEvidence = evidenceFor(answers, [2, 12, 14]);
  const tensionEvidence = evidenceFor(answers, [2, 10, 12, 14]);
  return {
    top_dimensions: deterministicProfile.top_dimensions,
    core_longing: {
      summary: modules.core,
      evidence: evidenceFor(answers, [1, 3, 14]),
    },
    relationship_style: {
      summary: modules.dual.title,
      evidence: relationshipEvidence,
    },
    safety_needs: [
      { summary: modules.security, evidence: safetyEvidence },
      { summary: modules.hidden, evidence: evidenceFor(answers, [4, 11]) },
    ],
    red_lines: [
      { summary: modules.landmine, evidence: evidenceFor(answers, [10]) },
    ],
    tensions: [
      {
        need_a: "靠近时被认真回应",
        need_b: "在关系里保留自己的节奏",
        interpretation: modules.dual.body,
        evidence: tensionEvidence,
      },
    ],
    growth_edge: {
      summary: modules.growthAdvice[0],
      evidence: evidenceFor(answers, [8, 9, 11]),
    },
    confidence: "high",
    uncertainties: [],
  };
}

function buildLocalPoem(answers, modules, insightProfile) {
  const q = (n) => pick(answers, n);
  const quietNeed = q(11) === "A"
    ? "你希望有人先看见你的安静，再轻轻问一句。"
    : q(11) === "B"
      ? "你要陪伴，也想由自己决定什么时候开口。"
      : "有时一件具体的小事，比追问更能把你接回来。";
  const repairLine = q(9) === "A"
    ? "你希望把话说完，不让裂缝一直悬着。"
    : q(9) === "B"
      ? "你允许彼此冷静，但离开之后，要记得回来。"
      : "你不要求每次深谈，只希望问题别在沉默里堆积。";
  const closingLine = q(14) === "A"
    ? "愿你遇见愿意坦诚回应、不让你反复猜测的人。"
    : q(14) === "B"
      ? "愿你既能安心靠近，也能自由呼吸。"
      : "愿你遇见愿意一起解决问题、一起成长的人。";
  const blocks = [
    {
      id: "opening",
      type: "opening",
      lines: [
        { text: "你认真走过了十四个选择。", emphasis: "soft" },
        { text: "那些没有说出口的需要，也终于有了形状。", emphasis: "normal" },
      ],
      hero_phrases: [],
      delay_ms: 0,
    },
    {
      id: "core-longing",
      type: "core_longing",
      lines: [
        { text: "你真正寻找的，", emphasis: "soft" },
        { text: modules.dual.title, emphasis: "hero" },
        { text: modules.core, emphasis: "normal" },
      ],
      hero_phrases: [],
      delay_ms: 700,
    },
    {
      id: "relationship-need",
      type: "relationship_need",
      lines: [
        { text: "你想被看见，却不想被看管。", emphasis: "normal" },
        { text: quietNeed, emphasis: "accent" },
      ],
      hero_phrases: [],
      delay_ms: 1450,
    },
    {
      id: "tension",
      type: "tension",
      lines: [
        { text: insightProfile.tensions[0].need_a, emphasis: "normal" },
        { text: insightProfile.tensions[0].need_b, emphasis: "normal" },
        { text: modules.dual.title, emphasis: "hero" },
      ],
      hero_phrases: [],
      delay_ms: 2200,
    },
    {
      id: "repair",
      type: "growth_edge",
      lines: [
        { text: "当关系遇见风暴，", emphasis: "soft" },
        { text: repairLine, emphasis: "normal" },
        { text: "把需要说得更具体，也把回来的时间说清楚。", emphasis: "accent" },
      ],
      hero_phrases: [],
      delay_ms: 3000,
    },
    {
      id: "closing",
      type: "closing",
      lines: [
        { text: "Lovera 会替你记住：", emphasis: "soft" },
        { text: closingLine, emphasis: "hero" },
        { text: "每一次靠近，都不必以弄丢自己为代价。", emphasis: "normal" },
      ],
      hero_phrases: [],
      delay_ms: 3800,
    },
  ];

  return {
    draft_poem: blocks
      .map((block) => block.lines.map((line) => line.text).join("\n"))
      .join("\n\n"),
    poem_blocks: blocks,
    evidence_used: [...new Set(evidenceFor(answers, Array.from({ length: 14 }, (_, index) => index + 1)))],
  };
}

export function interpret(answers) {
  const primary = extractPrimary(answers);
  const meta = computeMeta(answers);
  const pairs = pairNotes(answers);
  const dual = findDual(answers);
  const name = generateName(answers, meta);
  const core = coreLine(answers, meta);
  const dist = distanceText(answers, meta);
  const conflict = conflictText(answers);
  const q = (n) => pick(answers, n);

  const modules = {
    name,
    opening: warmOpening(name, core),
    core,
    heartTrigger: heartTriggerProfile(answers),
    logic: loveLogic(answers),
    beLoved: howToBeLoved(answers),
    youLove: howYouLove(answers),
    security: securityProfile(answers),
    closeness: dist.closeness,
    autonomy: dist.autonomy,
    conflictFirst: conflict.first,
    conflictRepair: conflict.repair,
    conflictDiff: conflict.diff,
    commitment: commitmentProfile(answers),
    hidden: hiddenNeed(answers),
    landmine: landmine(answers),
    dual,
    strengths: strengths(answers, meta),
    risks: risks(answers),
    partner: partnerProfile(answers),
    growthAdvice: practicalGrowthAdvice(answers),
    manual: partnerManual(answers),
    closing: warmClosing(answers),
    evidence: evidenceCards(answers, meta),
  };

  const confidence = {
    autonomy: conf([q(2) === "C" || q(2) === "B", q(10) === "A", q(12) === "B" || q(12) === "C"].filter(Boolean).length),
    repair: conf([true, true], q(8) === "C" && q(9) === "C"),
    partnership: conf([q(5) === "C", q(7) === "B", q(13) === "B", q(14) === "C"].filter(Boolean).length),
  };
  const deterministicProfile = buildDeterministicProfile(answers, primary, meta);
  const insightProfile = buildLocalInsightProfile(answers, deterministicProfile, modules);
  const localPoem = buildLocalPoem(answers, modules, insightProfile);

  return {
    primary,
    meta: {
      ...meta,
      labels: {
        responsiveness: `关系回应需求${levelOf(meta.responsiveness)}`,
        closeness: `亲密接近需求${levelOf(meta.closeness)}`,
        autonomy: `自主边界需求${levelOf(meta.autonomy)}`,
        predictability: `稳定可预期需求${levelOf(meta.predictability)}`,
        repair: `冲突修复倾向${levelOf(meta.repair)}`,
        partnership: `共建成长倾向${levelOf(meta.partnership)}`,
      },
    },
    pairs,
    modules,
    bars: partnerBars(answers, meta),
    radar: radar(answers, meta),
    shareLine: oneLiner({ name, core }),
    confidence,
    confPhrase,
    deterministic_profile: deterministicProfile,
    insight_profile: insightProfile,
    ...localPoem,
  };
}

export { PRIMARY };
