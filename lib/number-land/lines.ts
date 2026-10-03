// Every fixed line Block Buddy Land speaks, in Kit's teacher voice and in the narrator's voice.
// Components read NL, which picks the right style from the quest's narrator setting.
import { getProgress } from '../reading-quest/progress.ts'

export const KIT_NL = {
  welcome: 'Welcome to Block Buddy Land! Read the number names to wake up the Block Buddies.',
  mapHint: 'Tap the glowing house to visit your next Block Buddy!',
  locked: 'That house is still locked. Finish the glowing one first!',
  meetBuddy: 'Meet a new Block Buddy! Watch it build, and count along.',
  tapSounds: 'Now tap each sound in the name.',
  meetWord: 'A new math word! Tap each sound, then tap show me.',
  wake: 'Read the name to wake up the sleeping Block Buddy. Then tap the one that is that big.',
  build: 'Read the number name. Then build a Block Buddy that big.',
  equation: 'Read the number sentence. Then tap the Block Buddy that finishes it.',
  riddle: 'Detective time! Read every clue. Then tap the Block Buddy who fits them all.',
  oddEven: 'Read the question. Then tap odd or even.',
  compare: 'Read the question. Then tap the right number name.',
  story: 'Number story! Read it, then tap the right Block Buddy.',
  wordBond: 'Split the word! Tap the gap between the first sound and the rest.',
  soundCompare: 'Read both words. Which word has more sounds?',
  rocket: 'Read each number name and tap that Block Buddy, as fast as you can!',
  showMe: 'Here are the Block Buddies.',
  riddleHelp: 'These are the numbers that still fit.',
  bondDemo: 'Watch! The first sound goes on the left, and the rest of the word goes on the right.',
  blendBack: 'Now blend them back together!',
  bookWelcome: 'This is your Buddy Book! Tap a Block Buddy to say hello.',
  bookLocked: 'You have not met this Block Buddy yet.',
  levelDone: 'You did it! More Block Buddies are awake!',
  newTown: 'A new town is open!',
  countTogether: 'Let us count together!',
}

export type NLKey = keyof typeof KIT_NL

export const NARRATOR_NL: Record<NLKey, string> = {
  welcome: 'Welcome, explorer, to Block Buddy Land! The Block Buddies are fast asleep, and only YOU can wake them. Read their names, and let the counting begin!',
  mapHint: 'Where to next, explorer? Tap the glowing house, and let’s meet another Block Buddy!',
  locked: 'Whoa, not so fast! That house is still locked. Finish the glowing one first!',
  meetBuddy: 'Ooh, a brand new Block Buddy! Watch it build, block by block, and count along with me!',
  tapSounds: 'Now tap every sound in the name, explorer!',
  meetWord: 'A brand new math word! Tap each sound, then smash that show me button!',
  wake: 'Shhh! A Block Buddy is sleeping! Read its name to wake it up, then tap the buddy that is exactly that big!',
  build: 'Builder time! Read the number name, then stack up a Block Buddy that big!',
  equation: 'Number sentence alert! Read it, then tap the Block Buddy that finishes it!',
  riddle: 'Detective time, explorer! Read every clue, then find the Block Buddy who fits them all!',
  oddEven: 'Read the question! Is it odd, or is it even? Tap your answer!',
  compare: 'Read the question, then tap the right number name!',
  story: 'Number story! Read every sentence, then tap the right Block Buddy!',
  wordBond: 'Split that word! Tap the gap between the first sound and the rest!',
  soundCompare: 'Read both words! Which word has more sounds? Count them in your head!',
  rocket: 'Rocket fuel time! Read each number name and tap that Block Buddy, super fast!',
  showMe: 'Here come the Block Buddies!',
  riddleHelp: 'Look! These are the numbers that still fit!',
  bondDemo: 'Watch closely! The first sound goes on the left, and the rest of the word goes on the right!',
  blendBack: 'Now blend them back together!',
  bookWelcome: 'Welcome to your Buddy Book, explorer! Tap any Block Buddy to say hello!',
  bookLocked: 'You have not met this Block Buddy yet. Keep exploring!',
  levelDone: 'You did it! More Block Buddies are awake, thanks to YOU!',
  newTown: 'Whoa! A brand new town is open!',
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
    kit: 'Welcome to Tiny Town! The littlest Block Buddies live here.',
    arrive: 'Welcome, explorer, to Tiny Town! The littlest Block Buddies in the whole world live right here, and every one of them is fast asleep. Read their names to wake them up!',
    complete: 'Tiny Town is wide awake! Zero, one, two, three, four and five are all cheering for you. But there are bigger buddies down on Six Street!',
  },
  t2: {
    kit: 'Welcome to Six Street! The bigger Block Buddies live here.',
    arrive: 'Look at those tall Block Buddies! Welcome to Six Street, explorer, where six, seven, eight, nine and ten are waiting. Read their names to wake them up!',
    complete: 'Six Street is wide awake! You met every Block Buddy up to ten. Now let’s learn some math words in the park!',
  },
  t3: {
    kit: 'Welcome to Math Word Park! Here we read words like plus and minus.',
    arrive: 'Welcome to Math Word Park, explorer! Here the Block Buddies play, and every game has a math word. Read the words, then make the math happen!',
    complete: 'You read every math word in the park! Next stop: the Teen Tower, where the really big buddies live!',
  },
  t4: {
    kit: 'Welcome to Teen Tower! Every teen is a ten with some ones.',
    arrive: 'Look up, explorer! Teen Tower reaches all the way to twenty! Every teen is a ten-block with some extra blocks. Read the names, and climb!',
    complete: 'You climbed all the way to twenty! You can read every number from zero to twenty. Now it’s time for some detective work!',
  },
  t5: {
    kit: 'Welcome to the Detective Agency! Read the clues and find the Block Buddy.',
    arrive: 'Welcome to the Detective Agency, explorer! A mystery Block Buddy is hiding, and the only clues are in the words. Read carefully, detective!',
    complete: 'Case closed! You are an official number detective. One more stop: the Word Gym, where we train our reading muscles!',
  },
  t6: {
    kit: 'Welcome to the Word Gym! We train our reading muscles here.',
    arrive: 'Welcome to the Word Gym, explorer! Today we train the most important muscle of all: your reading brain. Let’s split some words!',
    complete: 'You are a Word Gym champion! You can read, count, add, take away, and solve mysteries. What a superstar!',
  },
}

export const MISSION_START_NL = [
  'Time to wake up some Block Buddies!',
  'Explorer, more Block Buddies are waiting for you!',
  'Get ready, explorer. Here comes a new mission!',
] as const

export const MISSION_DONE_NL = [
  'Mission complete!',
  'Block Buddies saved!',
  'You did it, explorer!',
] as const

export function pickLine<T extends readonly string[]>(lines: T): T[number] {
  return lines[Math.floor(Math.random() * lines.length)]
}
