import type { WorldDef } from '../types.ts'
import { WORLD_1 } from './world1.ts'
import { WORLD_2 } from './world2.ts'
import { WORLD_3 } from './world3.ts'
import { WORLD_4 } from './world4.ts'
import { WORLD_5 } from './world5.ts'
import { WORLD_6 } from './world6.ts'
import { WORLD_7 } from './world7.ts'
import { WORLD_8 } from './world8.ts'
import { WORLD_9 } from './world9.ts'
import { WORLD_10 } from './world10.ts'

/** The full scope and sequence, in teaching order. Worlds with no levels yet are skipped. */
export const WORLDS: WorldDef[] = [
  WORLD_1, WORLD_2, WORLD_3, WORLD_4, WORLD_5, WORLD_6, WORLD_7, WORLD_8, WORLD_9, WORLD_10,
].filter(world => world.levels.length > 0)
