import { useEffect, useRef, useState } from "react";
import { BackIcon, CloseIcon, Mascot, ShareIcon, StarEmblem } from "./ui/Mascot.jsx";
import { CHAPTERS, PETALS, QUESTIONS, getQ7Scene } from "./data/story.js";
import userPurpleFluffy from "./assets/user-purple-fluffy.png";
import loraWavingFluffy from "./assets/lora-waving-fluffy.png";
import chapterOneToTwoVideo from "./assets/video/chapter-1-to-2.mp4";
import chapterTwoToThreeVideo from "./assets/video/chapter-2-to-3.mp4";
import chapterThreeToFourVideo from "./assets/video/chapter-3-to-4.mp4";
import chapterFourToFiveVideo from "./assets/video/chapter-4-to-5.mp4";
import chapterFiveToSixVideo from "./assets/video/chapter-5-to-6.mp4";
import chapterSixToSevenVideo from "./assets/video/chapter-6-to-7.mp4";
import chapterSevenEndingVideo from "./assets/video/chapter-7-ending.mp4";
import {
  clearPrologueNarrationListener,
  getLoveraEncounterProgress,
  getPrologueNarrationProgress,
  getQ1CinematicProgress,
  getQ2CinematicProgress,
  getCaveCinematicProgress,
  getFutureLandCinematicProgress,
  getMirrorCinematicProgress,
  getPromiseCinematicProgress,
  getResourceCinematicProgress,
  getStormCinematicProgress,
  getQuestionNarrationProgress,
  playLoveraEncounter,
  playPrologueNarration,
  playQ1CinematicTrack,
  playQ2CinematicTrack,
  playCaveCinematicTrack,
  playFutureLandCinematicTrack,
  playMirrorCinematicTrack,
  playPromiseCinematicTrack,
  playResourceCinematicTrack,
  playStormCinematicTrack,
  playQuestionNarration,
  startIslandAmbience,
  stopIslandAmbience,
  stopLoveraNarration,
  stopPrologueNarration,
} from "./engine/islandAudio.js";

function Nav({ title, onBack, onClose, right }) {
  return (
    <div className="nav">
      {onBack ? (
        <button className="icon-btn" onClick={onBack} aria-label="返回">
          <BackIcon />
        </button>
      ) : onClose ? (
        <button className="icon-btn" onClick={onClose} aria-label="关闭">
          <CloseIcon />
        </button>
      ) : (
        <span style={{ width: 36 }} />
      )}
      <div className="nav-title">{title}</div>
      {right || <span style={{ width: 36 }} />}
    </div>
  );
}

export function Welcome({ hasProgress, onStart, onContinue }) {
  return (
    <div className="screen fade-in welcome-screen">
      <div className="welcome-sparkles" aria-hidden="true">
        <span>✦</span><span>·</span><span>✦</span><span>·</span>
      </div>

      <header className="welcome-copy">
        <p className="welcome-kicker"><span /> Welcome to <span /></p>
        <h1 className="welcome-title">Heart Islands</h1>
        <div className="welcome-divider" aria-hidden="true"><i>★</i></div>
        <p className="welcome-subtitle">
          A journey to understand<br />your <strong>true love</strong> personality.
        </p>
      </header>

      <div className="welcome-character-stage">
        <div className="welcome-speech">
          Let’s find<br />your heart<br />puzzle! <span>♥</span>
        </div>
        <div className="welcome-mascot-glow" aria-hidden="true" />
        <img
          className="welcome-mascot"
          src={loraWavingFluffy}
          alt="毛茸茸的 Lovera 正在向你挥手"
          draggable="false"
        />
        <span className="welcome-foreground-star" aria-hidden="true">★</span>
      </div>

      <div className="welcome-actions">
        <button className="welcome-cta" onClick={onStart}>
          <span aria-hidden="true">✦</span> Start Journey
        </button>
        {hasProgress && (
          <button className="welcome-continue" onClick={onContinue}>
            Continue your journey →
          </button>
        )}
        <div className="welcome-footer-line" aria-hidden="true"><span>♥</span></div>
        <p className="welcome-footer">Every choice brings you closer<br />to understanding yourself.</p>
      </div>
    </div>
  );
}

const CHAPTER_TRANSITION_VIDEOS = {
  "1-2": {
    src: chapterOneToTwoVideo,
    label: "从心动岛前往回声洞穴的故事过场",
    nextLabel: "进入第二章",
  },
  "2-3": {
    src: chapterTwoToThreeVideo,
    label: "从回声洞穴前往星果森林的故事过场",
    nextLabel: "进入第三章",
  },
  "3-4": {
    src: chapterThreeToFourVideo,
    label: "从星果森林前往风暴峡谷的故事过场",
    nextLabel: "进入第四章",
  },
  "4-5": {
    src: chapterFourToFiveVideo,
    label: "从风暴峡谷前往镜湖的故事过场",
    nextLabel: "进入第五章",
  },
  "5-6": {
    src: chapterFiveToSixVideo,
    label: "从镜湖前往双生浮岛的故事过场",
    nextLabel: "进入第六章",
  },
  "6-7": {
    src: chapterSixToSevenVideo,
    label: "从双生浮岛前往未来花园的故事过场",
    nextLabel: "进入第七章",
  },
  "7-ending": {
    src: chapterSevenEndingVideo,
    label: "完成心之群岛旅程的结尾过场",
    nextLabel: "查看我的关系画像",
  },
};

export function ChapterTransitionVideo({ transitionKey = "1-2", onComplete }) {
  const transition = CHAPTER_TRANSITION_VIDEOS[transitionKey] || CHAPTER_TRANSITION_VIDEOS["1-2"];
  const videoRef = useRef(null);
  const finishTimerRef = useRef(null);
  const [needsTap, setNeedsTap] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    video.muted = false;
    video.volume = 1;
    const startTimer = window.setTimeout(() => {
      const playback = video.play();
      playback?.catch(() => setNeedsTap(true));
    }, 500);

    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(finishTimerRef.current);
      video.pause();
    };
  }, []);

  const finishPlayback = () => {
    setPlaying(false);
    finishTimerRef.current = window.setTimeout(onComplete, 500);
  };

  const startPlayback = async () => {
    try {
      await videoRef.current?.play();
      setNeedsTap(false);
    } catch {
      setNeedsTap(true);
    }
  };

  return (
    <div className={`screen chapter-transition-screen ${playing ? "is-playing" : ""}`}>
      <video
        ref={videoRef}
        className="chapter-transition-video"
        src={transition.src}
        playsInline
        preload="auto"
        disablePictureInPicture
        controlsList="nodownload noplaybackrate noremoteplayback"
        aria-label={transition.label}
        onPlaying={() => {
          setPlaying(true);
          setNeedsTap(false);
        }}
        onEnded={finishPlayback}
        onError={() => setFailed(true)}
      />
      <div className="chapter-transition-fade" aria-hidden="true" />
      {needsTap && !failed && (
        <button type="button" className="chapter-transition-play" onClick={startPlayback}>
          <span aria-hidden="true">▶</span>
          点击播放过场
          <small>将播放原声</small>
        </button>
      )}
      {failed && (
        <div className="chapter-transition-error" role="alert">
          <p>过场视频暂时无法播放</p>
          <button type="button" onClick={onComplete}>{transition.nextLabel}</button>
        </div>
      )}
    </div>
  );
}

const MAP_CHAPTER_MARKS = {
  1: "♡",
  2: "≋",
  3: "✦",
  4: "☂",
  5: "◇",
  6: "♥",
  7: "♧",
};

