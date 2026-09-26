// Every fixed sentence the guide (Kit the fox) says. Dynamic content (words, tips, facts) comes from the curriculum.
// All of these are pre-approved for text-to-speech by the server allowlist.

export const LINES = {
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
} as const

export const PRAISE = [
  'Yes! Great reading!',
  'You got it!',
  'Awesome!',
  'Creature power!',
  'Wild! That is right!',
  'Super reader!',
  'Amazing!',
  'Fantastic!',
] as const

export const RETRY = [
  'Almost! Try again.',
  'Good try! Look again.',
  'Hmm, try another one.',
] as const

export const GOAL = 'Goal!'

export function rescuedLine(animalName: string): string {
  return `You rescued the ${animalName.toLowerCase()}!`
}

export function randomPraise(): string {
  return PRAISE[Math.floor(Math.random() * PRAISE.length)]
}
