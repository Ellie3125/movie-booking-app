import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';

type Tone = 'admin' | 'user';

const tonePalette = {
  admin: {
    fallback: '#13233D',
    text: '#EFF6FF',
    muted: '#9FB0D0',
    border: 'rgba(159, 176, 208, 0.16)',
  },
  user: {
    fallback: '#FFE7BE',
    text: '#4B2E22',
    muted: '#8C6856',
    border: 'rgba(140, 104, 86, 0.16)',
  },
} as const;

type Props = {
  uri?: string | null;
  title: string;
  tone: Tone;
  width?: number;
  height?: number;
  borderRadius?: number;
};

export function MoviePoster({
  uri,
  title,
  tone,
  width = 108,
  height = 156,
  borderRadius = 18,
}: Props) {
  const colors = tonePalette[tone];
  const hasPoster = Boolean(uri?.trim());

  return (
    <View
      style={[
        styles.frame,
        {
          width,
          height,
          borderRadius,
          borderColor: colors.border,
          backgroundColor: colors.fallback,
        },
      ]}>
      {hasPoster ? (
        <Image
          source={{ uri: uri?.trim() }}
          contentFit="cover"
          transition={180}
          style={StyleSheet.absoluteFillObject}
        />
      ) : null}
      <View
        pointerEvents="none"
        style={[
          styles.overlay,
          {
            borderRadius,
            backgroundColor: hasPoster ? 'rgba(17, 24, 39, 0.18)' : 'transparent',
          },
        ]}
      />
      {!hasPoster ? (
        <View style={styles.fallbackCopy}>
          <Text numberOfLines={3} style={[styles.fallbackTitle, { color: colors.text }]}>
            {title}
          </Text>
          <Text style={[styles.fallbackMeta, { color: colors.muted }]}>Poster</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  fallbackCopy: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    gap: 6,
  },
  fallbackTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: Fonts.sansBold,
    textAlign: 'center',
  },
  fallbackMeta: {
    fontSize: 11,
    fontFamily: Fonts.sansBold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
