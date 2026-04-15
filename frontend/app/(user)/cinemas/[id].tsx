import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import {
  EmptyNotice,
  HeroCard,
  PageScroll,
  SectionCard,
  SectionTitle,
  getTonePalette,
} from '@/components/ui/experience';
import { useAppStore } from '@/lib/app-store';

const formatSession = (value: string) =>
  new Date(value).toLocaleString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function CinemaDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { cinemas, rooms, showtimes, movies } = useAppStore();
  const colors = getTonePalette('user');
  const cinema = cinemas.find((item) => item.id === id);
  const cinemaShowtimes = showtimes.filter((item) => item.cinemaId === cinema?.id);

  return (
    <PageScroll tone="user">
      <Stack.Screen options={{ title: cinema?.name ?? 'Cinema Details' }} />
      {!cinema ? (
        <EmptyNotice
          tone="user"
          title="Khong tim thay rap"
          description="Duong dan cinema detail dang tro toi rap khong ton tai."
        />
      ) : (
        <>
          <HeroCard
            tone="user"
            eyebrow="Cinema detail"
            title={`${cinema.brand} ${cinema.name}`}
            description={`${cinema.address}. Hotline ${cinema.hotline}.`}
          />

          <SectionCard tone="user">
            <Text style={[styles.cardTitle, { color: colors.text }]}>Tien ich</Text>
            <Text style={[styles.cardCopy, { color: colors.muted }]}>
              {cinema.features.join(' • ')}
            </Text>
            <Text style={[styles.cardCopy, { color: colors.muted }]}>
              Rooms {rooms.filter((room) => room.cinemaId === cinema.id).length}
            </Text>
          </SectionCard>

          <SectionTitle
            tone="user"
            title="Lich chieu tai rap"
            description="Flow user co the bat dau tu rap roi chon phim va ghe."
          />
          {cinemaShowtimes.length === 0 ? (
            <EmptyNotice
              tone="user"
              title="Rap nay chua co suat"
              description="Them showtime vao store hoac backend de lich chieu hien ra."
            />
          ) : (
            cinemaShowtimes.map((showtime) => {
              const movie = movies.find((item) => item.id === showtime.movieId);
              const room = rooms.find((item) => item.id === showtime.roomId);

              return (
                <SectionCard key={showtime.id} tone="user">
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    {movie?.title ?? 'Unknown movie'}
                  </Text>
                  <Text style={[styles.cardCopy, { color: colors.muted }]}>
                    {room?.name} • {showtime.format} • {formatSession(showtime.startTime)}
                  </Text>
                  <View style={styles.rowBetween}>
                    {movie ? (
                      <Link href={`/movies/${movie.id}`} style={[styles.link, { color: colors.accent }]}>
                        Chi tiet phim
                      </Link>
                    ) : <View />}
                    <Link
                      href={{
                        pathname: '/booking/seats',
                        params: { showtimeId: showtime.id },
                      }}
                      style={[styles.link, { color: colors.accent }]}>
                      Chon ghe
                    </Link>
                  </View>
                </SectionCard>
              );
            })
          )}
        </>
      )}
    </PageScroll>
  );
}

const styles = StyleSheet.create({
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
  link: {
    fontSize: 14,
    fontWeight: '800',
  },
});
