import prologueLine1 from "../assets/optimized/audio/heart-island-prologue-1.m4a";
import prologueLine2 from "../assets/optimized/audio/heart-island-prologue-2.m4a";
import prologueLine3 from "../assets/optimized/audio/heart-island-prologue-3.m4a";
import prologueLine4 from "../assets/optimized/audio/heart-island-prologue-4.m4a";
import loveraEncounter1 from "../assets/optimized/audio/lovera-encounter-1.m4a";
import loveraEncounter2 from "../assets/optimized/audio/lovera-encounter-2.m4a";
import q1SceneNarration from "../assets/optimized/audio/q1-scene-narration.m4a";
import q1LoveraDialogue from "../assets/optimized/audio/q1-lovera-dialogue.m4a";
import q2SceneNarration from "../assets/optimized/audio/q2-scene-narration.m4a";
import q2BranchA from "../assets/optimized/audio/q2-branch-a.m4a";
import q2BranchB from "../assets/optimized/audio/q2-branch-b.m4a";
import q2BranchC from "../assets/optimized/audio/q2-branch-c.m4a";
import q3SceneNarration from "../assets/optimized/audio/q3-scene-narration.m4a";
import q3LoveraDialogue from "../assets/optimized/audio/q3-lovera-dialogue.m4a";
import q4DisappearNarration from "../assets/optimized/audio/q4-disappear-narration.m4a";
import q4ReturnNarration from "../assets/optimized/audio/q4-return-narration.m4a";
import q4LoveraDialogue from "../assets/optimized/audio/q4-lovera-dialogue.m4a";
import q5ArrivalNarration from "../assets/optimized/audio/q5-arrival-narration.m4a";
import q5LoveraDialogue from "../assets/optimized/audio/q5-lovera-dialogue.m4a";
import q5EnergyNarration from "../assets/optimized/audio/q5-energy-narration.m4a";
import q6VaultNarration from "../assets/optimized/audio/q6-vault-narration.m4a";
import q6GoodsNarration from "../assets/optimized/audio/q6-goods-narration.m4a";
import q6LoveraDialogue from "../assets/optimized/audio/q6-lovera-dialogue.m4a";
import q10MirrorNarration from "../assets/optimized/audio/q10-mirror-narration.m4a";
import q10FutureVoices from "../assets/optimized/audio/q10-future-voices.m4a";
import q11MoonNarration from "../assets/optimized/audio/q11-moon-narration.m4a";
import q11LoveraDialogue from "../assets/optimized/audio/q11-lovera-dialogue.m4a";
import q8ForkNarration from "../assets/optimized/audio/q8-fork-narration.m4a";
import q8LoveraInsist from "../assets/optimized/audio/q8-lovera-insist.m4a";
import q8BlownBackNarration from "../assets/optimized/audio/q8-blown-back-narration.m4a";
import q8LoveraBlame from "../assets/optimized/audio/q8-lovera-blame.m4a";
import q9APause from "../assets/optimized/audio/q9-a-pause.m4a";
import q9AApology from "../assets/optimized/audio/q9-a-apology.m4a";
import q9ARepair from "../assets/optimized/audio/q9-a-repair.m4a";
import q9BSilence from "../assets/optimized/audio/q9-b-silence.m4a";
import q9BFruit from "../assets/optimized/audio/q9-b-fruit.m4a";
import q9BQuestion from "../assets/optimized/audio/q9-b-question.m4a";
import q9CWalk from "../assets/optimized/audio/q9-c-walk.m4a";
import q9CStop from "../assets/optimized/audio/q9-c-stop.m4a";
import q9CQuestion from "../assets/optimized/audio/q9-c-question.m4a";
import q9RepairQuestion from "../assets/optimized/audio/q9-repair-question.m4a";
import q12ArrivalNarration from "../assets/optimized/audio/q12-arrival-narration.m4a";
import q12SplitNarration from "../assets/optimized/audio/q12-split-narration.m4a";
import q12GuardianNarration from "../assets/optimized/audio/q12-guardian-narration.m4a";
import q12LinkNarration from "../assets/optimized/audio/q12-link-narration.m4a";
import q12LoveraDialogue from "../assets/optimized/audio/q12-lovera-dialogue.m4a";
import q13StarNarration from "../assets/optimized/audio/q13-star-narration.m4a";
import q13InviteNarration from "../assets/optimized/audio/q13-invite-narration.m4a";
import q13DreamNarration from "../assets/optimized/audio/q13-dream-narration.m4a";
import q13DistanceNarration from "../assets/optimized/audio/q13-distance-narration.m4a";
import q13LoveraDialogue from "../assets/optimized/audio/q13-lovera-dialogue.m4a";
import q14ExitNarration from "../assets/optimized/audio/q14-exit-narration.m4a";
import q14FlowersNarration from "../assets/optimized/audio/q14-flowers-narration.m4a";
import q14GuardianRule from "../assets/optimized/audio/q14-guardian-rule.m4a";
import q14LoveraQuestion from "../assets/optimized/audio/q14-lovera-question.m4a";
import question1 from "../assets/optimized/audio/lora-q1.m4a";
import question2 from "../assets/optimized/audio/lora-q2.m4a";
import question3 from "../assets/optimized/audio/lora-q3.m4a";
import question4 from "../assets/optimized/audio/lora-q4.m4a";
import question5 from "../assets/optimized/audio/lora-q5.m4a";
import question6 from "../assets/optimized/audio/lora-q6.m4a";
import question7A from "../assets/optimized/audio/lora-q7a.m4a";
import question7B from "../assets/optimized/audio/lora-q7b.m4a";
import question7C from "../assets/optimized/audio/lora-q7c.m4a";
import question8 from "../assets/optimized/audio/lora-q8.m4a";
import question9 from "../assets/optimized/audio/lora-q9.m4a";
import question10 from "../assets/optimized/audio/lora-q10.m4a";
import question11 from "../assets/optimized/audio/lora-q11.m4a";
import question12 from "../assets/optimized/audio/lora-q12.m4a";
import question13 from "../assets/optimized/audio/lora-q13.m4a";
import question14 from "../assets/optimized/audio/lora-q14.m4a";

