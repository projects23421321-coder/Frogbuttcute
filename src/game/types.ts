export type Side = 'player' | 'rival';

export type FrogId = 'sandy' | 'pebble' | 'blobby';

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
  photoKey: 'player' | 'rival' | 'rivalAlt';
  tint: 'none' | 'cool' | 'warm';
  cutMode: 'white' | 'ellipse';
};

export const FIGHTERS: FighterKit[] = [
  {
    frogId: 'sandy',
    name: 'Sandy',
    tagline: 'Soft power. Maximum boop.',
    photoKey: 'player',
    tint: 'none',
    cutMode: 'white',
  },
  {
    frogId: 'pebble',
    name: 'Pebble',
    tagline: 'Gravel-trained cheeks.',
    photoKey: 'rival',
    tint: 'cool',
    cutMode: 'ellipse',
  },
  {
    frogId: 'blobby',
    name: 'Blobby',
    tagline: 'Built like a stress ball.',
    photoKey: 'rivalAlt',
    tint: 'warm',
    cutMode: 'ellipse',
  },
];
