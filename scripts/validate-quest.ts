// Checks the Reading Quest curriculum for words or sentences that use sounds not yet taught.
// Usage: npm run quest:check
import { summary, validateCurriculum, validatePlans } from '../lib/reading-quest/validate.ts'
import { numberLandSummary, validateNumberLand } from '../lib/number-land/validate.ts'

const errors = [...validateCurriculum(), ...validatePlans(), ...validateNumberLand()]
const s = summary()
console.log(`Levels: ${s.levels} · practice words: ${s.practiceWords} · sounds taught: ${s.sounds}`)
const nl = numberLandSummary()
console.log(`Block Buddy Land: ${nl.levels} levels in ${nl.towns} towns · ${nl.numberWords} number words · ${nl.mathWords} math words`)
if (errors.length) {
  console.error(`\n${errors.length} problem(s):`)
  errors.forEach(e => console.error('  ✗ ' + e))
  process.exit(1)
}
console.log('✓ Every word, sentence and story is decodable at its level, and every Block Buddy Land activity is valid.')
