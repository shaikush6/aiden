// Every fixed line Block Buddy Land speaks, in Kit's teacher voice and in the narrator's voice.
// Components read NL, which picks the right style from the quest's narrator setting.
import { getProgress } from '../reading-quest/progress.ts'

export const KIT_NL = {
  welcome: 'Welcome to Block Buddy Land! Count blocks, learn the signs, and solve number mysteries.',
  mapHint: 'Tap the glowing circle to start your next adventure!',
  locked: 'That one is still locked. Finish the glowing one first!',
  meetBuddy: 'Meet a new Block Buddy! Watch it build, and count along.',
  build: 'Build a Block Buddy that is this big. Tap plus to add blocks, then tap check.',
  rocket: 'Tap the matching number as fast as you can!',
  rocketWord: 'Read each number name, and tap that number as fast as you can!',
  tapSounds: 'Now tap each sound in the name.',
  wordBond: 'Split the word! Tap the gap between the first sound and the rest.',
  soundCompare: 'Read both words. Which word has more sounds?',
  bondDemo: 'Watch! The first sound goes on the left, and the rest of the word goes on the right.',
  blendBack: 'Now blend them back together!',
  learnDone: 'Got it? Let us try some!',
  helpTip: 'Stuck? Tap the light bulb, and I will explain it again.',
  showMe: 'Here is a picture to help.',
  blankHelp: 'This is the mystery spot. Tap the answer card that fits!',
  bookWelcome: 'This is your Buddy Book! Tap any Block Buddy or sign to learn about it.',
  bookLocked: 'You have not met this one yet. Keep exploring!',
  levelDone: 'You did it! Great counting!',
  newTown: 'A new town is open!',
  countTogether: 'Let us count together!',
}

export type NLKey = keyof typeof KIT_NL

export const NARRATOR_NL: Record<NLKey, string> = {
  welcome: 'Welcome, explorer, to Block Buddy Land! Count blocks, learn the signs, and solve number mysteries. Let the adventure begin!',
  mapHint: 'Where to next, explorer? Tap the glowing circle, and let’s go!',
  locked: 'Not so fast! That one is still locked. Finish the glowing one first!',
  meetBuddy: 'A brand new Block Buddy! Watch it build, block by block, and count along with me!',
  build: 'Builder time! Stack up a Block Buddy that is this big. Tap plus to add blocks, then tap check!',
  rocket: 'Rocket fuel time! Tap the matching number, super fast!',
  rocketWord: 'Rocket fuel time! Read each number name, and tap that number, super fast!',
  tapSounds: 'Now tap every sound in the name, explorer!',
  wordBond: 'Split that word! Tap the gap between the first sound and the rest!',
  soundCompare: 'Read both words! Which word has more sounds? Count them in your head!',
  bondDemo: 'Watch closely! The first sound goes on the left, and the rest of the word goes on the right!',
  blendBack: 'Now blend them back together!',
  learnDone: 'Got it? Now let’s try some!',
  helpTip: 'Stuck? Tap the light bulb, and I will explain it again!',
  showMe: 'Look! Here is a picture to help!',
  blankHelp: 'This is the mystery spot! Tap the answer card that fits!',
  bookWelcome: 'Welcome to your Buddy Book, explorer! Tap any Block Buddy or sign to learn all about it!',
  bookLocked: 'You have not met this one yet. Keep exploring!',
  levelDone: 'You did it! Amazing counting, explorer!',
  newTown: 'A brand new town is open!',
  countTogether: 'Let’s count together, nice and loud!',
}

function narratorOn(): boolean {
  return getProgress().settings.narrator
}

/** NL.wake returns Kit's wording or the narrator's, depending on the current setting. */
export const NL = {} as Record<NLKey, string>
for (const k of Object.keys(KIT_NL) as NLKey[]) {
  Object.defineProperty(NL, k, { get: () => (narratorOn() ? NARRATOR_NL[k] : KIT_NL[k]), enumerable: true })
}

// ---------- towns ----------

export interface TownNarration { kit: string; arrive: string; complete: string }

export const TOWN_NARRATION: Record<string, TownNarration> = {
  t1: {
    kit: 'Welcome to Counting Cove! Here we meet the numbers by counting blocks.',
    arrive: 'Welcome, explorer, to Counting Cove! Every number has a Block Buddy, and you are about to meet them all. Count along with me!',
    complete: 'You met every number from zero to ten! Next stop: Plus Park, where numbers join together!',
  },
  t2: {
    kit: 'Welcome to Plus Park! Here numbers join together.',
    arrive: 'Welcome to Plus Park, explorer! Here, numbers join together, and you learn the plus sign and the equals sign. Ready to add?',
    complete: 'You are a plus champion! Now climb Minus Mountain, where we take things away!',
  },
  t3: {
    kit: 'Welcome to Minus Mountain! Here we take things away.',
    arrive: 'Look up, explorer! Minus Mountain is tall, and here we take things away. Let’s climb to the top!',
    complete: 'You reached the top of Minus Mountain! On to Compare Castle, where we find the bigger number!',
  },
  t4: {
    kit: 'Welcome to Compare Castle! Which number is bigger? Let us find out.',
    arrive: 'Welcome to Compare Castle, explorer! Here the hungry mouth always eats the bigger number. Watch out for those teeth!',
    complete: 'The hungry mouth is full, and you know which number is bigger! Now climb Teen Tower, where the big numbers live!',
  },
  t5: {
    kit: 'Welcome to Teen Tower! Every teen is a ten and some ones.',
    arrive: 'Look up, explorer! Teen Tower reaches all the way to twenty! Every teen is a gold ten-block with some extra blocks. Climb with me!',
    complete: 'You climbed all the way to twenty, and you can skip count too! Now let’s play in the Pairs Playground!',
  },
  t6: {
    kit: 'Welcome to Pairs Playground! Odd, even, doubles, and making ten.',
    arrive: 'Welcome to the Pairs Playground, explorer! Here everything comes in pairs. Odd and even, doubles, and numbers that make ten!',
    complete: 'You are a pairs expert! Now put on your detective hat. The Detective Agency needs you!',
  },
  t7: {
    kit: 'Welcome to the Detective Agency! Listen to the clues and find the number.',
    arrive: 'Welcome to the Detective Agency, explorer! A mystery number is hiding, and the only clues are in the riddles. Listen carefully, detective!',
    complete: 'Case closed! You are an official number detective. One more stop: Word Wizard Tower!',
  },
  t8: {
    kit: 'Welcome to Word Wizard Tower! We read the number names here.',
    arrive: 'Welcome to Word Wizard Tower, explorer! Today we read the names of the numbers, and split words like a real wizard. Let’s go!',
    complete: 'You are a Word Wizard champion! You can count, add, take away, solve mysteries, and read! What a superstar!',
  },
}

export const MISSION_START_NL = [
  'Time for a new adventure!',
  'Explorer, a new mission is waiting for you!',
  'Get ready, explorer. Here comes a new mission!',
] as const

export const MISSION_DONE_NL = [
  'Mission complete!',
  'Great job, explorer!',
  'You did it, explorer!',
] as const

export function pickLine<T extends readonly string[]>(lines: T): T[number] {
  return lines[Math.floor(Math.random() * lines.length)]
}
