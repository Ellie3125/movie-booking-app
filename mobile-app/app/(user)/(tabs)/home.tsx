import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { MoviePoster } from '@/components/ui/movie-poster';
import { Fonts } from '@/constants/theme';
import { type Movie, useAppStore } from '@/lib/app-store';
import { API_BASE_URL } from '@/lib/backend-api';
import { normalizePosterUrl } from '@/lib/image-url';
import { formatGenres, formatLanguage } from '@/lib/user-display';

const BANNER_HEIGHT = 188;
const FEATURED_CARD_WIDTH = 246;
const FEATURED_CARD_GAP = 18;

const statusAccent: Record<Movie['status'], string> = {
  now_showing: 'Now Showing',
  coming_soon: 'Coming Soon',
  ended: 'Archived',
};

const getPosterUrl = (movie: Movie) =>
  normalizePosterUrl(movie.poster, { backendApiBaseUrl: API_BASE_URL });

export default function HomeMoviesTabScreen() {
  const { movies } = useAppStore();
  const { width } = useWindowDimensions();
  const bannerRef = useRef<ScrollView | null>(null);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [query, setQuery] = useState('');

  const bannerMovies = useMemo(() => movies.slice(0, 4), [movies]);
  const featuredMovies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return movies;
    }

    return movies.filter((movie) => {
      const searchable = [
        movie.title,
        movie.rating,
        movie.language,
        ...movie.genre,
      ]
        .join(' ')
        .toLowerCase();

      return searchable.includes(normalizedQuery);
    });
  }, [movies, query]);

  useEffect(() => {
    if (bannerMovies.length <= 1) {
      return undefined;
    }

    const interval = setInterval(() => {
      setBannerIndex((current) => {
        const next = (current + 1) % bannerMovies.length;
        bannerRef.current?.scrollTo({ y: next * BANNER_HEIGHT, animated: true });
        return next;
      });
    }, 3600);

    return () => clearInterval(interval);
  }, [bannerMovies.length]);

  const featuredInset = Math.max(20, (width - FEATURED_CARD_WIDTH) / 2);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <MaterialCommunityIcons name="magnify" size={32} color="#00356F" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search movies..."
              placeholderTextColor="#5C6B76"
              style={styles.searchInput}
              returnKeyType="search"
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voice search"
            style={({ pressed }) => [
              styles.voiceButton,
              pressed ? styles.voiceButtonPressed : null,
            ]}>
            <MaterialCommunityIcons name="microphone-outline" size={32} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.bannerFrame}>
          <ScrollView
            ref={bannerRef}
            pagingEnabled
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const nextIndex = Math.round(
                event.nativeEvent.contentOffset.y / BANNER_HEIGHT,
              );
              setBannerIndex(nextIndex);
            }}>
            {bannerMovies.map((movie) => {
              const posterUrl = getPosterUrl(movie);

              return (
                <Pressable
                  key={movie.id}
                  onPress={() => router.push(`/movies/${movie.id}`)}
                  style={styles.bannerSlide}>
                  {posterUrl ? (
                    <Image
                      source={{ uri: posterUrl }}
                      contentFit="cover"
                      transition={220}
                      style={styles.bannerImage}
                    />
                  ) : null}
                  <View style={styles.bannerScrim} />
                  <View style={styles.bannerGlow} />
                  <View style={styles.bannerCopy}>
                    <Text style={styles.bannerBadge}>{statusAccent[movie.status]}</Text>
                    <Text numberOfLines={2} style={styles.bannerTitle}>
                      {movie.title}
                    </Text>
                    <Text numberOfLines={1} style={styles.bannerSubtitle}>
                      {movie.featuredNote || 'Exclusive previews this week'}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.verticalDots}>
            {bannerMovies.map((movie, index) => (
              <View
                key={movie.id}
                style={[
                  styles.verticalDot,
                  index === bannerIndex ? styles.verticalDotActive : null,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Movies</Text>
          <Text style={styles.sectionMeta}>
            {featuredMovies.length} phim từ dữ liệu URL hiện có
          </Text>
        </View>

        {featuredMovies.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Không tìm thấy phim</Text>
            <Text style={styles.emptyText}>Thử tìm theo tên phim, thể loại hoặc nhãn tuổi.</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={FEATURED_CARD_WIDTH + FEATURED_CARD_GAP}
            contentContainerStyle={[
              styles.featuredRail,
              { paddingLeft: featuredInset, paddingRight: featuredInset },
            ]}>
            {featuredMovies.map((movie) => (
              <Pressable
                key={movie.id}
                onPress={() => router.push(`/movies/${movie.id}`)}
                style={({ pressed }) => [
                  styles.featuredCard,
                  pressed ? styles.featuredCardPressed : null,
                ]}>
                <View style={styles.posterShell}>
                  <MoviePoster
                    uri={movie.poster}
                    title={movie.title}
                    tone="admin"
                    width={FEATURED_CARD_WIDTH}
                    height={356}
                    borderRadius={24}
                  />
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>{movie.rating}</Text>
                  </View>
                </View>
                <View style={styles.featuredInfo}>
                  <Text numberOfLines={1} style={styles.movieTitle}>
                    {movie.title}
                  </Text>
                  <Text numberOfLines={1} style={styles.movieMeta}>
                    {formatGenres(movie.genre)} • {formatLanguage(movie.language)}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7FAFD',
  },
  content: {
    paddingTop: 18,
    paddingBottom: 112,
    gap: 28,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
  },
  searchBox: {
    flex: 1,
    minHeight: 66,
    borderRadius: 999,
    backgroundColor: '#D9E7F1',
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  searchInput: {
    flex: 1,
    minHeight: 52,
    color: '#001E42',
    fontSize: 18,
    fontFamily: Fonts.sansMedium,
  },
  voiceButton: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#003D7D',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#003D7D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 6,
  },
  voiceButtonPressed: {
    transform: [{ scale: 0.96 }],
  },
  bannerFrame: {
    height: BANNER_HEIGHT,
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#CBD6DE',
    shadowColor: '#253C52',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 3,
  },
  bannerSlide: {
    height: BANNER_HEIGHT,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'flex-end',
  },
  bannerImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.78,
  },
  bannerScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 35, 72, 0.42)',
  },
  bannerGlow: {
    position: 'absolute',
    width: 170,
    height: 260,
    right: 34,
    top: -64,
    borderRadius: 120,
    backgroundColor: 'rgba(195, 244, 255, 0.24)',
    transform: [{ rotate: '28deg' }],
  },
  bannerCopy: {
    paddingHorizontal: 28,
    paddingBottom: 28,
    gap: 10,
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 6,
    color: '#FFFFFF',
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    fontFamily: Fonts.sansBold,
  },
  bannerTitle: {
    maxWidth: 300,
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 34,
    fontFamily: Fonts.rounded,
  },
  bannerSubtitle: {
    maxWidth: 290,
    color: 'rgba(255,255,255,0.88)',
    fontSize: 16,
    fontFamily: Fonts.sansMedium,
  },
  verticalDots: {
    position: 'absolute',
    right: 18,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  verticalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.52)',
  },
  verticalDotActive: {
    width: 9,
    height: 36,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    gap: 4,
  },
  sectionTitle: {
    color: '#001E42',
    fontSize: 30,
    lineHeight: 36,
    fontFamily: Fonts.rounded,
  },
  sectionMeta: {
    color: '#6D7D8A',
    fontSize: 13,
    fontFamily: Fonts.sansMedium,
  },
  featuredRail: {
    gap: FEATURED_CARD_GAP,
    alignItems: 'flex-start',
    paddingBottom: 22,
  },
  featuredCard: {
    width: FEATURED_CARD_WIDTH,
    gap: 14,
  },
  featuredCardPressed: {
    transform: [{ scale: 0.98 }],
  },
  posterShell: {
    width: FEATURED_CARD_WIDTH,
    height: 356,
    borderRadius: 24,
    shadowColor: '#002B5C',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 5,
  },
  ratingBadge: {
    position: 'absolute',
    top: 16,
    right: 14,
    borderRadius: 10,
    backgroundColor: '#F7FAFD',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  ratingText: {
    color: '#001E42',
    fontSize: 13,
    fontFamily: Fonts.sansBold,
  },
  featuredInfo: {
    gap: 4,
  },
  movieTitle: {
    color: '#001E42',
    fontSize: 17,
    lineHeight: 22,
    fontFamily: Fonts.sansBold,
  },
  movieMeta: {
    color: '#7D8B97',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Fonts.sansMedium,
  },
  emptyState: {
    marginHorizontal: 20,
    borderRadius: 22,
    backgroundColor: '#E9F1F7',
    padding: 22,
    gap: 8,
  },
  emptyTitle: {
    color: '#001E42',
    fontSize: 18,
    fontFamily: Fonts.sansBold,
  },
  emptyText: {
    color: '#647584',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.sans,
  },
});
