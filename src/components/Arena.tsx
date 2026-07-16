import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient,
  RadialGradient,
  Stop,
  Path,
} from 'react-native-svg';
import { colors } from '../theme';

type Props = {
  size: number;
  ringRadius: number;
};

function ArenaComponent({ size, ringRadius }: Props) {
  const c = size / 2;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id="dirt" cx="50%" cy="48%" r="55%">
            <Stop offset="0%" stopColor={colors.sand} />
            <Stop offset="55%" stopColor={colors.clay} />
            <Stop offset="100%" stopColor={colors.clayDark} />
          </RadialGradient>
          <LinearGradient id="mossEdge" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.moss} stopOpacity={0.35} />
            <Stop offset="100%" stopColor={colors.canopy} stopOpacity={0.15} />
          </LinearGradient>
        </Defs>

        {/* Soft moss around the dohyo */}
        <Circle cx={c} cy={c} r={ringRadius + 28} fill="url(#mossEdge)" />

        {/* Dohyo clay */}
        <Circle cx={c} cy={c} r={ringRadius} fill="url(#dirt)" />

        {/* Sumo straw-ish rim */}
        <Circle
          cx={c}
          cy={c}
          r={ringRadius}
          stroke={colors.ringLine}
          strokeWidth={6}
          fill="none"
          opacity={0.85}
        />
        <Circle
          cx={c}
          cy={c}
          r={ringRadius - 10}
          stroke={colors.clayDark}
          strokeWidth={2}
          fill="none"
          opacity={0.35}
        />

        {/* Starting lines */}
        <Path
          d={`M ${c - 28} ${c - 18} L ${c + 28} ${c - 18}`}
          stroke={colors.ringLine}
          strokeWidth={3}
          opacity={0.55}
          strokeLinecap="round"
        />
        <Path
          d={`M ${c - 28} ${c + 18} L ${c + 28} ${c + 18}`}
          stroke={colors.ringLine}
          strokeWidth={3}
          opacity={0.55}
          strokeLinecap="round"
        />

        {/* Footprint texture */}
        <Ellipse
          cx={c - ringRadius * 0.35}
          cy={c + ringRadius * 0.2}
          rx={18}
          ry={10}
          fill={colors.clayDark}
          opacity={0.12}
        />
        <Ellipse
          cx={c + ringRadius * 0.3}
          cy={c - ringRadius * 0.25}
          rx={16}
          ry={9}
          fill={colors.clayDark}
          opacity={0.1}
        />
      </Svg>
    </View>
  );
}

export const Arena = memo(ArenaComponent);

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
