// Accounts: a username and a password, nothing else. Passwords are stored only as scrypt hashes.
// Signing in gives the browser a random session token in an httpOnly cookie; the token is looked up in the store.
import { randomBytes, scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from 'node:crypto'
import type { NextRequest } from 'next/server'
import { kvAvailable, kvDel, kvGet, kvGetJson, kvSet, kvSetNew } from './kv.ts'

const scrypt = (password: string, salt: Buffer, len: number, opts: ScryptOptions) =>
  new Promise<Buffer>((resolve, reject) => scryptCb(password, salt, len, opts, (err, key) => (err ? reject(err) : resolve(key))))

export const SESSION_COOKIE = 'aiden_session'
const SESSION_DAYS = 180
const SCRYPT = { N: 16384, r: 8, p: 1 }

export interface User { username: string; displayName: string; hash: string; salt: string; createdAt: number }

const userKey = (u: string) => `aiden:user:${u}`
const sessionKey = (t: string) => `aiden:session:${t}`

/** Usernames are typed by hand, so compare them without caring about case or spaces. */
export const normalizeUsername = (s: string): string => s.trim().toLowerCase()

export function checkUsername(raw: string): string | null {
  const u = normalizeUsername(raw)
  if (u.length < 2 || u.length > 24) return 'A username needs 2 to 24 letters.'
  if (!/^[a-z0-9_-]+$/.test(u)) return 'Use only letters, numbers, - and _.'
  return null
}

export function checkPassword(p: string): string | null {
  if (p.length < 6) return 'The password needs at least 6 characters.'
  if (p.length > 200) return 'That password is too long.'
  return null
}

/** Accounts work when there is a store. Without one (never in production here) the app stays open and local-only. */
export const authEnabled = (): boolean => kvAvailable()

/** New accounts need the family's invite code, so strangers cannot sign up and spend the AI budget. */
export function inviteOk(code: string | undefined | null): boolean {
  const expected = (process.env.INVITE_CODE ?? (process.env.NODE_ENV !== 'production' ? 'AIDEN-DEV' : '')).trim()
  if (!expected) return false
  const a = Buffer.from((code ?? '').trim().toUpperCase())
  const b = Buffer.from(expected.toUpperCase())
  return a.length === b.length && timingSafeEqual(a, b)
}

async function hashPassword(password: string, salt: Buffer): Promise<string> {
  return (await scrypt(password, salt, 64, SCRYPT)).toString('hex')
}

export async function createUser(rawUsername: string, password: string): Promise<User | 'taken'> {
  const username = normalizeUsername(rawUsername)
  const salt = randomBytes(16)
  const user: User = { username, displayName: rawUsername.trim().slice(0, 24), hash: await hashPassword(password, salt), salt: salt.toString('hex'), createdAt: Date.now() }
  return (await kvSetNew(userKey(username), JSON.stringify(user))) ? user : 'taken'
}

export async function verifyUser(rawUsername: string, password: string): Promise<User | null> {
  const user = await kvGetJson<User>(userKey(normalizeUsername(rawUsername)))
  // Hash even when the user does not exist, so a wrong username takes as long as a wrong password.
  const salt = user ? Buffer.from(user.salt, 'hex') : randomBytes(16)
  const hash = Buffer.from(await hashPassword(password, salt), 'hex')
  if (!user) return null
  const stored = Buffer.from(user.hash, 'hex')
  return stored.length === hash.length && timingSafeEqual(stored, hash) ? user : null
}

export async function getUser(username: string): Promise<User | null> {
  return kvGetJson<User>(userKey(username))
}

export async function createSession(username: string): Promise<{ token: string; maxAge: number }> {
  const token = randomBytes(32).toString('base64url')
  const maxAge = SESSION_DAYS * 86_400
  await kvSet(sessionKey(token), username, maxAge)
  return { token, maxAge }
}

export async function endSession(token: string | undefined): Promise<void> {
  if (token) await kvDel(sessionKey(token))
}

/** The signed-in username for this request, or null. */
export async function sessionUser(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (!token || token.length > 100) return null
  try { return await kvGet(sessionKey(token)) } catch { return null }
}

export function sessionCookie(token: string, maxAge: number) {
  return { name: SESSION_COOKIE, value: token, httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/', maxAge }
}
