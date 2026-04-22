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
import { Fonts } from '@/constants/theme';
import { useAppStore } from '@/lib/app-store';
import {
  formatFormats,
  formatLanguage,
  formatLocationName,
  formatMovieDescription,
  formatGenres,
  formatRoomName,
  formatShowtimeFormat,
} from '@/lib/user-display';

const formatSession = (value: string) =>
  new Date(value).toLocaleString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { movies, showtimes, cinemas, rooms } = useAppStore();
  const colors = getTonePalette('user');
  const movie = movies.find((item) => item.id === id);
  const movieShowtimes = showtimes.filter((item) => item.movieId === movie?.id);

  return (
    <PageScroll tone="user">
      <Stack.Screen options={{ title: movie?.title ?? 'Chi tiết phim' }} />
      {!movie ? (
        <EmptyNotice tone="user" title="Không tìm thấy phim" />
      ) : (
        <>
          <HeroCard
            tone="user"
            eyebrow="Chi tiết phim"
            title={movie.title}
            description={formatMovieDescription(movie.description)}
          />

          <SectionCard tone="user">
            <Text style={[styles.cardTitle, { color: colors.text }]}>Thông tin phim</Text>
            <Text style={[styles.cardCopy, { color: colors.muted }]}>
              {formatGenres(movie.genre)} • {movie.duration} phút •{' '}
              {formatLanguage(movie.language)}
            </Text>
            <Text style={[styles.cardCopy, { color: colors.muted }]}>
              Định dạng {formatFormats(movie.formats)} • Xếp loại {movie.rating}
            </Text>
          </SectionCard>

          <SectionTitle tone="user" title="Suất chiếu" />
          {movieShowtimes.length === 0 ? (
            <EmptyNotice tone="user" title="Chưa mở suất chiếu" />
          ) : (
            movieShowtimes.map((showtime) => {
              const cinema = cinemas.find((item) => item.id === showtime.cinemaId);
              const room = rooms.find((item) => item.id === showtime.roomId);

              return (
                <SectionCard key={showtime.id} tone="user">
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    {cinema
                      ? `${cinema.brand} ${formatLocationName(cinema.name)}`
                      : 'Rạp đang cập nhật'}
                  </Text>
                  <Text style={[styles.cardCopy, { color: colors.muted }]}>
                    {room ? formatRoomName(room.name) : 'Phòng đang cập nhật'} •{' '}
                    {formatShowtimeFormat(showtime.format)} • {formatSession(showtime.startTime)}
                  </Text>
                  <View style={styles.rowBetween}>
                    <Text style={[styles.inlineMeta, { color: colors.text }]}>
                      Giá từ {showtime.basePrice.toLocaleString('vi-VN')} VND
                    </Text>
                    <Link
                      href={{
                        pathname: '/booking/seats',
                        params: { showtimeId: showtime.id },
                      }}
                      style={[styles.link, { color: colors.accent }]}>
                      Chọn ghế
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
