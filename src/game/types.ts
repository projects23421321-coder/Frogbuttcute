export type Side = 'player' | 'rival';

export type FrogId =
  | 'peaches'
  | 'gravelina'
  | 'sinko'
  | 'marmalade'
  | 'blobbo'
  | 'dusk';

export type ArenaId =
  | 'candyDohyo'
  | 'bubbleBath'
  | 'discoPond'
  | 'snackCounter'
  | 'gravelGlam';

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
  photoKey:
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
  tint: 'none' | 'cool' | 'warm' | 'pink' | 'gold';
  cutMode: 'white' | 'ellipse';
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
  },
  {
    frogId: 'gravelina',
    name: 'Gravelina',
    tagline: 'Raised on pebbles. Built different.',
    photoKey: 'gravelina',
    tint: 'cool',
    cutMode: 'ellipse',
  },
  {
    frogId: 'sinko',
    name: 'Sinko',
    tagline: 'Bathroom sumo royalty.',
    photoKey: 'sinko',
    tint: 'warm',
    cutMode: 'ellipse',
  },
  {
    frogId: 'marmalade',
    name: 'Marmalade',
    tagline: 'Sticky sweet slam.',
    photoKey: 'marmalade',
    tint: 'gold',
    cutMode: 'white',
  },
  {
    frogId: 'blobbo',
    name: 'Blobbo',
    tagline: '90% cheek. 10% attitude.',
    photoKey: 'blobbo',
    tint: 'pink',
    cutMode: 'ellipse',
  },
  {
    frogId: 'dusk',
    name: 'Dusk',
    tagline: 'Night shift twerker.',
    photoKey: 'dusk',
    tint: 'cool',
    cutMode: 'ellipse',
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
