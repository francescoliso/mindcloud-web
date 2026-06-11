import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

// App-level encryption for sensitive content (journal, gratitude, reports).
// AES-256-GCM with a server-held key (ENCRYPTION_KEY, base64 of 32 bytes).
//
// Stored format:  enc:v1:<iv_b64>:<authTag_b64>:<ciphertext_b64>
// Backward compatible: values without the `enc:v1:` prefix are treated as
// plaintext and returned as-is (legacy rows, or when no key is configured).

const PREFIX = "enc:v1:";

function key(): Buffer | null {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) return null;
  const buf = Buffer.from(raw, "base64");
  if (buf.length !== 32) {
    throw new Error("ENCRYPTION_KEY must be 32 bytes (base64-encoded).");
  }
  return buf;
}

export function encrypt(plaintext: string): string {
  const k = key();
  if (!k) return plaintext; // no key configured (e.g. local dev) → store as-is

  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", k, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("base64")}:${tag.toString("base64")}:${ciphertext.toString("base64")}`;
}

export function decrypt(stored: string): string {
  if (!stored.startsWith(PREFIX)) return stored; // legacy plaintext

  const k = key();
  if (!k) return stored; // can't decrypt without the key; return raw

  const [, , ivB64, tagB64, dataB64] = stored.split(":");
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const data = Buffer.from(dataB64, "base64");

  const decipher = createDecipheriv("aes-256-gcm", k, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}
