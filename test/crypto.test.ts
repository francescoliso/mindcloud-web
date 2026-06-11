import { describe, it, expect, beforeAll } from "vitest";
import { randomBytes } from "node:crypto";

describe("crypto (with key)", () => {
  beforeAll(() => {
    process.env.ENCRYPTION_KEY = randomBytes(32).toString("base64");
  });

  it("round-trips text, including unicode", async () => {
    const { encrypt, decrypt } = await import("@/lib/crypto");
    const msg = "Today I felt anxious but grateful. 日本語 too. 🌤️";
    const enc = encrypt(msg);
    expect(enc.startsWith("enc:v1:")).toBe(true);
    expect(enc).not.toContain(msg);
    expect(decrypt(enc)).toBe(msg);
  });

  it("passes through legacy plaintext unchanged", async () => {
    const { decrypt } = await import("@/lib/crypto");
    expect(decrypt("an old plaintext entry")).toBe("an old plaintext entry");
  });

  it("produces a different ciphertext each time (random IV)", async () => {
    const { encrypt } = await import("@/lib/crypto");
    expect(encrypt("same")).not.toBe(encrypt("same"));
  });
});

describe("crypto (no key)", () => {
  it("stores and returns plaintext when no key is configured", async () => {
    delete process.env.ENCRYPTION_KEY;
    const { encrypt, decrypt } = await import("@/lib/crypto");
    expect(encrypt("hello")).toBe("hello");
    expect(decrypt("hello")).toBe("hello");
  });
});
