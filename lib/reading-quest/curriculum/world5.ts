// World 5 — Desert. Split digraphs / magic e (a_e, i_e, o_e, u_e, e_e).
import type { WorldDef } from '../types.ts'
import { w, ws } from './helpers.ts'

export const WORLD_5: WorldDef = {
  id: 'w5',
  name: 'Magic E Desert',
  emoji: '🦎',
  habitat: 'Desert',
  theme: 'from-orange-300 via-amber-200 to-yellow-100 dark:from-orange-950 dark:via-slate-900 dark:to-slate-950',
  intro: 'Welcome to the desert! Here a magic [e] can make a vowel say its name. Let us help the desert animals!',
  skill: 'Magic e (split digraphs): a_e, i_e, o_e, u_e, e_e, and pairs like cap and cape, kit and kite',
  levels: [
    {
      id: 'w5-l1',
      title: 'Snake Cake',
      animal: {
        emoji: '🐍', name: 'Rattlesnake',
        rescue: 'A rattlesnake is too hot in the desert sun! Read the words to help her find some shade.',
        fact: 'A rattlesnake’s rattle is made of keratin, the same stuff as your fingernails. It gets a new piece every time the snake sheds its skin!',
        stat: 'Up to 7 feet long',
      },
      sounds: [
        { g: 'a_e', tip: 'Magic [e]! When magic [e] sits at the end, it jumps over one letter and makes the letter [a] say its name: /ai/! Like in cake.', emoji: '🎂' },
      ],
      words: [
        w('c.a_e.k', '🎂'), w('s.n.a_e.k', '🐍'), w('g.r.a_e.p.s', '🍇'), w('p.l.a_e.n', '✈️'),
        w('s.k.a_e.t', '⛸️'), w('w.a_e.v', '🌊'), w('f.l.a_e.m', '🔥'), w('p.l.a_e.t', '🍽️'),
        w('a_e.p', '🦍'), w('c.a.c|t.u.s', '🌵'),
      ],
      extra: ws('b.a_e.k'),
      heart: [
        { seg: 'wh.a.t', heart: [0, 1], tip: 'In the word what, the [w] and [h] say /w/, and the [a] says /u/: what!' },
        { seg: 'wh.e.n', heart: [0], tip: 'In the word when, the [w] and [h] say /w/: when!' },
      ],
      aliens: ['v.a_e.k', 'z.a_e.p', 'j.a_e.t', 'f.a_e.p'],
      sentences: [
        { t: 'Is a flame hot?', yes: true },
        { t: 'Can a snake bake a cake?', yes: false },
        { t: 'When you bake a cake, is it hot?', yes: true },
        { t: 'The snake is on the cake.', pic: '🐍🎂', alts: ['🐍🍽️', '🦍🎂'] },
        { t: 'What is on the plate? A cake!', pic: '🍽️🎂', alts: ['🍽️🍇', '⛸️🎂'] },
        { t: 'The ape has grapes on a plate.', pic: '🦍🍇🍽️', alts: ['🐍🍇🍽️', '🦍🎂🍽️'] },
      ],
    },
    {
      id: 'w5-l2',
      title: 'Kite Ride',
      animal: {
        emoji: '🐪', name: 'Camel',
        rescue: 'A camel lost her way in the sand dunes! Read the words to help her find the path.',
        fact: 'A camel’s hump is full of fat, not water! The fat gives the camel energy when food is hard to find.',
        stat: 'Drinks 30 gallons in 13 minutes',
      },
      sounds: [
        { g: 'i_e', tip: 'Magic [e] jumps over one letter and makes the letter [i] say its name: /igh/! Like in kite.', emoji: '🪁' },
      ],
      words: [
        w('k.i_e.t', '🪁'), w('b.i_e.k', '🚲'), w('f.i_e.v', '5️⃣'), w('n.i_e.n', '9️⃣'),
        w('s.l.i_e.d', '🛝'), w('s.m.i_e.l', '😁'), w('p.r.i_e.z', '🏆'), w('p.i_e.n', '🌲'),
        w('b.r.i_e.d', '👰'), w('r.a.b|b.i.t', '🐇'),
      ],
      extra: ws('b.i_e.t', 'r.i_e.d', 'k.i.d.s=z', 'r.a.b|b.i.t.s', 'g.l.a.d'),
      heart: [
        { seg: 'w.ere=er', heart: [1], tip: 'In the word were, the letters [e], [r] and [e] say /er/: were!' },
      ],
      aliens: ['v.i_e.m', 'z.i_e.t', 'j.i_e.p', 'p.i_e.m'],
      sentences: [
        { t: 'Can a kite bite?', yes: false },
        { t: 'Can a rabbit ride a bike?', yes: false },
        { t: 'Can you smile when you are glad?', yes: true },
        { t: 'The kids were on the slide.', pic: '🧒🧒🛝', alts: ['🧒🧒🚲', '🐇🐇🛝'] },
        { t: 'Five rabbits ride on a big bike.', pic: '5️⃣🐇🚲', alts: ['9️⃣🐇🚲', '5️⃣🐇🪁'] },
        { t: 'The bride has a kite and a prize.', pic: '👰🪁🏆', alts: ['👰🚲🏆', '🐇🪁🏆'] },
      ],
    },
    {
      id: 'w5-l3',
      title: 'Stone Home',
      animal: {
        emoji: '🐇', name: 'Jackrabbit',
        rescue: 'A jackrabbit is too hot in the desert sun! Read the words to help her find some shade.',
        fact: 'A jackrabbit’s giant ears help it cool down. Extra heat leaves its body through its ears!',
        stat: 'Runs up to 40 miles per hour',
      },
      sounds: [
        { g: 'o_e', tip: 'Magic [e] jumps over one letter and makes the letter [o] say its name: /oa/! Like in bone.', emoji: '🦴' },
      ],
      words: [
        w('b.o_e.n', '🦴'), w('r.o_e.s=z', '🌹'), w('n.o_e.s=z', '👃'), w('g.l.o_e.b', '🌍'),
        w('c.o_e.n', '🍦'), w('s.t.o_e.n', '🪨'), w('h.o_e.l', '🕳️'), w('n.o_e.t', '🎵'),
        w('h.o_e.m', '🏠'), w('sh.e.ll', '🐚'),
      ],
      extra: ws('s.m.e.ll', 'a.t', 'f.r.o.g', 'w.i.th'),
      heart: [
        { seg: 'wh.ere', heart: [0, 1], tip: 'In the word where, the [w] and [h] say /w/, and the [e], [r] and [e] say /air/: where!' },
        { seg: 'wh.o', heart: [0, 1], tip: 'In the word who, the [w] and [h] say /h/, and the [o] says /oo/: who!' },
      ],
      aliens: ['v.o_e.p', 'z.o_e.b', 'j.o_e.t', 'f.o_e.p'],
      sentences: [
        { t: 'Can a dog dig up a bone?', yes: true },
        { t: 'Can a stone smell a rose?', yes: false },
        { t: 'Where is the bone? It is in the hole.', pic: '🦴🕳️', alts: ['🦴🏠', '🌹🕳️'] },
        { t: 'Who is at home? A dog and a frog!', pic: '🏠🐶🐸', alts: ['🏠🐶🐢', '🌍🐶🐸'] },
        { t: 'A dog with a rose on his nose sat on a stone.', pic: '🐶🌹🪨', alts: ['🐶🦴🪨', '🐶🌹🏠'] },
      ],
    },
    {
      id: 'w5-l4',
      title: 'Cube Tunes',
      animal: {
        emoji: '🦂', name: 'Scorpion',
        rescue: 'A scorpion is hiding from the hot sun! Read the words to help her find a cool spot.',
        fact: 'Scorpions glow bright blue-green under a black light, and scientists are still not sure why!',
        stat: '8 legs',
      },
      sounds: [
        { g: 'u_e', tip: 'Magic [e] jumps over one letter and makes the letter [u] say its name: /yoo/! Like in cube.', emoji: '🧊' },
        { g: 'u_e', p: 'oo', tip: 'Sometimes [u] with magic [e] says /oo/ instead. Like in tube and dune!', emoji: '🏜️' },
        { g: 'e_e', tip: 'Magic [e] can make the letter [e] say its name too: /ee/! Like in these.', emoji: '👉' },
      ],
      words: [
        w('c.u_e.b', '🧊'), w('c.u.b', '🐻'), w('t.u_e=oo.b', '🧪'), w('t.u.b', '🛁'),
        w('p.i_e.n', '🌲'), w('p.i.n', '📌'), w('k.i_e.t', '🪁'), w('d.u_e=oo.n', '🏜️'),
        w('t.u_e=oo.n', '🎶'), w('c.u.p|c.a_e.k', '🧁'), w('p.a.n|c.a_e.k', '🥞'),
      ],
      extra: ws(
        'th.e_e.s=z', 'p.e_e.t', 'h.o_e.p', 'h.o.p', 'c.u_e.t', 'j.u_e=oo.n', 'r.u_e=oo.l', 'f.l.u_e=oo.t',
        's.i.ng', 'c.u.b.s=z', 'p.a.n|c.a_e.k.s',
      ),
      heart: [
        { seg: 'f.our', heart: [1], tip: 'Four is a number word! The letters [o], [u] and [r] say /or/: four!' },
      ],
      aliens: ['v.u_e.b', 'z.u_e.t', 'z.e_e.m', 'n.u_e=oo.p'],
      sentences: [
        { t: 'Can a cube sing a tune?', yes: false },
        { t: 'Can a cub get in a tub?', yes: true },
        { t: 'Four cubs sat in a tub.', pic: '4️⃣🐻🛁', alts: ['5️⃣🐻🛁', '4️⃣🐻🧊'] },
        { t: 'These pancakes are on a plate.', pic: '🥞🍽️', alts: ['🧁🍽️', '🥞🛁'] },
        { t: 'I hope Pete the cub can hop on the cube.', pic: '🐻🧊', alts: ['🐻🛁', '🐻🌲'] },
        { t: 'The pin is in the tube, not in the tub.', pic: '📌🧪', alts: ['📌🛁', '🌲🧪'] },
      ],
    },
    {
      id: 'w5-l5',
      title: 'Big Dune Rescue',
      animal: {
        emoji: '🦎', name: 'Horned Lizard',
        rescue: 'Jake the horned lizard is helping Kit find a lost kite! Read the whole story to help them.',
        fact: 'When some horned lizards are scared, they can squirt blood from their eyes to scare away coyotes!',
        stat: 'Squirts up to 5 feet',
      },
      sounds: [],
      words: [
        w('k.i_e.t', '🪁'), w('c.a_e.k', '🎂'), w('s.t.o_e.n', '🪨'), w('d.u_e=oo.n', '🏜️'),
        w('r.o_e.s=z', '🌹'), w('sh.e.ll', '🐚'), w('s.n.a_e.k', '🐍'),
      ],
      extra: ws(
        'f.o.x', 'j.a_e.k', 'w.e.n.t', 'th.e.n', 's.n.a.p', 's.t.r.i.ng', 'b.r.o_e.k', 'd.u_e=oo.n.s=z',
        'r.e.s.t', 'g.a_e.v', 'th.e.m', 'a_e.t', 'l.o.s.t',
      ),
      sentences: [],
      story: {
        title: 'Kit and the Lost Kite',
        pages: [
          { t: 'Kit the fox has a red kite. Kit and Jake run up a big dune.', pic: '🦊🪁🏜️' },
          { t: 'Up, up, up went the kite! Kit and Jake had fun.', pic: '🪁🦊🦎' },
          { t: 'Then snap! The string broke. The kite went up and up, and then it fell into the dunes.', pic: '🪁💨🏜️' },
          { t: 'Where is the kite? Kit and Jake ran and ran. They got so hot in the sun.', pic: '🦊🦎🥵' },
          { t: 'Jake sat on a big stone to rest. Then the stone got up!', pic: '🦎🪨😮' },
          { t: 'It was not a stone at all. It was the shell of Rose, and she had the kite on her back!', pic: '🐢🪁' },
          { t: 'Rose gave the kite back to Kit. Then all of them ate cake on the dune!', pic: '🦊🦎🐢🎂' },
        ],
        questions: [
          { ask: 'What did Kit fly up in the sky?', options: ['🪁', '🎈', '⚽'], answer: 0 },
          { ask: 'Where did Jake sit to rest?', options: ['🌵', '🪨', '🛏️'], answer: 1 },
          { ask: 'Why did the stone get up and walk?', options: ['💨', '🐢', '🦂'], answer: 1 },
        ],
      },
    },
  ],
}
