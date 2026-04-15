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
import { type MovieStatus, useAppStore } from '@/lib/app-store';

const filters: { label: string; value: MovieStatus | 'all' }[] = [
  { label: 'Tat ca', value: 'all' },
  { label: 'Dang chieu', value: 'now_showing' },
  { label: 'Sap chieu', value: 'coming_soon' },
  { label: 'Da dong', value: 'ended' },
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
        eyebrow="Movie discovery"
        title="Kho phim user-facing theo kieu app dat ve."
        description="Tab nay tap trung phan kham pha phim, tinh trang dang chieu, sap chieu va duong dan vao lich rap.">
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
        title="Danh sach phim"
        description="Moi card co the dan thang vao detail va showtime booking."
      />
      {filteredMovies.length === 0 ? (
        <EmptyNotice
          tone="user"
          title="Khong co phim nao o bo loc nay"
          description="Thu doi trang thai hoac tao them phim tu giao dien admin."
        />
      ) : (
        filteredMovies.map((movie) => {
          const totalShowtimes = showtimes.filter((showtime) => showtime.movieId === movie.id).length;

          return (
            <SectionCard key={movie.id} tone="user">
              <Text style={[styles.cardTitle, { color: colors.text }]}>{movie.title}</Text>
              <Text style={[styles.cardCopy, { color: colors.muted }]}>
                {movie.genre.join(' • ')} • {movie.language} • {movie.duration} min
              </Text>
              <Text style={[styles.cardCopy, { color: colors.muted }]}>{movie.description}</Text>
              <View style={styles.rowBetween}>
                <Text style={[styles.inlineMeta, { color: colors.text }]}>
                  {totalShowtimes} suat dang mo
                </Text>
                <Link href={`/movies/${movie.id}`} style={[styles.link, { color: colors.accent }]}>
                  Xem detail
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
    fontWeight: '800',
  },
  cardCopy: {
    fontSize: 14,
    lineHeight: 20,
  },
  inlineMeta: {
    fontSize: 13,
    fontWeight: '700',
  },
  link: {
    fontSize: 14,
    fontWeight: '800',
  },
});
