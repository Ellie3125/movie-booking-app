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
import { useAppStore } from '@/lib/app-store';

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });

export default function HomeTabScreen() {
  const { movies, cinemas, showtimes, bookings, currentUser } = useAppStore();
  const colors = getTonePalette('user');
  const nowShowing = movies.filter((movie) => movie.status === 'now_showing').slice(0, 3);
  const upcoming = movies.find((movie) => movie.status === 'coming_soon');
  const userBookings = bookings.filter((booking) => booking.userId === currentUser.id);

  return (
    <PageScroll tone="user">
      <HeroCard
        tone="user"
        eyebrow="BeatCinema users"
        title="Dat ve nhanh, ro seat map, vao rap dung nhung suat dep."
        description="Trang user duoc tach rieng khoi admin, co day du home, movie detail, cinema detail, chon ghe, checkout va danh sach ve da mua.">
        <View style={styles.heroMetrics}>
          <MetricTile
            tone="user"
            value={String(nowShowing.length)}
            label="Now showing"
            helper="Phim dang mo ban trong app."
          />
          <MetricTile
            tone="user"
            value={String(showtimes.length)}
            label="Showtimes"
            helper="Suat chieu dang duoc mo tren mock store."
          />
          <MetricTile
            tone="user"
            value={String(userBookings.length)}
            label="My bookings"
            helper="Ve cua user hien tai sau moi lan thanh toan."
          />
        </View>
      </HeroCard>

      <SectionTitle
        tone="user"
        title="Now Showing"
        description="Danh sach phim dang mo ban ve va co the vao flow dat cho ngay lap tuc."
      />
      {nowShowing.length === 0 ? (
        <EmptyNotice
          tone="user"
          title="Chua co phim dang chieu"
          description="Them phim o khu admin se hien ngay tai day."
        />
      ) : (
        nowShowing.map((movie) => {
          const firstShowtime = showtimes.find((showtime) => showtime.movieId === movie.id);

          return (
            <SectionCard key={movie.id} tone="user">
              <View style={styles.rowBetween}>
                <View style={styles.flex}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{movie.title}</Text>
                  <Text style={[styles.cardCopy, { color: colors.muted }]}>
                    {movie.genre.join(' • ')} • {movie.duration} min • {movie.rating}
                  </Text>
                </View>
                <Link href={`/movies/${movie.id}`} style={[styles.link, { color: colors.accent }]}>
                  Chi tiet
                </Link>
              </View>
              <Text style={[styles.cardCopy, { color: colors.muted }]}>{movie.featuredNote}</Text>
              {firstShowtime ? (
                <Text style={[styles.inlineMeta, { color: colors.text }]}>
                  Suat gan nhat {formatTime(firstShowtime.startTime)}
                </Text>
              ) : null}
            </SectionCard>
          );
        })
      )}

      <SectionTitle
        tone="user"
        title="Featured Cinemas"
        description="Nhanh hon cho user theo phong cach app dat ve: chon rap, xem lich, vao man hinh ghe."
      />
      {cinemas.map((cinema) => (
        <SectionCard key={cinema.id} tone="user">
          <View style={styles.rowBetween}>
            <View style={styles.flex}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {cinema.brand} {cinema.name}
              </Text>
              <Text style={[styles.cardCopy, { color: colors.muted }]}>
                {cinema.city} • {cinema.features.join(' • ')}
              </Text>
            </View>
            <Link href={`/cinemas/${cinema.id}`} style={[styles.link, { color: colors.accent }]}>
              Lich rap
            </Link>
          </View>
        </SectionCard>
      ))}

      {upcoming ? (
        <>
          <SectionTitle
            tone="user"
            title="Coming Soon"
            description="Trang user cung co kho phim sap chieu de user theo doi."
          />
          <SectionCard tone="user">
            <Text style={[styles.cardTitle, { color: colors.text }]}>{upcoming.title}</Text>
            <Text style={[styles.cardCopy, { color: colors.muted }]}>{upcoming.description}</Text>
            <Text style={[styles.inlineMeta, { color: colors.text }]}>
              Release date {new Date(upcoming.releaseDate).toLocaleDateString('vi-VN')}
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
