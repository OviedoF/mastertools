import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64);
  return `s1$${salt.toString("hex")}$${key.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [v, saltHex, keyHex] = stored.split("$");
  if (v !== "s1" || !saltHex || !keyHex) return false;
  const key = Buffer.from(keyHex, "hex");
  const got = await scrypt(password, Buffer.from(saltHex, "hex"), key.length);
  return got.length === key.length && timingSafeEqual(got, key);
}

/** Contraseña temporal legible, sin caracteres ambiguos. */
export function tempPassword(): string {
  const abc = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(randomBytes(12), (x) => abc[x % abc.length]).join("");
}
