import { Link } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

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
  formatBookingStatus,
  formatLocationName,
  formatPaymentMethod,
} from '@/lib/user-display';

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  });

export default function BookingsTabScreen() {
  const { bookings, movies, showtimes, cinemas, currentUser } = useAppStore();
  const colors = getTonePalette('user');
  const currentUserId = currentUser?.id ?? '';
  const myBookings = bookings.filter((booking) => booking.userId === currentUserId);

  return (
    <PageScroll tone="user">
      <HeroCard
        tone="user"
        eyebrow="Vé của tôi"
        title="Danh sách vé đã mua và trạng thái thanh toán."
        description="Lịch sử booking được đồng bộ từ backend ngay sau khi đăng nhập thành công."
      />

      <SectionTitle
        tone="user"
        title="Lịch sử đặt vé"
        description="Tên ghế, tọa độ thật, tổng tiền và trạng thái thanh toán đều lấy từ luồng booking thật."
      />
      {myBookings.length === 0 ? (
        <EmptyNotice
          tone="user"
          title="Bạn chưa có booking nào"
          description="Vào tab phim hoặc rạp để bắt đầu đặt vé."
        />
      ) : (
        myBookings.map((booking) => {
          const movie = movies.find((item) => item.id === booking.movieId);
          const showtime = showtimes.find((item) => item.id === booking.showtimeId);
          const cinema = cinemas.find((item) => item.id === showtime?.cinemaId);

          return (
            <SectionCard key={booking.id} tone="user">
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {movie?.title ?? 'Phim không xác định'}
              </Text>
              <Text style={[styles.cardCopy, { color: colors.muted }]}>
                {cinema
                  ? `${cinema.brand} ${formatLocationName(cinema.name)}`
                  : 'Rạp đang cập nhật'}
              </Text>
              <Text style={[styles.cardCopy, { color: colors.muted }]}>
                Ghế{' '}
                {booking.seats
                  .map((seat) => `${seat.seatLabel} (${seat.seatCoordinate})`)
                  .join(', ')}
              </Text>
              <Text style={[styles.inlineMeta, { color: colors.text }]}>
                {formatBookingStatus(booking.status)} •{' '}
                {formatDateTime(showtime?.startTime ?? booking.createdAt)}
              </Text>
              <Text style={[styles.cardCopy, { color: colors.muted }]}>
                Tổng tiền {booking.totalPrice.toLocaleString('vi-VN')} VND •{' '}
                {formatPaymentMethod(booking.paymentMethod)}
              </Text>
              {movie ? (
                <Link href={`/movies/${movie.id}`} style={[styles.link, { color: colors.accent }]}>
                  Xem chi tiết phim
                </Link>
              ) : null}
            </SectionCard>
          );
        })
      )}
    </PageScroll>
  );
}

const styles = StyleSheet.create({
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
