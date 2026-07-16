import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors, fonts } from '../theme';

type Props = {
  onChargeStart: () => void;
  onChargeAim: (x: number, y: number) => void;
  onChargeRelease: (x: number, y: number) => void;
  charge: number;
  disabled?: boolean;
  superReady?: boolean;
};

export function ChargePad({
  onChargeStart,
  onChargeAim,
  onChargeRelease,
  charge,
  disabled,
  superReady,
}: Props) {
  const knobX = useSharedValue(0);
  const knobY = useSharedValue(0);
  const active = useSharedValue(0);

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(!disabled)
        .onBegin(() => {
          active.value = 1;
          knobX.value = 0;
          knobY.value = 0;
          runOnJS(onChargeStart)();
        })
        .onUpdate((e) => {
          const max = 54;
          const len = Math.hypot(e.translationX, e.translationY);
          const scale = len > max ? max / len : 1;
          const x = e.translationX * scale;
          const y = e.translationY * scale;
          knobX.value = x;
          knobY.value = y;
          runOnJS(onChargeAim)(x, y);
        })
        .onFinalize((e) => {
          runOnJS(onChargeRelease)(e.translationX, e.translationY);
          knobX.value = withSpring(0);
          knobY.value = withSpring(0);
          active.value = 0;
        }),
    [disabled, onChargeAim, onChargeRelease, onChargeStart, active, knobX, knobY],
  );

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: knobX.value }, { translateY: knobY.value }],
    opacity: 0.6 + active.value * 0.4,
  }));

  const ringColor = superReady
    ? colors.heart
    : charge > 0.75
      ? colors.heart
      : charge > 0.35
        ? colors.blush
        : colors.cream;

  return (
    <View style={styles.wrap}>
      <Text style={styles.hint}>
        {disabled
          ? 'wait for it…'
          : superReady && charge > 0.5
            ? 'RELEASE — ULTRA RUMP'
            : superReady
              ? 'SUPER READY — charge to unleash'
              : charge > 0.7
                ? 'MAXIMUM CUTE POWER'
                : 'hold · aim the booty · release to boop'}
      </Text>
      <GestureDetector gesture={gesture}>
        <View style={styles.pad}>
          <View
            style={[
              styles.ring,
              {
                borderColor: ringColor,
                transform: [{ scale: 1 + charge * 0.14 }],
              },
            ]}
          />
          <View style={styles.cheekPair}>
            <View style={styles.cheek} />
            <View style={styles.cheek} />
          </View>
          <Animated.View style={[styles.knob, knobStyle]} />
          <View style={styles.chargeTrack}>
            <View
              style={[
                styles.chargeFill,
                {
                  width: `${Math.round(charge * 100)}%`,
                  backgroundColor: charge > 0.7 ? colors.heart : colors.blush,
                },
              ]}
            />
          </View>
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 10,
  },
  hint: {
    fontFamily: fonts.bodyBold,
    color: colors.ink,
    opacity: 0.7,
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: 'rgba(255,248,240,0.75)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    overflow: 'hidden',
  },
  pad: {
    width: 172,
    height: 172,
    borderRadius: 86,
    backgroundColor: 'rgba(255,248,240,0.82)',
    borderWidth: 3,
    borderColor: colors.blushSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 118,
    height: 118,
    borderRadius: 59,
    borderWidth: 3,
  },
  padEmoji: {
    fontSize: 28,
    opacity: 0.85,
  },
  cheekPair: {
    flexDirection: 'row',
    gap: 6,
    opacity: 0.7,
  },
  cheek: {
    width: 18,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.blushSoft,
  },
  knob: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.blush,
    borderWidth: 3,
    borderColor: colors.cream,
  },
  chargeTrack: {
    position: 'absolute',
    bottom: 16,
    width: 104,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(58,46,40,0.12)',
    overflow: 'hidden',
  },
  chargeFill: {
    height: '100%',
    backgroundColor: colors.blush,
  },
});
