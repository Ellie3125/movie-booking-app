import { router, Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import {
  ActionButton,
  Chip,
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
  formatRoomName,
  formatScreenLabel,
} from '@/lib/user-display';

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const formatSeatType = (value: 'standard' | 'couple') =>
  value === 'couple' ? 'Ghế đôi' : 'Ghế đơn';

export default function BookingDetailScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();
  const { bookings, movies, showtimes, cinemas, rooms, currentUser } = useAppStore();
  const colors = getTonePalette('user');

  const booking = bookings.find((item) => {
    if (item.id !== bookingId) {
      return false;
    }

    if (!currentUser || currentUser.role === 'admin') {
      return true;
    }

    return item.userId === currentUser.id;
  });
  const movie = movies.find((item) => item.id === booking?.movieId);
  const showtime = showtimes.find((item) => item.id === booking?.showtimeId);
  const cinema = cinemas.find((item) => item.id === showtime?.cinemaId);
  const room = rooms.find((item) => item.id === booking?.roomId);

  return (
    <PageScroll tone="user">
      <Stack.Screen options={{ title: booking ? 'Chi tiết vé' : 'Không tìm thấy vé' }} />
      {!booking || !movie || !showtime || !cinema || !room ? (
        <EmptyNotice
          tone="user"
          title="Không tìm thấy vé"
          description="Vé này không tồn tại hoặc không còn nằm trong dữ liệu hiện tại của bạn."
        />
      ) : (
        <>
          <HeroCard
            tone="user"
            eyebrow="Chi tiết vé"
            title={movie.title}
            description={`${cinema.brand} ${formatLocationName(cinema.name)} • ${formatDateTime(showtime.startTime)}`}>
            <View style={styles.heroChips}>
              <Chip tone="user" label={formatBookingStatus(booking.status)} active />
              <Chip tone="user" label={formatPaymentMethod(booking.paymentMethod)} />
            </View>
          </HeroCard>

          <SectionTitle tone="user" title="Thông tin vé" />
          <SectionCard tone="user">
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.muted }]}>Mã vé</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{booking.id}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.muted }]}>Rạp</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {cinema.brand} {formatLocationName(cinema.name)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.muted }]}>Phòng</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {formatRoomName(room.name)} • {formatScreenLabel(room.screenLabel)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.muted }]}>Suất chiếu</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {formatDateTime(showtime.startTime)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.muted }]}>Đặt lúc</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {formatDateTime(booking.createdAt)}
              </Text>
            </View>
            {booking.paidAt ? (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.muted }]}>Thanh toán lúc</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {formatDateTime(booking.paidAt)}
                </Text>
              </View>
            ) : null}
            {booking.paymentExpiresAt ? (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.muted }]}>Hạn thanh toán</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {formatDateTime(booking.paymentExpiresAt)}
                </Text>
              </View>
            ) : null}
          </SectionCard>

          <SectionTitle tone="user" title="Ghế và thanh toán" />
          <SectionCard tone="user">
            {booking.seats.map((seat) => (
              <View key={seat.seatCoordinate} style={styles.seatRow}>
                <View style={styles.seatCopy}>
                  <Text style={[styles.seatLabel, { color: colors.text }]}>Ghế {seat.seatLabel}</Text>
                  <Text style={[styles.seatMeta, { color: colors.muted }]}>
                    {seat.seatCoordinate} • {formatSeatType(seat.seatType)}
                  </Text>
                </View>
                <Text style={[styles.seatPrice, { color: colors.text }]}>
                  {seat.price.toLocaleString('vi-VN')} VND
                </Text>
              </View>
            ))}
            <View style={[styles.totalBlock, { borderTopColor: colors.border }]}>
              <Text style={[styles.totalLabel, { color: colors.muted }]}>Tổng thanh toán</Text>
              <Text style={[styles.totalValue, { color: colors.text }]}>
                {booking.totalPrice.toLocaleString('vi-VN')} VND
              </Text>
            </View>
          </SectionCard>

          <SectionCard tone="user">
            <ActionButton
              tone="user"
              label="Xem chi tiết phim"
              variant="secondary"
              onPress={() => router.push(`/movies/${movie.id}`)}
            />
          </SectionCard>
        </>
      )}
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  heroChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },
  detailRow: {
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: Fonts.sansBold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  detailValue: {
    fontSize: 15,
    lineHeight: 21,
    fontFamily: Fonts.sans,
  },
  seatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  seatCopy: {
    flex: 1,
    gap: 2,
  },
  seatLabel: {
    fontSize: 15,
    fontFamily: Fonts.sansBold,
  },
  seatMeta: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Fonts.sans,
  },
  seatPrice: {
    fontSize: 14,
    fontFamily: Fonts.sansBold,
  },
  totalBlock: {
    borderTopWidth: 1,
    paddingTop: 14,
    gap: 4,
  },
  totalLabel: {
    fontSize: 13,
    fontFamily: Fonts.sansBold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  totalValue: {
    fontSize: 22,
    fontFamily: Fonts.rounded,
  },
});
