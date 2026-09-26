// World 7 — Rainforest. Other vowel sounds (oo ew ue, short oo and u, ow ou, oi oy aw au).
import type { WorldDef } from '../types.ts'
import { w, ws } from './helpers.ts'

export const WORLD_7: WorldDef = {
  id: 'w7',
  name: 'Rainforest Sound Twins',
  emoji: '🦜',
  habitat: 'Rainforest',
  theme: 'from-emerald-300 via-green-200 to-lime-200 dark:from-emerald-950 dark:via-slate-900 dark:to-slate-950',
  intro: 'Welcome to the rainforest! Here letters team up to make new sounds, like oo, ow and oy. Let us help the rainforest animals!',
  skill: 'Other vowel sounds: oo (moon) ew ue, oo (book) u (push), ow ou, oi oy, aw au',
  levels: [
    {
      id: 'w7-l1',
      title: 'Blue Moon Zoom',
      animal: {
        emoji: '🦋', name: 'Blue Morpho Butterfly',
        rescue: 'A blue butterfly got her wings wet in the rain! Read the words to help her dry off and fly.',
        fact: 'Butterflies taste with their feet! When they land on a leaf, their feet tell them if it is good food.',
        stat: 'Wings up to 8 inches wide',
      },
      sounds: [
        { g: 'oo', tip: 'o and o are a team. Together they say oo, like in moon.', emoji: '🌙' },
        { g: 'ew', tip: 'e and w are a team. They say oo too, like in stew.', emoji: '🍲' },
        { g: 'ue', tip: 'u and e are a team. They say oo too, like in blue.', emoji: '🟦' },
      ],
      words: [
        w('m.oo.n', '🌙'), w('s.p.oo.n', '🥄'), w('b.oo.t', '👢'), w('t.oo.th', '🦷'),
        w('b.r.oo.m', '🧹'), w('r.a.c|c.oo.n', '🦝'), w('m.u.sh|r.oo.m', '🍄'), w('s.t.ew', '🍲'),
        w('b.l.ue', '🟦'), w('f.r.o.g', '🐸'),
      ],
      extra: ws('z.oo.m', 'b.r.u.sh', 'ea.ch', 'g.r.ew', 'n.ew', 'ch.ew', 'f.l.ew', 'g.l.ue', 't.r.ue'),
      heart: [
        { seg: 'c.oul.d', heart: [1], tip: 'In could, the o u l says oo, like in book: could.' },
        { seg: 'w.oul.d', heart: [1], tip: 'In would, the o u l says oo, like in book: would.' },
        { seg: 'sh.oul.d', heart: [1], tip: 'In should, the o u l says oo, like in book: should.' },
      ],
      aliens: ['z.oo.p', 'v.oo.b', 'j.oo.f', 'k.oo.b'],
      sentences: [
        { t: 'Could a spoon zoom to the moon?', yes: false },
        { t: 'Would you eat stew with a broom?', yes: false },
        { t: 'Should you brush each tooth?', yes: true },
        { t: 'The raccoon sits on the moon with a spoon.', pic: '🦝🌙🥄', alts: ['🦝🌙🧹', '🐸🌙🥄'] },
        { t: 'A little mushroom grew in a blue boot.', pic: '🍄👢', alts: ['🍄🥄', '🦷👢'] },
        { t: 'The frog flew to the moon on a new broom.', pic: '🐸🧹🌙', alts: ['🐸🧹☀️', '🦝🧹🌙'] },
      ],
    },
    {
      id: 'w7-l2',
      title: 'Frog Footprints',
      animal: {
        emoji: '🐸', name: 'Poison Dart Frog',
        rescue: 'A tiny poison dart frog lost her tadpole in the leaves! Read the words to help her look.',
        fact: 'In many kinds of poison dart frogs, the dad carries the tadpoles on his back up to tiny pools of water in the trees!',
        stat: 'Only 1 to 2 inches long',
      },
      sounds: [
        { g: 'oo', p: 'uu', tip: 'Sometimes o and o say a short oo, like in book and look.', emoji: '📖' },
        { g: 'u', p: 'uu', tip: 'Sometimes u says that same short oo, like in bull and push.', emoji: '🐂' },
      ],
      words: [
        w('b.oo=uu.k', '📖'), w('h.oo=uu.k', '🪝'), w('f.oo=uu.t', '🦶'), w('c.oo=uu.k', '🧑‍🍳'),
        w('w.oo=uu.d', '🪵'), w('w.oo=uu.l', '🧶'), w('b.u=uu.ll', '🐂'), w('l.oo=uu.k', '👀'),
        w('f.oo=uu.t|p.r.i.n.t.s', '👣'), w('f.r.o.g', '🐸'),
      ],
      extra: ws('g.oo=uu.d', 'p.u=uu.t', 'p.u=uu.sh', 'p.u=uu.ll', 'f.u=uu.ll', 'l.e.f.t', 'b.a.g'),
      heart: [
        { seg: 'o.n.ce', heart: [0, 2], tip: 'In once, the o says wu and the c e says s: once.' },
      ],
      aliens: ['z.oo=uu.k', 'j.oo=uu.k', 'v.oo=uu.k'],
      sentences: [
        { t: 'Can you look at a good book?', yes: true },
        { t: 'Can a bull cook a pot of stew?', yes: false },
        { t: 'Should you pull a bull by its tail?', yes: false },
        { t: 'Once, a cook put a book on a hook.', pic: '🧑‍🍳📖🪝', alts: ['🧑‍🍳🦶🪝', '🐸📖🪝'] },
        { t: 'The bull has a full bag of wool on his back.', pic: '🐂🧶', alts: ['🐂🪵', '🐸🧶'] },
        { t: 'Look! A frog left little footprints on the book.', pic: '🐸👣📖', alts: ['🐸👣🪵', '🐂👣📖'] },
      ],
    },
    {
      id: 'w7-l3',
      title: 'Crown and Cloud',
      animal: {
        emoji: '🦍', name: 'Gorilla',
        rescue: 'A baby gorilla climbed too high up a tree! Read the words to help him get back to his family.',
        fact: 'A gorilla named Koko learned to talk with her hands. She knew more than 1,000 signs!',
        stat: 'Can weigh 400 pounds',
      },
      sounds: [
        { g: 'ow', tip: 'o and w are a team. They say ow, like when you bump your toe. Ow, like in cow!', emoji: '🐄' },
        { g: 'ou', tip: 'o and u are a team. They say ow too, like in cloud.', emoji: '☁️' },
      ],
      words: [
        w('c.ow', '🐄'), w('ow.l', '🦉'), w('c.r.ow.n', '👑'), w('c.l.ow.n', '🤡'),
        w('f.r.ow.n', '🙁'), w('d.ow.n', '⬇️'), w('c.l.ou.d', '☁️'), w('m.ou.th', '👄'),
        w('c.ou.ch', '🛋️'), w('s.n.ou.t', '🐽'), w('s.p.r.ou.t', '🌱'),
      ],
      extra: ws('l.ou.d', 'sh.ou.t', 'ou.t', 's.n.i.ff', 'ea.t.s', 'n.ow', 'h.ow'),
      aliens: ['z.ou.n.d', 'v.ou.t', 'f.ow.n', 'j.ou.d'],
      sentences: [
        { t: 'Can a cloud sit on a couch?', yes: false },
        { t: 'Can a pig sniff with its snout?', yes: true },
        { t: 'Is it loud when you shout?', yes: true },
        { t: 'The clown with the crown sat down on the couch.', pic: '🤡👑🛋️', alts: ['🤡👑☁️', '🐄👑🛋️'] },
        { t: 'An owl and a cow look up at a big gray cloud.', pic: '🦉🐄☁️', alts: ['🦉🐄🌙', '🦉🤡☁️'] },
        { t: 'When the cow sees a green sprout, she eats it in one bite.', pic: '🐄🌱', alts: ['🐄☁️', '🦉🌱'] },
      ],
    },
    {
      id: 'w7-l4',
      title: 'Ant Jaws',
      animal: {
        emoji: '🐜', name: 'Leafcutter Ant',
        rescue: 'A leafcutter ant dropped her leaf in the river! Read the words to help her get a new one.',
        fact: 'Leafcutter ants are farmers! They chew up leaves to grow a fungus garden, and the fungus is their food.',
        stat: 'Carries 50 times its own weight',
      },
      sounds: [
        { g: 'oi', tip: 'o and i are a team. They say oy, like in coin.', emoji: '🪙' },
        { g: 'oy', tip: 'o and y are a team. They say oy too, like in toy.', emoji: '🧸' },
        { g: 'aw', tip: 'a and w are a team. They say aw, like in paw.', emoji: '🐾' },
        { g: 'au', tip: 'a and u are a team. They say aw too, like in launch.', emoji: '🚀' },
      ],
      words: [
        w('c.oi.n', '🪙'), w('p.oi.n.t', '👉'), w('t.oi|l.e.t', '🚽'), w('t.oy', '🧸'),
        w('b.oy', '👦'), w('c.ow|b.oy', '🤠'), w('p.aw', '🐾'), w('s.aw', '🪚'),
        w('s.t.r.aw', '🥤'), w('y.aw.n', '🥱'),
      ],
      extra: ws('p.au.l', 'l.au.n.ch', 'y.aw.n.s=z', 'l.a_e.t', 'c.u.t', 'oi.nk'),
      heart: [
        { seg: 'b.e.c.au.s=z.e', heart: [1, 3, 5], tip: 'Because is a long heart word. Say it with me: be-cause!' },
      ],
      aliens: ['z.oi.p', 'v.oy', 'j.aw.b'],
      sentences: [
        { t: 'Can a toy saw cut down a big tree?', yes: false },
        { t: 'Do you yawn when you need to sleep?', yes: true },
        { t: 'Can a pig say oink?', yes: true },
        { t: 'The cowboy has a coin and a toy.', pic: '🤠🪙🧸', alts: ['🤠🪙🥤', '👦🪙🧸'] },
        { t: 'The boy yawns because it is late at night.', pic: '👦🥱🌃', alts: ['👦🥱☀️', '🤠🥱🌃'] },
        { t: 'Paul the dog put his paw in the toilet!', pic: '🐶🐾🚽', alts: ['🐶🐾🥤', '🐱🐾🚽'] },
      ],
    },
    {
      id: 'w7-l5',
      title: 'Big Canopy Rescue',
      animal: {
        emoji: '🦜', name: 'Scarlet Macaw',
        rescue: 'Strange sounds are coming from the treetops at night! Read the whole story to solve the mystery.',
        fact: 'Macaws use their big, strong beaks like a third foot to help them climb up trees!',
        stat: 'Up to 3 feet long, beak to tail',
      },
      sounds: [],
      words: [
        w('m.oo.n', '🌙'), w('ow.l', '🦉'), w('c.ow', '🐄'), w('t.r.ee', '🌳'),
        w('f.o.x', '🦊'), w('p.i.g', '🐷'),
      ],
      extra: ws(
        'j.oy', 'w.oo=uu.d.s=z', 's.t.i.ll', 'n.o.d.s=z', 's.ou.n.d', 'f.i.ll.s=z', 'h.oo.t', 'j.u.m.p.s',
        'm.oo', 'l.oo=uu.k.s', 'p.u.ff.s', 'sh.ou.t.s', 't.i_e.m', 'g.r.i.n', 'r.ea.l', 'h.oo.t.s',
      ),
      sentences: [],
      story: {
        title: 'Kit and the Loud Sound',
        pages: [
          { t: 'Kit the fox and Joy sit up in a big tree in the green woods.', pic: '🦊🦜🌳' },
          { t: 'It is night. The moon is out, and the woods are still. Kit nods off.', pic: '🌙🌳😴' },
          { t: 'Then a loud sound fills the woods. HOOT! HOOT! Kit jumps up. Could it be an owl?', pic: '🦊😮🔊' },
          { t: 'Kit and Joy look and look. They look up and down, but they do not see an owl.', pic: '🦊🦜👀' },
          { t: 'Then the sound is back: MOO! MOO! How could a cow get up in a tree?', pic: '🐄🌳❓' },
          { t: 'Kit looks at Joy. Joy puffs up and shouts: HOOT! MOO! OINK!', pic: '🦜🗣️' },
          { t: 'The loud sound was Joy all the time! Kit and Joy grin and grin.', pic: '🦊🦜😄' },
          { t: 'Then a real owl lands on the tree and hoots back at Joy!', pic: '🦉🦜🦊' },
        ],
        questions: [
          { ask: 'Where were Kit and Joy?', options: ['🏖️', '🌳', '🏠'], answer: 1 },
          { ask: 'Who made all the loud sounds?', options: ['🦉', '🐄', '🦜'], answer: 2 },
          { ask: 'Why did Kit think a cow was up in the tree?', options: ['👃', '🔊', '👀'], answer: 1 },
        ],
      },
    },
  ],
}
