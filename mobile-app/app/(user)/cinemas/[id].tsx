import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

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
  formatRoomType,
  formatShowtimeDayLabel,
  formatShowtimeTime,
} from '@/lib/user-display';
import { API_BASE_URL } from '@/lib/backend-api';

const buildImageUrl = (path?: string | null) => {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  const match = API_BASE_URL.match(/^(https?:\/\/[^\/]+)/);
  const host = match ? match[1] : 'http://localhost:5000';
  return `${host}${path}`;
};

export default function CinemaDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { cinemas, rooms, showtimes, movies, brands } = useAppStore();
  const colors = getTonePalette('user');
  const cinema = cinemas.find((item) => item.id === id);
  const cinemaShowtimes = showtimes.filter((item) => item.cinemaId === cinema?.id);

  const brandInfo = cinema
    ? brands.find((b) => b.code.toLowerCase() === cinema.brand.toLowerCase())
    : null;
  const logoUrl = buildImageUrl(cinema?.imageUrl || brandInfo?.logo);

  return (
    <PageScroll tone="user">
      <Stack.Screen
        options={{ title: cinema ? formatLocationName(cinema.name) : 'Chi tiết rạp' }}
      />
      {!cinema ? (
        <EmptyNotice
          tone="user"
          title="Không tìm thấy rạp"
          description="Rạp này không còn trong danh sách. Hãy quay lại tab rạp và chọn lại."
        />
      ) : (
        <>
          <HeroCard
            tone="user"
            eyebrow="Chi tiết rạp"
            title={`${cinema.brand} ${formatLocationName(cinema.name)}`}
            description={`${formatAddress(cinema.address)}. Hotline ${cinema.hotline}.`}>
            {logoUrl && (
              <View style={styles.brandLogoContainer}>
                <Image source={{ uri: logoUrl }} style={styles.brandLogo} contentFit="contain" />
              </View>
            )}
          </HeroCard>

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
            description="Từ màn hình rạp, người dùng vẫn sẽ đi qua bước chọn ngày và chọn suất trên màn hình phim để giữ flow booking nhất quán."
          />
          {cinemaShowtimes.length === 0 ? (
            <EmptyNotice
              tone="user"
              title="Rạp này chưa có suất chiếu"
              description="Hãy quay lại sau hoặc chọn một rạp khác để đặt vé."
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
                    {formatShowtimeDayLabel(showtime.startTime)} • {formatShowtimeTime(showtime.startTime)}
                  </Text>
                  <Text style={[styles.cardCopy, { color: colors.muted }]}>
                    {room ? formatRoomName(room.name) : 'Phòng đang cập nhật'} •{' '}
                    {room ? formatRoomType(room.roomType) : 'Loại phòng đang cập nhật'}
                  </Text>
                  <View style={styles.rowBetween}>
                    {movie ? (
                      <Link href={`/movies/${movie.id}`} style={[styles.link, { color: colors.accent }]}>
                        Chi tiết phim
                      </Link>
                    ) : (
                      <View />
                    )}
                    {movie ? (
                      <Link
                        href={{
                          pathname: '/movies/[id]',
                          params: { id: movie.id, cinemaId: cinema.id },
                        }}
                        style={[styles.link, { color: colors.accent }]}>
                        Chọn ngày và suất
                      </Link>
                    ) : null}
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
  brandLogoContainer: {
    alignSelf: 'flex-start',
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#FFFDF7',
    borderWidth: 1,
    borderColor: 'rgba(188, 132, 82, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: 8,
  },
  brandLogo: {
    width: 48,
    height: 48,
  },
});
