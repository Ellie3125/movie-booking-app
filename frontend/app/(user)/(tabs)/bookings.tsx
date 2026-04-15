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
import { useAppStore } from '@/lib/app-store';

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
  const myBookings = bookings.filter((booking) => booking.userId === currentUser.id);

  return (
    <PageScroll tone="user">
      <HeroCard
        tone="user"
        eyebrow="My tickets"
        title="Tab ve da mua va trang thai thanh toan."
        description="Sau khi qua checkout, booking se duoc ghi vao day ngay va ghe se chuyen sang trang thai paid tren so do suat chieu."
      />

      <SectionTitle
        tone="user"
        title="Lich su dat ve"
        description="Mock store dang luu seat label, toa do that, tong tien va phuong thuc thanh toan."
      />
      {myBookings.length === 0 ? (
        <EmptyNotice
          tone="user"
          title="Ban chua co booking nao"
          description="Vao tab movies hoac cinemas de dat cho trong flow moi."
        />
      ) : (
        myBookings.map((booking) => {
          const movie = movies.find((item) => item.id === booking.movieId);
          const showtime = showtimes.find((item) => item.id === booking.showtimeId);
          const cinema = cinemas.find((item) => item.id === showtime?.cinemaId);

          return (
            <SectionCard key={booking.id} tone="user">
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {movie?.title ?? 'Unknown movie'}
              </Text>
              <Text style={[styles.cardCopy, { color: colors.muted }]}>
                {cinema?.brand} {cinema?.name}
              </Text>
              <Text style={[styles.cardCopy, { color: colors.muted }]}>
                Ghe {booking.seats.map((seat) => `${seat.seatLabel} (${seat.seatCoordinate})`).join(', ')}
              </Text>
              <Text style={[styles.inlineMeta, { color: colors.text }]}>
                {booking.status.toUpperCase()} • {formatDateTime(showtime?.startTime ?? booking.createdAt)}
              </Text>
              <Text style={[styles.cardCopy, { color: colors.muted }]}>
                Tong tien {booking.totalPrice.toLocaleString('vi-VN')} VND • {booking.paymentMethod}
              </Text>
              {movie ? (
                <Link href={`/movies/${movie.id}`} style={[styles.link, { color: colors.accent }]}>
                  Xem phim
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
