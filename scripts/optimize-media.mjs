// Originals are retained. Run only when media changes; deploys use committed outputs.
// MEDIA_TOOL_ROOT points to an npm prefix containing sharp, ffmpeg-static and ffprobe-static.
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { resolve, relative, dirname } from "node:path";

const requireTool = createRequire(resolve(process.env.MEDIA_TOOL_ROOT || ".", "package.json"));
const sharp = requireTool("sharp");
const ffmpeg = requireTool("ffmpeg-static");
const ffprobe = requireTool("ffprobe-static").path;
const root = resolve("src/assets");
const output = resolve(root, "optimized");
const sha256 = (buffer) => createHash("sha256").update(buffer).digest("hex");
const probe = (file) => JSON.parse(execFileSync(ffprobe, ["-v", "error", "-show_streams", "-show_format", "-of", "json", file], { encoding: "utf8" }));
const entries = [];
const files = [
  ...(await readdir(root)).filter((name) => name.endsWith(".png")),
  ...(await readdir(resolve(root, "audio"))).filter((name) => name.endsWith(".wav")).map((name) => `audio/${name}`),
  ...(await readdir(resolve(root, "video"))).filter((name) => name.endsWith(".mp4")).map((name) => `video/${name}`),
].sort();

for (const file of files) {
  const source = resolve(root, file);
  const target = resolve(output, file.replace(/\.png$/, ".webp").replace(/\.wav$/, ".m4a"));
  await mkdir(dirname(target), { recursive: true });
  let properties;
  if (file.endsWith(".png")) {
    const before = await sharp(source).metadata();
    await sharp(source).webp({ quality: 88, alphaQuality: 100, effort: 6 }).toFile(target);
    const after = await sharp(target).metadata();
    if (before.width !== after.width || before.height !== after.height || before.hasAlpha !== after.hasAlpha) {
      throw new Error(`Image geometry/alpha changed: ${file}`);
    }
    properties = { width: after.width, height: after.height, alpha: after.hasAlpha };
  } else {
    const video = file.endsWith(".mp4");
    execFileSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-nostdin", "-y", "-i", source,
      ...(video
        ? ["-map", "0:v:0", "-map", "0:a?", "-c:v", "libx264", "-preset", "slow", "-crf", "23", "-pix_fmt", "yuv420p", "-fps_mode", "passthrough", "-g", "48", "-c:a", "copy"]
        : ["-map", "0:a:0", "-c:a", "aac", "-b:a", "80k"]),
      "-movflags", "+faststart+use_metadata_tags", target,
    ], { stdio: "inherit" });
    const before = probe(source);
    const after = probe(target);
    const duration = Number(after.format.duration);
    const originalDuration = Number(before.format.duration);
    if (Math.abs(duration - originalDuration) > 0.15) throw new Error(`Duration changed: ${file}`);
    const a = before.streams.find((s) => s.codec_type === "audio");
    const b = after.streams.find((s) => s.codec_type === "audio");
    if (a && (!b || a.channels !== b.channels || a.sample_rate !== b.sample_rate)) throw new Error(`Audio changed: ${file}`);
    const v = before.streams.find((s) => s.codec_type === "video");
    const w = after.streams.find((s) => s.codec_type === "video");
    if (v && (!w || v.width !== w.width || v.height !== w.height || v.nb_frames !== w.nb_frames)) throw new Error(`Video frames/geometry changed: ${file}`);
    properties = { duration, originalDuration, audioChannels: b?.channels, width: w?.width, height: w?.height, frames: w?.nb_frames, originalFrames: v?.nb_frames };
  }
  const originalBytes = (await stat(source)).size;
  const bytes = (await stat(target)).size;
  if (bytes >= originalBytes) throw new Error(`Compression did not reduce ${file}`);
  entries.push({ source: file, output: relative(root, target), originalBytes, bytes, sourceSha256: sha256(await readFile(source)), outputSha256: sha256(await readFile(target)), ...properties });
  console.log(`${file}: ${Math.round(originalBytes / 1024)} → ${Math.round(bytes / 1024)} KB`);
}
await writeFile(resolve(output, "manifest.json"), JSON.stringify({ version: 1, entries }, null, 2) + "\n");
console.log(JSON.stringify({ files: entries.length, before: entries.reduce((n, e) => n + e.originalBytes, 0), after: entries.reduce((n, e) => n + e.bytes, 0) }));
