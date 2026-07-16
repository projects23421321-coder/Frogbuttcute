import React, { useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FIGHTERS, type FighterKit, type FrogId } from '../game/types';
import { Sfx } from '../game/audio';
import { colors, fonts } from '../theme';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const PHOTOS = {
  player: require('../../assets/refs/frog4b.jpg'),
  rival: require('../../assets/refs/frog3b.jpg'),
  rivalAlt: require('../../assets/refs/frog1b.jpg'),
};

type Props = {
  onBack: () => void;
  onConfirm: (player: FrogId, rival: FrogId) => void;
};

export function SelectScreen({ onBack, onConfirm }: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [picked, setPicked] = useState<FrogId>('sandy');
  const cardW = Math.min(118, (width - 56) / 3 - 8);

  const selected = FIGHTERS.find((f) => f.frogId === picked)!;

  const confirm = () => {
    Sfx.uiTap();
    const rivals = FIGHTERS.filter((f) => f.frogId !== picked);
    const rival = rivals[Math.floor(Math.random() * rivals.length)];
    onConfirm(picked, rival.frogId);
  };

  return (
    <LinearGradient
      colors={[colors.skyCute, '#FFD6E0', colors.sand]}
      style={[
        styles.root,
        {
          paddingTop: Math.max(40, insets.top + 12),
          paddingBottom: Math.max(24, insets.bottom + 16),
        },
      ]}
    >
      <Pressable onPress={onBack} hitSlop={12}>
        <Text style={styles.back}>← back</Text>
      </Pressable>

      <Text style={styles.title}>pick your cheeks</Text>
      <Text style={styles.sub}>your booty · their problem</Text>

      <View style={styles.hero}>
        <Image
          source={PHOTOS[selected.photoKey]}
          style={styles.heroImg}
          resizeMode="contain"
        />
        <Text style={styles.name}>{selected.name}</Text>
        <Text style={styles.tag}>{selected.tagline}</Text>
      </View>

      <View style={styles.row}>
        {FIGHTERS.map((f) => (
          <FighterCard
            key={f.frogId}
            kit={f}
            width={cardW}
            selected={picked === f.frogId}
            onPress={() => {
              Sfx.uiTap();
              setPicked(f.frogId);
            }}
          />
        ))}
      </View>

      <Pressable
        onPress={confirm}
        style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
      >
        <Text style={styles.ctaText}>lock in & wiggle</Text>
      </Pressable>
    </LinearGradient>
  );
}

function FighterCard({
  kit,
  width,
  selected,
  onPress,
}: {
  kit: FighterKit;
  width: number;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        { width },
        selected && styles.cardSelected,
      ]}
    >
      <Image
        source={PHOTOS[kit.photoKey]}
        style={styles.cardImg}
        resizeMode="cover"
      />
      <Text style={styles.cardName}>{kit.name}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 20,
  },
  back: {
    fontFamily: fonts.body,
    color: colors.ink,
    opacity: 0.7,
    fontSize: 15,
    marginBottom: 8,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: colors.ink,
    textAlign: 'center',
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: 12,
  },
  hero: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  heroImg: {
    width: 220,
    height: 220,
    borderRadius: 28,
    backgroundColor: colors.cream,
  },
  name: {
    marginTop: 12,
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.blush,
  },
  tag: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
    opacity: 0.65,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 18,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.cream,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingBottom: 8,
  },
  cardSelected: {
    borderColor: colors.blush,
    transform: [{ translateY: -4 }],
  },
  cardImg: {
    width: '100%',
    height: 90,
    backgroundColor: '#eee',
  },
  cardName: {
    marginTop: 6,
    textAlign: 'center',
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.ink,
  },
  cta: {
    alignSelf: 'center',
    backgroundColor: colors.blush,
    paddingHorizontal: 32,
    paddingVertical: 15,
    borderRadius: 20,
    borderBottomWidth: 5,
    borderBottomColor: '#E0688A',
  },
  ctaPressed: {
    transform: [{ translateY: 3 }],
    borderBottomWidth: 2,
  },
  ctaText: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.cream,
  },
});