let narrationAudio;
let narrationLine = -1;
let narrationEndedCallback;

const PROLOGUE_TRACKS = [prologueLine1, prologueLine2, prologueLine3, prologueLine4];
const LOVERA_ENCOUNTER_TRACKS = [loveraEncounter1, loveraEncounter2];
const Q1_CINEMATIC_TRACKS = {
  narration: q1SceneNarration,
  lovera: q1LoveraDialogue,
};
const Q2_CINEMATIC_TRACKS = {
  narration: q2SceneNarration,
  lovera: question2,
  A: q2BranchA,
  B: q2BranchB,
  C: q2BranchC,
};
const CAVE_CINEMATIC_TRACKS = {
  "q3-narration": q3SceneNarration,
  "q3-lovera": q3LoveraDialogue,
  "q4-disappear": q4DisappearNarration,
  "q4-return": q4ReturnNarration,
  "q4-lovera": q4LoveraDialogue,
};
const RESOURCE_CINEMATIC_TRACKS = {
  "q5-arrival": q5ArrivalNarration,
  "q5-lovera": q5LoveraDialogue,
  "q5-energy": q5EnergyNarration,
  "q6-vault": q6VaultNarration,
  "q6-goods": q6GoodsNarration,
  "q6-lovera": q6LoveraDialogue,
};
const MIRROR_CINEMATIC_TRACKS = {
  "q10-narration": q10MirrorNarration,
  "q10-futures": q10FutureVoices,
  "q11-narration": q11MoonNarration,
  "q11-lovera": q11LoveraDialogue,
};
const STORM_CINEMATIC_TRACKS = {
  "q8-fork": q8ForkNarration,
  "q8-insist": q8LoveraInsist,
  "q8-blown": q8BlownBackNarration,
  "q8-blame": q8LoveraBlame,
  "q9-a-pause": q9APause,
  "q9-a-apology": q9AApology,
  "q9-a-repair": q9ARepair,
  "q9-b-silence": q9BSilence,
  "q9-b-fruit": q9BFruit,
  "q9-b-question": q9BQuestion,
  "q9-c-walk": q9CWalk,
  "q9-c-stop": q9CStop,
  "q9-c-question": q9CQuestion,
  "q9-question": q9RepairQuestion,
};
const PROMISE_CINEMATIC_TRACKS = {
  "q12-arrival": q12ArrivalNarration,
  "q12-split": q12SplitNarration,
  "q12-guardian": q12GuardianNarration,
  "q12-link": q12LinkNarration,
  "q12-lovera": q12LoveraDialogue,
  "q13-star": q13StarNarration,
  "q13-invite": q13InviteNarration,
  "q13-dream": q13DreamNarration,
  "q13-distance": q13DistanceNarration,
  "q13-lovera": q13LoveraDialogue,
};
const FUTURE_LAND_CINEMATIC_TRACKS = {
  "q14-exit": q14ExitNarration,
  "q14-flowers": q14FlowersNarration,
  "q14-guardian": q14GuardianRule,
  "q14-lovera": q14LoveraQuestion,
};
const QUESTION_TRACKS = {
  1: question1,
  2: question2,
  3: question3,
  4: question4,
  5: question5,
  6: question6,
  "7-A": question7A,
  "7-B": question7B,
  "7-C": question7C,
  8: question8,
  9: question9,
  10: question10,
  11: question11,
  12: question12,
  13: question13,
  14: question14,
};

