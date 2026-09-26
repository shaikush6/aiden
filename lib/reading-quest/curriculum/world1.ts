// World 1 — Savanna. Review of the first single sounds and short-vowel words (Letters and Sounds Phase 2).
import type { WorldDef } from '../types.ts'
import { w, ws } from './helpers.ts'

export const WORLD_1: WorldDef = {
  id: 'w1',
  name: 'Sound Safari',
  emoji: '🦁',
  habitat: 'Savanna',
  theme: 'from-amber-300 via-yellow-200 to-orange-200 dark:from-amber-950 dark:via-slate-900 dark:to-slate-950',
  intro: 'Welcome to the savanna! Animals here need your help. Every word you read gives you creature power!',
  skill: 'Single letter sounds and short-vowel words (s a t p i n m d g o c k e u r h b f l ff ll ss ck)',
  levels: [
    {
      id: 'w1-l1',
      title: 'Snake Sounds',
      animal: {
        emoji: '🦓', name: 'Zebra',
        rescue: 'A baby zebra is lost in the tall grass! Read the words to help her find her family.',
        fact: 'Every zebra has its own stripe pattern, like a fingerprint. No two zebras are the same!',
        stat: 'Top speed: 40 miles per hour',
      },
      sounds: [
        { g: 's', tip: 's says sss, like a hissing snake.', emoji: '🐍' },
        { g: 'a', tip: 'a says a, like in ant.', emoji: '🐜' },
        { g: 't', tip: 't says t, like a ticking clock.', emoji: '⏰' },
        { g: 'p', tip: 'p says p, like popping bubbles.', emoji: '🫧' },
        { g: 'i', tip: 'i says i, like in insect.', emoji: '🐞' },
        { g: 'n', tip: 'n says nnn, like a buzzing airplane.', emoji: '✈️' },
      ],
      words: [
        w('a.n.t', '🐜'), w('p.i.n', '📌'), w('t.i.n', '🥫'), w('p.a.n', '🍳'),
        w('t.a.p', '🚰'), w('n.a.p', '😴'), w('p.i.t', '🕳️'), w('s.i.p', '🥤'),
      ],
      extra: [...ws('s.a.t', 'p.a.t', 't.i.p', 'a.n', 'i.n', 'i.t', 'i.t.s'), w('a', undefined, 'uh')],
      aliens: ['n.a.s', 't.a.s', 'n.i.s', 'p.i.s'],
      sentences: [
        { t: 'an ant in a pan', pic: '🐜🍳', alts: ['🐜🥫', '📌🍳'] },
        { t: 'a pin in a tin', pic: '📌🥫', alts: ['📌🍳', '🐜🥫'] },
      ],
    },
    {
      id: 'w1-l2',
      title: 'Lion Letters',
      animal: {
        emoji: '🦁', name: 'Lion',
        rescue: 'A lion cub is stuck up a tree! Read the words to help him climb down.',
        fact: 'A lion’s roar is so loud you can hear it five miles away!',
        stat: 'Roar heard 5 miles away',
      },
      sounds: [
        { g: 'm', tip: 'm says mmm, like something yummy.', emoji: '😋' },
        { g: 'd', tip: 'd says d, like a drum.', emoji: '🥁' },
        { g: 'g', tip: 'g says g, like a gulping fish.', emoji: '🐟' },
        { g: 'o', tip: 'o says o, like in octopus.', emoji: '🐙' },
        { g: 'c', tip: 'c says c, like a clicking camera.', emoji: '📷' },
        { g: 'k', tip: 'k says the same sound as c, like a kangaroo.', emoji: '🦘' },
      ],
      words: [
        w('d.o.g', '🐶'), w('c.a.t', '🐱'), w('p.i.g', '🐷'), w('m.a.p', '🗺️'),
        w('c.a.p', '🧢'), w('m.o.m', '👩'), w('d.a.d', '👨'), w('s.a.d', '😢'),
        w('d.o.t', '🔵'), w('k.i.d', '🧒'), w('p.o.t', '🍲'), w('m.a.d', '😠'),
      ],
      extra: ws('o.n', 'a.m', 'a.n.d', 'n.o.t', 'g.o.t', 'c.a.n', 'd.i.d', 'k.i.t', 'p.i.p', 't.o.p', 'd.i.g', 'm.a.t'),
      heart: [
        { seg: 'i=igh', heart: [0], tip: 'The word I is just one letter. It says its name: I!', say: 'I' },
        { seg: 'th.e', heart: [0, 1], tip: 'The word the is a heart word. We learn it by heart: the!' },
      ],
      aliens: ['m.o.g', 'k.o.t', 'g.i.d', 'd.o.p'],
      sentences: [
        { t: 'a dog in a pot', pic: '🐶🍲', alts: ['🐱🍲', '🐶🗺️'] },
        { t: 'the cat on a map', pic: '🐱🗺️', alts: ['🐶🗺️', '🐱🧢'] },
        { t: 'I am sad.', pic: '😢', alts: ['😠', '😴'] },
        { t: 'a pig in a cap', pic: '🐷🧢', alts: ['🐷🍲', '🐱🧢'] },
      ],
    },
    {
      id: 'w1-l3',
      title: 'Hippo Hop',
      animal: {
        emoji: '🦛', name: 'Hippo',
        rescue: 'Hippo is too hot in the sun! Read the words to help her get back to the cool mud.',
        fact: 'Hippos make their own sunscreen! Their skin makes a red-orange goo that protects them from the sun.',
        stat: 'Weighs up to 8,000 pounds',
      },
      sounds: [
        { g: 'e', tip: 'e says e, like in egg.', emoji: '🥚' },
        { g: 'u', tip: 'u says u, like in up.', emoji: '⬆️' },
        { g: 'r', tip: 'r says rrr, like a roaring tiger.', emoji: '🐯' },
        { g: 'h', tip: 'h says h, like when you are out of breath.', emoji: '😮‍💨' },
        { g: 'b', tip: 'b says b, like a bouncing ball.', emoji: '🏀' },
        { g: 's', p: 'z', tip: 'Sometimes s says zzz, like in is and his.', emoji: '🐝' },
      ],
      words: [
        w('b.e.d', '🛏️'), w('h.e.n', '🐔'), w('n.e.t', '🥅'), w('p.e.n', '🖊️'),
        w('t.e.n', '🔟'), w('r.e.d', '🔴'), w('b.u.s', '🚌'), w('b.u.g', '🐛'),
        w('s.u.n', '☀️'), w('c.u.p', '☕'), w('h.u.t', '🛖'), w('b.a.t', '🦇'),
        w('h.a.t', '🎩'), w('r.a.t', '🐀'), w('c.u.b', '🐻'), w('h.u.g', '🤗'),
      ],
      extra: ws('i.s=z', 'h.i.s=z', 'h.a.s=z', 'a.s=z', 'r.u.n', 'r.a.n', 'g.e.t', 'h.o.t', 'b.i.g', 'm.u.d', 'u.p', 'b.u.t', 'h.a.d', 'h.i.m'),
      heart: [
        { seg: 't.o', heart: [1], tip: 'In the word to, the o is tricky. It says oo: to.' },
        { seg: 'n.o', heart: [1], tip: 'In the word no, the o says its name, oh: no.' },
        { seg: 'g.o', heart: [1], tip: 'In the word go, the o says its name, oh: go.' },
      ],
      aliens: ['b.e.m', 'r.u.d', 'h.e.b', 'b.u.p'],
      sentences: [
        { t: 'Is the sun hot?', yes: true },
        { t: 'Can a hen run?', yes: true },
        { t: 'Can a bed run?', yes: false },
        { t: 'The bug is in the cup.', pic: '🐛☕', alts: ['🐛🛏️', '🐀☕'] },
        { t: 'A rat is in a hat.', pic: '🐀🎩', alts: ['🦇🎩', '🐀☕'] },
      ],
    },
    {
      id: 'w1-l4',
      title: 'Giraffe Giggles',
      animal: {
        emoji: '🦒', name: 'Giraffe',
        rescue: 'A baby giraffe fell asleep far from his mom! Read the words to wake him up.',
        fact: 'A giraffe’s tongue is dark purple and about 20 inches long. It uses it to grab leaves from thorny trees!',
        stat: 'Up to 18 feet tall',
      },
      sounds: [
        { g: 'f', tip: 'f says fff, like air leaking from a tire.', emoji: '🛞' },
        { g: 'l', tip: 'l says lll, like licking a lollipop.', emoji: '🍭' },
        { g: 'ff', tip: 'Two f letters make one sound: fff, like in puff.', emoji: '💨' },
        { g: 'll', tip: 'Two l letters make one sound: lll, like in bell.', emoji: '🔔' },
        { g: 'ss', tip: 'Two s letters make one sound: sss, like in kiss.', emoji: '💋' },
        { g: 'ck', tip: 'c and k together make one sound: c, like in duck.', emoji: '🦆' },
      ],
      words: [
        w('b.e.ll', '🔔'), w('d.o.ll', '🪆'), w('h.i.ll', '⛰️'), w('d.u.ck', '🦆'),
        w('s.o.ck', '🧦'), w('r.o.ck', '🪨'), w('l.o.ck', '🔒'), w('l.o.g', '🪵'),
        w('l.e.g', '🦵'), w('f.a.n', '🪭'), w('f.o.g', '🌫️'), w('k.i.ss', '💋'),
        w('p.u.ff', '💨'), w('b.a.ck', '🔙'),
      ],
      extra: ws('o.ff', 'f.u.n', 'f.e.ll', 'n.e.ck', 'l.e.t', 'l.o.t', 'l.i.t', 'l.i.d'),
      heart: [
        { seg: 'i.n|t.o', heart: [3], tip: 'Into is in and to stuck together. The o says oo: into.' },
        { seg: 'o.f', heart: [0, 1], tip: 'Of is a heart word. It sounds like uv: of.' },
      ],
      aliens: ['l.u.ff', 'f.i.ck', 'g.e.ll', 'n.o.ss'],
      sentences: [
        { t: 'The bell is on the doll.', pic: '🔔🪆', alts: ['🔔🧦', '🦆🪆'] },
        { t: 'The duck is on a log.', pic: '🦆🪵', alts: ['🦆🪨', '🐶🪵'] },
        { t: 'Can a sock run up a hill?', yes: false },
        { t: 'Can a duck get in the mud?', yes: true },
      ],
    },
    {
      id: 'w1-l5',
      title: 'Big Mud Rescue',
      animal: {
        emoji: '🐘', name: 'Elephant',
        rescue: 'An elephant is stuck in the mud! Read the whole story to pull her out.',
        fact: 'An elephant’s trunk has about 40,000 muscles. It can pick up a peanut or lift a log!',
        stat: '40,000 muscles in its trunk',
      },
      sounds: [],
      words: [
        w('m.u.d', '🟫'), w('h.o.t', '🥵'), w('f.u.n', '🥳'), w('h.u.g', '🤗'),
        w('s.u.n', '☀️'), w('p.i.g', '🐷'),
      ],
      extra: ws('s.a.t', 'r.a.n', 'g.o.t', 'h.a.d', 'a.n.d', 'b.i.g', 'k.i.t', 'p.i.p'),
      sentences: [],
      story: {
        title: 'Kit and Pip in the Mud',
        pages: [
          { t: 'Kit is hot in the sun.', pic: '🦊☀️' },
          { t: 'Kit sat in the mud.', pic: '🦊🟫' },
          { t: 'Pip the pig ran to the mud.', pic: '🐷🏃' },
          { t: 'Pip got in the mud. Kit and Pip had fun.', pic: '🦊🐷🥳' },
          { t: 'Mud on Kit! Mud on Pip! A big mud hug!', pic: '🦊🤗🐷' },
        ],
        questions: [
          { ask: 'Who was hot in the sun?', options: ['🦊', '🐷', '🐶'], answer: 0 },
          { ask: 'Where did Kit sit?', options: ['🛏️', '🟫', '🚌'], answer: 1 },
          { ask: 'What did they do at the end?', options: ['😴', '🏃', '🤗'], answer: 2 },
        ],
      },
    },
  ],
}
