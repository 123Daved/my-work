import { useCallback, useMemo, useState } from "react";
import { CHAPTERS } from "./data/story.js";
import { interpret } from "./engine/interpreter.js";
import {
  playPrologueNarration,
  playQuestionNarration,
  primeIslandAudio,
} from "./engine/islandAudio.js";
import {
  ChatScreen,
  Generating,
  IslandIntro,
  JourneyMap,
  ManualScreen,
  PartnerTraits,
  PersonalityResult,
  PuzzleScreen,
  QuestionScreen,
  RadarScreen,
  ShareScreen,
  Welcome,
} from "./screens.jsx";

const STORAGE_KEY = "heart-islands-progress";
const PROFILE_VERSION = 2;
const CINEMATIC_QUESTION_IDS = new Set([1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14]);

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function loraReply(text, done) {
  if (!text) return "我在听。你慢慢说就好。";
  if (text.includes("准") || text.includes("难")) {
    return "嘻嘻，这就是了解自己的过程呀～我会帮你记下你每一次的回答，慢慢拼出最真实的你✨";
  }
  if (text.includes("累") || text.includes("难过")) {
    return "那我们歇一歇。岛还在，我也不会走。";
  }
  if (done >= 14) {
    return "拼图已经齐了。要不要看看，它们拼出来的是怎样的你？";
  }
  return "好，我记住了。下一座岛，我们一起走。";
}

const INITIAL_CHAT = [
  { role: "lora", text: "今天玩得怎么样呀？有没有什么有趣的发现？🧡" },
];

