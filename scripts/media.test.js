import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, dirname } from "node:path";

const root = resolve("src/assets");
const manifest = JSON.parse(readFileSync(resolve(root, "optimized/manifest.json"), "utf8"));
const sha256 = (buffer) => createHash("sha256").update(buffer).digest("hex");

test("optimized media has unchanged originals, valid hashes, and smaller files", () => {
  assert.equal(manifest.entries.length, 96);
  for (const entry of manifest.entries) {
    const original = readFileSync(resolve(root, entry.source));
    const output = readFileSync(resolve(root, entry.output));
    assert.equal(sha256(original), entry.sourceSha256, entry.source);
    assert.equal(sha256(output), entry.outputSha256, entry.output);
    assert.equal(output.length, entry.bytes);
    assert.ok(output.length < original.length, entry.source);
    if (entry.duration) assert.ok(Math.abs(entry.duration - entry.originalDuration) <= 0.15, entry.source);
    if (entry.frames) assert.equal(entry.frames, entry.originalFrames, entry.source);
  }
});

test("all 7 videos and 71 narrations are streamable without downloading the whole file", () => {
  const media = manifest.entries.filter((entry) => /\.(mp4|m4a)$/.test(entry.output));
  assert.equal(media.length, 78);
  for (const entry of media) {
    const bytes = readFileSync(resolve(root, entry.output));
    const atoms = [];
    for (let offset = 0; offset + 8 <= bytes.length;) {
      let size = bytes.readUInt32BE(offset);
      const type = bytes.toString("ascii", offset + 4, offset + 8);
      if (size === 1) size = Number(bytes.readBigUInt64BE(offset + 8));
      if (size === 0) size = bytes.length - offset;
      assert.ok(size >= 8, entry.output);
      atoms.push(type);
      offset += size;
    }
    assert.ok(atoms.indexOf("moov") >= 0 && atoms.indexOf("moov") < atoms.indexOf("mdat"), entry.output);
  }
});

test("client references optimized resources, with no missing paths", () => {
  const files = ["src/screens.jsx", "src/ui/Mascot.jsx", "src/engine/islandAudio.js", "src/index.css", "src/storm.css"];
  for (const file of files) {
    const content = readFileSync(file, "utf8");
    assert.doesNotMatch(content, /assets\/(?!optimized\/)[^"']+\.(png|wav|mp4)/);
    for (const [, path] of content.matchAll(/["']([^"']*assets\/optimized\/[^"']+)["']/g)) {
      assert.ok(existsSync(resolve(dirname(file), path)), `${file}: ${path}`);
    }
  }
});
