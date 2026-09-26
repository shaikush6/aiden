// World 8 — Ranch. Bossy r: ar, or, ore, er, ir, ur, air, are, ear, eer (r-controlled vowels).
import type { WorldDef } from '../types.ts'
import { w, ws } from './helpers.ts'

export const WORLD_8: WorldDef = {
  id: 'w8',
  name: 'Bossy R Ranch',
  emoji: '🐴',
  habitat: 'Ranch',
  theme: 'from-orange-300 via-amber-200 to-lime-200 dark:from-orange-950 dark:via-slate-900 dark:to-slate-950',
  intro: 'Welcome to the ranch! Here the letter r is bossy. It changes the sound of the vowel next to it. Let’s help the farm animals!',
  skill: 'R-controlled vowels: ar, or, ore, er, ir, ur, air, are, ear, eer',
  levels: [
    {
      id: 'w8-l1',
      title: 'Star Barn',
      animal: {
        emoji: '🦉', name: 'Barn Owl',
        rescue: 'A barn owl cannot find her way back to the big red barn! Read the words to light up the stars and guide her home.',
        fact: 'A barn owl can catch a mouse in total darkness, just by listening for it!',
        stat: 'Turns its head 270 degrees',
      },
      sounds: [
        { g: 'ar', tip: 'a and r together say ar, like a pirate: arr!', emoji: '🏴‍☠️' },
      ],
      words: [
        w('s.t.ar', '⭐'), w('c.ar', '🚗'), w('sh.ar.k', '🦈'), w('j.ar', '🫙'),
        w('y.ar.n', '🧶'), w('s.c.ar.f', '🧣'), w('c.ar.t', '🛒'), w('g.ar|l.i.c', '🧄'),
        w('ar.m', '💪'), w('p.ar.k', '🏞️'),
      ],
      extra: ws(
        'b.ar.n', 'f.ar.m', 'f.ar', 'h.ar.d', 'd.ar.k', 's.t.ar.t', 's.m.ar.t', 'sh.ar.p',
        'c.ar.s=z', 's.t.ar.s=z', 'sh.ar.k.s', 'a.t', 'f.i.t', 's.ee', 'n.igh.t', 'd.r.i_e.v',
        'f.u=uu.ll', 't.o.p',
      ),
      heart: [
        { seg: 's.ch=k.oo.l', heart: [1], tip: 'In school, the c h says k: school.' },
      ],
      aliens: ['z.ar.p', 'v.ar.b', 'j.ar.t', 'b.ar.v'],
      sentences: [
        { t: 'Can a shark drive a car?', yes: false },
        { t: 'Can you see stars at night?', yes: true },
        { t: 'Can a big farm fit in a jar?', yes: false },
        { t: 'The shark has a red scarf.', pic: '🦈🧣', alts: ['🦈🧶', '🚗🧣'] },
        { t: 'The cart is full of garlic.', pic: '🛒🧄', alts: ['🛒🫙', '🚗🧄'] },
        { t: 'A star is on top of the car in the park.', pic: '⭐🚗', alts: ['⭐🛒', '🦈🚗'] },
      ],
    },
    {
      id: 'w8-l2',
      title: 'Corn Storm',
      animal: {
        emoji: '🐄', name: 'Cow',
        rescue: 'A storm is coming and a cow is stuck out in the corn field! Read the words to lead her back to the barn.',
        fact: 'A cow has one stomach with 4 parts! She chews her food, swallows it, then brings it back up to chew it again.',
        stat: 'Stomach with 4 parts',
      },
      sounds: [
        { g: 'or', tip: 'o and r together say or, like in corn.', emoji: '🌽' },
        { g: 'ore', tip: 'o, r and e together also say or, like in snore. The e is quiet.', emoji: '😴' },
      ],
      words: [
        w('c.or.n', '🌽'), w('f.or.k', '🍴'), w('s.t.or.m', '⛈️'), w('sh.or.t.s', '🩳'),
        w('s.n.ore', '😴'), w('s.t.ore', '🏪'), w('h.or.n', '📯'), w('sh.ore', '🏖️'),
        w('g.oa.t', '🐐'), w('c.ow', '🐄'),
      ],
      extra: ws(
        'or', 'f.or', 'm.ore', 'b.or.n', 'sh.or.t', 's.or.t', 'h.or.n.s=z', 'f.or.k.s',
        'c.ow.s=z', 'ea.t', 'w.i.th', 's.p.or.t', 'm.or.n|i.ng',
      ),
      heart: [
        { seg: 'f.r.ie.n.d', heart: [2], tip: 'In friend, the i e says e: friend.' },
      ],
      aliens: ['z.or.p', 'v.or.b', 'j.ore', 'sh.or.b'],
      sentences: [
        { t: 'Can a fork snore?', yes: false },
        { t: 'Can a cow eat corn?', yes: true },
        { t: 'Do sharks have horns?', yes: false },
        { t: 'My friend the goat is at the store with a fork.', pic: '🐐🏪🍴', alts: ['🐐🏪🌽', '🐄🏪🍴'] },
        { t: 'A cow in shorts is at the shore.', pic: '🐄🩳🏖️', alts: ['🐄🩳🏪', '🐐🩳🏖️'] },
      ],
    },
    {
      id: 'w8-l3',
      title: 'Bird Burger Party',
      animal: {
        emoji: '🦬', name: 'Bison',
        rescue: 'A bison calf wandered away from the herd! Read the words to help her get back to her mom.',
        fact: 'A bison is the heaviest land animal in North America. It can weigh 2,000 pounds and still run 35 miles per hour!',
        stat: 'Runs 35 miles per hour',
      },
      sounds: [
        { g: 'er', tip: 'e and r together say er, like in hammer.', emoji: '🔨' },
        { g: 'ir', tip: 'i and r also say er, like in bird.', emoji: '🐦' },
        { g: 'ur', tip: 'u and r also say er, like in burger.', emoji: '🍔' },
      ],
      words: [
        w('b.ir.d', '🐦'), w('g.ir.l', '👧'), w('sh.ir.t', '👕'), w('b.ir.th|d.ay', '🎂'),
        w('ch.ur.ch', '⛪'), w('b.ur|g.er', '🍔'), w('h.ur.t', '🤕'), w('h.a.m|m.er', '🔨'),
        w('l.a.d|d.er', '🪜'), w('b.u.t|t.er', '🧈'), w('p.e.p|p.er', '🌶️'), w('f.l.ow|er', '🌷'),
      ],
      extra: ws(
        'f.ur', 'd.ir.t', 'f.ir.s.t', 'b.ir.d.s=z', 't.ur.n', 'b.ur.n', 'u.n|d.er', 'a.f|t.er',
        'b.i.g|g.er', 'p.er.ch', 'f.l.y=igh', 'm.a.n', 'u.s', 's.i.t.s',
      ),
      heart: [
        { seg: 'eye', heart: [0], tip: 'Eye is a heart word. It says I, like the letter: eye.' },
      ],
      aliens: ['z.er.t', 'v.ur.m', 'j.ir.p', 'n.ur.b'],
      sentences: [
        { t: 'Do birds have fur?', yes: false },
        { t: 'Is my eye on my arm?', yes: false },
        { t: 'Can a bird turn into a burger?', yes: false },
        { t: 'The girl has a hammer and a ladder.', pic: '👧🔨🪜', alts: ['👧🔨🌷', '🐦🔨🪜'] },
        { t: 'A bird sits on a burger with a hot pepper.', pic: '🐦🍔🌶️', alts: ['🐦🧈🌶️', '🐦🍔🌷'] },
        { t: 'The girl in the red shirt has a flower.', pic: '👧👕🌷', alts: ['👧👕🔨', '🐦👕🌷'] },
      ],
    },
    {
      id: 'w8-l4',
      title: 'Hair Scare',
      animal: {
        emoji: '🐑', name: 'Sheep',
        rescue: 'A little lamb is stuck behind the fence! Read the words to open the gate.',
        fact: 'Sheep are great at faces! A sheep can remember the faces of 50 other sheep for up to 2 years.',
        stat: 'Remembers 50 faces',
      },
      sounds: [
        { g: 'air', tip: 'a, i and r together say air, like the air you breathe.', emoji: '🌬️' },
        { g: 'are', tip: 'a, r and e also say air, like in scare. The e is quiet.', emoji: '😱' },
        { g: 'ear', tip: 'e, a and r together say ear, like the ear on your head.', emoji: '👂' },
        { g: 'eer', tip: 'e, e and r also say ear, like in deer.', emoji: '🦌' },
      ],
      words: [
        w('ch.air', '🪑'), w('h.air', '💇'), w('air|p.l.a_e.n', '✈️'), w('s.qu.are', '🟧'),
        w('s.c.are', '😱'), w('ear', '👂'), w('b.ear.d', '🧔'), w('g.ear', '⚙️'),
        w('d.eer', '🦌'), w('h.are', '🐇'),
      ],
      extra: ws(
        'air', 'f.air', 'c.are', 'sh.are', 'h.ear', 'n.ear', 'y.ear', 'f.ear', 'c.l.ear',
        's.t.air.s=z', 'ch.air.s=z', 'ear.s=z', 's.c.are.d',
      ),
      heart: [
        { seg: 's=sh.ure', heart: [0, 1], tip: 'In sure, the s says sh and the u r e says or: sure.' },
      ],
      aliens: ['z.air', 'j.are', 'z.ear', 'k.eer'],
      sentences: [
        { t: 'Can a chair fly up in the air?', yes: false },
        { t: 'Can you hear with an ear?', yes: true },
        { t: 'Is it fair to share with a friend?', yes: true },
        { t: 'I am sure the deer is on the chair.', pic: '🦌🪑', alts: ['🦌✈️', '🧔🪑'] },
        { t: 'A man with a big beard sits in the airplane.', pic: '🧔✈️', alts: ['🧔🪑', '🦌✈️'] },
        { t: 'The deer got a scare and ran up the stairs.', pic: '🦌😱', alts: ['🦌🪑', '🧔😱'] },
      ],
    },
    {
      id: 'w8-l5',
      title: 'Big Barn Rescue',
      animal: {
        emoji: '🐴', name: 'Horse',
        rescue: 'A strange sound is coming from the barn and the horses are scared! Read the whole story to find out what it is.',
        fact: 'A baby horse is called a foal. A foal can stand up and walk about one hour after it is born!',
        stat: 'Gallops up to 40 miles per hour',
      },
      sounds: [],
      words: [
        w('f.oa.l', '🐴'), w('ow.l', '🦉'), w('b.ir.d', '🐦'), w('c.or.n', '🌽'),
        w('s.t.or.m', '⛈️'), w('ch.air', '🪑'), w('d.eer', '🦌'), w('sh.ar.k', '🦈'),
      ],
      extra: ws(
        'f.o.x', 'th.e.n', 'th.a.t', 's.ou.n.d', 'l.ou.d', 'l.ou.d|er', 'sh.a_e.k.s', 'm.o.n|s.t.er',
        'm.u.s.t', 'l.oo=uu.k', 'c.r.ee.p', 'p.a.s.t', 'sh.ee.p', 'g.e.t.s', 'h.igh', 's.p.o.t',
        's.n.ore.s=z', 'g.r.i.n', 't.i.p|t.oe', 'ou.t', 'l.i_e.k',
      ),
      sentences: [],
      story: {
        title: 'The Monster in the Barn',
        pages: [
          { t: 'It is dark on the farm. Kit the fox and Star the foal are in the barn. The stars are out.', pic: '🦊🐴🌟' },
          { t: 'Then they hear a big sound. It is so loud that the barn shakes!', pic: '🔊' },
          { t: 'Star is scared. Is it a monster? Kit is smart. We must go and look, Kit said.', pic: '🐴😱🦊' },
          { t: 'They creep past the cow, the pig and the sheep. The sound gets louder and louder.', pic: '🐄🐷🐑' },
          { t: 'Up on a high perch, they spot the monster. It is a little barn owl!', pic: '🦉' },
          { t: 'The little owl snores and snores. She snores so hard that the barn shakes like a storm!', pic: '🦉😴⛈️' },
          { t: 'Kit and Star grin. They tiptoe out of the barn. Let the little owl snore!', pic: '🦊🐴🌙' },
        ],
        questions: [
          { ask: 'Who was in the barn with Kit?', options: ['🐴', '🐟', '🐧'], answer: 0 },
          { ask: 'What was making the big sound?', options: ['🐄', '🦉', '👹'], answer: 1 },
          { ask: 'Why did the barn shake?', options: ['⛈️', '😴', '🚗'], answer: 1 },
        ],
      },
    },
  ],
}