function getNarrationAudio() {
  if (typeof window === "undefined") return null;
  if (!narrationAudio) {
    narrationAudio = new Audio();
    narrationAudio.preload = "auto";
    narrationAudio.volume = 0.96;
    narrationAudio.playsInline = true;
    narrationAudio.addEventListener("ended", () => {
      narrationLine = -1;
      const callback = narrationEndedCallback;
      narrationEndedCallback = undefined;
      callback?.();
    });
  }
  return narrationAudio;
}

function playNarrationTrack(source, trackId, onEnded) {
  const audio = getNarrationAudio();
  if (!audio || !source) return Promise.resolve(false);

  narrationEndedCallback = onEnded;
  if (narrationLine === trackId && !audio.paused && !audio.ended) {
    return Promise.resolve(true);
  }

  audio.pause();
  audio.src = source;
  audio.currentTime = 0;
  audio.playbackRate = 1;
  narrationLine = trackId;

  const playPromise = audio.play();
  if (!playPromise) return Promise.resolve(true);
  return playPromise.then(() => true).catch(() => {
    narrationLine = -1;
    return false;
  });
}

export function playPrologueNarration(lineIndex, onEnded) {
  return playNarrationTrack(PROLOGUE_TRACKS[lineIndex], `prologue-${lineIndex}`, onEnded);
}

export function getPrologueNarrationProgress(lineIndex) {
  const audio = getNarrationAudio();
  if (!audio || narrationLine !== `prologue-${lineIndex}` || !Number.isFinite(audio.duration) || audio.duration <= 0) {
    return 0;
  }
  return Math.min(1, audio.currentTime / audio.duration);
}

export function playLoveraEncounter(lineIndex, onEnded) {
  return playNarrationTrack(LOVERA_ENCOUNTER_TRACKS[lineIndex], `lovera-encounter-${lineIndex}`, onEnded);
}

export function getLoveraEncounterProgress(lineIndex) {
  const audio = getNarrationAudio();
  if (!audio || narrationLine !== `lovera-encounter-${lineIndex}` || !Number.isFinite(audio.duration) || audio.duration <= 0) {
    return 0;
  }
  return Math.min(1, audio.currentTime / audio.duration);
}

export function playQ1CinematicTrack(segment, onEnded) {
  return playNarrationTrack(Q1_CINEMATIC_TRACKS[segment], `q1-cinematic-${segment}`, onEnded);
}

export function getQ1CinematicProgress(segment) {
  const audio = getNarrationAudio();
  if (!audio || narrationLine !== `q1-cinematic-${segment}` || !Number.isFinite(audio.duration) || audio.duration <= 0) {
    return 0;
  }
  return Math.min(1, audio.currentTime / audio.duration);
}

export function playQ2CinematicTrack(segment, onEnded) {
  return playNarrationTrack(Q2_CINEMATIC_TRACKS[segment], `q2-cinematic-${segment}`, onEnded);
}

export function getQ2CinematicProgress(segment) {
  const audio = getNarrationAudio();
  if (!audio || narrationLine !== `q2-cinematic-${segment}` || !Number.isFinite(audio.duration) || audio.duration <= 0) {
    return 0;
  }
  return Math.min(1, audio.currentTime / audio.duration);
}

export function playCaveCinematicTrack(segment, onEnded) {
  return playNarrationTrack(CAVE_CINEMATIC_TRACKS[segment], `cave-cinematic-${segment}`, onEnded);
}

