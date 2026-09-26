// World 3 — Ocean. Consonant digraphs sh ch th ng nk: two letters, one sound (Letters and Sounds Phase 3).
import type { WorldDef } from '../types.ts'
import { w, ws } from './helpers.ts'

export const WORLD_3: WorldDef = {
  id: 'w3',
  name: 'Deep Sea Digraphs',
  emoji: '🐙',
  habitat: 'Ocean',
  theme: 'from-sky-300 via-cyan-200 to-blue-200 dark:from-blue-950 dark:via-slate-900 dark:to-slate-950',
  intro: 'Dive into the deep blue sea! Down here, two letters team up to make one sound.',
  skill: 'Two letters, one sound: sh ch th ng nk, plus heart words she all by they are her',
  levels: [
    {
      id: 'w3-l1',
      title: 'Shh, Shark!',
      animal: {
        emoji: '🦈', name: 'Shark',
        rescue: 'A baby shark is tangled in an old fishing net! Read the words to set her free.',
        fact: 'Sharks never run out of teeth! When a tooth falls out, a new one moves up to take its place.',
        stat: 'Around for 400 million years',
      },
      sounds: [
        { g: 'sh', tip: 'sh says shh, like a quiet library.', emoji: '🤫' },
      ],
      words: [
        w('f.i.sh', '🐟'), w('sh.i.p', '🚢'), w('sh.e.ll', '🐚'), w('d.i.sh', '🍽️'),
        w('sh.o.p', '🏪'), w('c.a.sh', '💵'), w('h.u.sh', '🤫'), w('n.e.t', '🥅'),
        w('r.o.ck', '🪨'), w('s.u.n', '☀️'),
      ],
      heart: [
        { seg: 'sh.e', heart: [1], tip: 'In she, the e says its name, ee: she.' },
      ],
      aliens: ['sh.o.m', 'sh.u.b', 'sh.e.g', 'v.o.sh'],
      sentences: [
        { t: 'Can a fish get wet?', yes: true },
        { t: 'Is a shell as big as a ship?', yes: false },
        { t: 'The fish is in the dish.', pic: '🐟🍽️', alts: ['🐟🚢', '🐚🍽️'] },
        { t: 'She has a shell in a net.', pic: '👧🐚🥅', alts: ['👦🐚🥅', '👧🐟🥅'] },
        { t: 'The ship has cash in a big box.', pic: '🚢💵📦', alts: ['🚢🐚📦', '🚐💵📦'] },
      ],
    },
    {
      id: 'w3-l2',
      title: 'Otter Chomp',
      animal: {
        emoji: '🦦', name: 'Sea Otter',
        rescue: 'A sea otter let go of her friend and is floating away! Read the words to bring her back.',
        fact: 'Sea otters hold paws while they sleep, so they do not float away from each other!',
        stat: 'Up to 1 million hairs per square inch',
      },
      sounds: [
        { g: 'ch', tip: 'ch says ch, like a choo-choo train.', emoji: '🚂' },
      ],
      words: [
        w('ch.i.ck', '🐤'), w('ch.i.ck|e.n', '🐔'), w('ch.e.ss', '♟️'), w('ch.o.p', '🪓'),
        w('p.u.n.ch', '🥊'), w('r.i.ch', '🤑'), w('l.o.g', '🪵'), w('h.u.t', '🛖'),
        w('n.u.t', '🥜'), w('f.i.sh', '🐟'),
      ],
      extra: ws('p.e.ck', 's.e.t', 'ch.i.ck.s'),
      heart: [
        { seg: 'a.ll', heart: [0], tip: 'In all, the a says aw: all.' },
        { seg: 'b.y=igh', heart: [1], tip: 'In by, the y says I: by.' },
      ],
      aliens: ['ch.e.b', 'ch.u.v', 'ch.o.b', 'v.a.ch'],
      sentences: [
        { t: 'Can a chick chop a log?', yes: false },
        { t: 'Can a chicken peck?', yes: true },
        { t: 'The chick is by the chess set.', pic: '🐤♟️', alts: ['🐔♟️', '🐤🪵'] },
        { t: 'All the chicks sat in the hut.', pic: '🐤🐤🐤🛖', alts: ['🐤🛖', '🐤🐤🐤🪵'] },
        { t: 'Can a fish punch a nut?', yes: false },
        { t: 'The chicken got rich! It has a big box of cash.', pic: '🐔💵📦', alts: ['🐤💵📦', '🐔🥜📦'] },
      ],
    },
    {
      id: 'w3-l3',
      title: 'Dolphin Math',
      animal: {
        emoji: '🐬', name: 'Dolphin',
        rescue: 'A baby dolphin swam too far from her family! Read the words to help her swim back.',
        fact: 'Dolphins sleep with only half of their brain at a time. The other half stays awake to watch for danger!',
        stat: 'Swims up to 20 miles per hour',
      },
      sounds: [
        { g: 'th', tip: 'th says th. Put your tongue between your teeth, like in thumb.', emoji: '👍' },
      ],
      words: [
        w('b.a.th', '🛁'), w('m.a.th', '🔢'), w('f.i.sh', '🐟'), w('sh.i.p', '🚢'),
        w('ch.i.ck', '🐤'), w('d.u.ck', '🦆'), w('f.o.x', '🦊'), w('s.u.n', '☀️'),
        w('r.o.ck', '🪨'), w('c.u.p', '☕'),
      ],
      extra: ws('th.i.s', 'th.e.n', 'w.i.th', 'th.a.t', 'th.e.m'),
      heart: [
        { seg: 'th.ey', heart: [1], tip: 'In they, the e and y say ay: they.' },
      ],
      aliens: ['th.u.p', 'th.o.g', 'th.e.b', 'v.i.th'],
      sentences: [
        { t: 'Can a ship fit in a bath?', yes: false },
        { t: 'Math fun: is 5 and 5 ten?', yes: true },
        { t: 'The fish is in this cup, not in the bath.', pic: '🐟☕', alts: ['🐟🛁', '🦆☕'] },
        { t: 'This chick is on a rock with the fox.', pic: '🐤🪨🦊', alts: ['🐤☕🦊', '🦆🪨🦊'] },
        { t: 'The duck and the fox had fun. Then they had a nap in the sun.', pic: '🦆🦊☀️', alts: ['🦆🦊🛁', '🦆🐤☀️'] },
      ],
    },
    {
      id: 'w3-l4',
      title: 'Whale Song',
      animal: {
        emoji: '🐳', name: 'Humpback Whale',
        rescue: 'A humpback whale forgot the words to his song! Read the words to help him sing again.',
        fact: 'Humpback whales sing long songs. One song can last 20 minutes, and they sing it over and over for hours!',
        stat: 'About 50 feet long',
      },
      sounds: [
        { g: 'ng', tip: 'ng says ng, like at the end of ring. The sound comes out of your nose!', emoji: '💍' },
        { g: 'nk', tip: 'nk says nk, like at the end of think.', emoji: '🤔' },
      ],
      words: [
        w('r.i.ng', '💍'), w('k.i.ng', '👑'), w('s.i.ng', '🎤'), w('b.a.ng', '💥'),
        w('th.i.nk', '🤔'), w('w.i.nk', '😉'), w('b.a.nk', '🏦'), w('ch.i.p|m.u.nk', '🐿️'),
        w('sh.i.p', '🚢'), w('f.i.sh', '🐟'),
      ],
      extra: ws('p.i.nk', 's.o.ng'),
      heart: [
        { seg: 'are=ar', heart: [0], tip: 'Are is a heart word. It says ar: are.' },
        { seg: 'h.er', heart: [1], tip: 'In her, the e and r say er: her.' },
      ],
      aliens: ['v.i.ng', 'y.i.nk', 'd.e.nk', 'z.a.ng'],
      sentences: [
        { t: 'Can a ship sing?', yes: false },
        { t: 'Can a king sing a song?', yes: true },
        { t: 'She has a pink ring. Her ring is in the bank.', pic: '👧💍🏦', alts: ['👧💍🚢', '👧👑🏦'] },
        { t: 'The chipmunk and the fish are on a ship.', pic: '🐿️🐟🚢', alts: ['🐿️🐟🏦', '🐿️🦆🚢'] },
        { t: 'The king can wink at the chipmunk.', pic: '👑😉🐿️', alts: ['👑🎤🐿️', '👑😉🐟'] },
      ],
    },
    {
      id: 'w3-l5',
      title: 'Big Reef Rescue',
      animal: {
        emoji: '🐙', name: 'Octopus',
        rescue: 'Kit dropped something shiny into the sea! Read the whole story to find out who helps.',
        fact: 'An octopus has 3 hearts and blue blood! It can also change color in a blink to hide.',
        stat: '3 hearts, 8 arms',
      },
      sounds: [],
      words: [
        w('sh.i.p', '🚢'), w('r.i.ng', '💍'), w('sh.e.ll', '🐚'), w('f.i.sh', '🐟'),
        w('r.o.ck', '🪨'), w('s.a.d', '😢'),
      ],
      extra: ws('t.i.nk', 's.a.ng'),
      sentences: [],
      story: {
        title: 'Kit and the Red Rock',
        pages: [
          { t: 'Kit the fox is on a ship. He has a ring.', pic: '🦊🚢💍' },
          { t: 'The ring fell off the ship! Kit is sad.', pic: '🦊😢' },
          { t: 'Is the ring in a shell? No!', pic: '🐚' },
          { t: 'Is the ring with a fish? No!', pic: '🐟' },
          { t: 'Is it on a big red rock? Yes! The ring is on the rock.', pic: '🪨💍' },
          { t: 'Then the red rock got up. It was not a rock!', pic: '🪨❓' },
          { t: 'It was Tink! Tink can go red, and Tink can go pink.', pic: '🐙' },
          { t: 'Tink got the ring to Kit. Then they all sang a song!', pic: '🦊🐙🎤' },
        ],
        questions: [
          { ask: 'What fell off the ship?', options: ['💍', '🐟', '🦊'], answer: 0 },
          { ask: 'Where did Kit find the ring?', options: ['🐚', '🪨', '🐟'], answer: 1 },
          { ask: 'Who was the red rock, really?', options: ['🦈', '🐢', '🐙'], answer: 2 },
        ],
      },
    },
  ],
}
