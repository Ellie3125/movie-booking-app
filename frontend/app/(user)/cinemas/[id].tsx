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
  formatAddress,
  formatCinemaFeatures,
  formatLocationName,
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

export default function CinemaDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { cinemas, rooms, showtimes, movies } = useAppStore();
  const colors = getTonePalette('user');
  const cinema = cinemas.find((item) => item.id === id);
  const cinemaShowtimes = showtimes.filter((item) => item.cinemaId === cinema?.id);

  return (
    <PageScroll tone="user">
      <Stack.Screen
        options={{ title: cinema ? formatLocationName(cinema.name) : 'Chi tiết rạp' }}
      />
      {!cinema ? (
        <EmptyNotice
          tone="user"
          title="Không tìm thấy rạp"
          description="Đường dẫn chi tiết rạp đang trỏ tới một rạp không tồn tại."
        />
      ) : (
        <>
          <HeroCard
            tone="user"
            eyebrow="Chi tiết rạp"
            title={`${cinema.brand} ${formatLocationName(cinema.name)}`}
            description={`${formatAddress(cinema.address)}. Hotline ${cinema.hotline}.`}
          />

          <SectionCard tone="user">
            <Text style={[styles.cardTitle, { color: colors.text }]}>Tiện ích</Text>
            <Text style={[styles.cardCopy, { color: colors.muted }]}>
              {formatCinemaFeatures(cinema.features)}
            </Text>
            <Text style={[styles.cardCopy, { color: colors.muted }]}>
              Số phòng chiếu {rooms.filter((room) => room.cinemaId === cinema.id).length}
            </Text>
          </SectionCard>

          <SectionTitle
            tone="user"
            title="Lịch chiếu tại rạp"
            description="Người dùng có thể bắt đầu từ rạp rồi chọn phim và chọn ghế."
          />
          {cinemaShowtimes.length === 0 ? (
            <EmptyNotice
              tone="user"
              title="Rạp này chưa có suất chiếu"
              description="Thêm showtime từ backend để lịch chiếu hiện ra tại đây."
            />
          ) : (
            cinemaShowtimes.map((showtime) => {
              const movie = movies.find((item) => item.id === showtime.movieId);
              const room = rooms.find((item) => item.id === showtime.roomId);

              return (
                <SectionCard key={showtime.id} tone="user">
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    {movie?.title ?? 'Phim không xác định'}
                  </Text>
                  <Text style={[styles.cardCopy, { color: colors.muted }]}>
                    {room ? formatRoomName(room.name) : 'Phòng đang cập nhật'} •{' '}
                    {formatShowtimeFormat(showtime.format)} • {formatSession(showtime.startTime)}
                  </Text>
                  <View style={styles.rowBetween}>
                    {movie ? (
                      <Link
                        href={`/movies/${movie.id}`}
                        style={[styles.link, { color: colors.accent }]}>
                        Chi tiết phim
                      </Link>
                    ) : (
                      <View />
                    )}
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
  link: {
    fontSize: 14,
    fontFamily: Fonts.sansBold,
  },
});
