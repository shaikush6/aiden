// Every fixed sentence the quest says, in two styles:
//   KIT_LINES       — Kit the fox, a warm teacher voice (narrator mode off)
//   NARRATOR_LINES  — a high-energy adventure-show narrator (narrator mode on)
// Components read LINES, which picks the right style from the current settings.
// All of these are pre-approved for text-to-speech by the server allowlist.
import { getProgress } from './progress.ts'
import type { Sport } from './types.ts'

export const KIT_LINES = {
  welcome: 'Hi! I am Kit the fox. Animals need our help! Read words to power up and rescue them.',
  mapHint: 'Tap the glowing circle to start your next rescue!',
  locked: 'That one is still locked. Finish the glowing one first!',
  newSound: 'New sound!',
  meetExamples: 'Tap each picture to hear the sound in a word.',
  whichSound: 'Listen. Which one says this sound?',
  blend: 'Tap each sound button. Then tap the arrow to blend them together.',
  blendPick: 'What word did you hear? Tap the picture.',
  readPick: 'Read the word. Then tap the picture that matches.',
  build: 'Build this word. Tap the sounds in order.',
  goal: 'Kick the ball that says',
  hoop: 'Shoot the ball that says',
  net: 'Hit the ball over the net. Pick the one that says',
  alien: 'Real word or alien word? Read it, then tap the Earth or the alien.',
  realWord: 'Yes! That is a real word.',
  alienWord: 'Yes! That is an alien word!',
  heartWord: 'Heart word! Part of this word is tricky, so we learn it by heart.',
  findWord: 'Find the word',
  sentenceYesNo: 'Read the question. Then tap yes or no.',
  sentencePic: 'Read it. Then tap the picture that matches.',
  story: 'Story time! Read each page. Tap any word if you need help.',
  storyQuestions: 'Now, some questions about the story!',
  help: 'Tap the sound buttons to help you read it.',
  reveal: 'Here is the answer. Let’s look at it together.',
  levelDone: 'You did it! You earned a creature card!',
  newWorld: 'A new world is open!',
  combo: 'Combo! Your creature power is charging!',
  reserve: 'Welcome to the animal reserve! Tap an animal to say hello.',
  soundBlocks: 'How many sounds are in this word? Build a tower with one block for each sound.',
  readNumber: 'Read the number word. Then build a Block Buddy that big.',
  storySum: 'Read the number story. Then tap the right Block Buddy.',
  sumLeft: 'How many are left?',
  sumNow: 'How many are there now?',
  wordChain: 'Change one sound to make the new word',
  bubblePop: 'Pop every bubble that says',
  rocketRead: 'Read each word and tap its picture, as fast as you can!',
  blastOff: 'Blast off! Great fast reading!',
  newRecord: 'Wow! That is a new record!',
}

export type LineKey = keyof typeof KIT_LINES

