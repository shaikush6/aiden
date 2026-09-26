// World 2 — Jungle. New consonant sounds j v w x y z zz qu and two-part words (Letters and Sounds Phase 3 consonants).
import type { WorldDef } from '../types.ts'
import { w, ws } from './helpers.ts'

export const WORLD_2: WorldDef = {
  id: 'w2',
  name: 'Jungle Jumble',
  emoji: '🐒',
  habitat: 'Jungle',
  theme: 'from-green-300 via-emerald-200 to-lime-200 dark:from-green-950 dark:via-slate-900 dark:to-slate-950',
  intro: 'Welcome to the jungle! Swing through the treetops and learn new sounds to help the animals.',
  skill: 'New consonant sounds (j v w x y z zz qu), two-part words like sunhat, and heart words he we me be was you my',
  levels: [
    {
      id: 'w2-l1',
      title: 'Jaguar Jog',
      animal: {
        emoji: '🐆', name: 'Jaguar',
        rescue: 'A jaguar cub is stuck on the wrong side of the river! Read the words to help her get across.',
        fact: 'Jaguars love water! Most big cats stay dry, but jaguars are great swimmers. They even catch fish and turtles.',
        stat: 'Can weigh over 200 pounds',
      },
      sounds: [
        { g: 'j', tip: 'The letter [j] says /j/. Like jumping jelly: /j/ /j/ /j/!', emoji: '🧃' },
        { g: 'v', tip: 'The letter [v] says /v/. Like a rumbling volcano: /v/ /v/ /v/!', emoji: '🌋' },
        { g: 'w', tip: 'The letter [w] says /w/. Like a wiggly worm: /w/ /w/ /w/!', emoji: '🪱' },
      ],
      words: [
        w('j.e.t', '✈️'), w('j.o.g', '🏃'), w('v.a.n', '🚐'), w('w.e.b', '🕸️'),
        w('w.i.n', '🏆'), w('w.e.t', '💦'), w('b.u.g', '🐛'), w('b.a.t', '🦇'),
        w('n.u.t', '🥜'), w('l.o.g', '🪵'),
      ],
      heart: [
        { seg: 'h.e', heart: [1], tip: 'In the word he, the letter [e] says its name: /ee/. He!' },
        { seg: 'w.e', heart: [1], tip: 'In the word we, the letter [e] says its name: /ee/. We!' },
      ],
      aliens: ['j.e.v', 'v.u.p', 'w.o.v', 'j.u.b'],
      sentences: [
        { t: 'Can a dog jog?', yes: true },
        { t: 'Can we jog on a web?', yes: false },
        { t: 'The bug is on the web.', pic: '🐛🕸️', alts: ['🦇🕸️', '🐛🪵'] },
        { t: 'He is in a jet.', pic: '👦✈️', alts: ['👦🚐', '🐶✈️'] },
        { t: 'The nut is in the van.', pic: '🥜🚐', alts: ['🥜✈️', '🐛🚐'] },
      ],
    },
    {
      id: 'w2-l2',
      title: 'Sloth Snooze',
      animal: {
        emoji: '🦥', name: 'Sloth',
        rescue: 'A sleepy sloth is snoozing on a thin branch! Read the words to wake him up before it snaps.',
        fact: 'A sloth climbs down from its tree only about once a week. Why? To poop!',
        stat: 'Poops about once a week',
      },
      sounds: [
        { g: 'x', tip: 'The letter [x] says /ks/. Like at the end of box: /ks/ /ks/!', emoji: '📦' },
        { g: 'y', tip: 'The letter [y] says /y/. Like the start of yes: /y/ /y/ yes!', emoji: '🥱' },
        { g: 'z', tip: 'The letter [z] says /z/. Like a sleepy snore: /z/ /z/ /z/!', emoji: '💤' },
        { g: 'zz', tip: 'Two [z] letters together make just one sound: /z/. Like in buzz!', emoji: '🐝' },
      ],
      words: [
        w('b.o.x', '📦'), w('f.o.x', '🦊'), w('o.x', '🐂'), w('s.i.x', '6️⃣'),
        w('y.e.s', '✅'), w('y.u.m', '😋'), w('y.u.ck', '🤢'), w('z.a.p', '⚡'),
        w('b.u.zz', '🐝'), w('f.i.zz', '🫧'),
      ],
      extra: ws('f.i.t', 's.i.t', 'b.u.g.s=z'),
      heart: [
        { seg: 'm.e', heart: [1], tip: 'In the word me, the letter [e] says its name: /ee/. Me!' },
        { seg: 'b.e', heart: [1], tip: 'In the word be, the letter [e] says its name: /ee/. Be!' },
      ],
      aliens: ['y.o.x', 'z.e.b', 'v.u.zz', 'y.i.x'],
      sentences: [
        { t: 'Can a fox be red?', yes: true },
        { t: 'Can an ox fit in a box?', yes: false },
        { t: 'The fox is in the box.', pic: '🦊📦', alts: ['🐂📦', '🦊🚐'] },
        { t: 'Mud on me? Yuck!', pic: '🤢', alts: ['😋', '😴'] },
        { t: 'Six bugs sit on a log.', pic: '6️⃣🐛🪵', alts: ['6️⃣🐛📦', '🔟🐛🪵'] },
      ],
    },
    {
      id: 'w2-l3',
      title: 'Peacock Quiz',
      animal: {
        emoji: '🦚', name: 'Peacock',
        rescue: 'A peacock lost one of his shiny tail feathers! Read the words to help him find it.',
        fact: 'A peacock can spread his tail into a giant fan with more than 100 eye spots on it!',
        stat: 'Tail fan about 5 feet long',
      },
      sounds: [
        { g: 'qu', tip: 'The letters [q] and [u] stick together and say /kw/. Like a duck: /kw/ /kw/, quack!', emoji: '🦆' },
      ],
      words: [
        w('qu.a.ck', '🦆'), w('s.qu.i.d', '🦑'), w('qu.i.z', '❓'), w('h.e.n', '🐔'),
        w('n.e.t', '🥅'), w('r.o.ck', '🪨'), w('c.u.p', '☕'), w('b.u.s', '🚌'),
        w('t.e.n', '🔟'), w('r.e.d', '🔴'),
      ],
      extra: ws('qu.i.ck', 'd.u.ck.s'),
      heart: [
        { seg: 'w.a.s=z', heart: [1], tip: 'In the word was, the letter [a] is tricky. It says /u/: was!' },
      ],
      aliens: ['qu.e.b', 'qu.o.p', 'qu.u.d', 'qu.i.m'],
      sentences: [
        { t: 'Can a duck quack?', yes: true },
        { t: 'Can a squid quack?', yes: false },
        { t: 'The squid was in the net.', pic: '🦑🥅', alts: ['🦑🚌', '🐔🥅'] },
        { t: 'Quick! The hen is on the bus.', pic: '🐔🚌', alts: ['🐔🪨', '🦆🚌'] },
        { t: 'Ten ducks sat on a rock.', pic: '🔟🦆🪨', alts: ['🔟🦆🚌', '6️⃣🦆🪨'] },
      ],
    },
    {
      id: 'w2-l4',
      title: 'Jungle Mix',
      animal: {
        emoji: '🦧', name: 'Orangutan',
        rescue: 'Rain is coming, and a baby orangutan has nothing to keep her dry! Read the words to help her.',
        fact: 'When it rains, orangutans hold big leaves over their heads, just like umbrellas!',
        stat: 'Arms up to 7 feet wide',
      },
      sounds: [],
      words: [
        w('j.a.ck|e.t', '🧥'), w('h.o.t|d.o.g', '🌭'), w('l.a.p|t.o.p', '💻'), w('s.u.n|s.e.t', '🌅'),
        w('s.u.n|h.a.t', '👒'), w('r.o.ck|e.t', '🚀'), w('m.a.g|n.e.t', '🧲'), w('m.i.t|t.e.n', '🧤'),
        w('b.u.ck|e.t', '🪣'), w('t.e.n|n.i.s', '🎾'),
      ],
      extra: ws('a.t', 'z.i.p.s'),
      heart: [
        { seg: 'y.ou', heart: [1], tip: 'In the word you, the letters [o] and [u] say /oo/: you!' },
        { seg: 'm.y=igh', heart: [1], tip: 'In the word my, the letter [y] says /igh/: my!' },
      ],
      aliens: ['v.u.z', 'j.e.x', 'qu.o.v', 'y.i.z'],
      sentences: [
        { t: 'Can you jog up a hill?', yes: true },
        { t: 'Can my hotdog quack?', yes: false },
        { t: 'My sunhat is on the laptop.', pic: '👒💻', alts: ['👒🪣', '🧥💻'] },
        { t: 'A rocket zips up at sunset.', pic: '🚀🌅', alts: ['🚀☀️', '🧲🌅'] },
        { t: 'The hotdog is in my bucket, not in the jacket.', pic: '🌭🪣', alts: ['🌭🧥', '🧲🪣'] },
      ],
    },
    {
      id: 'w2-l5',
      title: 'Big Vine Rescue',
      animal: {
        emoji: '🐒', name: 'Spider Monkey',
        rescue: 'Max the monkey lost his sunhat! Read the whole story to help find it.',
        fact: 'A spider monkey can hang from a branch by just its tail. The tail works like an extra hand!',
        stat: 'Tail up to 3 feet long',
      },
      sounds: [],
      words: [
        w('s.u.n|h.a.t', '👒'), w('b.o.x', '📦'), w('w.e.b', '🕸️'), w('f.o.x', '🦊'),
        w('b.u.g', '🐛'), w('d.u.ck', '🦆'), w('s.i.x', '6️⃣'),
      ],
      extra: ws('m.a.x', 'qu.a.ck', 'd.u.ck.s', 's.i.t'),
      sentences: [],
      story: {
        title: 'Max and the Sunhat',
        pages: [
          { t: 'Max had a big red sunhat.', pic: '🐒👒' },
          { t: 'Max had a nap on a log in the sun.', pic: '🐒😴🪵' },
          { t: 'Max got up. No sunhat!', pic: '🐒❓' },
          { t: 'Kit the fox ran to Max. Is the sunhat in the box? No!', pic: '🦊📦' },
          { t: 'Is it on the web? No! A bug is on the web.', pic: '🕸️🐛' },
          { t: 'Quack! Quack! Kit and Max ran up the hill.', pic: '🦊🐒⛰️' },
          { t: 'The sunhat is on top of the hill. Six ducks sit in it!', pic: '👒🦆🦆' },
          { t: 'Max is not mad. His sunhat is a big duck bed!', pic: '🐒😄🦆' },
        ],
        questions: [
          { ask: 'What did Max lose?', options: ['👒', '📦', '🦊'], answer: 0 },
          { ask: 'Who helped Max look for it?', options: ['🦆', '🦊', '🐛'], answer: 1 },
          { ask: 'What was sitting in the sunhat at the end?', options: ['🐛', '🦆', '🥜'], answer: 1 },
        ],
      },
    },
  ],
}
