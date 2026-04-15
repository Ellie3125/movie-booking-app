import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
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
        title="Kho phim dành cho người dùng theo đúng luồng đặt vé."
        description="Tab này tập trung vào việc khám phá phim, trạng thái đang chiếu, sắp chiếu và đường dẫn sang lịch rạp.">
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
        description="Mỗi thẻ phim đều có thể đi thẳng vào chi tiết và luồng đặt vé."
      />
      {filteredMovies.length === 0 ? (
        <EmptyNotice
          tone="user"
          title="Không có phim nào trong bộ lọc này"
          description="Thử đổi trạng thái hoặc thêm phim từ khu quản trị."
        />
      ) : (
        filteredMovies.map((movie) => {
          const totalShowtimes = showtimes.filter((showtime) => showtime.movieId === movie.id).length;

          return (
            <SectionCard key={movie.id} tone="user">
              <Text style={[styles.cardTitle, { color: colors.text }]}>{movie.title}</Text>
              <Text style={[styles.cardCopy, { color: colors.muted }]}>
                {formatGenres(movie.genre)} • {formatLanguage(movie.language)} •{' '}
                {movie.duration} phút
              </Text>
              <Text style={[styles.cardCopy, { color: colors.muted }]}>
                {formatMovieDescription(movie.description)}
              </Text>
              <View style={styles.rowBetween}>
                <Text style={[styles.inlineMeta, { color: colors.text }]}>
                  {totalShowtimes} suất đang mở
                </Text>
                <Link href={`/movies/${movie.id}`} style={[styles.link, { color: colors.accent }]}>
                  Xem chi tiết
                </Link>
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
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: Fonts.sansBold,
  },
  cardCopy: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.sans,
  },
  inlineMeta: {
    fontSize: 13,
    fontFamily: Fonts.sansBold,
  },
  link: {
    fontSize: 14,
    fontFamily: Fonts.sansBold,
  },
});