export const NARRATOR_LINES: Record<LineKey, string> = {
  welcome: 'Hey hey, explorer! Welcome to the Reading Quest! Animals all over the world need your help, and every word you read gives you creature power! Let’s go!',
  mapHint: 'Where to next, explorer? Tap the glowing circle, and let’s go rescue some animals!',
  locked: 'Not so fast! That one is still locked. Finish the glowing mission first!',
  newSound: 'A brand new sound! Listen to this.',
  meetExamples: 'Now tap every picture, and listen for our new sound!',
  whichSound: 'Ears on, explorer! Which one makes this sound?',
  blend: 'Power up each sound button, one, two, three! Then smash that arrow to blend them together!',
  blendPick: 'Did you hear it? Quick, tap the picture!',
  readPick: 'Read it with your super eyes! Then tap the picture that matches!',
  build: 'Let’s build it! Tap the sounds in order, just like a builder!',
  goal: 'Here comes the big kick! Kick the ball that says',
  hoop: 'Time to shoot some hoops! Shoot the ball that says',
  net: 'Volleyball time! Hit the ball over the net. Pick the one that says',
  alien: 'Uh oh, an alien spaceship! Is this a real Earth word, or a silly alien word? Read it and decide!',
  realWord: 'Yes! That is a real Earth word!',
  alienWord: 'You got it! That is a silly alien word!',
  heartWord: 'Heart word alert! This word has a tricky part, so we learn it by heart!',
  findWord: 'Quick, find the word',
  sentenceYesNo: 'Read the whole question, explorer! Then tap yes or no!',
  sentencePic: 'Read it all the way to the end! Then tap the picture that matches!',
  story: 'Story time! Read each page, and tap any word if you need a little help!',
  storyQuestions: 'Now, let’s see how much you remember!',
  help: 'Tap the sound buttons for a little help!',
  reveal: 'Here’s the answer! Let’s look at it together.',
  levelDone: 'You did it! Creature card unlocked!',
  newWorld: 'A brand new world is open!',
  combo: 'Combo! Your creature power is charging up.',
  reserve: 'Welcome to your animal reserve, explorer! Every animal here was saved by you. Tap one to say hello!',
  soundBlocks: 'Block Buddy time! Build a tower with one block for every sound you hear!',
  readNumber: 'Read the number word, then build a Block Buddy exactly that big!',
  storySum: 'Number story time! Read it, then tap the right Block Buddy!',
  sumLeft: 'So, how many are left?',
  sumNow: 'So, how many are there now?',
  wordChain: 'Build the bridge! Change just one sound to make the new word',
  bubblePop: 'Bubble attack! Pop every bubble that says',
  rocketRead: 'Rocket fuel time! Read each word and tap its picture, super fast!',
  blastOff: 'Three, two, one, blast off! Great fast reading!',
  newRecord: 'Wow, a new record!',
}

function narratorOn(): boolean {
  return getProgress().settings.narrator
}

/** LINES.x returns Kit's wording or the narrator's, depending on the current setting. */
export const LINES = {} as Record<LineKey, string>
for (const k of Object.keys(KIT_LINES) as LineKey[]) {
  Object.defineProperty(LINES, k, { get: () => (narratorOn() ? NARRATOR_LINES[k] : KIT_LINES[k]), enumerable: true })
}

// Cheers are plain, full sentences on purpose: the voice model turns short shouted exclamations
// ("Woo-hoo!", "Fantastic!") into squeals and howls.
export const KIT_PRAISE = [
  'Yay, you did it!', 'Alright, that is right!', 'You did it!', 'Nice job!',
  'Good job, that is right.', 'Well done!', 'Yes, you got it!', 'Great reading!',
] as const

export const NARRATOR_PRAISE = [
  'Yay, you did it, explorer!', 'Alright, that is right!', 'You did it! Great reading!',
  'Nice job, explorer!', 'Yes, you got it!', 'Well done! That is right!',
  'Good job! You are a great reader!', 'Great reading, explorer!',
] as const

export const KIT_RETRY = ['Almost! Try again.', 'Good try! Look again.', 'Hmm, try another one.'] as const

export const NARRATOR_RETRY = [
  'So close! Try again, explorer.', 'Not quite! Look again, you can do it!', 'Hmm, give it another try!',
] as const

/** What the guide says when the right ball scores, per sport. */
export const KIT_SCORE: Record<Sport, string> = {
  soccer: 'Goal! Nice kick.',
  basketball: 'Swish! Nice shot.',
  volleyball: 'Point! Nice hit.',
}
export const NARRATOR_SCORE: Record<Sport, string> = {
  soccer: 'Goal! What a great kick!',
  basketball: 'Swish! What a great shot!',
  volleyball: 'Point! What a great hit!',
}

const pick = <T extends readonly string[]>(arr: T) => arr[Math.floor(Math.random() * arr.length)]

export function randomPraise(): string {
  return pick(narratorOn() ? NARRATOR_PRAISE : KIT_PRAISE)
}

export function randomRetry(): string {
  return pick(narratorOn() ? NARRATOR_RETRY : KIT_RETRY)
}

export function goalLine(sport: Sport = 'soccer'): string {
  return (narratorOn() ? NARRATOR_SCORE : KIT_SCORE)[sport]
}

/** The instruction that leads into the spoken word, per sport. */
export function sportAsk(sport: Sport): string {
  return sport === 'basketball' ? LINES.hoop : sport === 'volleyball' ? LINES.net : LINES.goal
}

export function rescuedLine(animalName: string): string {
  return `You rescued the ${animalName.toLowerCase()}!`
}