export function JourneyMap({ answers, unlocked, onBack, onOpen, onPuzzle, onChat, onResult }) {
  const done = Object.keys(answers).length;
  return (
    <div className="screen fade-in journey-map-screen">
      <Nav
        title="心之群岛"
        onBack={onBack}
        right={<span className="map-nav-count">{done}/14</span>}
      />
      <header className="map-intro">
        <span>HEART ISLANDS</span>
        <h1>Your Journey</h1>
        <div aria-hidden="true"><i />♥<i /></div>
        <p>每一块拼图，都是更了解自己的一步。</p>
      </header>
      <div className="map-canvas">
        <svg className="map-path" viewBox="0 0 320 560" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M70 40 C 140 70, 230 90, 250 130 S 70 210, 70 250 S 260 330, 250 370 S 80 450, 90 490 S 180 530, 150 540"
            fill="none"
            pathLength="1"
            className="map-path-base"
          />
          <path
            d="M70 40 C 140 70, 230 90, 250 130 S 70 210, 70 250 S 260 330, 250 370 S 80 450, 90 490 S 180 530, 150 540"
            fill="none"
            pathLength="1"
            className="map-path-progress"
            style={{ strokeDashoffset: 1 - (done / 14) }}
          />
        </svg>
        {CHAPTERS.map((ch, idx) => {
          const complete = ch.questions.every((q) => answers[`Q${q}`]);
          const open = ch.id <= unlocked;
          const current = open && !complete && idx === unlocked - 1;
          return (
            <button
              key={ch.id}
              type="button"
              className={`island map-island-${ch.id} ${open ? "active" : "locked"} ${complete ? "complete" : ""} ${current ? "current" : ""}`}
              style={ch.mapPos}
              onClick={() => open && onOpen(ch.id)}
              disabled={!open}
            >
              <span className="map-island-mark" aria-hidden="true">{MAP_CHAPTER_MARKS[ch.id]}</span>
              <div className="map-island-copy">
                <div className="no">
                  {String(ch.id).padStart(2, "0")} {complete ? "✦" : ""}
                </div>
                <h3>{ch.nameEn}</h3>
                <p>{ch.nameZh}</p>
              </div>
              {!open && <span className="lock" aria-hidden="true">⌁</span>}
              {open && !complete && idx === unlocked - 1 && <span className="lock">→</span>}
            </button>
          );
        })}
        <div className="map-lovera-companion" aria-hidden="true">
          <span />
          <Mascot mood="happy" size={54} />
        </div>
      </div>
      <div className="map-footer">
        <div className="map-progress-label">
          <span>✦ 收集更多拼图，看见更完整的自己</span>
          <strong>{done}<small>/14</small></strong>
        </div>
        <div className="map-progress-bar">
          <span style={{ width: `${(done / 14) * 100}%` }} />
        </div>
        <div className="row-btns">
          <button className="mini" onClick={onPuzzle}>
            <span aria-hidden="true">✦</span> 拼图
          </button>
          <button className="mini" onClick={onChat}>
            <span aria-hidden="true">♥</span> 找 Lovera
          </button>
          {done === 14 && onResult && (
            <button className="mini" onClick={onResult}>
              结果
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const HEART_ISLAND_PROLOGUE = [
  "传说，心之群岛上散落着九块「恋爱拼图」。",
  "只有两个愿意一起旅行的小怪物，才能找到它们。",
  "你刚刚醒来时，发现自己站在一座漂浮的小岛上。",
  "不远处，一只橘色、毛茸茸的小怪物正抱着一盏快要熄灭的星星灯。",
];

const LOVERA_ENCOUNTER_LINES = [
  "你也是迷路了吗？",
  "要不要……一起找回家的路？",
];

function HeartIslandPrologue({ onBack, onDone, soundOn, onToggleSound }) {
  const [phase, setPhase] = useState("narration");
  const [lineIndex, setLineIndex] = useState(0);
  const [spokenChars, setSpokenChars] = useState(0);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [dialogueChars, setDialogueChars] = useState(0);
  const [audioNeedsTap, setAudioNeedsTap] = useState(false);
  const [narrationAttempt, setNarrationAttempt] = useState(0);
  const [dialogueAttempt, setDialogueAttempt] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const doneRef = useRef(onDone);
  const transitionTimerRef = useRef(null);

  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (soundOn) {
      startIslandAmbience();
    } else {
      stopIslandAmbience();
      stopPrologueNarration();
    }
    return () => stopIslandAmbience();
  }, [soundOn]);

  useEffect(() => {
    if (phase !== "narration") return undefined;

    if (lineIndex >= HEART_ISLAND_PROLOGUE.length) {
      const pauseTimer = window.setTimeout(() => setPhase("dialogue"), 720);
      return () => {
        window.clearTimeout(pauseTimer);
      };
    }

    const line = HEART_ISLAND_PROLOGUE[lineIndex];
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const readingTime = reducedMotion ? 900 : Math.max(2800, line.length * 150);
    let disposed = false;
    let progressTimer;
    let textTimer;
    let lineTimer;
    let endPauseTimer;
    setSpokenChars(0);

    const advanceAfterNarration = () => {
      if (disposed) return;
      setSpokenChars(line.length);
      endPauseTimer = window.setTimeout(() => setLineIndex((value) => value + 1), 420);
    };

    if (soundOn) {
      setAudioNeedsTap(false);
      void playPrologueNarration(lineIndex, advanceAfterNarration).then((playing) => {
        if (!disposed && !playing) setAudioNeedsTap(true);
      });
      progressTimer = window.setInterval(() => {
        const progress = getPrologueNarrationProgress(lineIndex);
        if (progress > 0) {
          setSpokenChars(Math.min(line.length, Math.max(1, Math.ceil(line.length * progress))));
        }
      }, 45);
    } else {
      let visibleCharacters = 0;
      const characterDelay = readingTime / line.length;
      textTimer = window.setInterval(() => {
        visibleCharacters += 1;
        setSpokenChars(Math.min(line.length, visibleCharacters));
        if (visibleCharacters >= line.length) window.clearInterval(textTimer);
      }, characterDelay);
      lineTimer = window.setTimeout(() => setLineIndex((value) => value + 1), readingTime + 420);
    }

    return () => {
      disposed = true;
      window.clearInterval(progressTimer);
      window.clearInterval(textTimer);
      window.clearTimeout(lineTimer);
      window.clearTimeout(endPauseTimer);
      clearPrologueNarrationListener(advanceAfterNarration);
    };
  }, [lineIndex, narrationAttempt, phase, soundOn]);

  useEffect(() => {
    if (phase !== "dialogue") return undefined;

    const line = LOVERA_ENCOUNTER_LINES[dialogueIndex];
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let disposed = false;
    let progressTimer;
    let typeTimer;
    let advanceTimer;
    let fallbackTimer;
    let dialogueCompleted = false;
    setDialogueChars(soundOn || !reducedMotion ? 0 : line.length);

    const advanceDialogue = () => {
      if (disposed || dialogueCompleted) return;
      dialogueCompleted = true;
      setDialogueChars(line.length);
      advanceTimer = window.setTimeout(() => {
        if (dialogueIndex < LOVERA_ENCOUNTER_LINES.length - 1) {
          setDialogueIndex((value) => value + 1);
        } else {
          setPhase("gateway");
        }
      }, dialogueIndex === LOVERA_ENCOUNTER_LINES.length - 1 ? 920 : 520);
    };

    if (soundOn) {
      setAudioNeedsTap(false);
      void playLoveraEncounter(dialogueIndex, advanceDialogue).then((playing) => {
        if (disposed) return;
        if (!playing) {
          setAudioNeedsTap(true);
          return;
        }
        fallbackTimer = window.setTimeout(advanceDialogue, 9000);
      });
      progressTimer = window.setInterval(() => {
        const progress = getLoveraEncounterProgress(dialogueIndex);
        if (progress > 0) {
          setDialogueChars(Math.min(line.length, Math.max(1, Math.ceil(line.length * progress))));
        }
      }, 45);
    } else {
      if (!reducedMotion) {
        let visibleCharacters = 0;
        typeTimer = window.setInterval(() => {
          visibleCharacters += 1;
          setDialogueChars(Math.min(line.length, visibleCharacters));
          if (visibleCharacters >= line.length) window.clearInterval(typeTimer);
        }, 92);
      }
      fallbackTimer = window.setTimeout(
        advanceDialogue,
        reducedMotion ? 1150 : Math.max(2200, line.length * 210),
      );
    }

    return () => {
      disposed = true;
      window.clearInterval(progressTimer);
      window.clearInterval(typeTimer);
      window.clearTimeout(advanceTimer);
      window.clearTimeout(fallbackTimer);
      clearPrologueNarrationListener(advanceDialogue);
    };
  }, [dialogueAttempt, dialogueIndex, phase, soundOn]);

  const handleSoundToggle = () => {
    if (soundOn) {
      stopPrologueNarration();
    } else if (phase === "narration" && lineIndex < HEART_ISLAND_PROLOGUE.length) {
      void playPrologueNarration(lineIndex);
    }
    onToggleSound();
  };

  const retryNarration = () => {
    setAudioNeedsTap(false);
    void playPrologueNarration(lineIndex);
    setNarrationAttempt((value) => value + 1);
  };

  const retryEncounterNarration = () => {
    setAudioNeedsTap(false);
    setDialogueAttempt((value) => value + 1);
  };

  const leaveForMap = () => {
    stopPrologueNarration();
    onBack();
  };

  const finishPrologue = () => {
    stopPrologueNarration();
    window.clearTimeout(transitionTimerRef.current);
    setLeaving(true);
    transitionTimerRef.current = window.setTimeout(() => doneRef.current(), 460);
  };

  if (phase === "gateway") {
    return (
      <div className={`screen fade-in prologue-gateway ${leaving ? "prologue-leaving" : ""}`}>
        <div className="gateway-atmosphere" aria-hidden="true">
          <span className="gateway-ray gateway-ray-a" />
          <span className="gateway-ray gateway-ray-b" />
          <span className="gateway-orbit gateway-orbit-a" />
          <span className="gateway-orbit gateway-orbit-b" />
          <span className="gateway-star gateway-star-a">✦</span>
          <span className="gateway-star gateway-star-b">✦</span>
          <span className="gateway-star gateway-star-c">·</span>
        </div>

        <button className="gateway-back" onClick={leaveForMap} aria-label="返回旅程地图">
          <BackIcon />
        </button>

        <div className="gateway-copy">
          <p className="gateway-kicker"><span /> HEART ISLAND · 01 <span /></p>
          <p className="gateway-overline">两颗心，第一次并肩</p>
          <h2>你的心之旅<br /><strong>从这里开始</strong></h2>
          <p className="gateway-subtitle">从这一刻起，每一个选择<br />都会带你更靠近真实的自己</p>
        </div>

        <div className="gateway-portal" aria-label="你和 Lovera 准备一起踏上心之旅">
          <span className="gateway-halo" aria-hidden="true" />
          <span className="gateway-heart" aria-hidden="true">♥</span>
          <img className="gateway-player" src={userPurpleFluffy} alt="代表你的紫色毛球" draggable="false" />
          <div className="gateway-lovera"><Mascot mood="happy" size={104} /></div>
          <span className="gateway-ground" aria-hidden="true" />
        </div>

        <div className="gateway-actions">
          <button type="button" className="gateway-cta" onClick={finishPrologue}>
            <span>踏入心之群岛</span><i aria-hidden="true">→</i>
          </button>
          <p><span>✦</span> 你的故事，正等待被点亮 <span>✦</span></p>
        </div>
      </div>
    );
  }

  return (
    <div className={`screen fade-in prologue-screen ${leaving ? "prologue-leaving" : ""}`}>
      <div className="prologue-atmosphere" aria-hidden="true">
        <span className="prologue-sun-glow" />
        <span className="prologue-light-ray ray-a" />
        <span className="prologue-light-ray ray-b" />
        <span className="prologue-mist" />
        <span className="prologue-mote mote-a">✦</span>
        <span className="prologue-mote mote-b">·</span>
        <span className="prologue-mote mote-c">✦</span>
        <span className="prologue-mote mote-d">·</span>
      </div>

      <div className="prologue-controls">
        <button className="prologue-icon-button" onClick={leaveForMap} aria-label="返回旅程地图">
          <BackIcon />
        </button>
        <span className="prologue-chapter">01 · HEART ISLAND</span>
        <button
          type="button"
          className={`prologue-sound ${soundOn ? "active" : ""}`}
          onClick={handleSoundToggle}
          aria-pressed={soundOn}
          aria-label={soundOn ? "关闭序章声音" : "打开序章声音"}
        >
          <span aria-hidden="true">{soundOn ? "♪" : "♩"}</span>
          {soundOn ? "声音开" : "声音关"}
        </button>
      </div>

      {phase === "narration" ? (
        <div className="prologue-copy" aria-live="polite">
          <p className="prologue-kicker"><span /> 心之群岛 · 序章</p>
          {audioNeedsTap && (
            <button type="button" className="prologue-listen-prompt" onClick={retryNarration}>
              <span aria-hidden="true">♪</span> 点一下，听 Lovera 继续讲故事
            </button>
          )}
          <div className="prologue-lines">
            {HEART_ISLAND_PROLOGUE.map((line, index) => (
              <p
                key={line}
                className={`${index < lineIndex ? "is-past" : ""} ${index === lineIndex ? "is-current" : ""} ${index <= lineIndex ? "is-visible" : ""}`}
              >
                {index < lineIndex ? line : index === lineIndex ? line.slice(0, spokenChars) : ""}
                {index === lineIndex && spokenChars < line.length && <span className="narration-cursor" />}
              </p>
            ))}
          </div>
        </div>
      ) : (
        <div className="prologue-encounter" aria-live="polite">
          <p className="encounter-kicker"><span>✦</span> Lovera</p>
          {audioNeedsTap && (
            <button type="button" className="prologue-listen-prompt" onClick={retryEncounterNarration}>
              <span aria-hidden="true">♪</span> 点一下，听 Lovera 对你说
            </button>
          )}
          <div className="encounter-lines">
            {LOVERA_ENCOUNTER_LINES.map((line, index) => (
              <p key={line} className={index <= dialogueIndex ? "is-visible" : ""}>
                “{index < dialogueIndex ? line : index === dialogueIndex ? line.slice(0, dialogueChars) : ""}”
                {index === dialogueIndex && dialogueChars < line.length && <span className="narration-cursor" />}
              </p>
            ))}
          </div>
          <div className="encounter-prompt"><span /> 我们的故事，要从这里开始吗？ <span /></div>
        </div>
      )}

      <div className="prologue-companions" aria-label="你在浮岛上遇见抱着星星灯的 Lovera">
        <div className="prologue-traveler">
          <span className="wake-ring" aria-hidden="true" />
          <img src={userPurpleFluffy} alt="代表你的紫色毛球" draggable="false" />
        </div>
        <div className={`prologue-lora ${phase === "dialogue" ? "is-speaking" : ""}`}>
          <span className="lora-warmth" aria-hidden="true" />
          <Mascot mood="idle" size={116} />
          <span className="star-lantern" aria-hidden="true"><i>✦</i></span>
          <span className="lora-name">Lovera</span>
        </div>
      </div>

      <div className="prologue-footer">
        <div className="prologue-progress" aria-label={`序章进度 ${phase === "dialogue" ? 5 + dialogueIndex : Math.min(lineIndex + 1, 4)}/6`}>
          {[...HEART_ISLAND_PROLOGUE, ...LOVERA_ENCOUNTER_LINES].map((line, index) => (
            <span key={line} className={index <= (phase === "dialogue" ? 4 + dialogueIndex : Math.min(lineIndex, 3)) ? "active" : ""} />
          ))}
        </div>
        <button type="button" className="prologue-skip" onClick={finishPrologue}>跳过序章</button>
      </div>
    </div>
  );
}

export function IslandIntro({ chapter, onBack, onStart, soundOn, onToggleSound }) {
  if (chapter.id === 1) {
    return (
      <HeartIslandPrologue
        onBack={onBack}
        onDone={onStart}
        soundOn={soundOn}
        onToggleSound={onToggleSound}
      />
    );
  }

  return (
    <div className={`screen fade-in island-intro intro-chapter-${chapter.id}`}>
      <div className="intro-atmosphere" aria-hidden="true">
        <span className="intro-moon" />
        <span className="intro-star star-a">✦</span>
        <span className="intro-star star-b">✦</span>
        <span className="intro-star star-c">·</span>
        <span className="firefly firefly-a" />
        <span className="firefly firefly-b" />
        <span className="firefly firefly-c" />
        <span className="firefly firefly-d" />
        <span className="mist mist-a" />
        <span className="mist mist-b" />
      </div>
      <Nav title={`${chapter.no} ${chapter.nameEn}`} onBack={onBack} />
      <div className="intro-heading">
        <p className="intro-kicker">ISLAND STORY · {chapter.no}</p>
        <p className="intro-theme">{chapter.nameZh} · {chapter.theme}</p>
      </div>
      <div className="intro-content">
        <div className="intro-visual" aria-label="Lovera 站在发光的小岛上">
          <span className="mascot-halo" aria-hidden="true" />
          <Mascot mood="happy" size={184} />
          <span className="intro-ground" aria-hidden="true" />
        </div>
        <div className="intro-story-card">
          <div className="story-meta">
            <span className="story-dot" />
            <span>STORY MOMENT</span>
            <span className="story-line" />
          </div>
          <p className="story-scene">{chapter.intro.scene}</p>
          <div className="lora-line">
            <span className="lora-mark">✦</span>
            <p><strong>Lovera</strong>{chapter.intro.lora}</p>
          </div>
        </div>
      </div>
      <button className="cta" onClick={onStart}>
        <span>进入这一岛</span>
        <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}

const Q1_NARRATION_LINES = [
  "你和 Lovera 穿过一片会发光的萤火草地。",
  "走到一半时，突然刮起一阵风。",
  "你头顶的一颗小星星被吹走了。",
  "Lovera 追了很远，终于把它捧回来。",
  "然后，她轻轻把星星放进你手里。",
];

const Q1_LOVERA_LINE = "这个好像对你很重要。";

function getQ1NarrationIndex(progress) {
  if (progress < 0.2) return 0;
  if (progress < 0.38) return 1;
  if (progress < 0.57) return 2;
  if (progress < 0.81) return 3;
  return 4;
}

function Q1CinematicQuestion({ onClose, onChoose, soundOn, onToggleSound }) {
  const q = QUESTIONS[1];
  const chapter = CHAPTERS.find((item) => item.id === 1);
  const [phase, setPhase] = useState("narration");
  const [narrationProgress, setNarrationProgress] = useState(0);
  const [dialogueProgress, setDialogueProgress] = useState(0);
  const [audioNeedsTap, setAudioNeedsTap] = useState(false);
  const [audioAttempt, setAudioAttempt] = useState(0);

  useEffect(() => {
    if (phase !== "narration") return undefined;

    let disposed = false;
    let progressTimer;
    let transitionTimer;
    let silentTimer;
    const finishNarration = () => {
      if (disposed) return;
      setNarrationProgress(1);
      transitionTimer = window.setTimeout(() => setPhase("lovera"), 520);
    };

    setNarrationProgress(0);
    setAudioNeedsTap(false);
    if (soundOn) {
      void playQ1CinematicTrack("narration", finishNarration).then((playing) => {
        if (!disposed && !playing) setAudioNeedsTap(true);
      });
      progressTimer = window.setInterval(() => {
        const progress = getQ1CinematicProgress("narration");
        if (progress > 0) setNarrationProgress(progress);
      }, 45);
    } else {
      const startedAt = performance.now();
      progressTimer = window.setInterval(() => {
        setNarrationProgress(Math.min(1, (performance.now() - startedAt) / 12500));
      }, 45);
      silentTimer = window.setTimeout(finishNarration, 12500);
    }

    return () => {
      disposed = true;
      window.clearInterval(progressTimer);
      window.clearTimeout(transitionTimer);
      window.clearTimeout(silentTimer);
      clearPrologueNarrationListener(finishNarration);
    };
  }, [audioAttempt, phase, soundOn]);

  useEffect(() => {
    if (phase !== "lovera") return undefined;

    let disposed = false;
    let progressTimer;
    let transitionTimer;
    let silentTimer;
    const finishLoveraLine = () => {
      if (disposed) return;
      setDialogueProgress(1);
      transitionTimer = window.setTimeout(() => setPhase("question"), 720);
    };

    setDialogueProgress(0);
    setAudioNeedsTap(false);
    if (soundOn) {
      void playQ1CinematicTrack("lovera", finishLoveraLine).then((playing) => {
        if (!disposed && !playing) setAudioNeedsTap(true);
      });
      progressTimer = window.setInterval(() => {
        const progress = getQ1CinematicProgress("lovera");
        if (progress > 0) setDialogueProgress(progress);
      }, 45);
    } else {
      const startedAt = performance.now();
      progressTimer = window.setInterval(() => {
        setDialogueProgress(Math.min(1, (performance.now() - startedAt) / 2200));
      }, 45);
      silentTimer = window.setTimeout(finishLoveraLine, 2200);
    }

    return () => {
      disposed = true;
      window.clearInterval(progressTimer);
      window.clearTimeout(transitionTimer);
      window.clearTimeout(silentTimer);
      clearPrologueNarrationListener(finishLoveraLine);
    };
  }, [audioAttempt, phase, soundOn]);

  const handleSoundToggle = () => {
    stopLoveraNarration();
    onToggleSound();
  };

  const skipNarration = () => {
    stopLoveraNarration();
    setAudioNeedsTap(false);
    setNarrationProgress(1);
    setDialogueProgress(1);
    setPhase("question");
  };

  const retryAudio = () => {
    setAudioNeedsTap(false);
    setAudioAttempt((value) => value + 1);
  };

  const closeQuestion = () => {
    stopLoveraNarration();
    onClose();
  };

  const narrationIndex = getQ1NarrationIndex(narrationProgress);
  const visibleLoveraChars = Math.ceil(Q1_LOVERA_LINE.length * dialogueProgress);
  const dialogueVisible = phase === "lovera" || phase === "question";

  return (
    <div className="screen fade-in question-screen q1-cinematic-screen">
      <Nav title={`${chapter.no} ${chapter.nameEn}`} onClose={closeQuestion} />
      <div className="scroll question-scroll q1-cinematic-scroll">
        <section
          className={`q1-cinematic-stage phase-${phase}`}
          style={{ "--story-time": `${narrationProgress * -1}s` }}
          aria-label="Lovera 在萤火草地追逐被风吹走的星星，并把它交还给你"
        >
          <div className="scene-toolbar q1-toolbar">
            <span>✦ 心动岛 · 萤火草地</span>
            <button
              type="button"
              className={`sound-toggle ${soundOn ? "active" : ""}`}
              onClick={handleSoundToggle}
              aria-pressed={soundOn}
              aria-label={soundOn ? "关闭场景声音" : "打开场景声音"}
            >
              <span aria-hidden="true">{soundOn ? "🔊" : "🔇"}</span>
              {soundOn ? "声音开" : "声音关"}
            </button>
          </div>

          <div className="q1-scene" aria-hidden="true">
            <div className="q1-sunset-haze" />
            <div className="q1-fireflies">
              {Array.from({ length: 13 }, (_, index) => <i key={index} />)}
            </div>
            <div className="q1-wind-stream wind-one" />
            <div className="q1-wind-stream wind-two" />
            <span className="q1-story-star">★</span>
            <div className="q1-user-character">
              <img src={userPurpleFluffy} alt="" draggable="false" />
            </div>
            <div className="q1-lovera-character">
              <Mascot mood="idle" size={98} />
            </div>
            <div className="q1-handover-glow"><span>★</span></div>
          </div>

          <div className={`q1-caption ${dialogueVisible ? "lovera-caption" : "narrator-caption"}`} aria-live="polite">
            {dialogueVisible ? (
              <>
                <div className="q1-caption-meta"><span>✦ Lovera</span><i>轻轻地说</i></div>
                <p>“{phase === "question" ? Q1_LOVERA_LINE : Q1_LOVERA_LINE.slice(0, visibleLoveraChars)}”</p>
              </>
            ) : (
              <>
                <div className="q1-caption-meta"><span>旁白</span><i>{narrationIndex + 1} / {Q1_NARRATION_LINES.length}</i></div>
                <p key={narrationIndex}>{Q1_NARRATION_LINES[narrationIndex]}</p>
              </>
            )}
            {(audioNeedsTap || phase !== "question") && (
              <div className="q1-caption-actions">
                {audioNeedsTap && (
                  <button type="button" className="question-listen-prompt" onClick={retryAudio}>
                    <span aria-hidden="true">♪</span> 点一下，继续听这段故事
                  </button>
                )}
                {phase !== "question" && (
                  <button type="button" className="q1-skip-narration" onClick={skipNarration}>
                    跳过
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {phase === "question" ? (
          <div className="answer-reveal q1-answer-reveal">
            <div className="question-heading">
              <span>QUESTION 1 · 此刻，你的心微微亮了一下</span>
              <p>{q.question}</p>
            </div>
            <div className="question-options">
              {q.options.map((option) => (
                <button key={option.key} className="option" onClick={() => onChoose(option.key, option.text)}>
                  <span className="option-key">{option.key}</span>
                  <span className="option-text">{option.text}</span>
                  <span className="option-arrow" aria-hidden="true">›</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <div className="progress-row question-progress">
        <div className="bar"><span style={{ width: "50%" }} /></div>
        <span>1/2</span>
      </div>
    </div>
  );
}

const Q2_NARRATION_LINES = [
  "前方出现一座很窄的云朵桥。",
  "一次只能容下两个小怪物。",
];

function Q2CinematicQuestion({ onClose, onChoose, soundOn, onToggleSound }) {
  const q = QUESTIONS[2];
  const chapter = CHAPTERS.find((item) => item.id === 1);
  const [phase, setPhase] = useState("narration");
  const [narrationProgress, setNarrationProgress] = useState(0);
  const [dialogueProgress, setDialogueProgress] = useState(0);
  const [branchProgress, setBranchProgress] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [audioNeedsTap, setAudioNeedsTap] = useState(false);
  const [audioAttempt, setAudioAttempt] = useState(0);

  useEffect(() => {
    if (phase !== "narration") return undefined;

    let disposed = false;
    let progressTimer;
    let transitionTimer;
    let silentTimer;
    const finishNarration = () => {
      if (disposed) return;
      setNarrationProgress(1);
      transitionTimer = window.setTimeout(() => setPhase("lovera"), 460);
    };

    setNarrationProgress(0);
    setAudioNeedsTap(false);
    if (soundOn) {
      void playQ2CinematicTrack("narration", finishNarration).then((playing) => {
        if (!disposed && !playing) setAudioNeedsTap(true);
      });
      progressTimer = window.setInterval(() => {
        const progress = getQ2CinematicProgress("narration");
        if (progress > 0) setNarrationProgress(progress);
      }, 45);
    } else {
      const startedAt = performance.now();
      progressTimer = window.setInterval(() => {
        setNarrationProgress(Math.min(1, (performance.now() - startedAt) / 6200));
      }, 45);
      silentTimer = window.setTimeout(finishNarration, 6200);
    }

    return () => {
      disposed = true;
      window.clearInterval(progressTimer);
      window.clearTimeout(transitionTimer);
      window.clearTimeout(silentTimer);
      clearPrologueNarrationListener(finishNarration);
    };
  }, [audioAttempt, phase, soundOn]);

  useEffect(() => {
    if (phase !== "lovera") return undefined;

    let disposed = false;
    let progressTimer;
    let transitionTimer;
    let silentTimer;
    const finishQuestion = () => {
      if (disposed) return;
      setDialogueProgress(1);
      transitionTimer = window.setTimeout(() => setPhase("question"), 540);
    };

    setDialogueProgress(0);
    setAudioNeedsTap(false);
    if (soundOn) {
      void playQ2CinematicTrack("lovera", finishQuestion).then((playing) => {
        if (!disposed && !playing) setAudioNeedsTap(true);
      });
      progressTimer = window.setInterval(() => {
        const progress = getQ2CinematicProgress("lovera");
        if (progress > 0) setDialogueProgress(progress);
      }, 45);
    } else {
      const startedAt = performance.now();
      progressTimer = window.setInterval(() => {
        setDialogueProgress(Math.min(1, (performance.now() - startedAt) / 1840));
      }, 45);
      silentTimer = window.setTimeout(finishQuestion, 1840);
    }

    return () => {
      disposed = true;
      window.clearInterval(progressTimer);
      window.clearTimeout(transitionTimer);
      window.clearTimeout(silentTimer);
      clearPrologueNarrationListener(finishQuestion);
    };
  }, [audioAttempt, phase, soundOn]);

  useEffect(() => {
    if (phase !== "branch" || !selectedOption) return undefined;

    let disposed = false;
    let progressTimer;
    let transitionTimer;
    let silentTimer;
    const branchDuration = selectedOption.key === "A" ? 2380 : selectedOption.key === "B" ? 2140 : 1200;
    const finishBranch = () => {
      if (disposed) return;
      setBranchProgress(1);
      transitionTimer = window.setTimeout(() => {
        onChoose(selectedOption.key, selectedOption.text);
      }, 880);
    };

    setBranchProgress(0);
    setAudioNeedsTap(false);
    if (soundOn) {
      void playQ2CinematicTrack(selectedOption.key, finishBranch).then((playing) => {
        if (!disposed && !playing) setAudioNeedsTap(true);
      });
      progressTimer = window.setInterval(() => {
        const progress = getQ2CinematicProgress(selectedOption.key);
        if (progress > 0) setBranchProgress(progress);
      }, 45);
    } else {
      const startedAt = performance.now();
      progressTimer = window.setInterval(() => {
        setBranchProgress(Math.min(1, (performance.now() - startedAt) / branchDuration));
      }, 45);
      silentTimer = window.setTimeout(finishBranch, branchDuration);
    }

    return () => {
      disposed = true;
      window.clearInterval(progressTimer);
      window.clearTimeout(transitionTimer);
      window.clearTimeout(silentTimer);
      clearPrologueNarrationListener(finishBranch);
    };
  }, [audioAttempt, onChoose, phase, selectedOption, soundOn]);

  const chooseBranch = (option) => {
    stopLoveraNarration();
    setSelectedOption(option);
    setPhase("branch");
  };

  const handleSoundToggle = () => {
    stopLoveraNarration();
    onToggleSound();
  };

  const retryAudio = () => {
    setAudioNeedsTap(false);
    setAudioAttempt((value) => value + 1);
  };

  const skipNarration = () => {
    if (phase === "branch") return;
    stopLoveraNarration();
    setAudioNeedsTap(false);
    setNarrationProgress(1);
    setDialogueProgress(1);
    setPhase("question");
  };

  const closeQuestion = () => {
    stopLoveraNarration();
    onClose();
  };

  const narrationIndex = narrationProgress < 0.5 ? 0 : 1;
  const questionChars = Math.ceil(q.question.length * dialogueProgress);
  const branchLine = selectedOption ? q.echoes[selectedOption.key] : "";
  const branchChars = Math.ceil(branchLine.length * branchProgress);
  const branchClass = selectedOption ? `branch-${selectedOption.key.toLowerCase()}` : "";

  return (
    <div className="screen fade-in question-screen q2-cinematic-screen">
      <Nav title={`${chapter.no} ${chapter.nameEn}`} onClose={closeQuestion} />
      <div className="scroll question-scroll q2-cinematic-scroll">
        <section
          className={`q2-cinematic-stage phase-${phase} ${branchClass}`}
          style={{
            "--q2-story-time": `${narrationProgress * -1}s`,
            "--q2-branch-time": `${branchProgress * -1}s`,
          }}
          aria-label="你和 Lovera 来到狭窄的云朵桥，并选择过桥方式"
        >
          <div className="scene-toolbar q2-toolbar">
            <span>☁ 心动岛 · 云朵桥</span>
            <button
              type="button"
              className={`sound-toggle ${soundOn ? "active" : ""}`}
              onClick={handleSoundToggle}
              aria-pressed={soundOn}
              aria-label={soundOn ? "关闭场景声音" : "打开场景声音"}
            >
              <span aria-hidden="true">{soundOn ? "🔊" : "🔇"}</span>
              {soundOn ? "声音开" : "声音关"}
            </button>
          </div>

          <div className="q2-scene" aria-hidden="true">
            <div className="q2-sky-light" />
            <div className="q2-cloud-drift cloud-drift-one" />
            <div className="q2-cloud-drift cloud-drift-two" />
            <div className="q2-bridge-glimmer" />
            <div className="q2-user-character">
              <img src={userPurpleFluffy} alt="" draggable="false" />
            </div>
            <div className="q2-lovera-character">
              <Mascot mood="idle" size={96} />
              <img className="q2-lovera-wave" src={loraWavingFluffy} alt="" draggable="false" />
              <span className="q2-waiting-spark">✦</span>
            </div>
            <div className="q2-closeness-glow"><span>♥</span></div>
            <div className="q2-bridge-footprints"><i /><i /><i /><i /></div>
          </div>

          <div className={`q2-caption ${phase === "narration" ? "narrator-caption" : "lovera-caption"}`} aria-live="polite">
            {phase === "narration" ? (
              <>
                <div className="q2-caption-meta"><span>旁白</span><i>{narrationIndex + 1} / 2</i></div>
                <p key={narrationIndex}>{Q2_NARRATION_LINES[narrationIndex]}</p>
              </>
            ) : phase === "branch" ? (
              <>
                <div className="q2-caption-meta"><span>✦ Lovera</span><i>{selectedOption?.key === "C" ? "在桥对面挥手" : "回应你的选择"}</i></div>
                <p>“{branchLine.slice(0, branchChars)}”</p>
              </>
            ) : (
              <>
                <div className="q2-caption-meta"><span>✦ Lovera</span><i>回头问你</i></div>
                <p>“{phase === "question" ? q.question : q.question.slice(0, questionChars)}”</p>
              </>
            )}
            {audioNeedsTap && (
              <div className="q2-caption-actions">
                <button type="button" className="question-listen-prompt" onClick={retryAudio}>
                  <span aria-hidden="true">♪</span> 点一下，继续听 Lovera 说话
                </button>
                {phase !== "question" && phase !== "branch" && (
                  <button type="button" className="question-narration-skip" onClick={skipNarration}>跳过</button>
                )}
              </div>
            )}
            {!audioNeedsTap && phase !== "question" && phase !== "branch" && (
              <div className="q2-caption-actions">
                <button type="button" className="question-narration-skip" onClick={skipNarration}>跳过</button>
              </div>
            )}
          </div>
        </section>

        {phase === "question" ? (
          <div className="answer-reveal q2-answer-reveal">
            <div className="question-heading">
              <span>QUESTION 2 · 你想用怎样的距离一起前进？</span>
              <p>{q.question}</p>
            </div>
            <div className="question-options">
              {q.options.map((option) => (
                <button key={option.key} className="option" onClick={() => chooseBranch(option)}>
                  <span className="option-key">{option.key}</span>
                  <span className="option-text">{option.text}</span>
                  <span className="option-arrow" aria-hidden="true">›</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="waiting-response q2-watching-note">
            <span />
            {phase === "branch" ? "你的选择正在改变两颗心之间的距离……" : "风从云桥边吹过，故事正在发生……"}
          </div>
        )}
      </div>
      <div className="progress-row question-progress">
        <div className="bar"><span style={{ width: "100%" }} /></div>
        <span>2/2</span>
      </div>
    </div>
  );
}

function Q3CinematicQuestion({ onClose, onChoose, soundOn, onToggleSound }) {
  const q = QUESTIONS[3];
  const chapter = CHAPTERS.find((item) => item.id === 2);
  const narrationLines = [
    "进入洞穴以后，四周突然完全黑了。",
    "你只能听见 Lovera 的声音。",
  ];
  const loveraLine = "你还在吗？";
  const [phase, setPhase] = useState("narration");
  const [narrationProgress, setNarrationProgress] = useState(0);
  const [dialogueProgress, setDialogueProgress] = useState(0);
  const [audioNeedsTap, setAudioNeedsTap] = useState(false);
  const [audioAttempt, setAudioAttempt] = useState(0);

  useEffect(() => {
    if (phase !== "narration") return undefined;
    let disposed = false;
    let progressTimer;
    let transitionTimer;
    let silentTimer;
    const finish = () => {
      if (disposed) return;
      setNarrationProgress(1);
      transitionTimer = window.setTimeout(() => setPhase("lovera"), 480);
    };

    setNarrationProgress(0);
    setAudioNeedsTap(false);
    if (soundOn) {
      void playCaveCinematicTrack("q3-narration", finish).then((playing) => {
        if (!disposed && !playing) setAudioNeedsTap(true);
      });
      progressTimer = window.setInterval(() => {
        const progress = getCaveCinematicProgress("q3-narration");
        if (progress > 0) setNarrationProgress(progress);
      }, 45);
    } else {
      const startedAt = performance.now();
      progressTimer = window.setInterval(() => setNarrationProgress(Math.min(1, (performance.now() - startedAt) / 6100)), 45);
      silentTimer = window.setTimeout(finish, 6100);
    }

    return () => {
      disposed = true;
      window.clearInterval(progressTimer);
      window.clearTimeout(transitionTimer);
      window.clearTimeout(silentTimer);
      clearPrologueNarrationListener(finish);
    };
  }, [audioAttempt, phase, soundOn]);

  useEffect(() => {
    if (phase !== "lovera") return undefined;
    let disposed = false;
    let progressTimer;
    let transitionTimer;
    let silentTimer;
    const finish = () => {
      if (disposed) return;
      setDialogueProgress(1);
      transitionTimer = window.setTimeout(() => setPhase("question"), 620);
    };

    setDialogueProgress(0);
    setAudioNeedsTap(false);
    if (soundOn) {
      void playCaveCinematicTrack("q3-lovera", finish).then((playing) => {
        if (!disposed && !playing) setAudioNeedsTap(true);
      });
      progressTimer = window.setInterval(() => {
        const progress = getCaveCinematicProgress("q3-lovera");
        if (progress > 0) setDialogueProgress(progress);
      }, 45);
    } else {
      const startedAt = performance.now();
      progressTimer = window.setInterval(() => setDialogueProgress(Math.min(1, (performance.now() - startedAt) / 1180)), 45);
      silentTimer = window.setTimeout(finish, 1180);
    }

    return () => {
      disposed = true;
      window.clearInterval(progressTimer);
      window.clearTimeout(transitionTimer);
      window.clearTimeout(silentTimer);
      clearPrologueNarrationListener(finish);
    };
  }, [audioAttempt, phase, soundOn]);

  const closeQuestion = () => {
    stopLoveraNarration();
    onClose();
  };
  const handleSoundToggle = () => {
    stopLoveraNarration();
    onToggleSound();
  };
  const retryAudio = () => {
    setAudioNeedsTap(false);
    setAudioAttempt((value) => value + 1);
  };
  const narrationIndex = narrationProgress < 0.52 ? 0 : 1;
  const loveraChars = Math.ceil(loveraLine.length * dialogueProgress);

  const skipNarration = () => {
    stopLoveraNarration();
    setAudioNeedsTap(false);
    setNarrationProgress(1);
    setDialogueProgress(1);
    setPhase("question");
  };

  return (
    <div
      className={`screen fade-in question-screen cave-question-screen q3-cinematic-screen phase-${phase}`}
      style={{ "--cave-story-time": `${narrationProgress * -1}s` }}
    >
      <div className="q3-page-darkness" aria-hidden="true" />
      <Nav title={`${chapter.no} ${chapter.nameEn}`} onClose={closeQuestion} />
      <div className="scroll question-scroll cave-cinematic-scroll">
        <section
          className={`cave-cinematic-stage q3-cave-stage phase-${phase}`}
          style={{ "--cave-story-time": `${narrationProgress * -1}s` }}
          aria-label="你和 Lovera 进入突然完全黑下来的回声洞穴"
        >
          <div className="scene-toolbar cave-toolbar">
            <span>◈ 回声岛 · 失去光线</span>
            <button type="button" className={`sound-toggle ${soundOn ? "active" : ""}`} onClick={handleSoundToggle} aria-pressed={soundOn}>
              <span aria-hidden="true">{soundOn ? "🔊" : "🔇"}</span>{soundOn ? "声音开" : "声音关"}
            </button>
          </div>
          <div className="cave-scene" aria-hidden="true">
            <div className="cave-depth-vignette" />
            <div className="cave-crystal-glow crystal-left" />
            <div className="cave-crystal-glow crystal-right" />
            <div className="cave-user-character"><img src={userPurpleFluffy} alt="" draggable="false" /></div>
            <div className="cave-lovera-character"><Mascot mood="worry" size={98} /></div>
            <div className="cave-voice-waves"><i /><i /><i /></div>
            <div className="cave-search-beam" />
          </div>
          <div className={`cave-caption ${phase === "narration" ? "narrator-caption" : "lovera-caption"}`} aria-live="polite">
            {phase === "narration" ? (
              <>
                <div className="cave-caption-meta"><span>旁白</span><i>{narrationIndex + 1} / 2</i></div>
                <p key={narrationIndex}>{narrationLines[narrationIndex]}</p>
              </>
            ) : (
              <>
                <div className="cave-caption-meta"><span>✦ Lovera</span><i>声音从黑暗里传来</i></div>
                <p>“{phase === "question" ? loveraLine : loveraLine.slice(0, loveraChars)}”</p>
              </>
            )}
            {(audioNeedsTap || phase !== "question") && (
              <div className="cave-caption-actions">
                {audioNeedsTap && <button type="button" className="question-listen-prompt" onClick={retryAudio}><span>♪</span> 点一下，听见黑暗里的声音</button>}
                {phase !== "question" && <button type="button" className="question-narration-skip" onClick={skipNarration}>跳过</button>}
              </div>
            )}
          </div>
        </section>

        {phase === "question" ? (
          <div className="answer-reveal cave-answer-reveal">
            <div className="question-heading"><span>QUESTION 3 · 看不见时，你需要怎样的确认？</span><p>{q.question}</p></div>
            <div className="question-options">
              {q.options.map((option) => (
                <button key={option.key} className="option" onClick={() => onChoose(option.key, option.text)}>
                  <span className="option-key">{option.key}</span><span className="option-text">{option.text}</span><span className="option-arrow">›</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <div className="progress-row question-progress"><div className="bar"><span style={{ width: "50%" }} /></div><span>1/2</span></div>
    </div>
  );
}

function Q4CinematicQuestion({ onClose, onChoose, soundOn, onToggleSound }) {
  const q = QUESTIONS[4];
  const chapter = CHAPTERS.find((item) => item.id === 2);
  const apologyLine = "对不起，我刚才走错路了。";
  const [phase, setPhase] = useState("disappear");
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [audioNeedsTap, setAudioNeedsTap] = useState(false);
  const [audioAttempt, setAudioAttempt] = useState(0);

  useEffect(() => {
    if (phase !== "disappear") return undefined;
    let disposed = false;
    let progressTimer;
    let transitionTimer;
    let silentTimer;
    const finish = () => {
      if (disposed) return;
      setPhaseProgress(1);
      transitionTimer = window.setTimeout(() => setPhase("silence"), 360);
    };

    setPhaseProgress(0);
    setAudioNeedsTap(false);
    if (soundOn) {
      void playCaveCinematicTrack("q4-disappear", finish).then((playing) => {
        if (!disposed && !playing) setAudioNeedsTap(true);
      });
      progressTimer = window.setInterval(() => {
        const progress = getCaveCinematicProgress("q4-disappear");
        if (progress > 0) setPhaseProgress(progress);
      }, 45);
    } else {
      const startedAt = performance.now();
      progressTimer = window.setInterval(() => setPhaseProgress(Math.min(1, (performance.now() - startedAt) / 5250)), 45);
      silentTimer = window.setTimeout(finish, 5250);
    }
    return () => {
      disposed = true;
      window.clearInterval(progressTimer);
      window.clearTimeout(transitionTimer);
      window.clearTimeout(silentTimer);
      clearPrologueNarrationListener(finish);
    };
  }, [audioAttempt, phase, soundOn]);

  useEffect(() => {
    if (phase !== "silence") return undefined;
    setAudioNeedsTap(false);
    setPhaseProgress(0);
    const startedAt = performance.now();
    const progressTimer = window.setInterval(() => setPhaseProgress(Math.min(1, (performance.now() - startedAt) / 5200)), 45);
    const silenceTimer = window.setTimeout(() => setPhase("return"), 5200);
    return () => {
      window.clearInterval(progressTimer);
      window.clearTimeout(silenceTimer);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "return") return undefined;
    let disposed = false;
    let progressTimer;
    let transitionTimer;
    let silentTimer;
    const finish = () => {
      if (disposed) return;
      setPhaseProgress(1);
      transitionTimer = window.setTimeout(() => setPhase("lovera"), 420);
    };
    setPhaseProgress(0);
    setAudioNeedsTap(false);
    if (soundOn) {
      void playCaveCinematicTrack("q4-return", finish).then((playing) => {
        if (!disposed && !playing) setAudioNeedsTap(true);
      });
      progressTimer = window.setInterval(() => {
        const progress = getCaveCinematicProgress("q4-return");
        if (progress > 0) setPhaseProgress(progress);
      }, 45);
    } else {
      const startedAt = performance.now();
      progressTimer = window.setInterval(() => setPhaseProgress(Math.min(1, (performance.now() - startedAt) / 3200)), 45);
      silentTimer = window.setTimeout(finish, 3200);
    }
    return () => {
      disposed = true;
      window.clearInterval(progressTimer);
      window.clearTimeout(transitionTimer);
      window.clearTimeout(silentTimer);
      clearPrologueNarrationListener(finish);
    };
  }, [audioAttempt, phase, soundOn]);

  useEffect(() => {
    if (phase !== "lovera") return undefined;
    let disposed = false;
    let progressTimer;
    let transitionTimer;
    let silentTimer;
    const finish = () => {
      if (disposed) return;
      setPhaseProgress(1);
      transitionTimer = window.setTimeout(() => setPhase("question"), 720);
    };
    setPhaseProgress(0);
    setAudioNeedsTap(false);
    if (soundOn) {
      void playCaveCinematicTrack("q4-lovera", finish).then((playing) => {
        if (!disposed && !playing) setAudioNeedsTap(true);
      });
      progressTimer = window.setInterval(() => {
        const progress = getCaveCinematicProgress("q4-lovera");
        if (progress > 0) setPhaseProgress(progress);
      }, 45);
    } else {
      const startedAt = performance.now();
      progressTimer = window.setInterval(() => setPhaseProgress(Math.min(1, (performance.now() - startedAt) / 2760)), 45);
      silentTimer = window.setTimeout(finish, 2760);
    }
    return () => {
      disposed = true;
      window.clearInterval(progressTimer);
      window.clearTimeout(transitionTimer);
      window.clearTimeout(silentTimer);
      clearPrologueNarrationListener(finish);
    };
  }, [audioAttempt, phase, soundOn]);

  const closeQuestion = () => {
    stopLoveraNarration();
    onClose();
  };
  const handleSoundToggle = () => {
    stopLoveraNarration();
    onToggleSound();
  };
  const retryAudio = () => {
    setAudioNeedsTap(false);
    setAudioAttempt((value) => value + 1);
  };
  const apologyChars = Math.ceil(apologyLine.length * phaseProgress);
  const timeStyle = phase === "return"
    ? { "--cave-return-time": `${phaseProgress * -1}s` }
    : { "--cave-disappear-time": `${phaseProgress * -1}s` };

  const skipNarration = () => {
    stopLoveraNarration();
    setAudioNeedsTap(false);
    setPhaseProgress(1);
    setPhase("question");
  };

  return (
    <div className="screen fade-in question-screen cave-question-screen q4-cinematic-screen">
      <Nav title={`${chapter.no} ${chapter.nameEn}`} onClose={closeQuestion} />
      <div className="scroll question-scroll cave-cinematic-scroll">
        <section className={`cave-cinematic-stage q4-cave-stage phase-${phase}`} style={timeStyle} aria-label="Lovera 在洞穴岔路消失，等待后重新回到你身边">
          <div className="scene-toolbar cave-toolbar">
            <span>◈ 回声岛 · 最深处</span>
            <button type="button" className={`sound-toggle ${soundOn ? "active" : ""}`} onClick={handleSoundToggle} aria-pressed={soundOn}>
              <span aria-hidden="true">{soundOn ? "🔊" : "🔇"}</span>{soundOn ? "声音开" : "声音关"}
            </button>
          </div>
          <div className="cave-scene" aria-hidden="true">
            <div className="cave-depth-vignette" />
            <div className="cave-fork fork-left" /><div className="cave-fork fork-right" />
            <div className="cave-silence-pulse"><i /><i /><i /></div>
            <div className="cave-user-character"><img src={userPurpleFluffy} alt="" draggable="false" /></div>
            <div className="cave-lovera-character"><Mascot mood="worry" size={98} /></div>
            <div className="cave-return-light">✦</div>
            {phase === "silence" && <div className="cave-waiting-dots"><i /><i /><i /></div>}
          </div>
          <div className={`cave-caption ${phase === "lovera" || phase === "question" ? "lovera-caption" : "narrator-caption"}`} aria-live="polite">
            {phase === "disappear" ? (
              <><div className="cave-caption-meta"><span>旁白</span><i>声音断掉了</i></div><p>走到洞穴最深处时，Lovera 的声音突然消失了。</p></>
            ) : phase === "silence" ? (
              <><div className="cave-caption-meta"><span>寂静</span><i>时间变得很慢</i></div><p className="cave-silence-text">你听不见任何回应……</p></>
            ) : phase === "return" ? (
              <><div className="cave-caption-meta"><span>旁白</span><i>远处重新亮起微光</i></div><p>十几秒以后，TA 重新出现。</p></>
            ) : (
              <><div className="cave-caption-meta"><span>✦ Lovera</span><i>有些慌张地说</i></div><p>“{phase === "question" ? apologyLine : apologyLine.slice(0, apologyChars)}”</p></>
            )}
            {(audioNeedsTap || phase !== "question") && (
              <div className="cave-caption-actions">
                {audioNeedsTap && <button type="button" className="question-listen-prompt" onClick={retryAudio}><span>♪</span> 点一下，继续听这段故事</button>}
                {phase !== "question" && <button type="button" className="question-narration-skip" onClick={skipNarration}>跳过</button>}
              </div>
            )}
          </div>
        </section>

        {phase === "question" ? (
          <div className="answer-reveal cave-answer-reveal">
            <div className="question-heading"><span>QUESTION 4 · “没关系”背后，你真正需要什么？</span><p>{q.question}</p></div>
            <div className="question-options">
              {q.options.map((option) => (
                <button key={option.key} className="option" onClick={() => onChoose(option.key, option.text)}>
                  <span className="option-key">{option.key}</span><span className="option-text">{option.text}</span><span className="option-arrow">›</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <div className="progress-row question-progress"><div className="bar"><span style={{ width: "100%" }} /></div><span>2/2</span></div>
    </div>
  );
}

function Q5CinematicQuestion({ onClose, onChoose, soundOn, onToggleSound }) {
  const q = QUESTIONS[5];
  const chapter = CHAPTERS.find((item) => item.id === 3);
  const loveraLine = "我好像没力气了……";
  const [phase, setPhase] = useState("arrival");
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [audioNeedsTap, setAudioNeedsTap] = useState(false);
  const [audioAttempt, setAudioAttempt] = useState(0);

  useEffect(() => {
    if (phase === "question") return undefined;
    const config = {
      arrival: { segment: "q5-arrival", duration: 6960, next: "lovera", pause: 420 },
      lovera: { segment: "q5-lovera", duration: 2640, next: "energy", pause: 520 },
      energy: { segment: "q5-energy", duration: 3740, next: "question", pause: 620 },
    }[phase];
    if (!config) return undefined;

    let disposed = false;
    let progressTimer;
    let transitionTimer;
    let silentTimer;
    const finish = () => {
      if (disposed) return;
      setPhaseProgress(1);
      transitionTimer = window.setTimeout(() => setPhase(config.next), config.pause);
    };

    setPhaseProgress(0);
    setAudioNeedsTap(false);
    if (soundOn) {
      void playResourceCinematicTrack(config.segment, finish).then((playing) => {
        if (!disposed && !playing) setAudioNeedsTap(true);
      });
      progressTimer = window.setInterval(() => {
        const progress = getResourceCinematicProgress(config.segment);
        if (progress > 0) setPhaseProgress(progress);
      }, 45);
    } else {
      const startedAt = performance.now();
      progressTimer = window.setInterval(() => setPhaseProgress(Math.min(1, (performance.now() - startedAt) / config.duration)), 45);
      silentTimer = window.setTimeout(finish, config.duration);
    }

    return () => {
      disposed = true;
      window.clearInterval(progressTimer);
      window.clearTimeout(transitionTimer);
      window.clearTimeout(silentTimer);
      clearPrologueNarrationListener(finish);
    };
  }, [audioAttempt, phase, soundOn]);

  const closeQuestion = () => {
    stopLoveraNarration();
    onClose();
  };
  const handleSoundToggle = () => {
    stopLoveraNarration();
    onToggleSound();
  };
  const retryAudio = () => {
    setAudioNeedsTap(false);
    setAudioAttempt((value) => value + 1);
  };
  const skipNarration = () => {
    stopLoveraNarration();
    setAudioNeedsTap(false);
    setPhaseProgress(1);
    setPhase("question");
  };
  const arrivalLine = phaseProgress < 0.52
    ? "走了很久以后，Lovera 的星星灯突然熄灭。"
    : "TA 无力地坐在树下。";
  const loveraChars = Math.ceil(loveraLine.length * phaseProgress);

  return (
    <div className="screen fade-in question-screen resource-question-screen q5-cinematic-screen">
      <Nav title={`${chapter.no} ${chapter.nameEn}`} onClose={closeQuestion} />
      <div className="scroll question-scroll resource-cinematic-scroll">
        <section className={`resource-cinematic-stage q5-resource-stage phase-${phase}`} style={{ "--resource-time": `${phaseProgress * -1}s` }}>
          <div className="scene-toolbar resource-toolbar">
            <span>✦ 共生岛 · 树下微光</span>
            <button type="button" className={`sound-toggle ${soundOn ? "active" : ""}`} onClick={handleSoundToggle} aria-pressed={soundOn}>
              <span aria-hidden="true">{soundOn ? "🔊" : "🔇"}</span>{soundOn ? "声音开" : "声音关"}
            </button>
          </div>
          <div className="resource-scene q5-scene" aria-hidden="true">
            <div className="q5-sunset-rays" />
            <div className="q5-falling-petals">{Array.from({ length: 8 }, (_, index) => <i key={index} />)}</div>
            <div className="q5-user-character"><img src={userPurpleFluffy} alt="" draggable="false" /></div>
            <div className="q5-lovera-character"><Mascot mood="worry" size={100} /></div>
            <div className="q5-star-lamp">★</div>
            <div className="q5-energy-orb">✦</div>
            <div className="q5-care-line"><i /><i /><i /></div>
          </div>
          <div className={`resource-caption ${phase === "lovera" ? "lovera-caption" : "narrator-caption"}`} aria-live="polite">
            {phase === "arrival" ? (
              <><div className="resource-caption-meta"><span>旁白</span><i>灯光正在熄灭</i></div><p key={arrivalLine}>{arrivalLine}</p></>
            ) : phase === "lovera" ? (
              <><div className="resource-caption-meta"><span>✦ Lovera</span><i>声音很轻</i></div><p>“{loveraLine.slice(0, loveraChars)}”</p></>
            ) : (
              <><div className="resource-caption-meta"><span>旁白</span><i>背包里亮起最后一点光</i></div><p>你的背包里只剩下一点魔法能量。</p></>
            )}
            {(audioNeedsTap || phase !== "question") && (
              <div className="resource-caption-actions">
                {audioNeedsTap && <button type="button" className="question-listen-prompt" onClick={retryAudio}><span>♪</span> 点一下，继续听这段故事</button>}
                {phase !== "question" && <button type="button" className="question-narration-skip" onClick={skipNarration}>跳过</button>}
              </div>
            )}
          </div>
        </section>

        {phase === "question" ? (
          <div className="answer-reveal resource-answer-reveal">
            <div className="question-heading"><span>QUESTION 5 · 当旅伴没有力气时</span><p>{q.question}</p></div>
            <div className="question-options">{q.options.map((option) => (
              <button key={option.key} className="option" onClick={() => onChoose(option.key, option.text)}>
                <span className="option-key">{option.key}</span><span className="option-text">{option.text}</span><span className="option-arrow">›</span>
              </button>
            ))}</div>
          </div>
        ) : null}
      </div>
      <div className="progress-row question-progress"><div className="bar"><span style={{ width: "33.33%" }} /></div><span>1/3</span></div>
    </div>
  );
}

function Q6CinematicQuestion({ onClose, onChoose, soundOn, onToggleSound }) {
  const q = QUESTIONS[6];
  const chapter = CHAPTERS.find((item) => item.id === 3);
  const loveraLine = "你觉得我们怎么花？";
  const goodsLines = [
    "漂亮的飞行云朵：8 颗星币。可以让接下来的旅程很舒服。",
    "两盏小灯：4 颗星币。不漂亮，但之后也许有用。",
    "什么都不买：0 颗星币。把星币留给之后。",
  ];
  const vaultCaptions = [
    { text: "你们来到一座装满星砂的宝库。", start: 0.62, end: 3.46 },
    { text: "守门怪告诉你们：", start: 3.9, end: 5.22 },
    { text: "你们只有 10 颗星币，", start: 5.58, end: 7.38 },
    { text: "但前面还有很长的路。", start: 7.72, end: 9.76 },
  ];
  const goodsCaptionSegments = [
    [
      { text: "漂亮的飞行云朵：8 颗星币。", start: 0.58, end: 2.42 },
      { text: "可以让接下来的旅程很舒服。", start: 2.9, end: 5.62 },
    ],
    [
      { text: "两盏小灯：4 颗星币。", start: 5.98, end: 8.06 },
      { text: "不漂亮，但之后也许有用。", start: 8.52, end: 10.74 },
    ],
    [
      { text: "什么都不买：", start: 11.1, end: 11.56 },
      { text: "0 颗星币。", start: 11.88, end: 13.16 },
      { text: "把星币留给之后。", start: 13.84, end: 15.98 },
    ],
  ];
  const [phase, setPhase] = useState("vault");
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [audioNeedsTap, setAudioNeedsTap] = useState(false);
  const [audioAttempt, setAudioAttempt] = useState(0);

  useEffect(() => {
    if (phase === "question") return undefined;
    const config = {
      vault: { segment: "q6-vault", duration: 9780, next: "goods", pause: 420 },
      goods: { segment: "q6-goods", duration: 16120, next: "lovera", pause: 520 },
      lovera: { segment: "q6-lovera", duration: 3940, next: "question", pause: 650 },
    }[phase];
    if (!config) return undefined;

    let disposed = false;
    let progressTimer;
    let transitionTimer;
    let silentTimer;
    const finish = () => {
      if (disposed) return;
      setPhaseProgress(1);
      transitionTimer = window.setTimeout(() => {
        setPhaseProgress(0);
        setPhase(config.next);
      }, config.pause);
    };

    setPhaseProgress(0);
    setAudioNeedsTap(false);
    if (soundOn) {
      void playResourceCinematicTrack(config.segment, finish).then((playing) => {
        if (!disposed && !playing) setAudioNeedsTap(true);
      });
      progressTimer = window.setInterval(() => {
        const progress = getResourceCinematicProgress(config.segment);
        if (progress > 0) setPhaseProgress(progress);
      }, 45);
    } else {
      const startedAt = performance.now();
      progressTimer = window.setInterval(() => setPhaseProgress(Math.min(1, (performance.now() - startedAt) / config.duration)), 45);
      silentTimer = window.setTimeout(finish, config.duration);
    }

    return () => {
      disposed = true;
      window.clearInterval(progressTimer);
      window.clearTimeout(transitionTimer);
      window.clearTimeout(silentTimer);
      clearPrologueNarrationListener(finish);
    };
  }, [audioAttempt, phase, soundOn]);

  const closeQuestion = () => {
    stopLoveraNarration();
    onClose();
  };
  const handleSoundToggle = () => {
    stopLoveraNarration();
    onToggleSound();
  };
  const retryAudio = () => {
    setAudioNeedsTap(false);
    setAudioAttempt((value) => value + 1);
  };
  const skipNarration = () => {
    stopLoveraNarration();
    setAudioNeedsTap(false);
    setPhaseProgress(1);
    setPhase("question");
  };
  const revealTimedLine = (line, currentTime, startTime, endTime) => {
    const progress = Math.max(0, Math.min(1, (currentTime - startTime) / (endTime - startTime)));
    return line.slice(0, Math.ceil(line.length * progress));
  };
  const revealTimedSegments = (segments, currentTime) => segments.reduce((text, segment) => {
    if (currentTime <= segment.start) return text;
    if (currentTime >= segment.end) return text + segment.text;
    return text + revealTimedLine(segment.text, currentTime, segment.start, segment.end);
  }, "");
  const vaultTime = phaseProgress * 9.783;
  const vaultLineIndex = vaultTime < 3.9 ? 0 : vaultTime < 5.58 ? 1 : vaultTime < 7.72 ? 2 : 3;
  const activeVaultCaption = vaultCaptions[vaultLineIndex];
  const displayedVaultLine = revealTimedLine(
    activeVaultCaption.text,
    vaultTime,
    activeVaultCaption.start,
    activeVaultCaption.end,
  );
  const goodsTime = phaseProgress * 16.123;
  const activeGood = goodsTime < 5.98 ? 0 : goodsTime < 11.1 ? 1 : 2;
  const displayedGoodsLine = revealTimedSegments(goodsCaptionSegments[activeGood], goodsTime);
  const loveraTime = phaseProgress * 3.943;
  const displayedLoveraLine = phase === "question"
    ? loveraLine
    : revealTimedLine(loveraLine, loveraTime, 2.08, 3.7);

  return (
    <div className="screen fade-in question-screen resource-question-screen q6-cinematic-screen">
      <Nav title={`${chapter.no} ${chapter.nameEn}`} onClose={closeQuestion} />
      <div className="scroll question-scroll resource-cinematic-scroll">
        <section className={`resource-cinematic-stage q6-resource-stage phase-${phase}`} style={{ "--resource-time": `${phaseProgress * -1}s` }}>
          <div className="scene-toolbar resource-toolbar q6-toolbar">
            <span>✦ 共生岛 · 星砂宝库</span>
            <button type="button" className={`sound-toggle ${soundOn ? "active" : ""}`} onClick={handleSoundToggle} aria-pressed={soundOn}>
              <span aria-hidden="true">{soundOn ? "🔊" : "🔇"}</span>{soundOn ? "声音开" : "声音关"}
            </button>
          </div>
          <div className="resource-scene q6-scene" aria-hidden="true">
            <div className="q6-gold-shimmer">{Array.from({ length: 12 }, (_, index) => <i key={index} />)}</div>
            <div className="q6-user-character"><img src={userPurpleFluffy} alt="" draggable="false" /></div>
            <div className="q6-lovera-character"><Mascot mood="idle" size={96} /></div>
          </div>
          <div className={`resource-caption ${phase === "lovera" || phase === "question" ? "lovera-caption" : "narrator-caption"}`} aria-live="polite">
            {phase === "vault" ? (
              <><div className="resource-caption-meta"><span>旁白</span><i>继续前行</i></div><p key={vaultLineIndex}>{displayedVaultLine}{displayedVaultLine.length < activeVaultCaption.text.length && <span className="narration-cursor" />}</p></>
            ) : phase === "goods" ? (
              <><div className="resource-caption-meta"><span>旁白</span><i>三种不同的选择</i></div><p key={activeGood}>{displayedGoodsLine}{displayedGoodsLine.length < goodsLines[activeGood].length && <span className="narration-cursor" />}</p></>
            ) : (
              <><div className="resource-caption-meta"><span>✦ Lovera</span><i>认真地问你</i></div><p>“{displayedLoveraLine}{phase !== "question" && displayedLoveraLine.length < loveraLine.length && <span className="narration-cursor" />}”</p></>
            )}
            {(audioNeedsTap || phase !== "question") && (
              <div className="resource-caption-actions">
                {audioNeedsTap && <button type="button" className="question-listen-prompt" onClick={retryAudio}><span>♪</span> 点一下，继续听这段故事</button>}
                {phase !== "question" && <button type="button" className="question-narration-skip" onClick={skipNarration}>跳过</button>}
              </div>
            )}
          </div>
        </section>

        {phase === "question" ? (
          <div className="answer-reveal resource-answer-reveal">
            <div className="question-heading"><span>QUESTION 6 · 十颗星币，三种未来</span><p>{q.question}</p></div>
            <div className="question-options">{q.options.map((option) => (
              <button key={option.key} className="option" onClick={() => onChoose(option.key, option.text)}>
                <span className="option-key">{option.key}</span><span className="option-text">{option.text}</span><span className="option-arrow">›</span>
              </button>
            ))}</div>
          </div>
        ) : null}
      </div>
      <div className="progress-row question-progress"><div className="bar"><span style={{ width: "66.66%" }} /></div><span>2/3</span></div>
    </div>
  );
}

const Q8_FORK_LINES = [
  "你们来到一处分岔口。",
  "左边安全，但需要绕很远；右边很快，但正在刮风暴。",
  "你想走左边。",
];

const Q8_BEATS = {
  fork: { segment: "q8-fork", duration: 9440, next: "insist", pause: 420 },
  insist: { segment: "q8-insist", duration: 3280, next: "blown", pause: 460 },
  blown: { segment: "q8-blown", duration: 3600, next: "blame", pause: 620 },
  blame: { segment: "q8-blame", duration: 3600, next: "question", pause: 720 },
};

function Q8CinematicQuestion({ onClose, onChoose, soundOn, onToggleSound }) {
  const q = QUESTIONS[8];
  const chapter = CHAPTERS.find((item) => item.id === 4);
  const [phase, setPhase] = useState("fork");
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [audioNeedsTap, setAudioNeedsTap] = useState(false);
  const [audioAttempt, setAudioAttempt] = useState(0);

  useEffect(() => {
    if (phase === "question") return undefined;
    const config = Q8_BEATS[phase];
    if (!config) return undefined;

    let disposed = false;
    let progressTimer;
    let transitionTimer;
    let silentTimer;
    const finish = () => {
      if (disposed) return;
      setPhaseProgress(1);
      transitionTimer = window.setTimeout(() => setPhase(config.next), config.pause);
    };

    setPhaseProgress(0);
    setAudioNeedsTap(false);
    if (soundOn) {
      void playStormCinematicTrack(config.segment, finish).then((playing) => {
        if (!disposed && !playing) setAudioNeedsTap(true);
      });
      progressTimer = window.setInterval(() => {
        const progress = getStormCinematicProgress(config.segment);
        if (progress > 0) setPhaseProgress(progress);
      }, 45);
    } else {
      const startedAt = performance.now();
      progressTimer = window.setInterval(() => {
        setPhaseProgress(Math.min(1, (performance.now() - startedAt) / config.duration));
      }, 45);
      silentTimer = window.setTimeout(finish, config.duration);
    }

    return () => {
      disposed = true;
      window.clearInterval(progressTimer);
      window.clearTimeout(transitionTimer);
      window.clearTimeout(silentTimer);
      clearPrologueNarrationListener(finish);
    };
  }, [audioAttempt, phase, soundOn]);

  const closeQuestion = () => {
    stopLoveraNarration();
    onClose();
  };
  const handleSoundToggle = () => {
    stopLoveraNarration();
    onToggleSound();
  };
  const retryAudio = () => {
    setAudioNeedsTap(false);
    setAudioAttempt((value) => value + 1);
  };
  const skipNarration = () => {
    stopLoveraNarration();
    setAudioNeedsTap(false);
    setPhaseProgress(1);
    setPhase("question");
  };

  const forkLineIndex = phaseProgress < 0.25 ? 0 : phaseProgress < 0.78 ? 1 : 2;
  const loveraLine = phase === "insist"
    ? "相信我，右边一定可以过去。"
    : "你刚刚如果走快一点，我们已经过去了。";
  const loveraChars = Math.ceil(loveraLine.length * phaseProgress);
  const isLoveraSpeaking = phase === "insist" || phase === "blame" || phase === "question";

  return (
    <div className="screen fade-in question-screen storm-question-screen q8-cinematic-screen">
      <Nav title={`${chapter.no} ${chapter.nameEn}`} onClose={closeQuestion} />
      <div className="scroll question-scroll storm-cinematic-scroll">
        <section
          className={`storm-cinematic-stage q8-storm-stage phase-${phase}`}
          style={{ "--storm-time": `${phaseProgress * -1}s` }}
          aria-label="你和 Lovera 在风暴峡谷的分岔口发生第一次激烈分歧"
        >
          <div className="scene-toolbar storm-toolbar">
            <span>⚡ 风暴峡谷 · 分岔口</span>
            <button type="button" className={`sound-toggle ${soundOn ? "active" : ""}`} onClick={handleSoundToggle} aria-pressed={soundOn}>
              <span aria-hidden="true">{soundOn ? "🔊" : "🔇"}</span>{soundOn ? "声音开" : "声音关"}
            </button>
          </div>
          <div className="storm-scene" aria-hidden="true">
            <div className="storm-front" />
            <div className="storm-lightning"><i /><i /></div>
            <div className="storm-wind-rings"><i /><i /><i /></div>
            <div className="storm-petals">{Array.from({ length: 14 }, (_, index) => <i key={index} />)}</div>
            <div className="fork-label safe"><span>☀</span>安全 · 绕远</div>
            <div className="fork-label fast"><span>⚡</span>很快 · 风暴</div>
            <div className="storm-user-character"><img src={userPurpleFluffy} alt="" draggable="false" /></div>
            <div className="storm-lovera-character"><Mascot mood={phase === "blame" ? "worry" : "idle"} size={98} /></div>
            <div className="storm-impact"><i>✦</i><i>✦</i><i>✦</i></div>
          </div>
          <div className={`storm-caption ${isLoveraSpeaking ? "lovera-caption" : "narrator-caption"}`} aria-live="polite">
            {phase === "fork" ? (
              <><div className="storm-caption-meta"><span>旁白</span><i>{forkLineIndex + 1} / 3</i></div><p key={forkLineIndex}>{Q8_FORK_LINES[forkLineIndex]}</p></>
            ) : phase === "blown" ? (
              <><div className="storm-caption-meta"><span>旁白</span><i>风突然压了下来</i></div><p>结果刚走不远，你们就被风吹回来了。</p></>
            ) : (
              <><div className="storm-caption-meta"><span>✦ Lovera</span><i>{phase === "blame" ? "有点烦躁地说" : "指向右边的路"}</i></div><p>“{phase === "question" ? loveraLine : loveraLine.slice(0, loveraChars)}”</p></>
            )}
            {(audioNeedsTap || phase !== "question") && (
              <div className="storm-caption-actions">
                {audioNeedsTap && <button type="button" className="question-listen-prompt" onClick={retryAudio}><span>♪</span> 点一下，继续听这段故事</button>}
                {phase !== "question" && <button type="button" className="question-narration-skip" onClick={skipNarration}>跳过</button>}
              </div>
            )}
          </div>
        </section>

        {phase === "question" ? (
          <div className="answer-reveal storm-answer-reveal">
            <div className="question-heading"><span>QUESTION 8 · 当责任被推到你身上</span><p>{q.question}</p></div>
            <div className="question-options">{q.options.map((option) => (
              <button key={option.key} className="option" onClick={() => onChoose(option.key, option.text)}>
                <span className="option-key">{option.key}</span><span className="option-text">{option.text}</span><span className="option-arrow">›</span>
              </button>
            ))}</div>
          </div>
        ) : null}
      </div>
      <div className="progress-row question-progress"><div className="bar"><span style={{ width: "50%" }} /></div><span>1/2</span></div>
    </div>
  );
}

const Q9_BRANCH_BEATS = {
  A: [
    { key: "a-pause", segment: "q9-a-pause", duration: 2320, speaker: "旁白", meta: "风声慢慢低下去", line: "Lovera 沉默了一会儿。" },
    { key: "a-apology", segment: "q9-a-apology", duration: 3440, speaker: "Lovera", meta: "认真地承认", line: "嗯……刚才那句话确实不公平。" },
    { key: "a-repair", segment: "q9-a-repair", duration: 2320, speaker: "Lovera", meta: "向你靠近一点", line: "那我们重新想办法？" },
  ],
  B: [
    { key: "b-silence", segment: "q9-b-silence", duration: 3520, speaker: "旁白", meta: "缓慢修复", line: "两只小怪物默默坐在洞穴两边。" },
    { key: "b-fruit", segment: "q9-b-fruit", duration: 4480, speaker: "旁白", meta: "过了一会儿", line: "Lovera 把一颗星果推到你旁边。" },
    { key: "b-question", segment: "q9-b-question", duration: 1840, speaker: "Lovera", meta: "小心地问", line: "你还在生气吗？" },
  ],
  C: [
    { key: "c-walk", segment: "q9-c-walk", duration: 2640, speaker: "旁白", meta: "关系拉扯", line: "Lovera 真的转身走了两步。" },
    { key: "c-stop", segment: "q9-c-stop", duration: 2560, speaker: "旁白", meta: "却没有真的离开", line: "但又停下来。" },
    { key: "c-question", segment: "q9-c-question", duration: 2864, speaker: "Lovera", meta: "背对着你轻声问", line: "……你真的希望我自己走吗？" },
  ],
};

function Q9CinematicQuestion({ answers, onClose, onChoose, soundOn, onToggleSound, lastAnswerText }) {
  const q = QUESTIONS[9];
  const chapter = CHAPTERS.find((item) => item.id === 4);
  const branch = answers.Q8 || "B";
  const beats = Q9_BRANCH_BEATS[branch];
  const [phase, setPhase] = useState("branch");
  const [beatIndex, setBeatIndex] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [audioNeedsTap, setAudioNeedsTap] = useState(false);
  const [audioAttempt, setAudioAttempt] = useState(0);

  const activeBeat = beats[Math.min(beatIndex, beats.length - 1)];
  useEffect(() => {
    if (phase === "question") return undefined;
    const config = phase === "branch"
      ? activeBeat
      : { segment: "q9-question", duration: 3840 };
    if (!config) return undefined;

    let disposed = false;
    let progressTimer;
    let transitionTimer;
    let silentTimer;
    const finish = () => {
      if (disposed) return;
      setPhaseProgress(1);
      transitionTimer = window.setTimeout(() => {
        if (phase === "branch" && beatIndex < beats.length - 1) setBeatIndex((value) => value + 1);
        else if (phase === "branch") setPhase("lovera");
        else setPhase("question");
      }, phase === "lovera" ? 680 : 520);
    };

    setPhaseProgress(0);
    setAudioNeedsTap(false);
    if (soundOn) {
      void playStormCinematicTrack(config.segment, finish).then((playing) => {
        if (!disposed && !playing) setAudioNeedsTap(true);
      });
      progressTimer = window.setInterval(() => {
        const progress = getStormCinematicProgress(config.segment);
        if (progress > 0) setPhaseProgress(progress);
      }, 45);
    } else {
      const startedAt = performance.now();
      progressTimer = window.setInterval(() => {
        setPhaseProgress(Math.min(1, (performance.now() - startedAt) / config.duration));
      }, 45);
      silentTimer = window.setTimeout(finish, config.duration);
    }

    return () => {
      disposed = true;
      window.clearInterval(progressTimer);
      window.clearTimeout(transitionTimer);
      window.clearTimeout(silentTimer);
      clearPrologueNarrationListener(finish);
    };
  }, [activeBeat, audioAttempt, beatIndex, beats.length, phase, soundOn]);

  const closeQuestion = () => {
    stopLoveraNarration();
    onClose();
  };
  const handleSoundToggle = () => {
    stopLoveraNarration();
    onToggleSound();
  };
  const retryAudio = () => {
    setAudioNeedsTap(false);
    setAudioAttempt((value) => value + 1);
  };
  const skipNarration = () => {
    stopLoveraNarration();
    setAudioNeedsTap(false);
    setPhaseProgress(1);
    setPhase("question");
  };

  const currentLine = phase === "branch" ? activeBeat.line : q.question;
  const currentSpeaker = phase === "branch" ? activeBeat.speaker : "Lovera";
  const visibleChars = Math.ceil(currentLine.length * phaseProgress);
  const showFullLine = phase === "question";

  return (
    <div className="screen fade-in question-screen storm-question-screen q9-cinematic-screen">
      <Nav title={`${chapter.no} ${chapter.nameEn}`} onClose={closeQuestion} />
      <div className="scroll question-scroll storm-cinematic-scroll">
        <section
          className={`storm-cinematic-stage q9-repair-stage phase-${phase} branch-${branch.toLowerCase()} beat-${activeBeat.key}`}
          style={{ "--storm-time": `${phaseProgress * -1}s` }}
          aria-label="风暴后的洞穴里，你和 Lovera 根据刚才的选择尝试修复关系"
        >
          <div className="scene-toolbar storm-toolbar q9-toolbar">
            <span>✦ 风暴峡谷 · 避风洞穴</span>
            <button type="button" className={`sound-toggle ${soundOn ? "active" : ""}`} onClick={handleSoundToggle} aria-pressed={soundOn}>
              <span aria-hidden="true">{soundOn ? "🔊" : "🔇"}</span>{soundOn ? "声音开" : "声音关"}
            </button>
          </div>
          <div className="storm-scene q9-scene" aria-hidden="true">
            <div className="q9-after-rain" />
            <div className="q9-user-character">
              {lastAnswerText && <div className="q9-choice-bubble">{lastAnswerText}</div>}
              <img src={userPurpleFluffy} alt="" draggable="false" />
            </div>
            <div className="q9-lovera-character"><Mascot mood={branch === "A" ? "worry" : "idle"} size={98} /></div>
            <div className="q9-star-fruit">★</div>
            <div className="q9-repair-thread"><i /><i /><i /></div>
          </div>
          <div className={`storm-caption ${currentSpeaker === "Lovera" ? "lovera-caption" : "narrator-caption"}`} aria-live="polite">
            <div className="storm-caption-meta">
              <span>{currentSpeaker === "Lovera" ? "✦ Lovera" : "旁白"}</span>
              <i>{phase === "branch" ? activeBeat.meta : "三条路重新汇流"}</i>
            </div>
            <p>{currentSpeaker === "Lovera" ? "“" : ""}{showFullLine ? currentLine : currentLine.slice(0, visibleChars)}{currentSpeaker === "Lovera" ? "”" : ""}</p>
            {(audioNeedsTap || phase !== "question") && (
              <div className="storm-caption-actions">
                {audioNeedsTap && <button type="button" className="question-listen-prompt" onClick={retryAudio}><span>♪</span> 点一下，继续听这段故事</button>}
                {phase !== "question" && <button type="button" className="question-narration-skip" onClick={skipNarration}>跳过</button>}
              </div>
            )}
          </div>
        </section>

        {phase === "question" ? (
          <div className="answer-reveal storm-answer-reveal">
            <div className="question-heading"><span>QUESTION 9 · 你希望怎样重新靠近？</span><p>{q.question}</p></div>
            <div className="question-options">{q.options.map((option) => (
              <button key={option.key} className="option" onClick={() => onChoose(option.key, option.text)}>
                <span className="option-key">{option.key}</span><span className="option-text">{option.text}</span><span className="option-arrow">›</span>
              </button>
            ))}</div>
          </div>
        ) : null}
      </div>
      <div className="progress-row question-progress"><div className="bar"><span style={{ width: "100%" }} /></div><span>2/2</span></div>
    </div>
  );
}

const Q10_NARRATION_LINES = [
  "镜湖会展示一段“未来可能发生的关系”。",
  "湖面出现三个画面。你必须打碎一个。",
  "也就是说：哪一种关系，是你最不能接受的？",
];

const Q10_FUTURES = [
  { key: "A", kicker: "紧紧靠近", description: "很喜欢你，却想随时知道你的行踪", quote: "你在哪里？为什么没有回我？", icon: "⌖" },
  { key: "B", kicker: "永不争吵", description: "从不说出真正的想法", quote: "都可以。没什么。", icon: "≈" },
  { key: "C", kicker: "温柔失约", description: "对你很好，却一次次忘记承诺", quote: "下次不会了。", icon: "◇" },
];

function Q10CinematicQuestion({ onClose, onChoose, soundOn, onToggleSound }) {
  const q = QUESTIONS[10];
  const chapter = CHAPTERS.find((item) => item.id === 5);
  const [phase, setPhase] = useState("narration");
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [audioNeedsTap, setAudioNeedsTap] = useState(false);
  const [audioAttempt, setAudioAttempt] = useState(0);
  const [shattering, setShattering] = useState(null);
  const chooseTimer = useRef(null);

  const activeFutureIndex = phase === "futures"
    ? (phaseProgress < 0.36 ? 0 : phaseProgress < 0.7 ? 1 : 2)
    : -1;

  useEffect(() => {
    if (phase === "question" || phase === "shatter") return undefined;
    const config = phase === "narration"
      ? { segment: "q10-narration", duration: 11040, next: "futures", pause: 520 }
      : { segment: "q10-futures", duration: 6240, next: "question", pause: 680 };
    let disposed = false;
    let progressTimer;
    let transitionTimer;
    let silentTimer;
    const finish = () => {
      if (disposed) return;
      setPhaseProgress(1);
      transitionTimer = window.setTimeout(() => setPhase(config.next), config.pause);
    };

    setPhaseProgress(0);
    setAudioNeedsTap(false);
    if (soundOn) {
      void playMirrorCinematicTrack(config.segment, finish).then((playing) => {
        if (!disposed && !playing) setAudioNeedsTap(true);
      });
      progressTimer = window.setInterval(() => {
        const progress = getMirrorCinematicProgress(config.segment);
        if (progress > 0) setPhaseProgress(progress);
      }, 45);
    } else {
      const startedAt = performance.now();
      progressTimer = window.setInterval(() => setPhaseProgress(Math.min(1, (performance.now() - startedAt) / config.duration)), 45);
      silentTimer = window.setTimeout(finish, config.duration);
    }

    return () => {
      disposed = true;
      window.clearInterval(progressTimer);
      window.clearTimeout(transitionTimer);
      window.clearTimeout(silentTimer);
      clearPrologueNarrationListener(finish);
    };
  }, [audioAttempt, phase, soundOn]);

  useEffect(() => () => window.clearTimeout(chooseTimer.current), []);

  const closeQuestion = () => {
    stopLoveraNarration();
    window.clearTimeout(chooseTimer.current);
    onClose();
  };
  const handleSoundToggle = () => {
    stopLoveraNarration();
    onToggleSound();
  };
  const retryAudio = () => {
    setAudioNeedsTap(false);
    setAudioAttempt((value) => value + 1);
  };
  const skipNarration = () => {
    stopLoveraNarration();
    setAudioNeedsTap(false);
    setPhaseProgress(1);
    setPhase("question");
  };
  const chooseFuture = (option) => {
    if (shattering) return;
    stopLoveraNarration();
    setShattering(option.key);
    setPhase("shatter");
    chooseTimer.current = window.setTimeout(() => onChoose(option.key, option.text), 1280);
  };

  const narrationIndex = phaseProgress < 0.36 ? 0 : phaseProgress < 0.68 ? 1 : 2;
  const activeFuture = Q10_FUTURES[Math.max(0, activeFutureIndex)];

  return (
    <div className="screen fade-in question-screen mirror-question-screen q10-cinematic-screen">
      <Nav title={`${chapter.no} ${chapter.nameEn}`} onClose={closeQuestion} />
      <div className="scroll question-scroll mirror-cinematic-scroll">
        <section className={`mirror-cinematic-stage q10-mirror-stage phase-${phase} ${shattering ? `shatter-${shattering.toLowerCase()}` : ""}`} style={{ "--mirror-time": `${phaseProgress * -1}s` }}>
          <div className="scene-toolbar mirror-toolbar">
            <span>◌ 镜湖 · 未来倒影</span>
            <button type="button" className={`sound-toggle ${soundOn ? "active" : ""}`} onClick={handleSoundToggle} aria-pressed={soundOn}>
              <span aria-hidden="true">{soundOn ? "🔊" : "🔇"}</span>{soundOn ? "声音开" : "声音关"}
            </button>
          </div>
          <div className="mirror-scene" aria-hidden="true">
            <div className="mirror-water-ripples"><i /><i /><i /></div>
            {Q10_FUTURES.map((future, index) => (
              <div key={future.key} className={`future-mirror future-${future.key.toLowerCase()} ${activeFutureIndex === index ? "active" : ""} ${shattering === future.key ? "breaking" : ""}`}>
                <span className="future-mirror-icon">{future.icon}</span>
                <strong>{future.key}</strong>
                <i className="mirror-crack" />
                <b className="mirror-shard shard-one" /><b className="mirror-shard shard-two" /><b className="mirror-shard shard-three" />
              </div>
            ))}
            <div className="q10-user-character"><img src={userPurpleFluffy} alt="" draggable="false" /></div>
            <div className="q10-lovera-character"><Mascot mood={phase === "futures" ? "worry" : "idle"} size={88} /></div>
          </div>
          <div className={`mirror-caption ${phase === "futures" ? "lovera-caption" : "narrator-caption"}`} aria-live="polite">
            {phase === "narration" ? (
              <><div className="mirror-caption-meta"><span>旁白</span><i>湖面正在预演未来</i></div><p key={narrationIndex}>{Q10_NARRATION_LINES[narrationIndex]}</p></>
            ) : phase === "futures" ? (
              <><div className="mirror-caption-meta"><span>✦ 镜中的 Lovera</span><i>{activeFuture.kicker}</i></div><small>{activeFuture.description}</small><p key={activeFuture.key}>“{activeFuture.quote}”</p></>
            ) : phase === "shatter" ? (
              <><div className="mirror-caption-meta"><span>镜湖</span><i>你的选择击中了倒影</i></div><p>这段未来，在光里碎开了。</p></>
            ) : (
              <><div className="mirror-caption-meta"><span>镜湖</span><i>必须打碎其中一个</i></div><p>哪一种关系，是你最不能接受的？</p></>
            )}
            {(audioNeedsTap || (phase !== "question" && phase !== "shatter")) && (
              <div className="mirror-caption-actions">
                {audioNeedsTap && <button type="button" className="question-listen-prompt" onClick={retryAudio}><span>♪</span> 点一下，继续听这段故事</button>}
                {phase !== "question" && phase !== "shatter" && <button type="button" className="question-narration-skip" onClick={skipNarration}>跳过</button>}
              </div>
            )}
          </div>
        </section>

        {phase === "question" ? (
          <div className="answer-reveal mirror-answer-reveal">
            <div className="question-heading"><span>QUESTION 10 · 关系雷区</span><p>{q.question}</p></div>
            <div className="question-options mirror-options">{q.options.map((option) => (
              <button key={option.key} className="option" onClick={() => chooseFuture(option)}>
                <span className="option-key">{option.key}</span><span className="option-text">{option.text}</span><span className="option-arrow">×</span>
              </button>
            ))}</div>
          </div>
        ) : null}
      </div>
      <div className="progress-row question-progress"><div className="bar"><span style={{ width: "50%" }} /></div><span>1/2</span></div>
    </div>
  );
}

function Q11CinematicQuestion({ onClose, onChoose, soundOn, onToggleSound }) {
  const q = QUESTIONS[11];
  const chapter = CHAPTERS.find((item) => item.id === 5);
  const [phase, setPhase] = useState("arrival");
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [audioNeedsTap, setAudioNeedsTap] = useState(false);
  const [audioAttempt, setAudioAttempt] = useState(0);

  useEffect(() => {
    if (phase === "question") return undefined;
    const config = phase === "arrival"
      ? { segment: "q11-narration", duration: 3740, next: "lovera", pause: 580 }
      : { segment: "q11-lovera", duration: 6140, next: "question", pause: 720 };
    let disposed = false;
    let progressTimer;
    let transitionTimer;
    let silentTimer;
    const finish = () => {
      if (disposed) return;
      setPhaseProgress(1);
      transitionTimer = window.setTimeout(() => setPhase(config.next), config.pause);
    };

    setPhaseProgress(0);
    setAudioNeedsTap(false);
    if (soundOn) {
      void playMirrorCinematicTrack(config.segment, finish).then((playing) => {
        if (!disposed && !playing) setAudioNeedsTap(true);
      });
      progressTimer = window.setInterval(() => {
        const progress = getMirrorCinematicProgress(config.segment);
        if (progress > 0) setPhaseProgress(progress);
      }, 45);
    } else {
      const startedAt = performance.now();
      progressTimer = window.setInterval(() => setPhaseProgress(Math.min(1, (performance.now() - startedAt) / config.duration)), 45);
      silentTimer = window.setTimeout(finish, config.duration);
    }

    return () => {
      disposed = true;
      window.clearInterval(progressTimer);
      window.clearTimeout(transitionTimer);
      window.clearTimeout(silentTimer);
      clearPrologueNarrationListener(finish);
    };
  }, [audioAttempt, phase, soundOn]);

  const closeQuestion = () => {
    stopLoveraNarration();
    onClose();
  };
  const handleSoundToggle = () => {
    stopLoveraNarration();
    onToggleSound();
  };
  const retryAudio = () => {
    setAudioNeedsTap(false);
    setAudioAttempt((value) => value + 1);
  };
  const skipNarration = () => {
    stopLoveraNarration();
    setAudioNeedsTap(false);
    setPhaseProgress(1);
    setPhase("question");
  };
  const visibleChars = Math.ceil(q.question.length * phaseProgress);

  return (
    <div className="screen fade-in question-screen mirror-question-screen q11-cinematic-screen">
      <Nav title={`${chapter.no} ${chapter.nameEn}`} onClose={closeQuestion} />
      <div className="scroll question-scroll mirror-cinematic-scroll">
        <section className={`mirror-cinematic-stage q11-moon-stage phase-${phase}`} style={{ "--mirror-time": `${phaseProgress * -1}s` }}>
          <div className="scene-toolbar mirror-toolbar q11-toolbar">
            <span>☾ 月亮背面 · 休息处</span>
            <button type="button" className={`sound-toggle ${soundOn ? "active" : ""}`} onClick={handleSoundToggle} aria-pressed={soundOn}>
              <span aria-hidden="true">{soundOn ? "🔊" : "🔇"}</span>{soundOn ? "声音开" : "声音关"}
            </button>
          </div>
          <div className="moon-scene" aria-hidden="true">
            <div className="moon-stardust">{Array.from({ length: 9 }, (_, index) => <i key={index} />)}</div>
            <div className="moon-hanging-crystals"><i>◇</i><i>✦</i><i>◇</i></div>
            <div className="moon-seat-glow" />
            <div className="q11-user-character"><img src={userPurpleFluffy} alt="" draggable="false" /></div>
            <div className="q11-lovera-character"><Mascot mood={phase === "lovera" || phase === "question" ? "worry" : "idle"} size={94} /></div>
            <div className="moon-connection-thread"><i /><i /><i /></div>
          </div>
          <div className={`mirror-caption ${phase === "arrival" ? "narrator-caption" : "lovera-caption"}`} aria-live="polite">
            {phase === "arrival" ? (
              <><div className="mirror-caption-meta"><span>旁白</span><i>镜湖留在身后</i></div><p>穿过镜湖以后，你们坐在月亮背面休息。</p></>
            ) : (
              <><div className="mirror-caption-meta"><span>✦ Lovera</span><i>忽然认真地看向你</i></div><p>“{phase === "question" ? q.question : q.question.slice(0, visibleChars)}”</p></>
            )}
            {(audioNeedsTap || phase !== "question") && (
              <div className="mirror-caption-actions">
                {audioNeedsTap && <button type="button" className="question-listen-prompt" onClick={retryAudio}><span>♪</span> 点一下，继续听这段故事</button>}
                {phase !== "question" && <button type="button" className="question-narration-skip" onClick={skipNarration}>跳过</button>}
              </div>
            )}
          </div>
        </section>

        {phase === "question" ? (
          <div className="answer-reveal mirror-answer-reveal moon-answer-reveal">
            <div className="question-heading"><span>QUESTION 11 · 隐藏需求</span><p>如果你没有说出口，希望 Lovera 怎样发现？</p></div>
            <div className="question-options">{q.options.map((option) => (
              <button key={option.key} className="option" onClick={() => onChoose(option.key, option.text)}>
                <span className="option-key">{option.key}</span><span className="option-text">{option.text}</span><span className="option-arrow">›</span>
              </button>
            ))}</div>
          </div>
        ) : null}
      </div>
      <div className="progress-row question-progress"><div className="bar"><span style={{ width: "100%" }} /></div><span>2/2</span></div>
    </div>
  );
}

const PROMISE_STORIES = {
  12: {
    place: "双生浮岛 · 心星裂谷",
    aria: "双生浮岛在你和 Lovera 脚下裂开，两颗心星隔着裂谷彼此发光",
    prompt: "QUESTION 12 · 当承诺改变两个人的航线",
    waiting: "两座岛正在分开，请看着两颗心星……",
    beats: [
      { key: "arrival", segment: "q12-arrival", duration: 1760, pause: 420, speaker: "旁白", meta: "旅程即将抵达", line: "你们终于接近终点。" },
      { key: "split", segment: "q12-split", duration: 3200, pause: 520, speaker: "旁白", meta: "脚下传来一道震动", line: "但脚下的浮岛突然裂成两半。" },
      { key: "guardian", segment: "q12-guardian", duration: 9920, pause: 560, speaker: "旁白", meta: "守岛怪发出回声", line: "守岛怪告诉你们：“从这里开始，你们可能会去往不同的地方。如果想继续一起旅行，需要把两颗心星连起来。”" },
      { key: "link", segment: "q12-link", duration: 4640, pause: 620, speaker: "旁白", meta: "两颗心星开始呼应", line: "一旦连起来，以后无论飞到哪座岛，都会知道彼此的位置。" },
      { key: "lovera", segment: "q12-lovera", duration: 880, pause: 720, speaker: "Lovera", meta: "看着你，轻声问", line: "你愿意吗？" },
    ],
  },
  13: {
    place: "双生浮岛 · 远方来信",
    aria: "一颗来自云鲸岛的星星飞到 Lovera 手中，展开成为守灯人邀请函",
    prompt: "QUESTION 13 · 当彼此的未来指向远方",
    waiting: "远方的星星正在飞向 Lovera……",
    beats: [
      { key: "star", segment: "q13-star", duration: 3360, pause: 460, speaker: "旁白", meta: "天边出现一颗星", line: "Lovera 突然收到一颗来自远方的星星。" },
      { key: "invite", segment: "q13-invite", duration: 4560, pause: 540, speaker: "旁白", meta: "星光在掌心展开", line: "那是一张邀请函：“云鲸岛正在寻找新的守灯人。”" },
      { key: "dream", segment: "q13-dream", duration: 2560, pause: 520, speaker: "旁白", meta: "远方的灯塔亮了起来", line: "这是 Lovera 一直想去的地方。" },
      { key: "distance", segment: "q13-distance", duration: 4480, pause: 650, speaker: "旁白", meta: "两座岛之间升起云雾", line: "可是，一旦 TA 去了，你们会很久见不到彼此。" },
      { key: "lovera", segment: "q13-lovera", duration: 1200, pause: 760, speaker: "Lovera", meta: "握着邀请函，小心地问", line: "你希望我去吗？" },
    ],
  },
};

function PromiseCinematicQuestion({ qid, onClose, onChoose, soundOn, onToggleSound }) {
  const q = QUESTIONS[qid];
  const chapter = CHAPTERS.find((item) => item.id === 6);
  const story = PROMISE_STORIES[qid];
  const [beatIndex, setBeatIndex] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [questionReady, setQuestionReady] = useState(false);
  const [audioNeedsTap, setAudioNeedsTap] = useState(false);
  const [audioAttempt, setAudioAttempt] = useState(0);
  const activeBeat = story.beats[Math.min(beatIndex, story.beats.length - 1)];

  useEffect(() => {
    if (questionReady) return undefined;
    let disposed = false;
    let progressTimer;
    let transitionTimer;
    let silentTimer;
    const finish = () => {
      if (disposed) return;
      setPhaseProgress(1);
      transitionTimer = window.setTimeout(() => {
        if (beatIndex < story.beats.length - 1) setBeatIndex((value) => value + 1);
        else setQuestionReady(true);
      }, activeBeat.pause);
    };

    setPhaseProgress(0);
    setAudioNeedsTap(false);
    if (soundOn) {
      void playPromiseCinematicTrack(activeBeat.segment, finish).then((playing) => {
        if (!disposed && !playing) setAudioNeedsTap(true);
      });
      progressTimer = window.setInterval(() => {
        const progress = getPromiseCinematicProgress(activeBeat.segment);
        if (progress > 0) setPhaseProgress(progress);
      }, 45);
    } else {
      const startedAt = performance.now();
      progressTimer = window.setInterval(() => {
        setPhaseProgress(Math.min(1, (performance.now() - startedAt) / activeBeat.duration));
      }, 45);
      silentTimer = window.setTimeout(finish, activeBeat.duration);
    }

    return () => {
      disposed = true;
      window.clearInterval(progressTimer);
      window.clearTimeout(transitionTimer);
      window.clearTimeout(silentTimer);
      clearPrologueNarrationListener(finish);
    };
  }, [activeBeat, audioAttempt, beatIndex, questionReady, soundOn, story.beats.length]);

  const closeQuestion = () => {
    stopLoveraNarration();
    onClose();
  };
  const handleSoundToggle = () => {
    stopLoveraNarration();
    onToggleSound();
  };
  const retryAudio = () => {
    setAudioNeedsTap(false);
    setAudioAttempt((value) => value + 1);
  };
  const skipNarration = () => {
    stopLoveraNarration();
    setAudioNeedsTap(false);
    setPhaseProgress(1);
    setBeatIndex(story.beats.length - 1);
    setQuestionReady(true);
  };

  const line = activeBeat.line;
  const visibleChars = Math.max(1, Math.ceil(line.length * phaseProgress));
  const isLovera = activeBeat.speaker === "Lovera";
  const phaseClass = questionReady ? "phase-question" : `beat-${activeBeat.key}`;

  return (
    <div className={`screen fade-in question-screen promise-question-screen q${qid}-cinematic-screen`}>
      <Nav title={`${chapter.no} ${chapter.nameEn}`} onClose={closeQuestion} />
      <div className="scroll question-scroll promise-cinematic-scroll">
        <section
          className={`promise-cinematic-stage q${qid}-promise-stage ${phaseClass}`}
          style={{ "--promise-time": `${phaseProgress * -1}s` }}
          aria-label={story.aria}
        >
          <div className="scene-toolbar promise-toolbar">
            <span>◇ {story.place}</span>
            <button type="button" className={`sound-toggle ${soundOn ? "active" : ""}`} onClick={handleSoundToggle} aria-pressed={soundOn}>
              <span aria-hidden="true">{soundOn ? "🔊" : "🔇"}</span>{soundOn ? "声音开" : "声音关"}
            </button>
          </div>

          <div className="promise-scene" aria-hidden="true">
            <div className="promise-island-layer island-left" />
            <div className="promise-island-layer island-right" />
            <div className="promise-sun-bloom" />
            <div className="promise-cloud-motes">{Array.from({ length: 12 }, (_, index) => <i key={index} />)}</div>
            <div className="promise-rift"><i /><i /></div>
            <div className="promise-heart heart-left">♥</div>
            <div className="promise-heart heart-right">♥</div>
            <div className="promise-link-thread"><i /><i /><i /></div>
            <div className="promise-guardian"><span>◉</span><i>守岛怪</i></div>
            <div className="promise-user-character"><img src={userPurpleFluffy} alt="" draggable="false" /></div>
            <div className="promise-lovera-character"><Mascot mood={isLovera || qid === 13 ? "worry" : "idle"} size={92} /></div>
            <div className="promise-flying-star">✦<i /></div>
            <div className="promise-invitation"><span>✦</span><strong>云鲸岛</strong><small>守灯人邀请函</small></div>
            <div className="promise-beacon"><i /><span>云鲸岛</span></div>
            <div className="promise-distance-fog" />
          </div>

          <div className={`promise-caption ${isLovera ? "lovera-caption" : "narrator-caption"}`} aria-live="polite">
            <div className="promise-caption-meta"><span>{isLovera ? "✦ Lovera" : "旁白"}</span><i>{activeBeat.meta}</i></div>
            <p key={`${qid}-${beatIndex}`}>{isLovera ? "“" : ""}{questionReady ? line : line.slice(0, visibleChars)}{isLovera ? "”" : ""}</p>
            {(audioNeedsTap || !questionReady) && (
              <div className="promise-caption-actions">
                {audioNeedsTap && <button type="button" className="question-listen-prompt" onClick={retryAudio}><span>♪</span> 点一下，继续听这段故事</button>}
                {!questionReady && <button type="button" className="question-narration-skip" onClick={skipNarration}>跳过</button>}
              </div>
            )}
          </div>
        </section>

        {questionReady ? (
          <div className="answer-reveal promise-answer-reveal">
            <div className="question-heading"><span>{story.prompt}</span><p>{q.question}</p></div>
            <div className="question-options">{q.options.map((option) => (
              <button key={option.key} className="option" onClick={() => onChoose(option.key, option.text)}>
                <span className="option-key">{option.key}</span><span className="option-text">{option.text}</span><span className="option-arrow">›</span>
              </button>
            ))}</div>
          </div>
        ) : null}
      </div>
      <div className="progress-row question-progress"><div className="bar"><span style={{ width: qid === 12 ? "50%" : "100%" }} /></div><span>{qid === 12 ? "1/2" : "2/2"}</span></div>
    </div>
  );
}

const Q14_STORY_BEATS = [
  { key: "exit", segment: "q14-exit", duration: 2720, speaker: "旁白", meta: "旅程的尽头", line: "你们终于找到心之群岛的出口。" },
  { key: "flowers", segment: "q14-flowers", duration: 3200, speaker: "旁白", meta: "三种力量同时苏醒", line: "门前长着三朵很奇怪的花。" },
  { key: "guardian", segment: "q14-guardian", duration: 4720, speaker: "守门怪", meta: "出口的规则", line: "只能带走一朵。它会变成你未来旅伴身上最重要的力量。" },
  { key: "lovera", segment: "q14-lovera", duration: 6000, speaker: "Lovera", meta: "轻声问你", line: "如果只能带走一朵，你最希望未来的旅伴拥有哪一种力量？" },
];

function Q14CinematicQuestion({ onClose, onChoose, soundOn, onToggleSound }) {
  const q = QUESTIONS[14];
  const chapter = CHAPTERS.find((item) => item.id === 7);
  const [phase, setPhase] = useState("story");
  const [beatIndex, setBeatIndex] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [audioNeedsTap, setAudioNeedsTap] = useState(false);
  const [audioAttempt, setAudioAttempt] = useState(0);
  const activeBeat = Q14_STORY_BEATS[Math.min(beatIndex, Q14_STORY_BEATS.length - 1)];

  useEffect(() => {
    if (phase === "question") return undefined;

    let disposed = false;
    let progressTimer;
    let transitionTimer;
    let silentTimer;
    const finish = () => {
      if (disposed) return;
      setPhaseProgress(1);
      transitionTimer = window.setTimeout(() => {
        if (beatIndex < Q14_STORY_BEATS.length - 1) setBeatIndex((value) => value + 1);
        else setPhase("question");
      }, activeBeat.key === "lovera" ? 760 : 520);
    };

    setPhaseProgress(0);
    setAudioNeedsTap(false);
    if (soundOn) {
      void playFutureLandCinematicTrack(activeBeat.segment, finish).then((playing) => {
        if (!disposed && !playing) setAudioNeedsTap(true);
      });
      progressTimer = window.setInterval(() => {
        const progress = getFutureLandCinematicProgress(activeBeat.segment);
        if (progress > 0) setPhaseProgress(progress);
      }, 45);
    } else {
      const startedAt = performance.now();
      progressTimer = window.setInterval(() => {
        setPhaseProgress(Math.min(1, (performance.now() - startedAt) / activeBeat.duration));
      }, 45);
      silentTimer = window.setTimeout(finish, activeBeat.duration);
    }

    return () => {
      disposed = true;
      window.clearInterval(progressTimer);
      window.clearTimeout(transitionTimer);
      window.clearTimeout(silentTimer);
      clearPrologueNarrationListener(finish);
    };
  }, [activeBeat, audioAttempt, beatIndex, phase, soundOn]);

  const closeQuestion = () => {
    stopLoveraNarration();
    onClose();
  };
  const handleSoundToggle = () => {
    stopLoveraNarration();
    onToggleSound();
  };
  const retryAudio = () => {
    setAudioNeedsTap(false);
    setAudioAttempt((value) => value + 1);
  };
  const skipNarration = () => {
    stopLoveraNarration();
    setAudioNeedsTap(false);
    setPhaseProgress(1);
    setBeatIndex(Q14_STORY_BEATS.length - 1);
    setPhase("question");
  };

  const visibleCharacters = Math.ceil(activeBeat.line.length * phaseProgress);
  const displayedLine = phase === "question" ? activeBeat.line : activeBeat.line.slice(0, visibleCharacters);
  const isDialogue = activeBeat.speaker !== "旁白";
  return (
    <div className="screen fade-in question-screen future-question-screen q14-cinematic-screen">
      <Nav title={`${chapter.no} ${chapter.nameEn}`} onClose={closeQuestion} />
      <div className="scroll question-scroll future-land-scroll">
        <section className={`future-land-stage phase-${phase} beat-${activeBeat.key}`} aria-label="你和 Lovera 抵达未来花园的出口，在三朵花中选择未来旅伴最重要的力量">
          <div className="scene-toolbar future-land-toolbar">
            <span>✦ 未来花园 · 最后一块拼图</span>
            <button type="button" className={`sound-toggle ${soundOn ? "active" : ""}`} onClick={handleSoundToggle} aria-pressed={soundOn}>
              <span aria-hidden="true">{soundOn ? "🔊" : "🔇"}</span>{soundOn ? "声音开" : "声音关"}
            </button>
          </div>

          <div className="future-land-scene" aria-hidden="true">
            <div className="q14-camera-light" />
            <div className="q14-portal-glow"><i>♥</i></div>
            <div className="q14-light-motes">{Array.from({ length: 14 }, (_, index) => <i key={index} />)}</div>
            <div className="q14-flower-aura flower-warm"><i /><span>暖光</span></div>
            <div className="q14-flower-aura flower-wind"><i /><span>风铃</span></div>
            <div className="q14-flower-aura flower-together"><i /><span>共生</span></div>
            <div className="q14-guardian-focus"><i /><span>守门怪</span></div>
            <div className="q14-user-character"><img src={userPurpleFluffy} alt="" draggable="false" /></div>
            <div className="q14-lovera-character"><Mascot mood="happy" size={76} /></div>
            <div className="q14-heart-thread"><i /><i /><i /></div>
          </div>

          <div className={`future-land-caption ${isDialogue ? "dialogue-caption" : "narrator-caption"}`} aria-live="polite">
            <div className="future-land-caption-meta">
              <span>{activeBeat.speaker === "Lovera" ? "✦ Lovera" : activeBeat.speaker}</span>
              <div className="q14-beat-dots" aria-label={`故事进度 ${beatIndex + 1}/4`}>
                {Q14_STORY_BEATS.map((beat, index) => <i key={beat.key} className={index <= beatIndex ? "active" : ""} />)}
              </div>
              <em>{activeBeat.meta}</em>
            </div>
            <p key={`${activeBeat.key}-${phase}`}>
              {isDialogue ? "“" : ""}{displayedLine}{isDialogue ? "”" : ""}
              {phase !== "question" && phaseProgress < 1 && <span className="narration-cursor" />}
            </p>
            {phase !== "question" && (
              <div className="future-land-caption-actions">
                {audioNeedsTap && <button type="button" className="question-listen-prompt" onClick={retryAudio}><span>♪</span> 点一下，继续听这段故事</button>}
                <button type="button" className="question-narration-skip" onClick={skipNarration}>跳过</button>
              </div>
            )}
          </div>
        </section>

        {phase === "question" ? (
          <div className="answer-reveal future-land-answer-reveal">
            <div className="question-heading"><span>QUESTION 14 · 最后一块拼图</span><p>{q.question}</p></div>
            <div className="question-options">{q.options.map((option) => (
              <button key={option.key} className="option future-land-option" data-flower={option.key.toLowerCase()} onClick={() => onChoose(option.key, option.text)}>
                <span className="option-key">{option.key}</span><span className="option-text">{option.text}</span><span className="option-arrow">›</span>
              </button>
            ))}</div>
          </div>
        ) : null}
      </div>
      <div className="progress-row question-progress"><div className="bar"><span style={{ width: "100%" }} /></div><span>1/1</span></div>
    </div>
  );
}

export function QuestionScreen(props) {
  if (props.qid === 1) return <Q1CinematicQuestion {...props} />;
  if (props.qid === 2) return <Q2CinematicQuestion {...props} />;
  if (props.qid === 3) return <Q3CinematicQuestion {...props} />;
  if (props.qid === 4) return <Q4CinematicQuestion {...props} />;
  if (props.qid === 5) return <Q5CinematicQuestion {...props} />;
  if (props.qid === 6) return <Q6CinematicQuestion {...props} />;
  if (props.qid === 8) return <Q8CinematicQuestion {...props} />;
  if (props.qid === 9) return <Q9CinematicQuestion {...props} />;
  if (props.qid === 10) return <Q10CinematicQuestion {...props} />;
  if (props.qid === 11) return <Q11CinematicQuestion {...props} />;
  if (props.qid === 12 || props.qid === 13) return <PromiseCinematicQuestion key={props.qid} {...props} />;
  if (props.qid === 14) return <Q14CinematicQuestion {...props} />;
  return <StandardQuestionScreen {...props} />;
}

function StandardQuestionScreen({
  qid,
  answers,
  onClose,
  onChoose,
  soundOn,
  onToggleSound,
  lastAnswerText,
}) {
  const q = QUESTIONS[qid];
  const extra = qid === 7 ? getQ7Scene(answers.Q6) : null;
  const scene = extra?.scene || q.scene;
  const question = extra?.question || q.question;
  const chapter = CHAPTERS.find((c) => c.id === q.chapter);
  const localIndex = chapter.questions.indexOf(qid) + 1;
  const [typedQuestion, setTypedQuestion] = useState("");
  const [typingComplete, setTypingComplete] = useState(false);
  const [speechComplete, setSpeechComplete] = useState(true);
  const [audioNeedsTap, setAudioNeedsTap] = useState(false);
  const [narrationAttempt, setNarrationAttempt] = useState(0);

  useEffect(() => {
    if (soundOn) return undefined;
    let index = 0;
    let interval;
    setTypedQuestion("");
    setTypingComplete(false);

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setTypedQuestion(question);
      setTypingComplete(true);
      return undefined;
    }

    const start = window.setTimeout(() => {
      interval = window.setInterval(() => {
        index += 1;
        setTypedQuestion(question.slice(0, index));
        if (index >= question.length) {
          window.clearInterval(interval);
          setTypingComplete(true);
        }
      }, 42);
    }, 360);

    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
    };
  }, [qid, question, soundOn]);

  useEffect(() => {
    if (!soundOn) {
      setSpeechComplete(true);
      return undefined;
    }

    let disposed = false;
    let progressTimer;
    setTypedQuestion("");
    setTypingComplete(false);
    setSpeechComplete(false);
    setAudioNeedsTap(false);

    const finishQuestionNarration = () => {
      if (disposed) return;
      setTypedQuestion(question);
      setTypingComplete(true);
      setSpeechComplete(true);
    };

    void playQuestionNarration(qid, answers, finishQuestionNarration).then((playing) => {
      if (!disposed && !playing) setAudioNeedsTap(true);
    });

    progressTimer = window.setInterval(() => {
      const progress = getQuestionNarrationProgress(qid, answers);
      if (progress > 0) {
        const visibleCharacters = Math.min(
          question.length,
          Math.max(1, Math.ceil(question.length * progress)),
        );
        setTypedQuestion(question.slice(0, visibleCharacters));
      }
    }, 42);

    return () => {
      disposed = true;
      window.clearInterval(progressTimer);
      clearPrologueNarrationListener(finishQuestionNarration);
    };
  }, [answers, narrationAttempt, qid, question, soundOn]);

  const handleQuestionSoundToggle = () => {
    if (soundOn) {
      stopLoveraNarration();
    } else {
      void playQuestionNarration(qid, answers);
    }
    onToggleSound();
  };

  const retryQuestionNarration = () => {
    setAudioNeedsTap(false);
    void playQuestionNarration(qid, answers);
    setNarrationAttempt((value) => value + 1);
  };

  const skipQuestionNarration = () => {
    stopLoveraNarration();
    setAudioNeedsTap(false);
    setTypedQuestion(question);
    setTypingComplete(true);
    setSpeechComplete(true);
  };

  const closeQuestion = () => {
    stopLoveraNarration();
    onClose();
  };

  const dialogueComplete = typingComplete && speechComplete;

  return (
    <div className={`screen fade-in question-screen question-chapter-${chapter.id}`}>
      <Nav title={`${chapter.no} ${chapter.nameEn}`} onClose={closeQuestion} />
      <div className="scroll question-scroll">
        <div className="question-scene-card">
          <div className="scene-toolbar">
            <span>✦ {chapter.nameZh} · STORY</span>
            <button
              type="button"
              className={`sound-toggle ${soundOn ? "active" : ""}`}
              onClick={handleQuestionSoundToggle}
              aria-pressed={soundOn}
              aria-label={soundOn ? "关闭 Lovera 语音" : "打开 Lovera 语音"}
            >
              <span aria-hidden="true">{soundOn ? "🔊" : "🔇"}</span>
              {soundOn ? "语音开" : "语音关"}
            </button>
          </div>
          <p className="scene-narration">{scene}</p>
          <div className="scene-characters">
            <div className="lora-at-gate">
              <Mascot mood={qid === 8 ? "worry" : "idle"} size={88} />
              <span>Lovera</span>
            </div>
            <div className="user-in-scene">
              {lastAnswerText && <div className="user-answer-bubble">{lastAnswerText}</div>}
              <img src={userPurpleFluffy} alt="代表你的紫色毛球" draggable="false" />
              <span>你</span>
            </div>
          </div>
          <div className={`lora-dialogue ${dialogueComplete ? "complete" : "typing"}`}>
            <div className="dialogue-meta">
              <span><i /> Lovera</span>
              <span>{dialogueComplete ? "说完啦" : "正在和你说话…"}</span>
            </div>
            <p>
              {typedQuestion}
              {!typingComplete && <span className="typing-cursor" aria-hidden="true" />}
            </p>
            {audioNeedsTap && (
              <button type="button" className="question-listen-prompt" onClick={retryQuestionNarration}>
                <span aria-hidden="true">♪</span> 点一下，听 Lovera 说话
              </button>
            )}
            {!dialogueComplete && (
              <button type="button" className="question-narration-skip" onClick={skipQuestionNarration}>跳过</button>
            )}
          </div>
        </div>
        {dialogueComplete ? (
          <div className="answer-reveal">
            <div className="question-heading">
              <span>QUESTION {localIndex} · 轮到你回应</span>
              <p>选择此刻最接近你真实感受的答案</p>
            </div>
            <div className="question-options">
              {q.options.map((opt) => (
                <button key={opt.key} className="option" onClick={() => onChoose(opt.key, opt.text)}>
                  <span className="option-key">{opt.key}</span>
                  <span className="option-text">{opt.text}</span>
                  <span className="option-arrow" aria-hidden="true">›</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="waiting-response">
            <span />
            听 Lovera 把话说完，选项就会出现
          </div>
        )}
      </div>
      <div className="progress-row question-progress">
        <div className="bar">
          <span style={{ width: `${(localIndex / chapter.questions.length) * 100}%` }} />
        </div>
        <span>
          {localIndex}/{chapter.questions.length}
        </span>
      </div>
    </div>
  );
}

const PUZZLE_DETAILS = {
  heartbeat: { icon: "♥", description: "理解你的心动触发点", position: "piece-top" },
  promise: { icon: "♫", description: "探索你的长期观念", position: "piece-upper-left" },
  express: { icon: "•••", description: "发现你的沟通语言", position: "piece-upper-right" },
  distance: { icon: "●●", description: "了解你的关系节奏", position: "piece-lower-left" },
  security: { icon: "✦", description: "找到让你安心的支柱", position: "piece-lower-right" },
  conflict: { icon: "♧", description: "理解你的和解方式", position: "piece-bottom" },
};

export function PuzzleScreen({ answers, onBack, onShare }) {
  const done = Object.keys(answers).length;
  return (
    <div className="screen fade-in puzzle-gallery-screen">
      <div className="puzzle-atmosphere" aria-hidden="true">
        <span className="puzzle-sparkle sparkle-one">✦</span>
        <span className="puzzle-sparkle sparkle-two">✦</span>
        <span className="puzzle-sparkle sparkle-three">·</span>
        <span className="puzzle-cloud cloud-left" />
        <span className="puzzle-cloud cloud-right" />
      </div>

      <div className="puzzle-topbar">
        <button className="puzzle-round-button" onClick={onBack} aria-label="返回">
          <BackIcon />
        </button>
        <button className="puzzle-round-button" onClick={onShare} aria-label="分享拼图">
          <ShareIcon />
        </button>
      </div>

      <header className="puzzle-heading">
        <h1>Your Puzzle Pieces</h1>
        <div className="puzzle-ornament" aria-hidden="true"><span /> ✦ ♥ ✦ <span /></div>
        <p>每一块被点亮的拼图，<br />都是你更了解自己的一小步。</p>
      </header>

      <div className="puzzle-orbit">
        <svg className="puzzle-orbit-lines" viewBox="0 0 360 430" aria-hidden="true">
          <circle cx="180" cy="216" r="122" />
          <circle className="orbit-inner" cx="180" cy="216" r="80" />
          <path d="M180 94V72 M74 155L55 143 M286 155L305 143 M74 277L55 289 M286 277L305 289 M180 338V360" />
          {["180,94", "74,155", "286,155", "74,277", "286,277", "180,338"].map((point) => {
            const [cx, cy] = point.split(",");
            return <circle key={point} className="orbit-node" cx={cx} cy={cy} r="3.4" />;
          })}
        </svg>

        <div className="puzzle-center-companion">
          <span className="puzzle-center-halo" aria-hidden="true" />
          <img src={loraWavingFluffy} alt="Lovera 陪你收集恋爱拼图" draggable="false" />
          <span className="puzzle-center-label">陪你一起探索</span>
        </div>

        {PETALS.map((piece, index) => {
          const detail = PUZZLE_DETAILS[piece.id];
          const answered = piece.qs.filter((id) => answers[`Q${id}`]).length;
          const lit = answered === piece.qs.length;
          const discovering = answered > 0 && !lit;
          return (
            <article
              key={piece.id}
              data-piece={piece.id}
              className={`puzzle-piece-card ${detail.position} ${lit ? "lit" : "locked"} ${discovering ? "discovering" : ""}`}
              style={{ "--piece-delay": `${index * 70}ms` }}
              aria-label={`${piece.label}，${lit ? "已点亮" : discovering ? "探索中" : "待探索"}`}
            >
              <div className="puzzle-piece-icon" aria-hidden="true">
                <span>{detail.icon}</span>
              </div>
              <h2>{piece.label}</h2>
              <p>{detail.description}</p>
              <div className="piece-state">
                {lit ? <><i /> 已点亮</> : discovering ? `${answered}/${piece.qs.length} 探索中` : "等待发现"}
              </div>
            </article>
          );
        })}
      </div>

      <footer className="puzzle-collection-card">
        <div className="puzzle-progress-copy">
          <span>Pieces Collected</span>
          <strong>{done}/14</strong>
        </div>
        <div className="puzzle-progress-track" aria-label={`已收集 ${done}/14`}>
          <span style={{ width: `${(done / 14) * 100}%` }} />
        </div>
        <p>{done === 14 ? "所有拼图都亮起来了，你已经走完这段旅程。" : `再收集 ${14 - done} 块，就能看见更完整的自己。`}</p>
      </footer>
    </div>
  );
}

export function ChatScreen({ messages, draft, setDraft, onBack, onSend, isReplying }) {
  const chatScrollRef = useRef(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const container = chatScrollRef.current;
      if (container) container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isReplying, messages]);

  return (
    <div className="screen fade-in lovera-chat-screen">
      <div className="lovera-chat-ambient" aria-hidden="true">
        <span>✦</span><span>·</span><span>♥</span><span>✦</span>
      </div>
      <Nav title="" onBack={onBack} />
      <header className="lovera-chat-heading">
        <span>HEART ISLANDS</span>
        <h1>Lovera</h1>
        <div aria-hidden="true"><i />♥<i /></div>
        <p>你的心灵旅伴</p>
      </header>
      <div className="lovera-chat-thread scroll" ref={chatScrollRef} aria-live="polite">
        {messages.map((m, i) => (
          <div key={`${m.role}-${i}`} className={`chat-message-row ${m.role}`}>
            {m.role === "lora" && (
              <div className="chat-lovera-avatar" aria-hidden="true"><Mascot mood="happy" size={42} /></div>
            )}
            <div className={`chat-bubble ${m.role}`}>
              <div className="chat-message-meta">
                <strong>{m.role === "lora" ? "Lovera" : "你"}</strong>
                <time>{m.time || "旅途中"}</time>
              </div>
              <p>{m.text}</p>
            </div>
          </div>
        ))}
        {isReplying && (
          <div className="chat-message-row lora chat-is-typing">
            <div className="chat-lovera-avatar" aria-hidden="true"><Mascot mood="idle" size={42} /></div>
            <div className="chat-bubble lora">
              <div className="chat-message-meta"><strong>Lovera</strong><time>正在听你说</time></div>
              <div className="chat-typing-dots" aria-label="Lovera 正在回复"><i /><i /><i /></div>
            </div>
          </div>
        )}
      </div>
      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="和 Lovera 说点什么……"
          maxLength={600}
          disabled={isReplying}
        />
        <button type="submit" className="mic" aria-label="发送消息" disabled={isReplying || !draft.trim()}>
          ✦
        </button>
      </form>
    </div>
  );
}

const POEM_BLOCK_LABELS = {
  opening: "序章",
  core_longing: "核心渴望",
  relationship_need: "相处方式",
  tension: "内在张力",
  red_line: "关系边界",
  growth_edge: "风暴之后",
  closing: "Lovera 的话",
};

const POEM_LINE_PAUSE = {
  soft: 900,
  normal: 1120,
  accent: 1380,
  hero: 1780,
};

function getPoemLinePause(line, isBlockEnd) {
  const emphasis = line.emphasis || "normal";
  const readingTime = Math.min(380, Math.max(120, line.text.length * 17));
  return (POEM_LINE_PAUSE[emphasis] || POEM_LINE_PAUSE.normal)
    + readingTime
    + (isBlockEnd ? 360 : 0);
}

function renderPoemText(text, phrases = []) {
  const phrase = phrases.find((item) => text.includes(item));
  if (!phrase) return text;
  const start = text.indexOf(phrase);
  return (
    <>
      {text.slice(0, start)}
      <mark>{phrase}</mark>
      {text.slice(start + phrase.length)}
    </>
  );
}

export function PersonalityResult({ profile, view = "cover", onBack, onOpenPoem, onDetails }) {
  const m = profile.modules;
  const poemBlocks = profile.poem_blocks || [];
  const poemLines = poemBlocks.flatMap((block, blockIndex) =>
    block.lines.map((line, lineIndex) => ({ block, blockIndex, line, lineIndex })),
  );
  const [visibleLineCount, setVisibleLineCount] = useState(0);
  const [showFullPoem, setShowFullPoem] = useState(false);
  const poemScrollRef = useRef(null);
  const isComplete = visibleLineCount >= poemLines.length;
  const lastVisibleLine = poemLines[Math.max(0, visibleLineCount - 1)];
  const currentBlock = lastVisibleLine ? lastVisibleLine.blockIndex + 1 : 1;

  useEffect(() => {
    if (view !== "poem") {
      setVisibleLineCount(0);
      setShowFullPoem(false);
      return undefined;
    }
    if (showFullPoem) {
      setVisibleLineCount(poemLines.length);
      return undefined;
    }
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || poemLines.length === 0) {
      setVisibleLineCount(poemLines.length);
      setShowFullPoem(true);
      return undefined;
    }

    setVisibleLineCount(0);
    let elapsed = 620;
    const timers = poemLines.map(({ block, line, lineIndex }, index) => {
      const timer = window.setTimeout(() => setVisibleLineCount(index + 1), elapsed);
      elapsed += getPoemLinePause(line, lineIndex === block.lines.length - 1);
      return timer;
    });
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [profile.draft_poem, showFullPoem, view]);

  useEffect(() => {
    if (view !== "poem" || visibleLineCount < 2 || !poemScrollRef.current) return;
    const frame = window.requestAnimationFrame(() => {
      const container = poemScrollRef.current;
      const visibleLines = container?.querySelectorAll(".insight-line.is-visible");
      const latestLine = visibleLines?.[visibleLines.length - 1];
      if (!container || !latestLine) return;
      const containerRect = container.getBoundingClientRect();
      const lineRect = latestLine.getBoundingClientRect();
      const overflow = lineRect.bottom - (containerRect.bottom - 88);
      if (overflow > 0) container.scrollTo({ top: container.scrollTop + overflow, behavior: "smooth" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [visibleLineCount, view]);

  if (view === "cover") {
    return (
      <div className="screen fade-in personality-result love-portrait-cover">
        <div className="poem-ambient" aria-hidden="true">
          <i className="poem-moon" />
          <i className="poem-mist" />
          <i className="poem-island" />
          <span /><span /><span /><span />
        </div>
        <Nav title="My Love Personality" onBack={onBack} />
        <button type="button" className="love-personality-card" onClick={onOpenPoem}>
          <span className="love-card-kicker">✦ 你的恋爱人格</span>
          <div className="love-card-mascot"><Mascot mood="happy" size={132} /></div>
          <h2>{m.name}</h2>
          <p>{m.core}</p>
          <span className="love-card-open">点击展开 Lovera 写给你的诗 <b>→</b></span>
        </button>
        <p className="love-cover-note">基于你的 14 个选择</p>
      </div>
    );
  }

  return (
    <div className={`screen fade-in personality-result insight-poem-result ${showFullPoem ? "show-full-poem" : ""}`}>
      <div className="poem-ambient" aria-hidden="true">
        <i className="poem-moon" />
        <i className="poem-mist" />
        <i className="poem-mist poem-mist-two" />
        <i className="poem-island" />
        <span /><span /><span /><span />
      </div>
      <Nav title="Lovera 写给你的诗" onBack={onBack} />
      <div className="insight-poem-scroll scroll" ref={poemScrollRef}>
        <header className="insight-poem-intro">
          <span>✦ 心之群岛 · 你的关系画像</span>
          <div className="insight-poem-mascot"><Mascot mood="happy" size={76} /></div>
          <p>有些需要，不必急着命名。</p>
          <h2>{m.name}</h2>
          <em>基于你的 14 个选择</em>
        </header>

        <div className="insight-poem-progress" aria-label={`诗篇呈现进度 ${currentBlock}/${poemBlocks.length || 1}`}>
          <span><i style={{ width: `${(currentBlock / Math.max(1, poemBlocks.length)) * 100}%` }} /></span>
          <b>{String(currentBlock).padStart(2, "0")} / {String(poemBlocks.length || 1).padStart(2, "0")}</b>
        </div>

        <div className="insight-poem-stanzas" aria-live="polite">
          {poemBlocks.map((block, blockIndex) => {
            const blockStart = poemLines.findIndex((item) => item.blockIndex === blockIndex);
            const blockVisible = visibleLineCount > blockStart;
            return (
              <article key={block.id} className={`insight-stanza ${blockVisible ? "is-revealed" : ""}`}>
                <span className="insight-stanza-number">{String(blockIndex + 1).padStart(2, "0")}</span>
                <small>{POEM_BLOCK_LABELS[block.type] || "写给你"}</small>
                {block.lines.map((line, lineIndex) => {
                  const absoluteIndex = blockStart + lineIndex;
                  return (
                    <p key={`${block.id}-${lineIndex}`} className={`insight-line is-${line.emphasis || "normal"} ${absoluteIndex < visibleLineCount ? "is-visible" : ""}`}>
                      {renderPoemText(line.text, block.hero_phrases)}
                    </p>
                  );
                })}
              </article>
            );
          })}
        </div>

        {!isComplete && (
          <button type="button" className="poem-finish-now" onClick={() => setShowFullPoem(true)}>
            展开完整诗篇
          </button>
        )}

        {isComplete && (
          <button type="button" className="poem-manual-entry" onClick={onDetails}>
            <span>✦ 查看你的图形化画像</span>
            <strong>打开完整恋爱说明书 <b>→</b></strong>
          </button>
        )}
      </div>
    </div>
  );
}

export function PartnerTraits({ profile, onBack, onDetails, onNext, onPrev }) {
  return (
    <div className="screen fade-in">
      <Nav title="Ideal Partner Traits" onBack={onBack} />
      <p className="sub" style={{ textAlign: "center", marginBottom: 16 }}>
        最适合你的伴侣特质
      </p>
      <div className="scroll">
        {profile.bars.map((t) => (
          <div className="trait-row" key={t.label}>
            <span>{t.label}</span>
            <div className="trait-bar">
              <span style={{ width: `${t.value}%` }} />
            </div>
            <strong style={{ color: "var(--orange-hot)" }}>{t.value}%</strong>
          </div>
        ))}
        <div className="block">
          {profile.modules.partner.map((p) => (
            <p key={p} style={{ marginBottom: 6 }}>
              · {p}
            </p>
          ))}
        </div>
      </div>
      <div className="swipe-row">
        <button className="icon-btn" onClick={onPrev}>
          ‹
        </button>
        <button className="cta" style={{ width: "auto", padding: "0 28px", height: 46 }} onClick={onDetails}>
          View Details
        </button>
        <button className="icon-btn" onClick={onNext}>
          ›
        </button>
      </div>
    </div>
  );
}

function RadarChart({ data }) {
  const cx = 140;
  const cy = 132;
  const r = 88;
  const n = data.length;
  const pt = (i, value) => {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const rr = (value / 100) * r;
    return [cx + rr * Math.cos(ang), cy + rr * Math.sin(ang)];
  };
  const poly = data.map((d, i) => pt(i, d.value).join(",")).join(" ");
  const rings = [0.35, 0.62, 1];
  const shortLabel = (label) => ({
    "安全感需求": "安全感",
    "表达方式": "表达",
    "亲密接近": "亲密",
    "冲突修复": "修复",
    "心动触发": "心动",
  }[label] || label);
  return (
    <svg className="radar-chart" viewBox="0 0 280 280" width="100%" height="240" role="img" aria-label="你的关系维度雷达图">
      <title>你的关系维度雷达图</title>
      <defs>
        <linearGradient id="relationshipRadarFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f0a773" stopOpacity="0.62" />
          <stop offset="100%" stopColor="#9f7eb9" stopOpacity="0.36" />
        </linearGradient>
      </defs>
      {rings.map((s) => (
        <polygon
          key={s}
          fill="none"
          stroke="rgba(160,112,117,0.2)"
          points={data.map((_, i) => pt(i, s * 100).join(",")).join(" ")}
        />
      ))}
      {data.map((_, i) => {
        const [x, y] = pt(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(160,112,117,0.18)" />;
      })}
      <polygon points={poly} fill="url(#relationshipRadarFill)" stroke="#cc8568" strokeWidth="2" />
      {data.map((d, i) => {
        const [x, y] = pt(i, d.value);
        return <circle key={`point-${d.label}`} cx={x} cy={y} r="3.2" fill="#fff8ec" stroke="#c67c62" strokeWidth="2" />;
      })}
      {data.map((d, i) => {
        const [x, y] = pt(i, 118);
        return (
          <text key={d.label} x={x} y={y} textAnchor="middle" fontSize="9" fontWeight="700" fill="#755f69">
            {shortLabel(d.label)} {d.value}
          </text>
        );
      })}
    </svg>
  );
}

export function RadarScreen({ profile, onBack, onMore, onNext, onPrev }) {
  return (
    <div className="screen fade-in">
      <Nav title="Your Relationship Mind Map" onBack={onBack} />
      <p className="sub" style={{ textAlign: "center" }}>
        多维度了解你的恋爱模式
      </p>
      <RadarChart data={profile.radar} />
      <div className="block">
        {Object.values(profile.meta.labels).map((l) => (
          <p key={l} style={{ marginBottom: 4 }}>
            · {l}
          </p>
        ))}
      </div>
      <div className="swipe-row">
        <button className="icon-btn" onClick={onPrev}>
          ‹
        </button>
        <button className="cta" style={{ width: "auto", padding: "0 28px", height: 46 }} onClick={onMore}>
          Explore More
        </button>
        <button className="icon-btn" onClick={onNext}>
          ›
        </button>
      </div>
    </div>
  );
}

export function ShareScreen({ profile, onBack, onShare }) {
  return (
    <div className="screen fade-in">
      <Nav title="Share Your Love Puzzle" onBack={onBack} />
      <div className="share-card">
        <p className="eyebrow">My Love Personality</p>
        <Mascot mood="happy" size={130} />
        <h2 className="h-serif" style={{ color: "var(--orange-hot)", fontSize: 26 }}>
          {profile.modules.name}
        </h2>
        <p className="sub" style={{ marginTop: 10 }}>
          {profile.modules.core}
        </p>
      </div>
      <button className="ghost-cta" onClick={onShare} style={{ marginTop: 8 }}>
        ↑ Swipe up to share
      </button>
    </div>
  );
}

export function ManualScreen({ profile, onBack }) {
  const m = profile.modules;
  const insight = profile.insight_profile;
  const topDimensions = insight?.top_dimensions || profile.deterministic_profile?.top_dimensions || [];
  const portraitCards = [
    { icon: "✦", label: "核心渴望", value: insight?.core_longing?.summary, evidence: insight?.core_longing?.evidence },
    { icon: "↔", label: "关系风格", value: insight?.relationship_style?.summary, evidence: insight?.relationship_style?.evidence },
    { icon: "◉", label: "安全感", value: insight?.safety_needs?.[0]?.summary, evidence: insight?.safety_needs?.[0]?.evidence },
    { icon: "≈", label: "内在张力", value: insight?.tensions?.[0]?.interpretation, evidence: insight?.tensions?.[0]?.evidence },
    { icon: "!", label: "关系边界", value: insight?.red_lines?.[0]?.summary, evidence: insight?.red_lines?.[0]?.evidence },
    { icon: "↑", label: "可以练习", value: insight?.growth_edge?.summary, evidence: insight?.growth_edge?.evidence },
  ].filter((item) => item.value);
  const evidenceLabel = (evidence = []) => evidence
    .map((evidenceId) => evidenceId.split("-")[0])
    .join(" · ");

  return (
    <div className="screen fade-in manual-screen">
      <Nav title="个人恋爱说明书" onBack={onBack} />
      <div className="manual scroll">
        <header className="manual-hero">
          <span>HEART ISLANDS · LOVE PROFILE</span>
          <div>
            <h2>「{m.name}」</h2>
            <Mascot mood="happy" size={68} />
          </div>
          <p>{insight?.core_longing?.summary || m.core}</p>
          <div className="manual-keywords">
            {topDimensions.map((dimension) => (
              <span key={dimension.id}>{dimension.label}<b>{dimension.score}</b></span>
            ))}
          </div>
        </header>

        <section className="manual-section manual-radar-card">
          <div className="manual-section-heading">
            <span>01</span>
            <div><small>RELATIONSHIP RADAR</small><h3>你的关系能量图</h3></div>
          </div>
          <RadarChart data={profile.radar} />
          <p className="manual-radar-note">分数代表你在本次选择中表现出的<strong>关注强度</strong>，不是好坏排名。</p>
        </section>

        <section className="manual-section manual-portrait-section">
          <div className="manual-section-heading">
            <span>02</span>
            <div><small>YOUR LOVE PORTRAIT</small><h3>这首诗背后的你</h3></div>
          </div>
          <div className="manual-portrait-grid">
            {portraitCards.map((item, index) => (
              <article key={item.label} className={`manual-portrait-card tone-${index + 1}`}>
                <i>{item.icon}</i>
                <div>
                  <strong>{item.label}</strong>
                  <p>{item.value}</p>
                  {item.evidence?.length > 0 && <small>依据 {evidenceLabel(item.evidence)}</small>}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="manual-section manual-playbook">
          <div className="manual-section-heading">
            <span>03</span>
            <div><small>LOVE PLAYBOOK</small><h3>让关系更舒服的方法</h3></div>
          </div>
          <article><span>冲突后</span><strong>你需要的不是胜负，而是回来。</strong><p>{m.conflictRepair}</p></article>
          <article><span>适配伴侣</span><strong>稳定、坦诚，也尊重你的节奏。</strong><p>{m.partner?.[0]}</p></article>
          <article><span>关系练习</span><strong>把需要说具体，比让对方猜更温柔。</strong><p>{insight?.growth_edge?.summary || m.growthAdvice?.[0]}</p></article>
        </section>

        <section className="manual-section manual-strengths">
          <div className="manual-section-heading">
            <span>04</span>
            <div><small>YOUR STRENGTHS</small><h3>你带进关系里的光</h3></div>
          </div>
          <div>{m.strengths.slice(0, 3).map((strength) => <span key={strength}>{strength}</span>)}</div>
        </section>

        <blockquote className="manual-partner-note">
          <small>TO YOUR FUTURE PARTNER</small>
          <p>“{m.manual}”</p>
        </blockquote>

        <p className="manual-disclaimer">
          以上判断来自你在心之群岛里的选择，描述的是关系偏好，不是心理诊断。
        </p>
      </div>
    </div>
  );
}

export function Generating({ status }) {
  return (
    <div className="screen fade-in generating-screen">
      <div className="generating-sparkles" aria-hidden="true">
        <span>✦</span><span>·</span><span>♥</span><span>✦</span><span>·</span>
      </div>
      <div className="generating-emblem"><StarEmblem size={66} /></div>
      <div className="generating-lovera">
        <span className="generating-halo" aria-hidden="true" />
        <Mascot mood="happy" size={94} />
      </div>
      <div className="generating-copy">
        <span>HEART ISLANDS · LOVE PORTRAIT</span>
        <h2 className="h-serif">正在拼出最真实的你</h2>
        <div className="generating-divider" aria-hidden="true"><i />♥<i /></div>
        <p>{status || "Lovera 正在整理你的关系画像……"}</p>
      </div>
      <div className="ai-loader" aria-label="正在生成">
        <span />
        <span />
        <span />
      </div>
      <p className="generating-note">请稍等片刻，你的关系画像很快就好</p>
    </div>
  );
}
