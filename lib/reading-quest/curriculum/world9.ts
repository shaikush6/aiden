// World 9 — Swamp. Tricky twists: alternative pronunciations (o, i, ea, soft c, soft g, dge, y, le) and silent letters.
import type { WorldDef } from '../types.ts'
import { w, ws } from './helpers.ts'

export const WORLD_9: WorldDef = {
  id: 'w9',
  name: 'Tricky Twist Swamp',
  emoji: '🐊',
  habitat: 'Swamp',
  theme: 'from-emerald-300 via-teal-200 to-lime-200 dark:from-emerald-950 dark:via-slate-900 dark:to-slate-950',
  intro: 'Welcome to the swamp! Here letters play tricks and make surprise sounds. Can you spot every twist?',
  skill: 'Alternative sounds: o (cold), i (wild), ea (bread), soft c and g, dge, y (bunny), le, wh, ph, kn, wr',
  levels: [
    {
      id: 'w9-l1',
      title: 'Old Gold Pond',
      animal: {
        emoji: '🦩', name: 'Flamingo',
        rescue: 'A flamingo chick cannot find her flock! Read the words to help her find them.',
        fact: 'Flamingos are born gray! They turn pink from the food they eat, like tiny shrimp and algae.',
        stat: 'Rests standing on 1 leg',
      },
      sounds: [
        { g: 'o', p: 'oa', tip: 'Sometimes o says its name, oh, like in cold.', emoji: '🥶' },
        { g: 'i', p: 'igh', tip: 'Sometimes i says its name, I, like in child.', emoji: '🧒' },
        { g: 'ea', p: 'e', tip: 'Sometimes e and a say e, like in bread.', emoji: '🍞' },
      ],
      words: [
        w('c.o=oa.l.d', '🥶'), w('o=oa.l.d', '👴'), w('ch.i=igh.l.d', '🧒'), w('b.r.ea=e.d', '🍞'),
        w('f.ea=e.th|er', '🪶'), w('th.r.ea=e.d', '🧵'), w('r.o=oa.ll', '🧻'), w('s.c.r.o=oa.ll', '📜'),
        w('b.o=oa.l.t', '⚡'), w('g.o=oa.l.d', '🪙'),
      ],
      extra: ws(
        'h.ea=e.d', 'k.i=igh.n.d', 'w.i=igh.l.d', 'f.i=igh.n.d', 'm.o=oa.s.t', 'b.o=oa.th', 'h.o=oa.l.d',
        'h.o=oa.l.d.s=z', 't.o=oa.l.d', 'l.i.f.t', 't.r.u.ck', 's.n.ow=oa', 'w.e.t', 'l.igh.t|n.i.ng', 'h.i.t.s',
      ),
      heart: [
        { seg: 'l.augh', heart: [1], tip: 'In laugh, the a u g h says af: laugh.' },
      ],
      aliens: ['z.o=oa.l.d', 'v.o=oa.l.d', 'z.i=igh.n.d', 'v.i=igh.l.d'],
      sentences: [
        { t: 'Is it kind to laugh at a sad child?', yes: false },
        { t: 'Can a feather lift a big old truck?', yes: false },
        { t: 'Is snow cold and wet?', yes: true },
        { t: 'The child has a feather on her head.', pic: '🧒🪶', alts: ['🧒🧵', '👴🪶'] },
        { t: 'The old man holds a roll of gold thread.', pic: '👴🧵', alts: ['👴🍞', '🧒🧵'] },
        { t: 'A bolt of lightning hits the old scroll.', pic: '⚡📜', alts: ['⚡🧻', '🪶📜'] },
      ],
    },
    {
      id: 'w9-l2',
      title: 'Bridge of Gems',
      animal: {
        emoji: '🦆', name: 'Wood Duck',
        rescue: 'A duckling is stuck under a bridge and cannot swim home! Read the words to set her free.',
        fact: 'Wood duck babies jump out of their nest high in a tree when they are just one day old, and land safely!',
        stat: 'Jumps from up to 50 feet high',
      },
      sounds: [
        { g: 'c', p: 's', tip: 'Sometimes c says sss, when e, i or y comes next, like in ice.', emoji: '🧊' },
        { g: 'g', p: 'j', tip: 'Sometimes g says j, when e, i or y comes next, like in gem.', emoji: '💎' },
        { g: 'dge', tip: 'd, g and e together say j, like in bridge.', emoji: '🌉' },
      ],
      words: [
        w('r.i_e.c=s', '🍚'), w('i_e.c=s', '🧊'), w('d.i_e.c=s', '🎲'), w('p.e.n|c=s.i.l', '✏️'),
        w('s.p.a_e.c=s', '🌌'), w('g=j.e.m', '💎'), w('p.a_e.g=j', '📄'), w('g=j.er.m', '🦠'),
        w('b.r.i.dge', '🌉'), w('b.a.dge', '📛'), w('j.u.dge', '👩‍⚖️'),
      ],
      extra: ws(
        'h.u_e.g=j', 'n.i_e.c=s', 'c=s.e.n.t', 'r.a_e.c=s', 'e.dge', 's.i.t', 'c.oo=uu.k', 'm.a_e.k',
        'b.ow=oa.l', 'g.r.ee.n', 'p.o.t', 'n.e.x.t',
      ),
      heart: [
        { seg: 'b.u=i.s=z.y=ee', heart: [1, 3], tip: 'In busy, the u says i and the y says ee: busy.' },
      ],
      aliens: ['z.u.dge', 'v.e.dge', 'z.i_e.c=s', 'c=s.e.p', 'g=j.e.b'],
      sentences: [
        { t: 'Is ice as hot as the sun?', yes: false },
        { t: 'Can a germ be as huge as a bridge?', yes: false },
        { t: 'Can a busy cook make rice in a pot?', yes: true },
        { t: 'Two dice sit on the ice.', pic: '🎲🧊', alts: ['🎲🍚', '💎🧊'] },
        { t: 'The judge gets a big bowl of rice.', pic: '👩‍⚖️🍚', alts: ['👩‍⚖️🎲', '🧒🍚'] },
        { t: 'A green gem is on the page next to the pencil.', pic: '💎📄✏️', alts: ['💎📄🧊', '🎲📄✏️'] },
      ],
    },
    {
      id: 'w9-l3',
      title: 'Turtle Puzzle',
      animal: {
        emoji: '🦢', name: 'Swan',
        rescue: 'A baby swan is lost in the tall reeds! Read the words to help her find her mom.',
        fact: 'A swan can have about 25,000 feathers. That is more than almost any other bird!',
        stat: 'About 25,000 feathers',
      },
      sounds: [
        { g: 'y', p: 'ee', tip: 'At the end of a longer word, y says ee, like in bunny.', emoji: '🐰' },
        { g: 'le', tip: 'l and e at the end of a word say ul, like in turtle.', emoji: '🐢' },
      ],
      words: [
        w('b.u.n|n.y=ee', '🐰'), w('p.u.p|p.y=ee', '🐶'), w('c.a.n|d.y=ee', '🍬'), w('t.e.d|d.y=ee', '🧸'),
        w('c=s.i.t|y=ee', '🏙️'), w('h.a.p|p.y=ee', '😊'), w('t.ur|t.le', '🐢'), w('a.p|p.le', '🍎'),
        w('b.o.t|t.le', '🍼'), w('c.a.n|d.le', '🕯️'), w('p.u.z|z.le', '🧩'), w('b.u.b|b.le', '🫧'),
        w('b.ee|t.le', '🪲'), w('ea|g.le', '🦅'),
      ],
      extra: ws(
        's.u.n|n.y=ee', 'f.u.n|n.y=ee', 's.i.l|l.y=ee', 'm.u.d|d.y=ee', 'a.p|p.le.s=z', 'w.a.g', 't.ai.l',
      ),
      heart: [
        { seg: 'p.r.e=i.t|t.y=ee', heart: [2], tip: 'In pretty, the e says i: pretty.' },
      ],
      aliens: ['z.i.b|b.le', 'v.o.t|t.le', 'm.u.p|p.y=ee', 'j.u.f|f.y=ee'],
      sentences: [
        { t: 'Is a bunny as big as a city?', yes: false },
        { t: 'Can you eat a pretty candle?', yes: false },
        { t: 'Can a happy puppy wag its tail?', yes: true },
        { t: 'The happy puppy has a red apple.', pic: '🐶🍎', alts: ['🐶🕯️', '🐰🍎'] },
        { t: 'A pretty candle sits on top of the puzzle.', pic: '🕯️🧩', alts: ['🕯️🍼', '🍎🧩'] },
        { t: 'The little eagle has a teddy and a bottle.', pic: '🦅🧸🍼', alts: ['🦅🧸🍬', '🐢🧸🍼'] },
      ],
    },
    {
      id: 'w9-l4',
      title: 'Silent Letter Splash',
      animal: {
        emoji: '🦇', name: 'Bat',
        rescue: 'A little bat got tangled in a vine over the swamp! Read the words to help her fly free.',
        fact: 'Bats are the only mammals that can really fly. Their wings are skin stretched over long finger bones!',
        stat: '5 fingers in each wing',
      },
      sounds: [
        { g: 'wh', tip: 'w and h together say w, like in whale.', emoji: '🐋' },
        { g: 'ph', tip: 'p and h together say fff, like in phone.', emoji: '📱' },
        { g: 'kn', tip: 'k and n together say nnn. The k is silent, like in knot.', emoji: '🪢' },
        { g: 'wr', tip: 'w and r together say rrr. The w is silent, like in write.', emoji: '✍️' },
      ],
      words: [
        w('wh.a_e.l', '🐋'), w('wh.ee.l', '🛞'), w('ph.o_e.n', '📱'), w('d.o.l|ph.i.n', '🐬'),
        w('e.l|e|ph.a.n.t', '🐘'), w('t.r.o=oa|ph.y=ee', '🏆'), w('kn.o.t', '🪢'), w('kn.i_e.f', '🔪'),
        w('kn.ee.l', '🧎'), w('wr.i_e.t', '✍️'), w('wr.e.n.ch', '🔧'),
      ],
      extra: ws(
        'wh.i.ch', 'wh.i_e.t', 'kn.ow=oa', 'kn.ee', 'kn.o.ck', 'wr.o.ng', 'kn.ee.l.s=z', 's.w.i.m', 't.ie', 'p.e.n',
      ),
      aliens: ['wh.u.g', 'ph.e.g', 'kn.u.v', 'wr.u.z'],
      sentences: [
        { t: 'Can a whale fit in a phone?', yes: false },
        { t: 'Is a knife sharp?', yes: true },
        { t: 'Can a dolphin write with a pencil?', yes: false },
        { t: 'The elephant kneels by the big white wheel.', pic: '🐘🛞', alts: ['🐘🔧', '🐬🛞'] },
        { t: 'A whale and a dolphin swim with a trophy.', pic: '🐋🐬🏆', alts: ['🐋🐬📱', '🐋🐘🏆'] },
        { t: 'I tie a knot and then I write with a pen.', pic: '🪢✍️', alts: ['🔪✍️', '🪢📱'] },
      ],
    },
    {
      id: 'w9-l5',
      title: 'Big Swamp Rescue',
      animal: {
        emoji: '🐊', name: 'Alligator',
        rescue: 'A big alligator is all alone in the swamp. Read the whole story to find him some friends!',
        fact: 'An alligator can grow up to 3,000 teeth in its life. When a tooth falls out, a new one grows in!',
        stat: '80 teeth at a time',
      },
      sounds: [],
      words: [
        w('f.r.o.g', '🐸'), w('o.t|t.er', '🦦'), w('t.ur|t.le', '🐢'), w('b.u.b|b.le', '🫧'),
        w('g.oa.l', '🥅'), w('t.ee.th', '🦷'), w('n.o_e.s=z', '👃'),
      ],
      extra: ws(
        'm.ar.sh', 't.ea.m', 's.e.t', 's.o.c|c.er', 'g.a_e.m', 'b.a.nk', 'k.i.ck.s', 'wh.a.m', 'sh.o.t',
        's.ai.l.s=z', 'l.a.n.d.s=z', 's.p.l.a.sh', 'b.o.g', 's.t.ar.t.s', 'p.o.p.s', 'a.l', 'k.i.ng',
        's.t.i.ff', 'o=oa|p.e.n.s=z', 'm.ou.th', 'n.u.dge', 's.e.n.d.s=z', 'a.s.k.s', 'p.l.ay', 'g.r.i.n.s=z',
        's.t.a.n.d.s=z', 'l.o.ng', 't.ai.l', 's.w.i.ng.s=z', 'th.i.s', 'w.ay', 'k.i.ck', 'g.oa.l.s=z', 'n.ew',
      ),
      sentences: [],
      story: {
        title: 'The Big Marsh Soccer Game',
        pages: [
          { t: 'Kit the fox and the marsh team set up a soccer game on the bank. Frog, Turtle and Otter are on the team.', pic: '🦊🐸🐢🦦⚽' },
          { t: 'Kit kicks with a big WHAM! The shot sails up, up, up and lands with a splash in the bog.', pic: '⚽💦' },
          { t: 'Then the water starts to bubble. A huge green head pops up. It is Big Al, the king of the marsh!', pic: '🫧🐊' },
          { t: 'The team is scared stiff. Big Al opens his mouth. He has 80 teeth!', pic: '😱🐊🦷' },
          { t: 'But Big Al is kind. With a nudge of his nose, he sends the shot back to Kit.', pic: '🐊👃⚽' },
          { t: 'Can you play soccer with us? Kit asks. Big Al grins. He can be in goal!', pic: '🦊🐊😁' },
          { t: 'Big Al stands in the goal. His long tail swings this way and that. No kick gets past him!', pic: '🐊🥅' },
          { t: 'The team gets 0 goals, but no one is sad. They all laugh. Kit has a new friend, and he has 80 teeth!', pic: '🦊🐊😂' },
        ],
        questions: [
          { ask: 'What game did the friends play?', options: ['🏀', '⚽', '🎾'], answer: 1 },
          { ask: 'Who popped up out of the water?', options: ['🐊', '🐋', '🦆'], answer: 0 },
          { ask: 'How did the team feel at the end?', options: ['😢', '😂', '😡'], answer: 1 },
        ],
      },
    },
  ],
}