export default function App() {
  const saved = loadState();
  const [screen, setScreen] = useState("welcome");
  const [answers, setAnswers] = useState(saved?.answers || {});
  const [unlocked, setUnlocked] = useState(saved?.unlocked || 1);
  const [chapterId, setChapterId] = useState(1);
  const [qid, setQid] = useState(1);
  const [resultTab, setResultTab] = useState(0);
  const [aiProfile, setAiProfile] = useState(
    saved?.profile?.profileVersion === PROFILE_VERSION ? saved.profile : null,
  );
  const [generationStatus, setGenerationStatus] = useState("正在连接 DeepSeek，为你整理关系画像……");
  const [messages, setMessages] = useState(saved?.messages || INITIAL_CHAT);
  const [draft, setDraft] = useState("");
  const [soundOn, setSoundOn] = useState(false);
  const [lastAnswerText, setLastAnswerText] = useState("");
  const [toast, setToast] = useState("");

  const persist = (patch = {}) => {
    const prev = loadState() || { answers: {}, unlocked: 1, messages: INITIAL_CHAT };
    const next = {
      answers: patch.answers ?? prev.answers,
      unlocked: patch.unlocked ?? prev.unlocked,
      messages: patch.messages ?? prev.messages,
      profile: patch.profile === undefined ? prev.profile : patch.profile,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const doneCount = Object.keys(answers).length;
  const profile = useMemo(
    () => (doneCount === 14 ? aiProfile || interpret(answers) : null),
    [aiProfile, answers, doneCount],
  );

  const showToast = (text) => {
    setToast(text);
    window.setTimeout(() => setToast(""), 1800);
  };

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAnswers({});
    setUnlocked(1);
    setMessages(INITIAL_CHAT);
    setDraft("");
    setResultTab(0);
    setAiProfile(null);
    setLastAnswerText("");
    setScreen("map");
  };

  const openChapter = (id) => {
    const ch = CHAPTERS.find((c) => c.id === id);
    const nextQ = ch.questions.find((q) => !answers[`Q${q}`]) || ch.questions[0];
    if (id === 1) {
      primeIslandAudio();
      void playPrologueNarration(0);
      setSoundOn(true);
    } else if (soundOn && !CINEMATIC_QUESTION_IDS.has(nextQ)) {
      void playQuestionNarration(nextQ, answers);
    }
    setChapterId(id);
    setQid(nextQ);
    setLastAnswerText("");
    setScreen(id === 1 ? "intro" : "question");
  };

  const requestAiProfile = async (finalAnswers) => {
    setGenerationStatus("正在连接 DeepSeek，为你整理关系画像……");
    setScreen("generating");

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers }),
        signal: AbortSignal.timeout(32000),
      });
      const payload = await response.json();
      if (!response.ok || !payload.profile) {
        throw new Error(payload.error || "画像生成失败");
      }

      setGenerationStatus("画像已经拼好了，正在为你展开……");
      setAiProfile(payload.profile);
      persist({ answers: finalAnswers, profile: payload.profile });
      setResultTab(0);
      setScreen("result");
      if (payload.warning) showToast(payload.warning);
    } catch {
      const fallbackProfile = {
        ...interpret(finalAnswers),
        generatedBy: "local",
        profileVersion: PROFILE_VERSION,
      };
      setAiProfile(fallbackProfile);
      persist({ answers: finalAnswers, profile: fallbackProfile });
      setResultTab(0);
      setScreen("result");
      showToast("网络暂时不可用，已使用本地规则库生成结果");
    }
  };

  const advanceJourney = (currentAnswers) => {
    const ch = CHAPTERS.find((c) => c.id === chapterId);
    const idx = ch.questions.indexOf(qid);
    const nextInChapter = ch.questions[idx + 1];

    if (nextInChapter) {
      if (soundOn && !CINEMATIC_QUESTION_IDS.has(nextInChapter)) {
        void playQuestionNarration(nextInChapter, currentAnswers);
      }
      setQid(nextInChapter);
      setScreen("question");
      return;
    }

    const nextChapter = chapterId + 1;
    if (nextChapter <= 7) {
      setUnlocked((u) => {
        const v = Math.max(u, nextChapter);
        persist({ unlocked: v });
        return v;
      });
    }

    if (qid === 4 || qid === 9) {
      setMessages((prev) => {
        const nextMessages = [
          ...prev,
          {
            role: "lora",
            text:
              qid === 4
                ? "洞穴里那一阵沉默，我都记得。你选的方式，我会学着靠近。"
                : "风暴过了。你刚刚保护自己的方式，我不觉得那是冷淡。",
          },
        ];
        persist({ messages: nextMessages });
        return nextMessages;
      });
    }

    if (chapterId === 7) {
      void requestAiProfile(currentAnswers);
      return;
    }

    const nextChapterData = CHAPTERS.find((chapter) => chapter.id === nextChapter);
    const nextQuestion = nextChapterData.questions.find((questionId) => !currentAnswers[`Q${questionId}`])
      || nextChapterData.questions[0];
    setChapterId(nextChapter);
    setQid(nextQuestion);
    setLastAnswerText("");
    setScreen("question");
  };

  const choose = (key, text) => {
    const next = { ...answers, [`Q${qid}`]: key };
    setAnswers(next);
    setLastAnswerText(text);
    setAiProfile(null);
    persist({ answers: next, profile: null });
    advanceJourney(next);
  };

  const sendChat = () => {
    const text = draft.trim() || "感觉有些选项真的很难选……但很准的！";
    const reply = loraReply(text, doneCount);
    const next = [...messages, { role: "me", text }, { role: "lora", text: reply }];
    setMessages(next);
    setDraft("");
    persist({ messages: next });
  };

  const share = async () => {
    const text = profile?.shareLine || "我在心之群岛拼出了自己的恋爱说明书。";
    try {
      if (navigator.share) {
        await navigator.share({ title: "Soul Relationship Puzzle", text });
      } else {
        await navigator.clipboard.writeText(text);
        showToast("已复制分享文案");
      }
    } catch {
      showToast("已取消分享");
    }
  };

  const goResult = useCallback((tab = 0) => {
    setResultTab(tab);
    setScreen("result");
  }, []);

  const openCompletedResult = (tab = 0) => {
    if (doneCount === 14 && !aiProfile) {
      void requestAiProfile(answers);
      return;
    }
    goResult(tab);
  };

  const cycleTab = (dir) => setResultTab((t) => (t + dir + 4) % 4);

  let body = null;
  if (screen === "welcome") {
    body = (
      <Welcome
        hasProgress={doneCount > 0}
        onStart={reset}
        onContinue={() => (doneCount === 14 ? openCompletedResult(0) : setScreen("map"))}
      />
    );
  } else if (screen === "map") {
    body = (
      <JourneyMap
        answers={answers}
        unlocked={unlocked}
        onBack={() => setScreen("welcome")}
        onOpen={openChapter}
        onPuzzle={() => setScreen("puzzle")}
        onChat={() => setScreen("chat")}
        onResult={() => openCompletedResult(0)}
      />
    );
  } else if (screen === "intro") {
    body = (
      <IslandIntro
        chapter={CHAPTERS.find((c) => c.id === chapterId)}
        onBack={() => setScreen("map")}
        onStart={() => {
          if (soundOn && !CINEMATIC_QUESTION_IDS.has(qid)) void playQuestionNarration(qid, answers);
          setScreen("question");
        }}
        soundOn={soundOn}
        onToggleSound={() => {
          if (!soundOn) primeIslandAudio();
          setSoundOn((value) => !value);
        }}
      />
    );
  } else if (screen === "question") {
    body = (
      <QuestionScreen
        qid={qid}
        answers={answers}
        onClose={() => setScreen("map")}
        onChoose={choose}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((value) => !value)}
        lastAnswerText={lastAnswerText}
      />
    );
  } else if (screen === "puzzle") {
    body = (
      <PuzzleScreen
        answers={answers}
        onBack={() => (doneCount === 14 ? openCompletedResult(0) : setScreen("map"))}
        onShare={() => (profile ? goResult(3) : showToast("先把拼图集齐再分享吧"))}
      />
    );
  } else if (screen === "chat") {
    body = (
      <ChatScreen
        messages={messages}
        draft={draft}
        setDraft={setDraft}
        onBack={() => (doneCount === 14 ? openCompletedResult(0) : setScreen("map"))}
        onSend={sendChat}
      />
    );
  } else if (screen === "generating") {
    body = <Generating status={generationStatus} />;
  } else if (screen === "manual" && profile) {
    body = <ManualScreen profile={profile} onBack={() => goResult(1)} />;
  } else if (screen === "result" && profile) {
    const common = {
      profile,
      onBack: () => setScreen("map"),
      onNext: () => cycleTab(1),
      onPrev: () => cycleTab(-1),
    };
    if (resultTab === 0) body = <PersonalityResult {...common} onDetails={() => setScreen("manual")} />;
    else if (resultTab === 1) {
      body = <PartnerTraits {...common} onDetails={() => setScreen("manual")} />;
    } else if (resultTab === 2) {
      body = <RadarScreen {...common} onMore={() => setScreen("manual")} />;
    } else body = <ShareScreen profile={profile} onBack={() => setScreen("map")} onShare={share} />;
  } else {
    body = (
      <Welcome
        hasProgress={doneCount > 0}
        onStart={reset}
        onContinue={() => setScreen("map")}
      />
    );
  }

  return (
    <div className="stage">
      <div className="phone">
        <div
          className={`phone-screen ${
            screen === "welcome"
              ? "theme-welcome"
              : screen === "puzzle"
                ? "theme-puzzle"
              : screen === "intro"
              ? chapterId === 1
                ? "theme-prologue"
                : "theme-intro"
              : screen === "question"
                ? `theme-question theme-question-${chapterId} theme-question-q${qid}`
                : ""
          }`}
        >
          <div className="status-bar">
            <span>9:41</span>
            <span>♥︎ 心之群岛</span>
          </div>
          {body}
          {toast && <div className="toast">{toast}</div>}
        </div>
      </div>
    </div>
  );
}
