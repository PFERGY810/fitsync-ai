import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const PREFIX = "enc";

function getKey(): Buffer | null {
  const rawKey = process.env.DATA_ENCRYPTION_KEY;
  if (!rawKey) {
    return null;
  }

  if (rawKey.length === 64 && /^[0-9a-fA-F]+$/.test(rawKey)) {
    return Buffer.from(rawKey, "hex");
  }

  try {
    const decoded = Buffer.from(rawKey, "base64");
    if (decoded.length === 32) {
      return decoded;
    }
  } catch {
    return null;
  }

  return null;
}

export function encryptPayload(payload: any): any {
  if (payload === undefined || payload === null) return payload;
  if (typeof payload === "string" && payload.startsWith(`${PREFIX}:`)) {
    return payload;
  }

  const key = getKey();
  if (!key) {
    return payload;
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const serialized = JSON.stringify(payload);
  const encrypted = Buffer.concat([
    cipher.update(serialized, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return `${PREFIX}:${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
}

export function decryptPayload(payload: any): any {
  if (payload === undefined || payload === null) return payload;
  if (typeof payload !== "string" || !payload.startsWith(`${PREFIX}:`)) {
    return payload;
  }

  const key = getKey();
  if (!key) {
    return payload;
  }

  const [, ivB64, tagB64, dataB64] = payload.split(":");
  if (!ivB64 || !tagB64 || !dataB64) {
    return payload;
  }

  try {
    const iv = Buffer.from(ivB64, "base64");
    const tag = Buffer.from(tagB64, "base64");
    const encrypted = Buffer.from(dataB64, "base64");
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString("utf8");
    return JSON.parse(decrypted);
  } catch (error) {
    console.error("Failed to decrypt payload:", error);
    return payload;
  }
}
