import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { MoviePoster } from '@/components/ui/movie-poster';
import {
  ActionButton,
  Chip,
  EmptyNotice,
  HeroCard,
  PageScroll,
  SectionCard,
  SectionTitle,
  getTonePalette,
} from '@/components/ui/experience';
import { Fonts } from '@/constants/theme';
import { type MovieStatus, useAppStore } from '@/lib/app-store';
import {
  formatFormats,
  formatGenres,
  formatLanguage,
  formatMovieDescription,
} from '@/lib/user-display';

const filters: { label: string; value: MovieStatus | 'all' }[] = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Đang chiếu', value: 'now_showing' },
  { label: 'Sắp chiếu', value: 'coming_soon' },
  { label: 'Đã đóng', value: 'ended' },
];

const movieStatusLabels: Record<MovieStatus, string> = {
  now_showing: 'Đang mở bán',
  coming_soon: 'Sắp chiếu',
  ended: 'Đã đóng',
};

export default function MoviesTabScreen() {
  const { movies, showtimes } = useAppStore();
  const colors = getTonePalette('user');
  const [filter, setFilter] = useState<MovieStatus | 'all'>('all');

  const filteredMovies =
    filter === 'all' ? movies : movies.filter((movie) => movie.status === filter);

  return (
    <PageScroll tone="user">
      <HeroCard
        tone="user"
        eyebrow="Khám phá phim"
        title="Chọn phim bằng poster, thông tin gọn và đường vào đặt vé rõ ràng."
        description="Màu chủ đạo được chuyển sang tone kem cam sáng. Danh sách phim giờ hiển thị poster nổi bật, meta rõ ràng và CTA đặt vé trực tiếp.">
        <View style={styles.chipRow}>
          {filters.map((item) => (
            <Chip
              key={item.value}
              tone="user"
              label={item.label}
              active={filter === item.value}
              onPress={() => setFilter(item.value)}
            />
          ))}
        </View>
      </HeroCard>

      <SectionTitle
        tone="user"
        title="Danh sách phim"
        description="Poster, định dạng, số suất đang mở và nút đặt vé được gom chung trong từng card để chọn phim nhanh hơn."
      />
      {filteredMovies.length === 0 ? (
        <EmptyNotice
          tone="user"
          title="Không có phim nào trong bộ lọc này"
          description="Hãy đổi bộ lọc để xem thêm phim đang chiếu, sắp chiếu hoặc đã kết thúc."
        />
      ) : (
        filteredMovies.map((movie) => {
          const movieShowtimes = showtimes.filter((showtime) => showtime.movieId === movie.id);
          const totalShowtimes = movieShowtimes.length;
          const lowestPrice = movieShowtimes.length
            ? Math.min(...movieShowtimes.map((showtime) => showtime.basePrice))
            : null;

          return (
            <SectionCard key={movie.id} tone="user" style={styles.movieCard}>
              <MoviePoster
                uri={movie.poster}
                title={movie.title}
                tone="user"
                width={112}
                height={162}
                borderRadius={20}
              />

              <View style={styles.movieBody}>
                <View style={styles.metaRail}>
                  <Chip tone="user" label={movieStatusLabels[movie.status]} active />
                  <Chip tone="user" label={`${movie.rating} • ${movie.duration} phút`} />
                </View>

                <View style={styles.copyBlock}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{movie.title}</Text>
                  <Text style={[styles.cardMeta, { color: colors.muted }]}>
                    {formatGenres(movie.genre)} • {formatLanguage(movie.language)}
                  </Text>
                  <Text style={[styles.cardMeta, { color: colors.muted }]}>
                    {formatFormats(movie.formats)}
                  </Text>
                  <Text numberOfLines={3} style={[styles.cardDescription, { color: colors.muted }]}>
                    {formatMovieDescription(movie.description)}
                  </Text>
                </View>

                <View style={styles.cardFooter}>
                  <View style={styles.priceBlock}>
                    <Text style={[styles.inlineMeta, { color: colors.text }]}>
                      {totalShowtimes} suất đang mở
                    </Text>
                    <Text style={[styles.priceText, { color: colors.muted }]}>
                      {lowestPrice
                        ? `Từ ${lowestPrice.toLocaleString('vi-VN')}đ`
                        : 'Đang cập nhật giá'}
                    </Text>
                  </View>
                  <ActionButton
                    tone="user"
                    label="Đặt vé"
                    onPress={() => router.push(`/movies/${movie.id}`)}
                    style={styles.ctaButton}
                  />
                </View>
              </View>
            </SectionCard>
          );
        })
      )}
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  movieCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 14,
  },
  movieBody: {
    flex: 1,
    gap: 12,
  },
  metaRail: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  copyBlock: {
    gap: 4,
  },
  cardTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: Fonts.rounded,
  },
  cardMeta: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: Fonts.sans,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.sans,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  priceBlock: {
    flex: 1,
    gap: 2,
  },
  inlineMeta: {
    fontSize: 14,
    fontFamily: Fonts.sansBold,
  },
  priceText: {
    fontSize: 13,
    fontFamily: Fonts.sans,
  },
  ctaButton: {
    minWidth: 108,
  },
});
