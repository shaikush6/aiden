// Short animated lessons. Each beat is something Kit says while the picture on the stage changes.
// A lesson plays when a new idea is introduced, and again whenever the child taps the 💡 button
// or taps a sign he does not know yet.
import type { Sign, Term, Topic } from './terms.ts'

export interface Beat {
  say: string
  terms: Term[]
}

export interface Lesson {
  topic: Topic
  title: string
  icon: string
  beats: Beat[]
}

const B = (n: number, fx?: 'pairs' | 'leftover' | 'glow'): Term => ({ t: 'buddy', n, fx })
const N = (n: number, fx?: 'glow'): Term => ({ t: 'num', n, fx })
const S = (s: Sign, fx?: 'glow'): Term => ({ t: 'sign', s, fx })
const T = (text: string): Term => ({ t: 'text', text })
const I = (emoji: string, n: number, faded = 0): Term => ({ t: 'items', emoji, n, faded })

export const LESSONS: Record<Topic, Lesson> = {
  numerals: {
    topic: 'numerals',
    title: 'Numbers',
    icon: '🔢',
    beats: [
      { say: 'Every number has a Block Buddy, and a numeral that is its picture in writing.', terms: [B(3), N(3)] },
      { say: 'Count the blocks, and you find the number. Tap a number any time to hear its name!', terms: [B(5), N(5)] },
    ],
  },

  plus: {
    topic: 'plus',
    title: 'The plus sign',
    icon: '➕',
    beats: [
      { say: 'Here are two blocks.', terms: [B(2)] },
      { say: 'And here are three more blocks.', terms: [B(2), B(3)] },
      { say: 'This is the plus sign. It means: put them together!', terms: [B(2), S('+', 'glow'), B(3)] },
      { say: 'Together, they make five blocks!', terms: [B(5)] },
      { say: 'Two plus three makes five. Plus makes things bigger!', terms: [N(2), S('+'), N(3), T('makes'), N(5)] },
    ],
  },

  equals: {
    topic: 'equals',
    title: 'The equals sign',
    icon: '🟰',
    beats: [
      { say: 'This is the equals sign. It means: the same as!', terms: [S('=', 'glow')] },
      { say: 'Two blocks plus one block is the same as three blocks.', terms: [B(2), S('+'), B(1), S('=', 'glow'), B(3)] },
      { say: 'Two plus one equals three. Both sides are the same!', terms: [N(2), S('+'), N(1), S('=', 'glow'), N(3)] },
    ],
  },

  minus: {
    topic: 'minus',
    title: 'The minus sign',
    icon: '➖',
    beats: [
      { say: 'Here are five blocks.', terms: [B(5)] },
      { say: 'This is the minus sign. It means: take some away!', terms: [B(5), S('−', 'glow'), B(2)] },
      { say: 'Take two away, and three blocks are left.', terms: [B(3)] },
      { say: 'Five minus two equals three. Minus makes things smaller!', terms: [N(5), S('−'), N(2), S('='), N(3)] },
    ],
  },

  compare: {
    topic: 'compare',
    title: 'More and less',
    icon: '⚖️',
    beats: [
      { say: 'Which Block Buddy has more blocks? Let us look!', terms: [B(3), T('or'), B(5)] },
      { say: 'Count the blocks. Three, and five. Five has more blocks!', terms: [B(3), T('or'), B(5, 'glow')] },
      { say: 'Five is more than three.', terms: [N(5, 'glow'), T('is more than'), N(3)] },
      { say: 'And three is less than five.', terms: [N(3, 'glow'), T('is less than'), N(5)] },
    ],
  },

  signs: {
    topic: 'signs',
    title: 'The hungry mouth',
    icon: '🐊',
    beats: [
      { say: 'These two signs look like a hungry mouth. They tell us which number is bigger!', terms: [S('>', 'glow'), S('<', 'glow')] },
      { say: 'The mouth always opens to the bigger number. It wants the most food!', terms: [N(5), S('>', 'glow'), N(3)] },
      { say: 'Five is more than three, so the mouth opens to the five.', terms: [N(5, 'glow'), S('>'), N(3)] },
      { say: 'Now the mouth opens the other way. Three is less than five.', terms: [N(3), S('<', 'glow'), N(5, 'glow')] },
      { say: 'If both numbers are the same, we use the equals sign. Four equals four.', terms: [N(4), S('=', 'glow'), N(4)] },
    ],
  },

  oddEven: {
    topic: 'oddEven',
    title: 'Odd and even',
    icon: '🎲',
    beats: [
      { say: 'Let us make pairs! Two blocks make one pair.', terms: [B(2, 'pairs')] },
      { say: 'Six blocks make three pairs. Nobody is left over, so six is even.', terms: [B(6, 'pairs')] },
      { say: 'Five blocks make two pairs, and one block is left over. So five is odd.', terms: [B(5, 'leftover')] },
      { say: 'Even means everyone has a partner. Odd means one is left over!', terms: [B(4, 'pairs'), B(3, 'leftover')] },
    ],
  },

  teen: {
    topic: 'teen',
    title: 'Teen numbers',
    icon: '🏗️',
    beats: [
      { say: 'Big numbers use a gold ten-block. It is ten blocks all stuck together!', terms: [B(10)] },
      { say: 'Eleven is a ten, and one more.', terms: [B(11)] },
      { say: 'Thirteen is a ten, and three more.', terms: [B(13)] },
      { say: 'Every teen number is a ten and some ones. Fifteen is ten and five!', terms: [B(15)] },
    ],
  },

  next: {
    topic: 'next',
    title: 'What comes next?',
    icon: '🪜',
    beats: [
      { say: 'Numbers go in order, like steps on a stair.', terms: [N(1), N(2), N(3), N(4), N(5)] },
      { say: 'After three comes four. Each number is one more than the number before.', terms: [N(2), N(3), N(4, 'glow')] },
      { say: 'Before four comes three. Each number is one less than the number after.', terms: [N(3, 'glow'), N(4), N(5)] },
    ],
  },

  skip: {
    topic: 'skip',
    title: 'Skip counting',
    icon: '🐸',
    beats: [
      { say: 'Let us count by twos. We skip a number every time!', terms: [N(1), N(2, 'glow'), N(3), N(4, 'glow'), N(5), N(6, 'glow'), N(7), N(8, 'glow')] },
      { say: 'Two, four, six, eight, ten!', terms: [N(2), N(4), N(6), N(8), N(10)] },
      { say: 'Now count by fives. Five, ten, fifteen, twenty!', terms: [N(5), N(10), N(15), N(20)] },
    ],
  },

  double: {
    topic: 'double',
    title: 'Doubles',
    icon: '👯',
    beats: [
      { say: 'Double means two of the same number!', terms: [B(3), S('+'), B(3)] },
      { say: 'Double three is six. Three plus three makes six.', terms: [B(6)] },
      { say: 'Double four is eight. Four plus four makes eight!', terms: [B(4), S('+'), B(4), T('makes'), B(8)] },
    ],
  },

  bond: {
    topic: 'bond',
    title: 'Making ten',
    icon: '🔟',
    beats: [
      { say: 'A number can break into two parts. Look at ten!', terms: [B(10)] },
      { say: 'Seven and three make ten.', terms: [B(7), S('+'), B(3), T('makes'), B(10)] },
      { say: 'Every number has a friend that makes ten with it. Six and four. Five and five!', terms: [N(6), S('+'), N(4), T('and'), N(5), S('+'), N(5)] },
    ],
  },

  riddle: {
    topic: 'riddle',
    title: 'Number riddles',
    icon: '🔍',
    beats: [
      { say: 'A riddle is a number mystery! The clues help us find the number.', terms: [{ t: 'strip', from: 1, to: 10, out: [] }] },
      { say: 'I am more than three. So it is not one, not two and not three.', terms: [{ t: 'strip', from: 1, to: 10, out: [1, 2, 3] }] },
      { say: 'I am less than six. So it is not six, seven, eight, nine or ten.', terms: [{ t: 'strip', from: 1, to: 10, out: [1, 2, 3, 6, 7, 8, 9, 10] }] },
      { say: 'Only four and five are left. I am odd. Five is odd, so I am five!', terms: [{ t: 'strip', from: 1, to: 10, out: [1, 2, 3, 4, 6, 7, 8, 9, 10], glow: [5] }] },
    ],
  },

  story: {
    topic: 'story',
    title: 'Number stories',
    icon: '📖',
    beats: [
      { say: 'Number stories are about animals. Listen closely, and picture it!', terms: [I('🐸', 3)] },
      { say: 'Three frogs sit on a log. Two more frogs hop on.', terms: [I('🐸', 3), S('+'), I('🐸', 2)] },
      { say: 'How many frogs now? Count them all. Five frogs!', terms: [I('🐸', 5), N(5)] },
    ],
  },

  words: {
    topic: 'words',
    title: 'Reading the words',
    icon: '🔤',
    beats: [
      { say: 'Every number has a name you can read. Tap each sound button to hear the sounds.', terms: [{ t: 'word', text: 'six' }, N(6)] },
      { say: 'Then blend the sounds together. Six! The word matches the numeral.', terms: [{ t: 'word', text: 'six' }, N(6)] },
    ],
  },
}

export const lessonScripts = (): string[] => Object.values(LESSONS).flatMap(l => l.beats.map(b => b.say))
