// World 4 — Forest Camp. Adjacent consonants (blends) with no new graphemes (Letters and Sounds Phase 4).
import type { WorldDef } from '../types.ts'
import { w, ws } from './helpers.ts'

export const WORLD_4: WorldDef = {
  id: 'w4',
  name: 'Camp Blend Trail',
  emoji: '⛺',
  habitat: 'Forest',
  theme: 'from-emerald-300 via-lime-200 to-amber-200 dark:from-emerald-950 dark:via-slate-900 dark:to-slate-950',
  intro: 'Welcome to Forest Camp! Grab your backpack. Here, sounds bump together, like s and t in stop.',
  skill: 'Blending consonant clusters (tent, stop, frog, splash) and heart words said have so do two some come one there',
  levels: [
    {
      id: 'w4-l1',
      title: 'Beaver Dam Camp',
      animal: {
        emoji: '🦫', name: 'Beaver',
        rescue: 'A beaver’s dam has a leak! Read the words to help her fix it.',
        fact: 'A beaver’s front teeth never stop growing! Chewing on wood keeps them from getting too long.',
        stat: 'Stays underwater 15 minutes',
      },
      sounds: [],
      words: [
        w('t.e.n.t', '⛺'), w('m.i.l.k', '🥛'), w('h.a.n.d', '✋'), w('g.i.f.t', '🎁'),
        w('f.i.s.t', '✊'), w('e.l.f', '🧝'), w('g.o.l.f', '⛳'), w('v.e.s.t', '🦺'),
        w('b.u.l.b', '💡'), w('m.a.s.k', '😷'), w('p.a.n.t.s', '👖'),
      ],
      extra: ws('j.u.m.p', 's.a.n.d', 'w.e.n.t'),
      heart: [
        { seg: 's.ai.d', heart: [1], tip: 'In said, the a and i say e: said.' },
        { seg: 'h.a.v.e', heart: [3], tip: 'In have, the e at the end is silent: have.' },
      ],
      aliens: ['n.u.m.p', 'v.i.s.k', 'j.o.n.t', 'f.e.l.b'],
      sentences: [
        { t: 'Can you have milk in a tent?', yes: true },
        { t: 'Can a tent jump?', yes: false },
        { t: 'Dad said the gift is in the tent.', pic: '👨🎁⛺', alts: ['👩🎁⛺', '👨🥛⛺'] },
        { t: 'The elf has milk and a vest.', pic: '🧝🥛🦺', alts: ['🧝🥛🎁', '🧝💡🦺'] },
        { t: 'Can you jump in the sand?', yes: true },
      ],
    },
    {
      id: 'w4-l2',
      title: 'Stinky Skunk',
      animal: {
        emoji: '🦨', name: 'Skunk',
        rescue: 'A scared skunk is about to spray the campsite! Read the words to help him calm down.',
        fact: 'Before a skunk sprays, it stamps its feet and lifts its tail. That is its way of saying: back off!',
        stat: 'Sprays up to 10 feet',
      },
      sounds: [],
      words: [
        w('s.t.o.p', '🛑'), w('s.w.i.m', '🏊'), w('s.k.u.ll', '💀'), w('s.m.e.ll', '👃'),
        w('s.k.u.nk', '🦨'), w('s.t.i.ng', '🐝'), w('s.n.a.ck', '🍿'), w('s.m.a.sh', '💥'),
        w('t.e.n.t', '⛺'), w('m.i.l.k', '🥛'),
      ],
      extra: ws('p.o.n.d', 'b.a.d', 's.k.u.nk.s'),
      heart: [
        { seg: 's.o', heart: [1], tip: 'In so, the o says its name, oh: so.' },
        { seg: 'd.o', heart: [1], tip: 'In do, the o says oo: do.' },
        { seg: 't.wo', heart: [1], tip: 'Two is a number word. The w is silent and the o says oo: two.' },
      ],
      aliens: ['s.p.e.v', 's.t.o.b', 's.m.u.d', 's.n.i.v'],
      sentences: [
        { t: 'Can a tent swim in a pond?', yes: false },
        { t: 'Do skunks smell bad?', yes: true },
        { t: 'Two skunks stop at the tent.', pic: '🦨🦨⛺', alts: ['🦨⛺', '🦨🦨🛑'] },
        { t: 'The skunk has a snack and milk.', pic: '🦨🍿🥛', alts: ['🦨💀🥛', '🐝🍿🥛'] },
        { t: 'I swim in the pond, so the skunk has my snack!', pic: '🏊🦨🍿', alts: ['🏊🦨🥛', '🛑🦨🍿'] },
      ],
    },
    {
      id: 'w4-l3',
      title: 'Raccoon Rascal',
      animal: {
        emoji: '🦝', name: 'Raccoon',
        rescue: 'A raccoon got his paw stuck in a snack bag! Read the words to help him get free.',
        fact: 'A raccoon has five fingers on each front paw. They can feel things so well, even under water!',
        stat: '5 fingers on each paw',
      },
      sounds: [],
      words: [
        w('f.r.o.g', '🐸'), w('c.r.a.b', '🦀'), w('d.r.u.m', '🥁'), w('c.l.a.p', '👏'),
        w('p.l.u.g', '🔌'), w('f.l.a.g', '🚩'), w('b.r.i.ck', '🧱'), w('d.r.e.ss', '👗'),
        w('s.l.e.d', '🛷'), w('c.l.o.ck', '🕰️'), w('t.r.u.ck', '🚚'), w('g.r.i.n', '😁'),
        w('b.r.u.sh', '🪥'),
      ],
      extra: ws('b.r.i.ck.s', 'f.r.o.g.s=z'),
      heart: [
        { seg: 's.o.m.e', heart: [1, 3], tip: 'In some, the o says u and the e is silent: some.' },
        { seg: 'c.o.m.e', heart: [1, 3], tip: 'In come, the o says u and the e is silent: come.' },
      ],
      aliens: ['p.l.u.v', 'g.r.e.p', 'c.l.o.v', 'd.r.u.m.p'],
      sentences: [
        { t: 'Can a truck grin?', yes: false },
        { t: 'Can you clap and grin?', yes: true },
        { t: 'The frog is on the red truck.', pic: '🐸🚚', alts: ['🐸🛷', '🦀🚚'] },
        { t: 'Come quick! The crab has some bricks on a sled.', pic: '🦀🧱🛷', alts: ['🦀🧱🚚', '🐸🧱🛷'] },
        { t: 'Some frogs have a flag and a drum.', pic: '🐸🐸🚩🥁', alts: ['🐸🐸🚩🔌', '🦀🦀🚩🥁'] },
      ],
    },
    {
      id: 'w4-l4',
      title: 'Deer Night Splash',
      animal: {
        emoji: '🦌', name: 'Deer',
        rescue: 'A baby deer lost her mom in the dark forest! Read the words to light the path home.',
        fact: 'A baby deer, called a fawn, has white spots on its fur. The spots help it hide in sunny patches of the forest!',
        stat: 'Jumps up to 8 feet high',
      },
      sounds: [],
      words: [
        w('p.l.a.n.t', '🪴'), w('sh.r.i.m.p', '🦐'), w('s.p.l.a.sh', '💦'), w('s.t.r.o.ng', '💪'),
        w('s.t.r.i.ng', '🧵'), w('d.r.i.nk', '🥤'), w('t.r.u.m|p.e.t', '🎺'), w('s.a.n.d|w.i.ch', '🥪'),
        w('b.a.ck|p.a.ck', '🎒'), w('t.r.a.ck.s', '🐾'),
      ],
      extra: ws('l.i.f.t', 'j.u.m.p.s', 'n.e.x.t'),
      heart: [
        { seg: 'o.n.e', heart: [0, 1, 2], tip: 'One is a number word. It sounds like won: one.' },
        { seg: 'th.ere', heart: [1], tip: 'In there, the e r e says air: there.' },
      ],
      aliens: ['s.t.r.u.v', 's.p.l.e.n.t', 'g.r.o.n.t', 'sh.r.i.v'],
      sentences: [
        { t: 'Can one shrimp drink a pond?', yes: false },
        { t: 'Can a strong kid lift a backpack?', yes: true },
        { t: 'There is one shrimp in my backpack.', pic: '🦐🎒', alts: ['🦐🦐🎒', '🦐🥪'] },
        { t: 'Splash! The strong skunk jumps in the pond with a trumpet.', pic: '🦨💦🎺', alts: ['🦨💦🧵', '🦝💦🎺'] },
        { t: 'Kit has a sandwich and a drink next to a plant.', pic: '🦊🥪🥤🪴', alts: ['🦊🥪🎺🪴', '🦊🥪🥤🎒'] },
      ],
    },
    {
      id: 'w4-l5',
      title: 'Big Camp Rescue',
      animal: {
        emoji: '🐻', name: 'Black Bear',
        rescue: 'Something is crunching snacks at camp tonight! Read the whole story to find out who.',
        fact: 'Black bears sleep through most of the winter in a cozy den. Baby cubs are born right there, in the middle of winter!',
        stat: 'Runs up to 35 miles per hour',
      },
      sounds: [],
      words: [
        w('t.e.n.t', '⛺'), w('b.a.ck|p.a.ck', '🎒'), w('h.o.t|d.o.g', '🌭'), w('s.a.n.d|w.i.ch', '🥪'),
        w('s.k.u.nk', '🦨'), w('f.r.o.g', '🐸'), w('c.u.b', '🐻'),
      ],
      extra: ws(
        'c.a.m.p', 'p.a.l.s=z', 'l.o.t.s', 's.n.a.ck.s', 'd.u.s.k', 'c.r.u.n.ch', 'l.a.m.p', 'c.r.e.p.t',
        'g.r.a.ss', 'b.l.a.ck', 'l.o.s.t', 'th.u.m.p', 'f.r.o.m', 'e.n.d',
      ),
      sentences: [],
      story: {
        title: 'Crunch at Camp',
        pages: [
          { t: 'Kit went to camp with his pals. They set up a big tent on a hill.', pic: '🦊⛺' },
          { t: 'Kit had lots of snacks in his backpack. There was a hotdog and a sandwich. Yum!', pic: '🎒🌭🥪' },
          { t: 'At dusk, the pals got in the tent. Then... crunch! Crunch! Crunch!', pic: '🌙⛺' },
          { t: 'Kit sat up. "Some of my snacks are not in my backpack!" said Kit.', pic: '🦊🎒' },
          { t: 'Was it the skunk? No, the skunk was in bed. Was it the frog? No, the frog was in the pond.', pic: '🦨🐸' },
          { t: 'Kit got a lamp and crept up the hill. There, in the grass, sat a black cub with the snacks!', pic: '🔦🐻' },
          { t: '"I am lost," said the cub. "I had to have a snack." Then... thump, thump! It was his mom. She was so big!', pic: '🐻🐻' },
          { t: 'Mom was not mad. She got a hug from the cub and a hotdog from Kit. The end!', pic: '🐻🤗🌭' },
        ],
        questions: [
          { ask: 'Where did Kit and his pals sleep?', options: ['⛺', '🚢', '🛖'], answer: 0 },
          { ask: 'Who had the snacks?', options: ['🦨', '🐸', '🐻'], answer: 2 },
          { ask: 'How did the mom bear feel at the end?', options: ['😠', '😊', '😢'], answer: 1 },
        ],
      },
    },
  ],
}