export function getCaveCinematicProgress(segment) {
  const audio = getNarrationAudio();
  if (!audio || narrationLine !== `cave-cinematic-${segment}` || !Number.isFinite(audio.duration) || audio.duration <= 0) {
    return 0;
  }
  return Math.min(1, audio.currentTime / audio.duration);
}

export function playResourceCinematicTrack(segment, onEnded) {
  return playNarrationTrack(RESOURCE_CINEMATIC_TRACKS[segment], `resource-cinematic-${segment}`, onEnded);
}

export function getResourceCinematicProgress(segment) {
  const audio = getNarrationAudio();
  if (!audio || narrationLine !== `resource-cinematic-${segment}` || !Number.isFinite(audio.duration) || audio.duration <= 0) {
    return 0;
  }
  return Math.min(1, audio.currentTime / audio.duration);
}

export function playMirrorCinematicTrack(segment, onEnded) {
  return playNarrationTrack(MIRROR_CINEMATIC_TRACKS[segment], `mirror-cinematic-${segment}`, onEnded);
}

export function getMirrorCinematicProgress(segment) {
  const audio = getNarrationAudio();
  if (!audio || narrationLine !== `mirror-cinematic-${segment}` || !Number.isFinite(audio.duration) || audio.duration <= 0) {
    return 0;
  }
  return Math.min(1, audio.currentTime / audio.duration);
}

export function playStormCinematicTrack(segment, onEnded) {
  return playNarrationTrack(STORM_CINEMATIC_TRACKS[segment], `storm-cinematic-${segment}`, onEnded);
}

export function getStormCinematicProgress(segment) {
  const audio = getNarrationAudio();
  if (!audio || narrationLine !== `storm-cinematic-${segment}` || !Number.isFinite(audio.duration) || audio.duration <= 0) {
    return 0;
  }
  return Math.min(1, audio.currentTime / audio.duration);
}

export function playPromiseCinematicTrack(segment, onEnded) {
  return playNarrationTrack(PROMISE_CINEMATIC_TRACKS[segment], `promise-cinematic-${segment}`, onEnded);
}

export function getPromiseCinematicProgress(segment) {
  const audio = getNarrationAudio();
  if (!audio || narrationLine !== `promise-cinematic-${segment}` || !Number.isFinite(audio.duration) || audio.duration <= 0) {
    return 0;
  }
  return Math.min(1, audio.currentTime / audio.duration);
}

export function playFutureLandCinematicTrack(segment, onEnded) {
  return playNarrationTrack(FUTURE_LAND_CINEMATIC_TRACKS[segment], `future-land-cinematic-${segment}`, onEnded);
}

export function getFutureLandCinematicProgress(segment) {
  const audio = getNarrationAudio();
  if (!audio || narrationLine !== `future-land-cinematic-${segment}` || !Number.isFinite(audio.duration) || audio.duration <= 0) {
    return 0;
  }
  return Math.min(1, audio.currentTime / audio.duration);
}

function getQuestionTrackKey(questionId, answers) {
  if (questionId !== 7) return String(questionId);
  return `7-${answers?.Q6 || "A"}`;
}

export function playQuestionNarration(questionId, answers, onEnded) {
  const key = getQuestionTrackKey(questionId, answers);
  return playNarrationTrack(QUESTION_TRACKS[key], `question-${key}`, onEnded);
}

export function getQuestionNarrationProgress(questionId, answers) {
  const audio = getNarrationAudio();
  const key = getQuestionTrackKey(questionId, answers);
  if (!audio || narrationLine !== `question-${key}` || !Number.isFinite(audio.duration) || audio.duration <= 0) {
    return 0;
  }
  return Math.min(1, audio.currentTime / audio.duration);
}

export function clearPrologueNarrationListener(callback) {
  if (narrationEndedCallback === callback) narrationEndedCallback = undefined;
}

export function stopPrologueNarration() {
  stopLoveraNarration();
}

export function stopLoveraNarration() {
  const audio = getNarrationAudio();
  narrationEndedCallback = undefined;
  narrationLine = -1;
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
}

export function primeIslandAudio() {
  // Narration is started directly from the user's click. No ambient audio is primed.
}

export function startIslandAmbience() {
  // Intentionally silent: keep only Lovera's recorded narration.
}

export function stopIslandAmbience() {
  // Kept as a no-op so existing screen lifecycle calls remain safe.
}
