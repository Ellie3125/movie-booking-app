import { Image } from 'expo-image';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { MoviePoster } from '@/components/ui/movie-poster';
import { AzureColors, AzureRadius, AzureShadow, Fonts } from '@/constants/theme';
import type { MovieCardViewModel } from '@/lib/booking-view-models';

import { SectionHeader, StateNotice } from './common';

const bannerHeight = 184;
const featuredCardWidth = 228;
const posterHeight = 330;

const statusLabel: Record<string, string> = {
  now_showing: 'Đang chiếu',
  coming_soon: 'Sắp chiếu',
  ended: 'Đã kết thúc',
};

export function BannerCarousel({
  items,
  onPressMovie,
}: {
  items: MovieCardViewModel[];
  onPressMovie: (movieId: string) => void;
}) {
  const { width } = useWindowDimensions();
  const railRef = useRef<ScrollView | null>(null);
  const [index, setIndex] = useState(0);
  const slideWidth = Math.max(280, width - 40);

  useEffect(() => {
    if (items.length <= 1) {
      return undefined;
    }

    const interval = setInterval(() => {
      setIndex((current) => {
        const next = (current + 1) % items.length;
        railRef.current?.scrollTo({ x: next * slideWidth, animated: true });
        return next;
      });
    }, 4200);

    return () => clearInterval(interval);
  }, [items.length, slideWidth]);

  if (items.length === 0) {
    return (
      <StateNotice
        title="Chưa có banner phim"
        description="Dữ liệu phim sẽ tự hiển thị tại đây khi backend trả về danh sách."
      />
    );
  }

  return (
    <View style={styles.bannerFrame}>
      <ScrollView
        ref={railRef}
        horizontal
        pagingEnabled
        decelerationRate="fast"
        snapToInterval={slideWidth}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          setIndex(Math.round(event.nativeEvent.contentOffset.x / slideWidth));
        }}>
        {items.map((movie) => (
          <Pressable
            key={movie.id}
            accessibilityRole="button"
            accessibilityLabel={`Chọn phim ${movie.title}`}
            onPress={() => onPressMovie(movie.id)}
            style={[styles.bannerSlide, { width: slideWidth }]}>
            {movie.poster ? (
              <Image
                source={{ uri: movie.poster }}
                contentFit="cover"
                transition={200}
                style={StyleSheet.absoluteFill}
              />
            ) : null}
            <View style={styles.bannerScrim} />
            <View style={styles.bannerCopy}>
              <Text style={styles.bannerBadge}>
                {statusLabel[movie.status] ?? movie.status}
              </Text>
              <Text numberOfLines={2} style={styles.bannerTitle}>
                {movie.title}
              </Text>
              <Text numberOfLines={1} style={styles.bannerMeta}>
                {movie.formatBadge ?? '2D'} • {movie.genreLabel || 'Azure Cinema'}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.bannerDots}>
        {items.map((movie, dotIndex) => (
          <View
            key={movie.id}
            style={[styles.bannerDot, dotIndex === index ? styles.bannerDotActive : null]}
          />
        ))}
      </View>
    </View>
  );
}

