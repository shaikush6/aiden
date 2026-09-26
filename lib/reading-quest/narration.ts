// Dramatic narration for "narrator mode": the cinematic moments between the reading.
// Spoken by the narrator voice. Reading content (words, sounds) always stays in the clear teacher voice.

/** Narrator voices a grown-up can choose from (OpenAI text-to-speech voice names). */
export const NARRATOR_VOICES = [
  { id: 'verse', label: 'Verse' },
  { id: 'ash', label: 'Ash' },
  { id: 'coral', label: 'Coral' },
  { id: 'ballad', label: 'Ballad' },
] as const
export type NarratorVoice = (typeof NARRATOR_VOICES)[number]['id']
export const DEFAULT_NARRATOR_VOICE: NarratorVoice = 'verse'

/** Played when a grown-up previews a narrator voice. */
export const VOICE_PREVIEW = 'Hey, explorer! I am your narrator! Are you ready to read some words and rescue some animals? Let’s GO!'

export interface WorldNarration {
  /** Played when the child starts the first level of a world. */
  arrive: string
  /** Played when the world's final rescue is complete. */
  complete: string
}

export const WORLD_NARRATION: Record<string, WorldNarration> = {
  w1: {
    arrive: 'Explorer! You have reached the Savanna! Tall golden grass. Hot sun. And somewhere out there, animals who need your help. Your reading power begins right NOW!',
    complete: 'The Savanna is safe! Zebras, lions, hippos, giraffes and elephants are free, all because of your reading power. But the adventure is not over. The jungle is calling!',
  },
  w2: {
    arrive: 'Welcome to the Jungle! Vines swing. Monkeys shriek. The trees are so tall they touch the clouds. Five new creatures are waiting for a hero. Are you ready?',
    complete: 'Jungle mission complete! The whole canopy is cheering for you. Next stop: deep, deep under the sea!',
  },
  w3: {
    arrive: 'Dive, dive, dive! You are now in the Deep Blue Ocean, where sharks glide, whales sing, and letters team up to make brand new sounds. Hold your breath, explorer!',
    complete: 'The ocean is safe! Octopus, dolphin, whale and shark all wave their fins to say thank you. Now, pack your backpack. We are going camping!',
  },
  w4: {
    arrive: 'Night falls on the Forest Camp. The campfire crackles. Owls hoot. Something is moving in the trees! Here, letters stick together like marshmallows. Let’s blend them!',
    complete: 'Camp is safe, and the bear cub is home with his mom! You are becoming a real reading ranger. But look! The desert sun is rising!',
  },
  w5: {
    arrive: 'Whoosh! A hot wind blows across the Desert. The sand is burning, the cactus is spiky, and a mysterious magic E is hiding in the dunes. Its power changes everything!',
    complete: 'You mastered the magic E! The desert animals are safe and cool in the shade. Now, bundle up, explorer. It is about to get freezing!',
  },
  w6: {
    arrive: 'Brrrr! You have reached the Frozen Ice Lands! Snow as far as you can see. Penguins waddle. Seals splash. And here, vowels team up to say their names!',
    complete: 'The Ice Lands are safe! Even the whales are singing your name. Warm up, explorer. The rainforest is waiting!',
  },
  w7: {
    arrive: 'Drip, drop! You are in the Rainforest! Rain pours. Frogs glow. Butterflies flash blue. Listen closely, because sounds here come in twins!',
    complete: 'The rainforest is saved! Frogs are croaking a victory song just for you. Saddle up, partner. Next stop: the ranch!',
  },
  w8: {
    arrive: 'Yee-haw! Welcome to the Ranch! Barns, horses, cows and fields of corn. But watch out: there is a bossy letter R here, and it bosses every vowel around!',
    complete: 'The ranch is safe, and bossy R is no match for you! Now grab your boots. We are heading into the mysterious swamp!',
  },
  w9: {
    arrive: 'Splash! You have entered the Swamp. Mist floats over the water. Alligators hide in the reeds. And letters here play tricks! Only the smartest readers can see through them.',
    complete: 'You beat every trick in the swamp! Even Big Al the alligator is impressed. Now, get ready for the greatest adventure of all. Prepare for launch!',
  },
  w10: {
    arrive: 'Three, two, one, BLAST OFF! You are soaring into the Galaxy! Stars, planets, comets, and the biggest words in the universe. This is the final mission, explorer!',
    complete: 'Mission complete! You have rescued every animal and read every word from the Savanna to the stars! You are now an official reading champion of the galaxy!',
  },
}

/** Spoken when a regular level begins (before the animal’s rescue line). */
export const MISSION_START = [
  'A new mission is starting!',
  'Explorer, an animal needs you!',
  'Alert! Alert! A rescue is needed!',
  'Get ready, explorer. Here comes a new mission!',
] as const

/** Spoken when a level is complete, before "You rescued the …". */
export const MISSION_DONE = [
  'Mission complete!',
  'Rescue successful!',
  'You did it, explorer!',
  'Incredible reading! The rescue worked!',
] as const

export const STORY_START = 'Gather round, explorer! A brand new story is about to begin!'

export function pickLine<T extends readonly string[]>(lines: T): T[number] {
  return lines[Math.floor(Math.random() * lines.length)]
}

/** Every narration-only line, for the audio allowlist. */
export function narrationLines(): string[] {
  return [
    ...Object.values(WORLD_NARRATION).flatMap(n => [n.arrive, n.complete]),
    ...MISSION_START,
    ...MISSION_DONE,
    STORY_START,
    VOICE_PREVIEW,
  ]
}
