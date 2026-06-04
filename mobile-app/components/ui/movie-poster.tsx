import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AzureColors, Fonts } from '@/constants/theme';
import { API_BASE_URL } from '@/lib/backend-api';
import { normalizePosterUrl } from '@/lib/image-url';

type Tone = 'admin' | 'user';

const tonePalette = {
  admin: {
    fallback: '#13233D',
    text: '#EFF6FF',
    muted: '#9FB0D0',
    border: 'rgba(159, 176, 208, 0.16)',
  },
  user: {
    fallback: AzureColors.primaryLight,
    text: AzureColors.textPrimary,
    muted: AzureColors.textSecondary,
    border: AzureColors.border,
  },
} as const;

const fallbackPosterImage = require('../../assets/images/popcorn-logo-cutout.png');

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
  const imageUrl = normalizePosterUrl(uri, { backendApiBaseUrl: API_BASE_URL });
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'loaded' | 'error'>(
    imageUrl ? 'loading' : 'idle',
  );

  useEffect(() => {
    setLoadState(imageUrl ? 'loading' : 'idle');
  }, [imageUrl]);

  const showFallback = !imageUrl || loadState === 'error';
  const showLoader = Boolean(imageUrl && loadState === 'loading');

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
      <Image
        source={showFallback ? fallbackPosterImage : { uri: imageUrl }}
        contentFit={showFallback ? 'contain' : 'cover'}
        transition={180}
        style={[StyleSheet.absoluteFillObject, showFallback ? styles.fallbackImage : null]}
        onLoadStart={imageUrl ? () => setLoadState('loading') : undefined}
        onLoad={imageUrl ? () => setLoadState('loaded') : undefined}
        onError={
          imageUrl
            ? () => setLoadState('error')
            : undefined
        }
      />
      {showLoader ? (
        <View style={[styles.loadingState, { backgroundColor: colors.fallback }]}>
          <ActivityIndicator color={colors.text} size="small" />
        </View>
      ) : null}
      <View
        pointerEvents="none"
        style={[
          styles.overlay,
          {
            borderRadius,
            backgroundColor: showFallback ? 'rgba(255, 255, 255, 0.12)' : 'rgba(17, 24, 39, 0.18)',
          },
        ]}
      />
      {showFallback ? (
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
  fallbackImage: {
    opacity: 0.34,
    margin: 18,
  },
  loadingState: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
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
