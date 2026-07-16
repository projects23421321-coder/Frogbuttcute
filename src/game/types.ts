export type Side = 'player' | 'rival';

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
  /** Seconds of butt-dash afterimage */
  dashTrail: number;
};

export type ImpactBurst = {
  id: number;
  x: number;
  y: number;
  power: number;
  label: string;
};

export type MatchPhase =
  | 'title'
  | 'countdown'
  | 'fighting'
  | 'roundOver'
  | 'matchOver';

export type GameSnapshot = {
  player: FrogBody;
  rival: FrogBody;
  phase: MatchPhase;
  countdown: number;
  playerRounds: number;
  rivalRounds: number;
  lastWinner: Side | null;
  matchWinner: Side | null;
  shake: number;
  message: string;
};
