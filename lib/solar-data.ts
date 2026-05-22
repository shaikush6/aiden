export interface Planet {
  id: string;
  name: string;
  emoji: string;
  color: string;
  glowColor: string;
  diameterKm: number;
  distanceAU: number;
  moons: number;
  tempDesc: string;
  facts: string[];
  orbitDuration: number; // seconds for one full orbit animation
  orbitRadius: number;   // px in the orrery (visual only)
  size: number;          // px diameter in orrery
}

export const PLANETS: Planet[] = [
  {
    id: 'mercury',
    name: 'MERCURY',
    emoji: '⬛',
    color: '#9CA3AF',
    glowColor: '#D1D5DB',
    diameterKm: 4879,
    distanceAU: 0.39,
    moons: 0,
    tempDesc: '-180°C to 430°C',
    facts: [
      'Closest planet to the Sun!',
      'No air to breathe here!',
      'A year is just 88 Earth days!',
    ],
    orbitDuration: 8,
    orbitRadius: 80,
    size: 14,
  },
  {
    id: 'venus',
    name: 'VENUS',
    emoji: '🟡',
    color: '#FBBF24',
    glowColor: '#FDE68A',
    diameterKm: 12104,
    distanceAU: 0.72,
    moons: 0,
    tempDesc: '465°C — SUPER hot!',
    facts: [
      'The HOTTEST planet in the solar system!',
      'It spins backwards — really!',
      'A day on Venus is longer than its year!',
    ],
    orbitDuration: 14,
    orbitRadius: 120,
    size: 18,
  },
  {
    id: 'earth',
    name: 'EARTH',
    emoji: '🌍',
    color: '#3B82F6',
    glowColor: '#93C5FD',
    diameterKm: 12742,
    distanceAU: 1,
    moons: 1,
    tempDesc: '15°C average',
    facts: [
      'OUR HOME! 🏠',
      'The only planet with liquid oceans!',
      'The only planet with life (that we know of!)',
    ],
    orbitDuration: 20,
    orbitRadius: 165,
    size: 20,
  },
  {
    id: 'mars',
    name: 'MARS',
    emoji: '🔴',
    color: '#EF4444',
    glowColor: '#FCA5A5',
    diameterKm: 6779,
    distanceAU: 1.52,
    moons: 2,
    tempDesc: '-60°C average',
    facts: [
      'Called The Red Planet!',
      'Has the tallest volcano in the whole solar system!',
      'A day on Mars is 24 hours and 37 minutes — almost like Earth!',
    ],
    orbitDuration: 30,
    orbitRadius: 215,
    size: 16,
  },
  {
    id: 'jupiter',
    name: 'JUPITER',
    emoji: '🟠',
    color: '#F97316',
    glowColor: '#FED7AA',
    diameterKm: 139820,
    distanceAU: 5.2,
    moons: 95,
    tempDesc: '-110°C',
    facts: [
      'The BIGGEST planet — over 1,000 Earths could fit inside!',
      'Has a giant storm called the Great Red Spot — bigger than Earth!',
      'Has 95 moons — like its own little solar system!',
    ],
    orbitDuration: 50,
    orbitRadius: 280,
    size: 40,
  },
  {
    id: 'saturn',
    name: 'SATURN',
    emoji: '🪐',
    color: '#EAB308',
    glowColor: '#FEF08A',
    diameterKm: 116460,
    distanceAU: 9.58,
    moons: 146,
    tempDesc: '-140°C',
    facts: [
      'Has the most beautiful rings in the solar system!',
      'It is so light it could float on water!',
      'Has 146 moons — the most of any planet!',
    ],
    orbitDuration: 70,
    orbitRadius: 345,
    size: 36,
  },
  {
    id: 'uranus',
    name: 'URANUS',
    emoji: '🔵',
    color: '#67E8F9',
    glowColor: '#A5F3FC',
    diameterKm: 50724,
    distanceAU: 19.2,
    moons: 27,
    tempDesc: '-195°C',
    facts: [
      'Spins completely on its side — like a rolling ball!',
      'The coldest planet in our solar system!',
      'It rolls around the Sun instead of spinning upright!',
    ],
    orbitDuration: 95,
    orbitRadius: 410,
    size: 26,
  },
  {
    id: 'neptune',
    name: 'NEPTUNE',
    emoji: '💙',
    color: '#3B82F6',
    glowColor: '#BFDBFE',
    diameterKm: 49244,
    distanceAU: 30.05,
    moons: 16,
    tempDesc: '-200°C — FREEZING!',
    facts: [
      'The farthest planet from the Sun!',
      'Has the strongest winds in the solar system — faster than a race car!',
      'One year on Neptune = 165 Earth years!',
    ],
    orbitDuration: 130,
    orbitRadius: 475,
    size: 24,
  },
];

export const FUN_FACTS = [
  'The Sun is so big, over 1 MILLION Earths could fit inside it! 🌞',
  'Light from the Sun takes 8 minutes to reach Earth! ⚡',
  'Saturn\'s rings are made of ice and rock! 💍',
  'Mars has a volcano called Olympus Mons — 3 times taller than Mount Everest! 🌋',
  'Jupiter\'s storm (the Great Red Spot) has been going for over 350 years! 🌀',
  'There are more stars in the universe than grains of sand on all Earth\'s beaches! ✨',
  'A black hole is so heavy that nothing — not even light — can escape it! 🕳️',
  'The Moon is moving away from Earth — very, very slowly! 🌙',
  'Venus is hotter than Mercury, even though Mercury is closer to the Sun! 🔥',
  'Neptune was only discovered in 1846! 🔭',
  'Uranus was the first planet discovered with a telescope, in 1781! 👀',
  'The solar system is about 4.6 BILLION years old! 🎂',
];
