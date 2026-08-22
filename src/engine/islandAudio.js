import prologueLine1 from "../assets/audio/heart-island-prologue-1.wav";
import prologueLine2 from "../assets/audio/heart-island-prologue-2.wav";
import prologueLine3 from "../assets/audio/heart-island-prologue-3.wav";
import prologueLine4 from "../assets/audio/heart-island-prologue-4.wav";
import loveraEncounter1 from "../assets/audio/lovera-encounter-1.wav";
import loveraEncounter2 from "../assets/audio/lovera-encounter-2.wav";
import q1SceneNarration from "../assets/audio/q1-scene-narration.wav";
import q1LoveraDialogue from "../assets/audio/q1-lovera-dialogue.wav";
import q2SceneNarration from "../assets/audio/q2-scene-narration.wav";
import q2BranchA from "../assets/audio/q2-branch-a.wav";
import q2BranchB from "../assets/audio/q2-branch-b.wav";
import q2BranchC from "../assets/audio/q2-branch-c.wav";
import q3SceneNarration from "../assets/audio/q3-scene-narration.wav";
import q3LoveraDialogue from "../assets/audio/q3-lovera-dialogue.wav";
import q4DisappearNarration from "../assets/audio/q4-disappear-narration.wav";
import q4ReturnNarration from "../assets/audio/q4-return-narration.wav";
import q4LoveraDialogue from "../assets/audio/q4-lovera-dialogue.wav";
import q5ArrivalNarration from "../assets/audio/q5-arrival-narration.wav";
import q5LoveraDialogue from "../assets/audio/q5-lovera-dialogue.wav";
import q5EnergyNarration from "../assets/audio/q5-energy-narration.wav";
import q6VaultNarration from "../assets/audio/q6-vault-narration.wav";
import q6GoodsNarration from "../assets/audio/q6-goods-narration.wav";
import q6LoveraDialogue from "../assets/audio/q6-lovera-dialogue.wav";
import q10MirrorNarration from "../assets/audio/q10-mirror-narration.wav";
import q10FutureVoices from "../assets/audio/q10-future-voices.wav";
import q11MoonNarration from "../assets/audio/q11-moon-narration.wav";
import q11LoveraDialogue from "../assets/audio/q11-lovera-dialogue.wav";
import q8ForkNarration from "../assets/audio/q8-fork-narration.wav";
import q8LoveraInsist from "../assets/audio/q8-lovera-insist.wav";
import q8BlownBackNarration from "../assets/audio/q8-blown-back-narration.wav";
import q8LoveraBlame from "../assets/audio/q8-lovera-blame.wav";
import q9APause from "../assets/audio/q9-a-pause.wav";
import q9AApology from "../assets/audio/q9-a-apology.wav";
import q9ARepair from "../assets/audio/q9-a-repair.wav";
import q9BSilence from "../assets/audio/q9-b-silence.wav";
import q9BFruit from "../assets/audio/q9-b-fruit.wav";
import q9BQuestion from "../assets/audio/q9-b-question.wav";
import q9CWalk from "../assets/audio/q9-c-walk.wav";
import q9CStop from "../assets/audio/q9-c-stop.wav";
import q9CQuestion from "../assets/audio/q9-c-question.wav";
import q9RepairQuestion from "../assets/audio/q9-repair-question.wav";
import q12ArrivalNarration from "../assets/audio/q12-arrival-narration.wav";
import q12SplitNarration from "../assets/audio/q12-split-narration.wav";
import q12GuardianNarration from "../assets/audio/q12-guardian-narration.wav";
import q12LinkNarration from "../assets/audio/q12-link-narration.wav";
import q12LoveraDialogue from "../assets/audio/q12-lovera-dialogue.wav";
import q13StarNarration from "../assets/audio/q13-star-narration.wav";
import q13InviteNarration from "../assets/audio/q13-invite-narration.wav";
import q13DreamNarration from "../assets/audio/q13-dream-narration.wav";
import q13DistanceNarration from "../assets/audio/q13-distance-narration.wav";
import q13LoveraDialogue from "../assets/audio/q13-lovera-dialogue.wav";
import q14ExitNarration from "../assets/audio/q14-exit-narration.wav";
import q14FlowersNarration from "../assets/audio/q14-flowers-narration.wav";
import q14GuardianRule from "../assets/audio/q14-guardian-rule.wav";
import q14LoveraQuestion from "../assets/audio/q14-lovera-question.wav";
import question1 from "../assets/audio/lora-q1.wav";
import question2 from "../assets/audio/lora-q2.wav";
import question3 from "../assets/audio/lora-q3.wav";
import question4 from "../assets/audio/lora-q4.wav";
import question5 from "../assets/audio/lora-q5.wav";
import question6 from "../assets/audio/lora-q6.wav";
import question7A from "../assets/audio/lora-q7a.wav";
import question7B from "../assets/audio/lora-q7b.wav";
import question7C from "../assets/audio/lora-q7c.wav";
import question8 from "../assets/audio/lora-q8.wav";
import question9 from "../assets/audio/lora-q9.wav";
import question10 from "../assets/audio/lora-q10.wav";
import question11 from "../assets/audio/lora-q11.wav";
import question12 from "../assets/audio/lora-q12.wav";
import question13 from "../assets/audio/lora-q13.wav";
import question14 from "../assets/audio/lora-q14.wav";

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
