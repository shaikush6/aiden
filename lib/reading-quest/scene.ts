// Picture scenes for sentence and story pictures, so the picture shows what the sentence says.
//   "🐜 in 🍳"        ant inside the pan          "🦆 on 🪵"    duck on top of the log
//   "🐛 under 🪨"     bug underneath the rock     "🐘 by 🛞"    elephant next to the wheel
//   "6🐛 on 🪵"       six bugs (to count!)        "🐿️+🐟 on 🚢" two things together, on the ship
//   "👧 🐚 in 🥅"     girl, beside a shell in a net (spaces separate things side by side)
// Chains read left to right: "🐝 on 🍑 in 🌳" is (bee on peach) in tree.
// A string with no spaces is a plain row of emoji, as before.

export type Relation = 'in' | 'on' | 'under' | 'by'

export type SceneNode =
  | { kind: 'item'; emoji: string; count: number }
  | { kind: 'group'; items: SceneNode[] }
  | { kind: 'rel'; rel: Relation; a: SceneNode; b: SceneNode }

const RELATIONS = new Set<string>(['in', 'on', 'under', 'by'])
const MAX_COUNT = 12

function parseItem(token: string): SceneNode {
  const parts = token.split('+').filter(Boolean)
  if (parts.length > 1) return { kind: 'group', items: parts.map(parseItem) }
  const m = /^(\d+)(.+)$/.exec(token)
  // A leading number is a count, unless it is part of a keycap emoji like 6️⃣.
  if (m && !/^[️⃣]/.test(m[2])) return { kind: 'item', emoji: m[2], count: Math.min(MAX_COUNT, Number(m[1])) }
  return { kind: 'item', emoji: token, count: 1 }
}

/** Parse a scene string into things shown side by side. Throws on a malformed scene. */
export function parseScene(scene: string): SceneNode[] {
  const tokens = scene.trim().split(/\s+/)
  const out: SceneNode[] = []
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]
    if (RELATIONS.has(t)) {
      const a = out.pop()
      const next = tokens[++i]
      if (!a || !next || RELATIONS.has(next)) throw new Error(`"${t}" needs a picture on both sides in "${scene}"`)
      out.push({ kind: 'rel', rel: t as Relation, a, b: parseItem(next) })
    } else {
      out.push(parseItem(t))
    }
  }
  return out
}
