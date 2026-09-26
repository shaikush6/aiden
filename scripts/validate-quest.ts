// Checks the Reading Quest curriculum for words or sentences that use sounds not yet taught.
// Usage: npm run quest:check
import { summary, validateCurriculum, validatePlans } from '../lib/reading-quest/validate.ts'

const errors = [...validateCurriculum(), ...validatePlans()]
const s = summary()
console.log(`Levels: ${s.levels} · practice words: ${s.practiceWords} · sounds taught: ${s.sounds}`)
if (errors.length) {
  console.error(`\n${errors.length} problem(s):`)
  errors.forEach(e => console.error('  ✗ ' + e))
  process.exit(1)
}
console.log('✓ Every word, sentence and story is decodable at its level.')
