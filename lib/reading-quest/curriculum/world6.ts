// World 6 — Polar ice. Long vowel teams (ai ay, ee ea, igh ie y, oa ow oe).
import type { WorldDef } from '../types.ts'
import { w, ws } from './helpers.ts'

export const WORLD_6: WorldDef = {
  id: 'w6',
  name: 'Long Vowel Ice',
  emoji: '🐧',
  habitat: 'Polar Ice',
  theme: 'from-sky-200 via-cyan-100 to-white dark:from-sky-950 dark:via-slate-900 dark:to-slate-950',
  intro: 'Brrr! Welcome to the land of snow and ice. Here two letters team up to make one long sound. Let us help the polar animals!',
  skill: 'Long vowel teams: ai ay, ee ea, igh ie y, oa ow oe',
  levels: [
    {
      id: 'w6-l1',
      title: 'Penguin Play Day',
      animal: {
        emoji: '🐧', name: 'Emperor Penguin',
        rescue: 'A penguin chick got lost in the snow! Read the words to help her find her dad.',
        fact: 'Emperor penguin dads keep their egg warm on their feet for about 2 months, in the coldest winter on Earth!',
        stat: 'Almost 4 feet tall',
      },
      sounds: [
        { g: 'ai', tip: 'a and i are a team. Together they say ay, like in rain.', emoji: '🌧️' },
        { g: 'ay', tip: 'a and y are a team. They say ay too, like in day. You see ay at the end of a word.', emoji: '☀️' },
      ],
      words: [
        w('s.n.ai.l', '🐌'), w('r.ai.n', '🌧️'), w('t.r.ai.n', '🚂'), w('m.ai.l', '📬'),
        w('s.ai.l', '⛵'), w('ch.ai.n', '⛓️'), w('p.ai.n.t', '🎨'), w('b.r.ai.n', '🧠'),
        w('c.r.ay|o.n', '🖍️'), w('r.ai.l|w.ay', '🛤️'),
      ],
      extra: ws('p.l.ay', 'd.ay', 'w.e.t', 'sh.i.p', 'w.ai.t', 'g.r.ay', 't.ai.l', 's.ay'),
      heart: [
        { seg: 'w.a.t.er', heart: [1, 3], tip: 'In water, the a says aw and the e r says er: water.' },
        { seg: 'a.g.ai.n', heart: [0, 2], tip: 'In again, the first a says uh and the a i says e: again.' },
      ],
      aliens: ['z.ai.b', 'f.ai.p', 'b.ai.m', 'v.ay'],
      sentences: [
        { t: 'Can a snail paint?', yes: false },
        { t: 'Is rain wet?', yes: true },
        { t: 'Can you play in the water on a hot day?', yes: true },
        { t: 'The snail is on the train again.', pic: '🐌🚂', alts: ['🐌⛵', '🐧🚂'] },
        { t: 'The snail has a crayon and some paint.', pic: '🐌🖍️🎨', alts: ['🐌🖍️🧠', '🐧🖍️🎨'] },
        { t: 'A ship with a sail is on the water in the rain.', pic: '⛵🌧️', alts: ['⛵☀️', '🚂🌧️'] },
      ],
    },
    {
      id: 'w6-l2',
      title: 'Sleepy Seal',
      animal: {
        emoji: '🦭', name: 'Seal',
        rescue: 'A baby seal is stuck far from the sea! Read the words to help her get back to the water.',
        fact: 'Some seals can hold their breath for more than an hour while they swim under the ice!',
        stat: 'Holds its breath over 1 hour',
      },
      sounds: [
        { g: 'ee', tip: 'e and e are a team. Together they say ee, like in bee.', emoji: '🐝' },
        { g: 'ea', tip: 'e and a are a team. They say ee too, like in peach.', emoji: '🍑' },
      ],
      words: [
        w('s.ea.l', '🦭'), w('t.r.ee', '🌳'), w('b.ee', '🐝'), w('sh.ee.p', '🐑'),
        w('th.r.ee', '3️⃣'), w('g.r.ee.n', '🟢'), w('p.ea.ch', '🍑'), w('b.ea.ch', '🏖️'),
        w('j.ea.n.s=z', '👖'), w('l.ea.f', '🍃'), w('t.ea', '🍵'), w('s.l.ee.p', '😴'),
      ],
      extra: ws('s.ea', 'ea.t', 's.ee', 's.ee.s=z', 's.ea.l.s=z', 's.t.i.ng', 's.w.i.m', 's.i.t.s', 's.i.t', 'n.ee.d'),
      heart: [
        { seg: 'p.eo.p.le', heart: [1, 3], tip: 'In people, the e o says ee and the l e says ul: people.' },
      ],
      aliens: ['z.ee.p', 'v.ee.b', 'f.ee.m', 'l.ea.b'],
      sentences: [
        { t: 'Can a bee sting?', yes: true },
        { t: 'Can a tree swim in the sea?', yes: false },
        { t: 'Can people eat a peach?', yes: true },
        { t: 'Three seals sleep on the beach.', pic: '3️⃣🦭🏖️', alts: ['3️⃣🐑🏖️', '3️⃣🦭🌳'] },
        { t: 'A bee sits on a peach in the tree.', pic: '🐝🍑🌳', alts: ['🐝🍃🌳', '🐑🍑🌳'] },
        { t: 'The seal has a cup of tea and a green leaf.', pic: '🦭🍵🍃', alts: ['🦭🍵🍑', '🐑🍵🍃'] },
      ],
    },
    {
      id: 'w6-l3',
      title: 'Fox Night Light',
      animal: {
        emoji: '🦊', name: 'Arctic Fox',
        rescue: 'An Arctic fox pup got lost in a snowstorm at night! Read the words to help her find her den.',
        fact: 'An Arctic fox has a white coat in winter and a brown coat in summer, so it can always hide!',
        stat: 'Stays warm at 58 degrees below zero',
      },
      sounds: [
        { g: 'igh', tip: 'i g h is a team of three letters. Together they say I, like in light.', emoji: '💡' },
        { g: 'ie', tip: 'i and e are a team. They say I too, like in pie.', emoji: '🥧' },
        { g: 'y', p: 'igh', tip: 'At the end of a short word, y can say I, like in fly and cry.', emoji: '🪰' },
      ],
      words: [
        w('l.igh.t', '💡'), w('n.igh.t', '🌃'), w('f.l.a.sh|l.igh.t', '🔦'), w('t.ie', '👔'),
        w('p.ie', '🥧'), w('f.r.ie.s=z', '🍟'), w('f.l.y=igh', '🪰'), w('c.r.y=igh', '😭'),
        w('b.ee', '🐝'), w('t.r.ee', '🌳'),
      ],
      extra: ws('s.k.y=igh', 'f.l.ie.s=z', 'h.igh', 'h.e.l.p'),
      heart: [
        { seg: 'l.i.t|t.le', heart: [4], tip: 'In little, the l e at the end says ul: little.' },
        { seg: 'eigh.t', heart: [0], tip: 'Eight is a number word. The e i g h says ay: eight.' },
      ],
      aliens: ['v.igh.t', 'z.igh.t', 'j.igh.t'],
      sentences: [
        { t: 'Can a pie fly up in the sky?', yes: false },
        { t: 'Is a little bee as big as a tree?', yes: false },
        { t: 'Can a flashlight help you see at night?', yes: true },
        { t: 'Eight flies sit on the pie.', pic: '8️⃣🪰🥧', alts: ['8️⃣🐝🥧', '8️⃣🪰🍟'] },
        { t: 'The little fly has a tie and some fries.', pic: '🪰👔🍟', alts: ['🪰👔🥧', '🐝👔🍟'] },
      ],
    },
    {
      id: 'w6-l4',
      title: 'Polar Bear Snow',
      animal: {
        emoji: '🐻‍❄️', name: 'Polar Bear',
        rescue: 'A polar bear cub got lost in a snowstorm! Read the words to help him find his mom.',
        fact: 'A polar bear’s fur looks white, but the skin under it is black! Black skin soaks up heat from the sun.',
        stat: 'Can weigh 1,500 pounds',
      },
      sounds: [
        { g: 'oa', tip: 'o and a are a team. Together they say oh, like in boat.', emoji: '🚤' },
        { g: 'ow', p: 'oa', tip: 'Sometimes o and w say oh, like in snow.', emoji: '❄️' },
        { g: 'oe', tip: 'o and e can say oh too, like in toe.', emoji: '🦶' },
      ],
      words: [
        w('b.oa.t', '🚤'), w('g.oa.t', '🐐'), w('c.oa.t', '🧥'), w('s.oa.p', '🧼'),
        w('r.oa.d', '🛣️'), w('g.oa.l', '🥅'), w('l.oa.f', '🍞'), w('s.n.ow=oa', '❄️'),
        w('s.n.ow=oa|m.a.n', '⛄'), w('b.ow=oa.l', '🥣'), w('w.i.n|d.ow=oa', '🪟'), w('r.ai.n|b.ow=oa', '🌈'),
        w('y.e.l|l.ow=oa', '🟡'),
      ],
      extra: ws('f.l.oa.t', 'k.i.ck.s', 's.n.ow=oa|m.e.n', 't.oe', 't.oe.s=z', 'g.oa.t.s'),
      heart: [
        { seg: 'm.a.n.y=ee', heart: [1, 3], tip: 'In many, the a says e and the y says ee: many.' },
        { seg: 'a.n.y=ee', heart: [0, 2], tip: 'In any, the a says e and the y says ee: any.' },
      ],
      aliens: ['z.oa.p', 'v.oa.b', 'j.oa.m', 'n.oa.f'],
      sentences: [
        { t: 'Can a goat play in the snow?', yes: true },
        { t: 'Can a boat float on a road?', yes: false },
        { t: 'Do snowmen have any toes?', yes: false },
        { t: 'The goat kicks the snow into the goal.', pic: '🐐❄️🥅', alts: ['🐐❄️🚤', '🐻‍❄️❄️🥅'] },
        { t: 'The soap is in the bowl by the window.', pic: '🧼🥣🪟', alts: ['🧼🥣🌈', '🍞🥣🪟'] },
        { t: 'Many goats sit in a big boat on the sea.', pic: '🐐🐐🐐🚤', alts: ['🐐🚤', '🐐🐐🐐🛣️'] },
      ],
    },
    {
      id: 'w6-l5',
      title: 'Big Ice Rescue',
      animal: {
        emoji: '🐋', name: 'Bowhead Whale',
        rescue: 'A bowhead whale needs a hole in the ice to come up for air! Read the whole story to help her.',
        fact: 'Bowhead whales can live for more than 200 years. That is longer than any other mammal!',
        stat: 'Lives 200+ years',
      },
      sounds: [],
      words: [
        w('s.n.ow=oa|m.a.n', '⛄'), w('c.oa.t', '🧥'), w('t.r.ai.n', '🚂'), w('h.a.t', '🎩'),
        w('n.o_e.s=z', '👃'), w('s.ea', '🌊'),
      ],
      extra: ws(
        'f.o.x', 'j.ay', 'm.a_e.k', 'm.a_e.k.s', 's.e.t.s', 's.t.i.ck', 'h.o_e.l', 'sh.a_e.k.s',
        's.p.l.a.sh', 'p.o.p.s', 'b.l.a.ck', 'm.oe', 's.p.r.ay', 's.p.r.ay.s=z', 'r.ai.n.s=z', 'h.i.t.s',
        'l.a.n.d.s=z', 's.w.i.m.s=z', 'w.a_e.v', 'n.ee.d.s=z',
      ),
      sentences: [],
      story: {
        title: 'The Snowman and Moe',
        pages: [
          { t: 'Kit the fox and Jay play in the snow. They make a big snowman.', pic: '🦊🐧⛄' },
          { t: 'Kit sets a hat and a coat on the snowman. Jay makes a nose with a stick.', pic: '⛄🎩🧥' },
          { t: 'Then Jay sees a hole in the snow. There is sea water in it!', pic: '🐧🕳️🌊' },
          { t: 'Kit and Jay sit by the hole and wait. They wait and wait. Then the water shakes!', pic: '🦊🐧🕳️' },
          { t: 'Splash! Up pops a big black nose. It is Moe, and Moe is as big as a train!', pic: '🐋💦' },
          { t: 'Moe sprays water up high. It rains on Kit, Jay and the snowman!', pic: '🐋💦⛄' },
          { t: 'The spray hits the hat. The hat flies off the snowman and lands on Moe!', pic: '🎩🐋' },
          { t: 'Moe swims off in the hat. Kit and Jay wave. The snowman needs a hat again!', pic: '🐋🎩👋' },
        ],
        questions: [
          { ask: 'Who played in the snow with Kit?', options: ['🐧', '🐻‍❄️', '🦭'], answer: 0 },
          { ask: 'What popped up out of the hole?', options: ['🐟', '🐋', '🦭'], answer: 1 },
          { ask: 'Why does the snowman need a new hat?', options: ['☀️', '🐋', '🐧'], answer: 1 },
        ],
      },
    },
  ],
}
