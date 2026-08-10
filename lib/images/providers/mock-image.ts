import { deflateSync } from "node:zlib";

import {
  aspectRatioDimensions,
  type AspectRatio,
} from "@/lib/images/providers/types";

/**
 * PNG generation for the mock provider.
 *
 * Real providers return raster images, and the ai-image-drafts bucket only
 * accepts image/jpeg, image/png and image/webp. Emitting genuine PNG bytes
 * means the ingest path, the MIME check and the stored dimensions are all
 * exercised for real rather than special-cased for the mock.
 *
 * Deliberately no image dependency: a few lines of zlib is cheaper than a
 * package that only ever runs in development.
 */

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const CRC_TABLE = (() => {
  const table = new Int32Array(256);

  for (let n = 0; n < 256; n += 1) {
    let c = n;

    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }

    table[n] = c;
  }

  return table;
})();

function crc32(buffer: Buffer): number {
  let c = 0xffffffff;

  for (const byte of buffer) {
    c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  }

  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeAndData = Buffer.concat([Buffer.from(type, "ascii"), data]);

  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);

  return Buffer.concat([length, typeAndData, crc]);
}

/** Stable 32-bit hash, so the same seed always yields the same picture. */
function hashString(value: string): number {
  let hash = 2166136261;

  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

type Rgb = { r: number; g: number; b: number };

/** Muted, low-saturation tones — closer to the brand than random colours. */
function paletteFor(seed: string): { top: Rgb; bottom: Rgb } {
  const hash = hashString(seed);
  const base = 190 + (hash % 45); // 190–234: off-white through warm grey
  const warmth = (hash >>> 8) % 24;
  const shade = 38 + ((hash >>> 16) % 42);

  return {
    top: { r: base, g: base - Math.floor(warmth / 2), b: base - warmth },
    bottom: {
      r: Math.max(base - shade, 0),
      g: Math.max(base - shade - Math.floor(warmth / 2), 0),
      b: Math.max(base - shade - warmth, 0),
    },
  };
}

export type MockImageOptions = {
  aspectRatio: AspectRatio;
  seed: string;
  /** Long edge in pixels. Small by default: this is pipeline fixture data. */
  longEdge?: number;
};

export type MockImage = {
  buffer: Buffer;
  width: number;
  height: number;
  contentType: "image/png";
};

/**
 * Render a deterministic vertical-gradient PNG.
 * Distinct seeds produce visibly distinct images, so a four-variant grid in
 * the review UI is actually distinguishable.
 */
export function renderMockPng({
  aspectRatio,
  seed,
  longEdge = 512,
}: MockImageOptions): MockImage {
  const { width, height } = aspectRatioDimensions(aspectRatio, longEdge);
  const { top, bottom } = paletteFor(seed);

  // Each scanline is a filter byte (0 = none) followed by RGB triples.
  const stride = width * 3 + 1;
  const raw = Buffer.alloc(stride * height);

  for (let y = 0; y < height; y += 1) {
    const rowStart = y * stride;
    raw[rowStart] = 0;

    const t = height === 1 ? 0 : y / (height - 1);
    const r = Math.round(top.r + (bottom.r - top.r) * t);
    const g = Math.round(top.g + (bottom.g - top.g) * t);
    const b = Math.round(top.b + (bottom.b - top.b) * t);

    for (let x = 0; x < width; x += 1) {
      const offset = rowStart + 1 + x * 3;
      raw[offset] = r;
      raw[offset + 1] = g;
      raw[offset + 2] = b;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: truecolour RGB
  ihdr[10] = 0; // compression: deflate
  ihdr[11] = 0; // filter: adaptive
  ihdr[12] = 0; // interlace: none

  const buffer = Buffer.concat([
    PNG_SIGNATURE,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);

  return { buffer, width, height, contentType: "image/png" };
}

/**
 * The mock's stand-in for a provider CDN URL.
 *
 * A data: URL keeps the whole pipeline runnable with no network and no
 * fixture server. Known limitation: it does not exercise a real HTTPS fetch,
 * so the ingest step must be re-checked against the first real provider in
 * Phase 6.
 */
export function toDataUrl(image: MockImage): string {
  return `data:${image.contentType};base64,${image.buffer.toString("base64")}`;
}