export function MoviePosterCard({
  movie,
  onPress,
  compact = false,
}: {
  movie: MovieCardViewModel;
  onPress: (movieId: string) => void;
  compact?: boolean;
}) {
  const width = compact ? 148 : featuredCardWidth;
  const height = compact ? 214 : posterHeight;
  const showStatus = statusLabel[movie.status] ?? movie.status;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Chọn phim ${movie.title}`}
      onPress={() => onPress(movie.id)}
      style={({ pressed }) => [
        compact ? styles.compactCard : styles.movieCard,
        { width },
        pressed ? styles.cardPressed : null,
      ]}>
      <View style={[styles.posterShell, { width, height }]}>
        <MoviePoster
          uri={movie.poster}
          title={movie.title}
          tone="user"
          width={width}
          height={height}
          borderRadius={compact ? 18 : 24}
        />
        <View style={styles.ageBadge}>
          <Text style={styles.ageText}>{movie.rating}</Text>
        </View>
        {movie.formatBadge ? (
          <View style={styles.formatBadge}>
            <Text style={styles.formatText}>{movie.formatBadge}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.movieCopy}>
        <Text numberOfLines={1} style={styles.movieTitle}>
          {movie.title}
        </Text>
        <Text numberOfLines={1} style={styles.movieGenre}>
          {movie.genreLabel || 'Đang cập nhật thể loại'}
        </Text>
        <Text numberOfLines={1} style={styles.movieStatus}>
          {showStatus}
        </Text>
      </View>
    </Pressable>
  );
}

export function MovieCarousel({
  title,
  meta,
  movies,
  onPressMovie,
  compact = false,
}: {
  title: string;
  meta?: string;
  movies: MovieCardViewModel[];
  onPressMovie: (movieId: string) => void;
  compact?: boolean;
}) {
  const contentInset = useMemo(() => (compact ? 20 : 18), [compact]);

  return (
    <View style={styles.carouselSection}>
      <SectionHeader title={title} meta={meta} />
      {movies.length === 0 ? (
        <StateNotice title="Không có phim phù hợp" description="Thử đổi từ khóa tìm kiếm." />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.movieRail, { paddingHorizontal: contentInset }]}>
          {movies.map((movie) => (
            <MoviePosterCard
              key={movie.id}
              movie={movie}
              onPress={onPressMovie}
              compact={compact}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bannerFrame: {
    height: bannerHeight,
    borderRadius: AzureRadius.xl,
    overflow: 'hidden',
    backgroundColor: AzureColors.primaryLight,
    ...AzureShadow.card,
  },
  bannerSlide: {
    height: bannerHeight,
    justifyContent: 'flex-end',
  },
  bannerScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: AzureColors.overlay,
  },
  bannerCopy: {
    padding: 22,
    gap: 8,
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    borderRadius: AzureRadius.round,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: Fonts.sansBold,
    textTransform: 'uppercase',
  },
  bannerTitle: {
    maxWidth: 320,
    color: '#FFFFFF',
    fontSize: 25,
    lineHeight: 31,
    fontFamily: Fonts.rounded,
  },
  bannerMeta: {
    maxWidth: 300,
    color: 'rgba(255,255,255,0.88)',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Fonts.sansBold,
  },
  bannerDots: {
    position: 'absolute',
    right: 18,
    bottom: 16,
    flexDirection: 'row',
    gap: 6,
  },
  bannerDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  bannerDotActive: {
    width: 22,
    backgroundColor: '#FFFFFF',
  },
  carouselSection: {
    gap: 14,
  },
  movieRail: {
    gap: 16,
    paddingBottom: 8,
  },
  movieCard: {
    gap: 12,
  },
  compactCard: {
    gap: 10,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.94,
  },
  posterShell: {
    borderRadius: AzureRadius.xl,
    backgroundColor: AzureColors.primaryLight,
    ...AzureShadow.card,
  },
  ageBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 9,
    backgroundColor: AzureColors.danger,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  ageText: {
    color: '#FFFFFF',
    fontSize: 11,
    lineHeight: 14,
    fontFamily: Fonts.sansBold,
  },
  formatBadge: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    borderRadius: AzureRadius.round,
    backgroundColor: AzureColors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  formatText: {
    color: '#FFFFFF',
    fontSize: 11,
    lineHeight: 14,
    fontFamily: Fonts.sansBold,
  },
  movieCopy: {
    gap: 3,
  },
  movieTitle: {
    color: AzureColors.textPrimary,
    fontSize: 16,
    lineHeight: 21,
    fontFamily: Fonts.sansBold,
  },
  movieGenre: {
    color: AzureColors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: Fonts.sansMedium,
  },
  movieStatus: {
    color: AzureColors.secondary,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: Fonts.sansBold,
  },
});
