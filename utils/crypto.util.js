import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";

export function createOpaqueToken(size = 32) {
  return randomBytes(size).toString("hex");
}

export function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password, storedHash) {
  const [salt, currentHash] = String(storedHash || "").split(":");

  if (!salt || !currentHash) {
    return false;
  }

  const derivedKey = scryptSync(password, salt, 64);
  const currentBuffer = Buffer.from(currentHash, "hex");

  if (derivedKey.length !== currentBuffer.length) {
    return false;
  }

  return timingSafeEqual(derivedKey, currentBuffer);
}
