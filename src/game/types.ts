export type Side = 'player' | 'rival';

export type FrogId =
  | 'peaches'
  | 'gravelina'
  | 'sinko'
  | 'marmalade'
  | 'blobbo'
  | 'dusk'
  | 'custom';

export type ArenaId =
  | 'candyDohyo'
  | 'bubbleBath'
  | 'discoPond'
  | 'snackCounter'
  | 'gravelGlam';

export type AccessoryId = 'none' | 'bow' | 'shades' | 'chain';

export type PhotoKey =
  | 'peaches'
  | 'gravelina'
  | 'sinko'
  | 'marmalade'
  | 'pebble'
  | 'blobbo'
  | 'dusk'
  | 'grump'
  | 'potato'
  | 'sandy';

export type FrogPalette = {
  body: string;
  bodyDark: string;
  spots: string;
  belly: string;
  blush: string;
  eye: string;
};

export type FrogBody = {
  id: Side;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  facing: number;
  charge: number;
  charging: boolean;
  cooldown: number;
  squish: number;
  hurtFlash: number;
  dashTrail: number;
  style: number;
  superReady: boolean;
  /** 0..1 twerk intensity */
  twerk: number;
  /** Impulse for cheek springs (set on clash) */
  cheekImpulse: number;
};

export type MatchPhase =
  | 'title'
  | 'select'
  | 'countdown'
  | 'fighting'
  | 'hitstop'
  | 'roundOver'
  | 'matchOver';

export type ImpactBurst = {
  id: number;
  x: number;
  y: number;
  power: number;
  label: string;
  perfect?: boolean;
};

export type FighterKit = {
  frogId: FrogId;
  name: string;
  tagline: string;
  photoKey: PhotoKey;
  tint: 'none' | 'cool' | 'warm' | 'pink' | 'gold';
  cutMode: 'white' | 'ellipse';
  /** Relative bubble-cheek size (1 = default) */
  cheekScale?: number;
  /** Extra jiggle multiplier (1 = default) */
  jiggle?: number;
  accessory?: AccessoryId;
  /** Stable id when frogId === 'custom' */
  customId?: string;
};

export type CustomFrog = {
  id: string;
  name: string;
  tagline: string;
  photoKey: PhotoKey;
  tint: FighterKit['tint'];
  cutMode: FighterKit['cutMode'];
  cheekScale: number;
  jiggle: number;
  accessory: AccessoryId;
};

export type ArenaKit = {
  id: ArenaId;
  name: string;
  tagline: string;
};

export const FIGHTERS: FighterKit[] = [
  {
    frogId: 'peaches',
    name: 'Peaches',
    tagline: 'Certified bubble cheeks.',
    photoKey: 'peaches',
    tint: 'pink',
    cutMode: 'white',
    cheekScale: 1.15,
    jiggle: 1.1,
  },
  {
    frogId: 'gravelina',
    name: 'Gravelina',
    tagline: 'Raised on pebbles. Built different.',
    photoKey: 'gravelina',
    tint: 'cool',
    cutMode: 'ellipse',
    cheekScale: 1.05,
    jiggle: 0.95,
  },
  {
    frogId: 'sinko',
    name: 'Sinko',
    tagline: 'Bathroom sumo royalty.',
    photoKey: 'sinko',
    tint: 'warm',
    cutMode: 'ellipse',
    cheekScale: 1.2,
    jiggle: 1.15,
    accessory: 'bow',
  },
  {
    frogId: 'marmalade',
    name: 'Marmalade',
    tagline: 'Sticky sweet slam.',
    photoKey: 'marmalade',
    tint: 'gold',
    cutMode: 'white',
    cheekScale: 1.1,
    jiggle: 1,
    accessory: 'chain',
  },
  {
    frogId: 'blobbo',
    name: 'Blobbo',
    tagline: '90% cheek. 10% attitude.',
    photoKey: 'blobbo',
    tint: 'pink',
    cutMode: 'ellipse',
    cheekScale: 1.35,
    jiggle: 1.25,
  },
  {
    frogId: 'dusk',
    name: 'Dusk',
    tagline: 'Night shift twerker.',
    photoKey: 'dusk',
    tint: 'cool',
    cutMode: 'ellipse',
    cheekScale: 1.1,
    jiggle: 1.2,
    accessory: 'shades',
  },
];

export const ARENAS: ArenaKit[] = [
  {
    id: 'candyDohyo',
    name: 'Candy Dohyo',
    tagline: 'Pastel rope. Serious business.',
  },
  {
    id: 'bubbleBath',
    name: 'Bubble Bath Coliseum',
    tagline: 'Porcelain. Bubbles. Chaos.',
  },
  {
    id: 'discoPond',
    name: 'Disco Pond',
    tagline: 'Hearts. Lights. Cheek drops.',
  },
  {
    id: 'snackCounter',
    name: 'Snack Counter',
    tagline: 'Crumbs optional. Victory not.',
  },
  {
    id: 'gravelGlam',
    name: 'Gravel Glam Pit',
    tagline: 'Rocks with drip.',
  },
];

/** Preferred arenas for mute-clip silhouette */
export const SHARE_DEFAULT_ARENA: ArenaId = 'discoPond';

export function kitFromCustom(c: CustomFrog): FighterKit {
  return {
    frogId: 'custom',
    customId: c.id,
    name: c.name,
    tagline: c.tagline,
    photoKey: c.photoKey,
    tint: c.tint,
    cutMode: c.cutMode,
    cheekScale: c.cheekScale,
    jiggle: c.jiggle,
    accessory: c.accessory,
  };
}

export function defaultCustomFrog(): CustomFrog {
  return {
    id: `custom-${Date.now()}`,
    name: 'Dump Truck',
    tagline: 'Illegal levels of cheek.',
    photoKey: 'peaches',
    tint: 'pink',
    cutMode: 'white',
    cheekScale: 1.55,
    jiggle: 1.4,
    accessory: 'bow',
  };
}
