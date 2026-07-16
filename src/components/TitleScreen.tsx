import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TitleCanvas } from '../three/GameCanvas';
import { colors, fonts } from '../theme';

type Props = {
  onPlay: () => void;
};

export function TitleScreen({ onPlay }: Props) {
  const insets = useSafeAreaInsets();
  const pulse = useSharedValue(1);
  const bob = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    bob.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
        withTiming(4, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [pulse, bob]);

  const ctaStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));
  const brandStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bob.value }],
  }));

  return (
    <View style={styles.root}>
      <View style={styles.canvasWrap}>
        <TitleCanvas />
      </View>

      <View
        pointerEvents="box-none"
        style={[
          styles.overlay,
          {
            paddingTop: Math.max(44, insets.top + 16),
            paddingBottom: Math.max(28, insets.bottom + 16),
          },
        ]}
      >
        <Animated.View style={[styles.brandBlock, brandStyle]}>
          <Text style={styles.brand}>Frog but(t)</Text>
          <Text style={styles.brandStrong}>strong</Text>
          <Text style={styles.tagline}>
            The cutest sumo in the desert.{'\n'}
            Butts only. Feelings optional.
          </Text>
        </Animated.View>

        <View style={styles.spacer} />

        <Animated.View style={ctaStyle}>
          <Pressable
            onPress={onPlay}
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
          >
            <Text style={styles.ctaText}>wiggle into battle</Text>
          </Pressable>
        </Animated.View>

        <Text style={styles.credits}>
          best of 3 · cheek-to-cheek · iOS & Android
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.skyCute,
  },
  canvasWrap: {
    ...StyleSheet.absoluteFill,
  },
  overlay: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
  },
  brandBlock: {
    alignItems: 'center',
    gap: 2,
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: 44,
    color: colors.cream,
    letterSpacing: -0.5,
    textAlign: 'center',
    textShadowColor: 'rgba(58,46,40,0.45)',
    textShadowRadius: 10,
  },
  brandStrong: {
    fontFamily: fonts.display,
    fontSize: 56,
    color: colors.blush,
    marginTop: -6,
    textAlign: 'center',
    textShadowColor: 'rgba(58,46,40,0.35)',
    textShadowRadius: 8,
  },
  tagline: {
    marginTop: 10,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.cream,
    textAlign: 'center',
    maxWidth: 300,
    textShadowColor: 'rgba(58,46,40,0.4)',
    textShadowRadius: 6,
  },
  spacer: {
    flex: 1,
  },
  cta: {
    alignSelf: 'center',
    backgroundColor: colors.blush,
    paddingHorizontal: 34,
    paddingVertical: 16,
    borderRadius: 22,
    borderBottomWidth: 5,
    borderBottomColor: '#E0688A',
  },
  ctaPressed: {
    transform: [{ translateY: 3 }],
    borderBottomWidth: 2,
  },
  ctaText: {
    fontFamily: fonts.bodyBold,
    fontSize: 20,
    color: colors.cream,
  },
  credits: {
    marginTop: 16,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
    opacity: 0.55,
    textAlign: 'center',
  },
});
