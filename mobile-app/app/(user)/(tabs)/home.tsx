import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import {
  EmptyNotice,
  HeroCard,
  MetricTile,
  PageScroll,
  SectionCard,
  SectionTitle,
  getTonePalette,
} from '@/components/ui/experience';
import { Fonts } from '@/constants/theme';
import { useAppStore } from '@/lib/app-store';
import {
  formatCinemaFeatures,
  formatCity,
  formatFeaturedNote,
  formatGenres,
  formatLocationName,
  formatMovieDescription,
} from '@/lib/user-display';

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });

export default function HomeTabScreen() {
  const { movies, cinemas, showtimes, bookings, currentUser } = useAppStore();
  const colors = getTonePalette('user');
  const currentUserId = currentUser?.id ?? '';
  const nowShowing = movies.filter((movie) => movie.status === 'now_showing').slice(0, 3);
  const upcoming = movies.find((movie) => movie.status === 'coming_soon');
  const userBookings = bookings.filter((booking) => booking.userId === currentUserId);

  return (
    <PageScroll tone="user">
      <HeroCard
        tone="user"
        eyebrow="Người dùng BeatCinema"
        title="Đặt vé nhanh, rõ sơ đồ ghế, vào rạp đúng những suất đẹp.">
        <View style={styles.heroMetrics}>
          <MetricTile tone="user" value={String(nowShowing.length)} label="Đang chiếu" />
          <MetricTile tone="user" value={String(showtimes.length)} label="Suất chiếu" />
          <MetricTile tone="user" value={String(userBookings.length)} label="Vé của tôi" />
        </View>
      </HeroCard>

      <SectionTitle tone="user" title="Phim đang chiếu" />
      {nowShowing.length === 0 ? (
        <EmptyNotice tone="user" title="Chưa có phim đang chiếu" />
      ) : (
        nowShowing.map((movie) => {
          const firstShowtime = showtimes.find((showtime) => showtime.movieId === movie.id);

          return (
            <SectionCard key={movie.id} tone="user">
              <View style={styles.rowBetween}>
                <View style={styles.flex}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{movie.title}</Text>
                  <Text style={[styles.cardCopy, { color: colors.muted }]}>
                    {formatGenres(movie.genre)} • {movie.duration} phút • {movie.rating}
                  </Text>
                </View>
                <Link href={`/movies/${movie.id}`} style={[styles.link, { color: colors.accent }]}>
                  Chi tiết
                </Link>
              </View>
              <Text style={[styles.cardCopy, { color: colors.muted }]}>
                {formatFeaturedNote(movie.featuredNote)}
              </Text>
              {firstShowtime ? (
                <Text style={[styles.inlineMeta, { color: colors.text }]}>
                  Suất gần nhất {formatTime(firstShowtime.startTime)}
                </Text>
              ) : null}
            </SectionCard>
          );
        })
      )}

      <SectionTitle tone="user" title="Rạp nổi bật" />
      {cinemas.map((cinema) => (
        <SectionCard key={cinema.id} tone="user">
          <View style={styles.rowBetween}>
            <View style={styles.flex}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {cinema.brand} {formatLocationName(cinema.name)}
              </Text>
              <Text style={[styles.cardCopy, { color: colors.muted }]}>
                {formatCity(cinema.city)} • {formatCinemaFeatures(cinema.features)}
              </Text>
            </View>
            <Link href={`/cinemas/${cinema.id}`} style={[styles.link, { color: colors.accent }]}>
              Lịch rạp
            </Link>
          </View>
        </SectionCard>
      ))}

      {upcoming ? (
        <>
          <SectionTitle
            tone="user"
            title="Sắp chiếu"
          />
          <SectionCard tone="user">
            <Text style={[styles.cardTitle, { color: colors.text }]}>{upcoming.title}</Text>
            <Text style={[styles.cardCopy, { color: colors.muted }]}>
              {formatMovieDescription(upcoming.description)}
            </Text>
            <Text style={[styles.inlineMeta, { color: colors.text }]}>
              Khởi chiếu {new Date(upcoming.releaseDate).toLocaleDateString('vi-VN')}
            </Text>
          </SectionCard>
        </>
      ) : null}
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  heroMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  flex: {
    flex: 1,
    gap: 4,
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
