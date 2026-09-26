// World 10 — Galaxy. Big words: compound words, two-syllable words, endings (-ed, -s, -es, -ing), tch, tion, -er and -est.
import type { WorldDef } from '../types.ts'
import { w, ws } from './helpers.ts'

export const WORLD_10: WorldDef = {
  id: 'w10',
  name: 'Big Word Galaxy',
  emoji: '🚀',
  habitat: 'Galaxy',
  theme: 'from-indigo-300 via-violet-200 to-sky-200 dark:from-indigo-950 dark:via-slate-900 dark:to-slate-950',
  intro: 'Welcome to the galaxy! Out here, small words join up to make big words. Blast off and read them all!',
  skill: 'Big words: compound words, syllables, endings -ed -s -es -ing, tch, tion, -er and -est',
  levels: [
    {
      id: 'w10-l1',
      title: 'Word Glue Launch',
      animal: {
        emoji: '🪰', name: 'Fruit Fly',
        rescue: 'A little fruit fly rode a rocket up to space and cannot find her way back! Read the words to guide her home.',
        fact: 'In 1947, fruit flies were the first animals ever sent to space. They rode a rocket up and came back down safe!',
        stat: 'First in space: 1947',
      },
      sounds: [],
      words: [
        w('s.u.n|s.e.t', '🌅'), w('b.a.th|t.u.b', '🛁'), w('r.ai.n|b.ow=oa', '🌈'), w('b.a.ck|p.a.ck', '🎒'),
        w('p.o.p|c.or.n', '🍿'), w('c.u.p|c.a_e.k', '🧁'), w('s.n.ow=oa|m.a.n', '⛄'), w('p.a.n|c.a_e.k', '🥞'),
        w('s.p.a_e.c=s|sh.i.p', '🚀'), w('m.ai.l|b.o.x', '📫'), w('b.u.t|t.er|f.l.y=igh', '🦋'), w('s.n.ow=oa|f.l.a_e.k', '❄️'),
        w('s.u.n|f.l.ow|er', '🌻'), w('t.oo.th|b.r.u.sh', '🪥'),
      ],
      extra: ws(
        's.u.n|l.igh.t', 'm.e.l.t', 'b.e.d|t.i_e.m', 'i.n|s.i_e.d', 'ou.t|s.i_e.d', 'th.a.n', 's.aw', 'ea.t.s',
        'p.a.ck', 'p.a.ck.s', 'm.oo.n',
      ),
      heart: [
        { seg: 'th.ough.t', heart: [1], tip: 'In the word thought, the letters [o], [u], [g] and [h] say /aw/: thought!' },
      ],
      aliens: ['z.u.b|m.o.p', 'v.i.m|f.a.sh', 'j.e.b|t.u.d', 'n.e.p|w.i.g'],
      sentences: [
        { t: 'Can a snowman melt in the hot sunlight?', yes: true },
        { t: 'Is a butterfly bigger than a spaceship?', yes: false },
        { t: 'Can you pack a bathtub inside a backpack?', yes: false },
        { t: 'A snowman eats popcorn at sunset.', pic: '⛄🍿🌅', alts: ['⛄🧁🌅', '🦋🍿🌅'] },
        { t: 'The butterfly sits on a sunflower under a rainbow.', pic: '🦋🌻🌈', alts: ['🦋🌻🌅', '🦋🧁🌈'] },
        { t: 'I thought I saw a spaceship, but it was a pancake!', pic: '🥞', alts: ['🚀', '🧁'] },
      ],
    },
    {
      id: 'w10-l2',
      title: 'Rocket Syllables',
      animal: {
        emoji: '🐕', name: 'Space Dog',
        rescue: 'A brave space dog is floating far from her spaceship! Read the words to pull her back in.',
        fact: 'In 1960, two dogs named Belka and Strelka flew around Earth in a spaceship, and both came home safe!',
        stat: '1 day in space',
      },
      sounds: [],
      words: [
        w('r.a.b|b.i.t', '🐇'), w('m.a.g|n.e.t', '🧲'), w('r.o.ck|e.t', '🚀'), w('b.a.s|k.e.t', '🧺'),
        w('h.e.l|m.e.t', '⛑️'), w('p.u.m.p|k.i.n', '🎃'), w('p.l.a.n|e.t', '🪐'), w('c.o.m|e.t', '☄️'),
        w('l.e.m|o.n', '🍋'), w('c.a.c|t.u.s', '🌵'), w('t.i.ck|e.t', '🎟️'), w('j.a.ck|e.t', '🧥'),
      ],
      extra: ws(
        'p.i.c|n.i.c', 'k.i.t|t.e.n', 'z.oo.m', 'z.oo.m.s=z', 'r.o.ck|e.t.s', 'p.l.a.n|e.t.s',
        'w.i.n|d.ow=oa', 'p.u=uu.ll.s=z',
      ),
      heart: [
        { seg: 'th.r.ough', heart: [2], tip: 'In the word through, the letters [o], [u], [g] and [h] say /oo/: through!' },
      ],
      aliens: ['z.o.b|l.e.t', 'm.i.m|p.u.n', 'v.a.s|k.i.t', 'j.u.n|t.e.m'],
      sentences: [
        { t: 'Can a rabbit fly a rocket to a planet?', yes: false },
        { t: 'Can a comet zoom through space?', yes: true },
        { t: 'Is a lemon a kind of planet?', yes: false },
        { t: 'A rabbit in a jacket zooms past a planet.', pic: '🐇🧥🪐', alts: ['🐇⛑️🪐', '🐇🧥☄️'] },
        { t: 'A pumpkin and a lemon sit in the basket.', pic: '🎃🍋🧺', alts: ['🎃🌵🧺', '🎃🍋🚀'] },
        { t: 'The magnet pulls the ticket through the window.', pic: '🧲🎟️', alts: ['🧲🧥', '🍋🎟️'] },
      ],
    },
    {
      id: 'w10-l3',
      title: 'Ending Orbit',
      animal: {
        emoji: '🐢', name: 'Tortoise',
        rescue: 'Two space tortoises are flying home from the Moon, but they drifted off course! Read the words to steer them back.',
        fact: 'In 1968, two tortoises flew all the way around the Moon and came back to Earth. They were the first animals to go around the Moon!',
        stat: 'Around the Moon in 1968',
      },
      sounds: [
        { g: 'ed', p: 't', tip: 'Sometimes [e] [d] at the end of a word says /t/. Like in jumped!', emoji: '🦘' },
        { g: 'ed', tip: 'Sometimes [e] [d] at the end of a word says /d/. Like in rained!', emoji: '🌧️' },
        { g: 'ed', p: 'id', tip: 'After [t] or [d], the ending [e] [d] says /id/. Like in landed!', emoji: '🛬' },
      ],
      words: [
        w('r.u.n|n.i.ng', '🏃'), w('s.w.i.m|m.i.ng', '🏊'), w('s.l.ee.p|i.ng', '😴'), w('c.r.y=igh|i.ng', '😭'),
        w('f.i.sh|i.ng', '🎣'), w('j.u.g|g.l.i.ng', '🤹'), w('b.o.x|e.s=z', '📦'), w('d.i.sh|e.s=z', '🍽️'),
        w('p.ea.ch|e.s=z', '🍑'), w('l.a.n.d|ed=id', '🛬'), w('m.e.l.t|ed=id', '🫠'), w('s.p.i.ll.ed', '🫗'),
        w('l.o.ck.ed=t', '🔒'), w('w.i.nk.ed=t', '😉'),
      ],
      extra: ws(
        'j.u.m.p.ed=t', 'k.i.ck.ed=t', 'p.l.ay.ed', 'r.ai.n.ed', 'p.l.a.n.t|ed=id', 'f.o.x|e.s=z',
        'j.u.m.p|i.ng', 'k.i.ck|i.ng', 'l.oo=uu.k.ed=t', 'l.oo=uu.k|i.ng', 'h.e.l.p.ed=t', 's.t.ar.t|ed=id',
        'f.i.sh', 'm.i.l.k', 'p.o.n.d', 'k.i.d.s=z',
      ),
      heart: [
        { seg: 'm.o.v.e', heart: [1, 3], tip: 'In the word move, the [o] says /oo/, and the [e] is silent: move!' },
        { seg: 'f.a.th.er', heart: [1], tip: 'In the word father, the [a] sounds like the /o/ in hot: father!' },
      ],
      aliens: ['z.u.m.p.ed=t', 'v.a.n.d|ed=id', 'z.a.ck|i.ng', 'r.u.v.ed'],
      sentences: [
        { t: 'Can a rock go swimming and jumping in the pond?', yes: false },
        { t: 'Can a sleeping dog kick a goal?', yes: false },
        { t: 'Do fish go swimming in water?', yes: true },
        { t: 'My father is juggling 3 peaches.', pic: '🤹🍑', alts: ['🤹🍽️', '🎣🍑'] },
        { t: 'The kid spilled the milk and started crying.', pic: '🫗😭', alts: ['🫗😴', '🔒😭'] },
      ],
    },
    {
      id: 'w10-l4',
      title: 'Faster Than Light',
      animal: {
        emoji: '🕷️', name: 'Space Spider',
        rescue: 'A spider on a space station spun a messy web! Read the words to help her fix it.',
        fact: 'In 1973, two spiders named Anita and Arabella went to a space station. With no gravity their first webs were messy, but soon they spun good webs!',
        stat: '2 spiders in space',
      },
      sounds: [
        { g: 'tch', tip: 'The letters [t], [c] and [h] together say /ch/. Like in hatch!', emoji: '🐣' },
        { g: 'tion', tip: 'The letters [t], [i], [o] and [n] together say /shun/. Like in action!', emoji: '🎬' },
      ],
      words: [
        w('h.a.tch', '🐣'), w('c.r.u.tch', '🩼'), w('s.t.i.tch', '🪡'), w('a.c|tion', '🎬'),
        w('l.o=oa|tion', '🧴'), w('p.o=oa|tion', '🧪'), w('f.ar.m|er', '🧑‍🌾'), w('t.ea.ch|er', '🧑‍🏫'),
        w('s.i.ng|er', '🧑‍🎤'), w('p.ai.n.t|er', '🧑‍🎨'),
      ],
      extra: ws(
        'b.i.g|g.e.s.t', 'f.a.s.t', 'f.a.s.t|er', 'f.a.s.t|e.s.t', 'l.o.ng|er', 'l.o.ng|e.s.t', 's.l.ow=oa',
        's.l.ow=oa|er', 'c.o=oa.l.d|er', 'c.a.tch', 'm.a.tch', 'f.e.tch', 'k.i.tch|e.n', 'm.e.n|tion',
        'c.r.a.b', 's.n.ai.l', 'ch.i.ck', 'f.r.o.m', 'p.u=uu.t.s', 'm.a_e.k.s', 'y.e.ll.s=z', 'l.igh.t',
      ),
      heart: [
        { seg: 'b.eau.t.i.f.u.l', heart: [1, 3, 5], tip: 'Beautiful is a big heart word. Say it with me: beau-ti-ful!' },
      ],
      aliens: ['z.o.tch', 'v.u.tch', 'z.a.p|tion', 'n.u.f|tion'],
      sentences: [
        { t: 'Is a whale bigger than a crab?', yes: true },
        { t: 'Is a snail faster than a rocket?', yes: false },
        { t: 'Can a chick hatch from a pumpkin?', yes: false },
        { t: 'The farmer puts lotion on the biggest pig.', pic: '🧑‍🌾🧴🐷', alts: ['🧑‍🌾🧪🐷', '🧑‍🏫🧴🐷'] },
        { t: 'The teacher makes a beautiful potion in the kitchen.', pic: '🧑‍🏫🧪', alts: ['🧑‍🏫🧴', '🧑‍🎤🧪'] },
        { t: 'The singer on a crutch yells action!', pic: '🧑‍🎤🩼🎬', alts: ['🧑‍🎤🪡🎬', '🧑‍🎨🩼🎬'] },
      ],
    },
    {
      id: 'w10-l5',
      title: 'Big Galaxy Rescue',
      animal: {
        emoji: '🪲', name: 'Dung Beetle',
        rescue: 'A tiny dung beetle is lost under a cloudy sky! Read the whole story to help all your friends get him home.',
        fact: 'Dung beetles use the Milky Way to find their way at night. They are the first animals known to do that!',
        stat: 'Pulls 1,141 times its weight',
      },
      sounds: [],
      words: [
        w('r.o.ck|e.t', '🚀'), w('p.l.a.n|e.t', '🪐'), w('c.o.m|e.t', '☄️'), w('b.ee|t.le', '🪲'),
        w('g.a.l|a.x|y=ee', '🌌'), w('h.e.l|m.e.t', '⛑️'), w('c.l.ou.d', '☁️'), w('b.a.th|t.u.b', '🛁'),
      ],
      extra: ws(
        'h.ear.s=z', 's.o.b', 's.o.b.s=z', 't.i=igh|n.y=ee', 's.i.t|t.i.ng', 'l.o.s.t', 'h.o_e.m', 'th.i.ck',
        'h.i_e.d.s=z', 'th.e.m', 'c.a.n|n.o.t', 'p.l.a.n', 'a.n|i|m.a.l.s=z', 'qu.e.s.t', 'h.e.l.p',
        'b.i=igh|s.o.n', 'l.i=igh|o.n', 'h.i.p|p.o=oa', 'c.a_e.m', 'm.a_e.d', 'p.u=uu.sh.ed=t', 't.oo',
        't.r.y=igh', 'd.u.ng', 's.t.r.o.ng|e.s.t', 'z.oo.m.ed', 'n.ow', 'p.oi.n.t|ed=id', 'm.i.l.k|y=ee',
        's.ur|p.r.i_e.s=z', 'p.i_e.l', 'p.oo.p', 'y.u.ck', 'b.e.s.t',
      ),
      sentences: [],
      story: {
        title: 'Kit and the Galaxy Beetle',
        pages: [
          { t: 'It is night, and Kit the fox is looking up at the stars. Then Kit hears a sob. A tiny beetle is sitting on a rock, crying.', pic: '🦊🌌🪲' },
          { t: 'I am lost, the beetle sobs. I find my way home with the stars of the galaxy. But a big thick cloud hides them all, and I cannot see the way!', pic: '🪲☁️' },
          { t: 'Kit thought and thought. Then Kit had a plan. We can fly a rocket up through the cloud, so you can see the stars! Kit ran to get all the animals from the quest to help.', pic: '🦊💡🚀' },
          { t: 'Big Al, the bison, the lion, the hippo and the elephant all came to help. They made a rocket from boxes, a bathtub and a helmet. It was the biggest rocket in the galaxy!', pic: '🐊🦬🦁🦛🐘🚀' },
          { t: 'The elephant and the hippo pushed the rocket, but it did not move. It was too big! Then the tiny beetle said, let me try.', pic: '🐘🦛🚀' },
          { t: 'All the animals had a big laugh. But the beetle pushed and pushed, and the rocket started to move! A dung beetle is the strongest bug on the planet.', pic: '🪲💪🚀' },
          { t: 'The rocket zoomed up through the thick cloud. Now the beetle could see the beautiful galaxy! He pointed at the Milky Way. That is my way home, he said.', pic: '🚀🌌' },
          { t: 'The rocket landed back on the farm, and the beetle ran home. Surprise! His home was a big pile of cow poop! Kit said yuck, and all the animals had the best laugh in the galaxy.', pic: '🪲💩😂' },
        ],
        questions: [
          { ask: 'Who was lost?', options: ['🪲', '🦊', '🐘'], answer: 0 },
          { ask: 'Where was the beetle’s home?', options: ['🏠', '💩', '🌳'], answer: 1 },
          { ask: 'Why could the tiny beetle move the rocket when the big animals could not?', options: ['😴', '💪', '🌧️'], answer: 1 },
        ],
      },
    },
  ],
}
