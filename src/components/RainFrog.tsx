import React, { memo } from 'react';
import { View } from 'react-native';
import Svg, {
  Circle,
  Ellipse,
  G,
  Path,
  Defs,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import type { FrogPalette } from '../game/types';

type Props = {
  size: number;
  facing: number;
  palette: FrogPalette;
  charge: number;
  squish: number;
  charging: boolean;
  flash?: number;
  gradId?: string;
};

/** Desert rain frog: near-spherical body, warty sand skin, legendary butt cleft. */
function RainFrogComponent({
  size,
  facing,
  palette,
  charge,
  squish,
  charging,
  flash = 0,
  gradId = 'frog',
}: Props) {
  const scaleX = 1 + squish * 0.32;
  const scaleY = 1 - squish * 0.26;
  const chargePulse = charging ? 1 + charge * 0.07 : 1;
  const rotDeg = (facing * 180) / Math.PI;
  const bodyId = `${gradId}-body`;
  const cheekId = `${gradId}-cheek`;

  return (
    <View
      style={{
        width: size,
        height: size,
        transform: [
          { rotate: `${rotDeg}deg` },
          { scaleX: scaleX * chargePulse },
          { scaleY: scaleY / Math.max(0.72, chargePulse * 0.96) },
        ],
      }}
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id={bodyId} cx="42%" cy="42%" r="62%">
            <Stop offset="0%" stopColor={palette.spots} />
            <Stop offset="45%" stopColor={palette.body} />
            <Stop offset="100%" stopColor={palette.bodyDark} />
          </RadialGradient>
          <RadialGradient id={cheekId} cx="55%" cy="40%" r="55%">
            <Stop offset="0%" stopColor={palette.spots} />
            <Stop offset="70%" stopColor={palette.body} />
            <Stop offset="100%" stopColor={palette.bodyDark} />
          </RadialGradient>
        </Defs>

        {/* Tiny stubby feet (desert rain frog limbs) */}
        <Ellipse cx="38" cy="86" rx="9" ry="5.5" fill={palette.bodyDark} />
        <Ellipse cx="58" cy="87" rx="9" ry="5.5" fill={palette.bodyDark} />
        <Ellipse cx="28" cy="80" rx="7" ry="4.5" fill={palette.bodyDark} opacity={0.85} />
        <Ellipse cx="70" cy="80" rx="7" ry="4.5" fill={palette.bodyDark} opacity={0.85} />
        {/* Toes */}
        <Circle cx="32" cy="88" r="1.6" fill={palette.bodyDark} />
        <Circle cx="38" cy="90" r="1.6" fill={palette.bodyDark} />
        <Circle cx="44" cy="88" r="1.5" fill={palette.bodyDark} />
        <Circle cx="54" cy="89" r="1.6" fill={palette.bodyDark} />
        <Circle cx="60" cy="91" r="1.6" fill={palette.bodyDark} />
        <Circle cx="66" cy="88" r="1.5" fill={palette.bodyDark} />

        {/* Main sphere — egg-potato rain frog */}
        <Circle cx="50" cy="48" r="36" fill={`url(#${bodyId})`} />

        {/* Dual butt cheeks (rear is the whole silhouette) */}
        <G>
          <Ellipse cx="38" cy="52" rx="22" ry="26" fill={`url(#${cheekId})`} />
          <Ellipse cx="62" cy="52" rx="22" ry="26" fill={`url(#${cheekId})`} />
          {/* Soft cheek highlight */}
          <Ellipse
            cx="34"
            cy="44"
            rx="10"
            ry="12"
            fill={palette.spots}
            opacity={0.35}
          />
          <Ellipse
            cx="66"
            cy="44"
            rx="10"
            ry="12"
            fill={palette.spots}
            opacity={0.35}
          />
          {/* THE CLEFT — iconic desert rain frog butt */}
          <Path
            d="M50 28 C46 40 45 52 50 72 C55 52 54 40 50 28"
            fill={palette.bodyDark}
            opacity={0.55}
          />
          <Path
            d="M50 30 Q47 50 50 70"
            stroke={palette.bodyDark}
            strokeWidth={2.4}
            fill="none"
            opacity={0.75}
            strokeLinecap="round"
          />
        </G>

        {/* Warty tuberculated spots (sand grit vibe) */}
        <G opacity={0.7}>
          <Circle cx="30" cy="36" r="3.2" fill={palette.spots} />
          <Circle cx="42" cy="30" r="2.6" fill={palette.bodyDark} opacity={0.45} />
          <Circle cx="58" cy="29" r="3" fill={palette.spots} />
          <Circle cx="70" cy="36" r="2.8" fill={palette.bodyDark} opacity={0.4} />
          <Circle cx="26" cy="52" r="2.4" fill={palette.spots} />
          <Circle cx="74" cy="50" r="2.5" fill={palette.spots} />
          <Circle cx="36" cy="62" r="2.2" fill={palette.bodyDark} opacity={0.35} />
          <Circle cx="64" cy="64" r="2.4" fill={palette.bodyDark} opacity={0.35} />
          <Circle cx="48" cy="40" r="1.8" fill={palette.spots} opacity={0.6} />
          <Circle cx="54" cy="58" r="1.6" fill={palette.spots} opacity={0.5} />
          <Circle cx="33" cy="44" r="1.4" fill={palette.bodyDark} opacity={0.3} />
          <Circle cx="67" cy="46" r="1.5" fill={palette.bodyDark} opacity={0.3} />
        </G>

        {/* Tiny face peeking over the top of the ball (head barely exists) */}
        <G>
          <Ellipse cx="50" cy="26" rx="14" ry="10" fill={palette.body} />
          {/* Eyes nearly on top of the head */}
          <Circle cx="44" cy="24" r="5.2" fill={palette.belly} />
          <Circle cx="56" cy="24" r="5.2" fill={palette.belly} />
          <Circle cx="44" cy="24" r="2.8" fill={palette.eye} />
          <Circle cx="56" cy="24" r="2.8" fill={palette.eye} />
          <Circle cx="42.8" cy="23" r="0.9" fill="#fff" />
          <Circle cx="54.8" cy="23" r="0.9" fill="#fff" />
          {/* Little brow bumps */}
          <Ellipse
            cx="44"
            cy="19.5"
            rx="4"
            ry="2"
            fill={palette.bodyDark}
            opacity={0.25}
          />
          <Ellipse
            cx="56"
            cy="19.5"
            rx="4"
            ry="2"
            fill={palette.bodyDark}
            opacity={0.25}
          />
        </G>

        {/* Soft under-curve where legs tuck into body */}
        <Path
          d="M34 74 Q50 82 66 74"
          stroke={palette.bodyDark}
          strokeWidth={1.5}
          fill="none"
          opacity={0.3}
        />

        {/* Charge aura */}
        {charging && charge > 0.08 ? (
          <Circle
            cx="50"
            cy="50"
            r={40 + charge * 8}
            stroke={palette.blush}
            strokeWidth={2 + charge * 2}
            fill="none"
            opacity={0.28 + charge * 0.4}
          />
        ) : null}

        {flash > 0.05 ? (
          <Circle cx="50" cy="48" r="36" fill="#fff" opacity={flash * 0.4} />
        ) : null}
      </Svg>
    </View>
  );
}

export const RainFrog = memo(RainFrogComponent);
