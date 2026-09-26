// Spoken-script markup, so the voice never confuses letter NAMES with letter SOUNDS.
//
//   /p/   a phonics SOUND. The real recording plays here (text-to-speech would say "pee").
//         The key is a phoneme key: /a/ /sh/ /ai/ /oo/ /uu/ /ar/ …
//   [p]   a letter NAME, when the script means the letter itself ("the letter [p]").
//
// Example: "The letter [p] says /p/. Like popping bubbles: /p/ /p/ /p/!"
import { soundSource } from './phonemes.ts'

export type ScriptPart = { text: string } | { phoneme: string }

const SOUND = /\/([a-z]+)\//g
const LETTERS = /\[([a-z]+)\]/g

/** Letters in [brackets] become capitals, which text-to-speech reads as letter names: [igh] → "I G H". */
function speakLetters(text: string): string {
  return text.replace(LETTERS, (_, l: string) => l.toUpperCase().split('').join(' '))
}

/** Spoken piece: letters named, leading punctuation left over from a sound marker removed. */
function cleanPiece(text: string): string {
  return speakLetters(text).replace(/^[\s.,:;!?]+/, '').trim()
}

/** Split a script into spoken text and phonics sounds, in order. Punctuation-only pieces are dropped. */
export function parseScript(script: string): ScriptPart[] {
  const parts: ScriptPart[] = []
  let last = 0
  for (const m of script.matchAll(SOUND)) {
    const before = script.slice(last, m.index)
    if (/[a-z0-9]/i.test(before)) parts.push({ text: cleanPiece(before) })
    parts.push({ phoneme: m[1] })
    last = (m.index ?? 0) + m[0].length
  }
  const rest = script.slice(last)
  if (/[a-z0-9]/i.test(rest)) parts.push({ text: cleanPiece(rest) })
  return parts
}

/** The text pieces that must be pre-approved for text-to-speech. */
export function spokenFragments(script: string): string[] {
  return parseScript(script).flatMap(p => ('text' in p ? [p.text] : []))
}

/** How a script reads on screen: sounds keep phonics slashes, letters appear as themselves. */
export function displayScript(script: string): string {
  return script.replace(LETTERS, '$1')
}

/** Problems in a script: unknown sound keys, or a sound written as plain text after "says". */
export function checkScript(script: string): string[] {
  const problems: string[] = []
  for (const m of script.matchAll(SOUND)) {
    try { soundSource(m[1]) } catch { problems.push(`unknown sound /${m[1]}/`) }
  }
  // "says X" / "say X" / "sounds like X" must be followed by a /sound/, a [letter], or ordinary words.
  const ALLOWED_AFTER = /^(\/|\[|its\b|it\b|the\b|a\b|an\b|just\b|too\b|this\b|with\b|together\b|be-cause|beau|one\b|their\b|thank\b|hello\b)/i
  for (const m of script.matchAll(/\b(says|say|sounds like|sound like)\s+(\S+)/gi)) {
    const next = m[2]
    if (!ALLOWED_AFTER.test(next)) problems.push(`"${m[0]}" — write the sound as /x/ so the real recording plays`)
  }
  // "…its name, ay" — the name must be a marker too, so the right recording plays.
  for (const m of script.matchAll(/its name[,:]\s+([^\s/[][^\s]*)/gi)) {
    problems.push(`"${m[0]}" — write the name sound as /x/`)
  }
  return problems
}
