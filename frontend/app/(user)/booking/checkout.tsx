import { router, Stack } from 'expo-router';
import { useState } from 'react';
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
import { type PaymentMethod, useAppStore } from '@/lib/app-store';
import { formatLocationName, formatPaymentMethod } from '@/lib/user-display';

const paymentMethods: { label: string; value: PaymentMethod }[] = [
  { label: 'Tiền mặt', value: 'cash' },
  { label: 'MoMo Sandbox', value: 'momo_sandbox' },
  { label: 'VNPay Sandbox', value: 'vnpay_sandbox' },
];

export default function CheckoutScreen() {
  const {
    draftCheckout,
    movies,
    cinemas,
    showtimes,
    releaseDraftCheckout,
    confirmDraftCheckout,
  } = useAppStore();
  const colors = getTonePalette('user');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('momo_sandbox');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const movie = movies.find((item) => item.id === draftCheckout?.movieId);
  const showtime = showtimes.find((item) => item.id === draftCheckout?.showtimeId);
  const cinema = cinemas.find((item) => item.id === showtime?.cinemaId);

  const handleCancel = async () => {
    setSubmitting(true);
    await releaseDraftCheckout();
    setSubmitting(false);
    router.back();
  };

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      setError('');
      const booking = await confirmDraftCheckout(paymentMethod);

      if (!booking) {
        return;
      }

      router.replace('/bookings');
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : 'Thanh toán thất bại. Vui lòng thử lại.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageScroll tone="user">
      <Stack.Screen options={{ title: 'Thanh toán' }} />
      {!draftCheckout || !movie || !showtime || !cinema ? (
        <EmptyNotice
          tone="user"
          title="Không có phiên thanh toán"
          description="Chọn ghế trước khi vào màn hình thanh toán."
        />
      ) : (
        <>
          <HeroCard
            tone="user"
            eyebrow="Thanh toán"
            title={movie.title}
            description={`${cinema.brand} ${formatLocationName(cinema.name)} • ${new Date(showtime.startTime).toLocaleString('vi-VN')}`}
          />

          <SectionTitle
            tone="user"
            title="Thông tin ghế"
            description="Tên ghế và tọa độ thật được lưu song song trong phiên thanh toán nháp."
          />
          <SectionCard tone="user">
            {draftCheckout.seats.map((seat) => (
              <View key={seat.seatCoordinate} style={styles.rowBetween}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Ghế {seat.seatLabel}
                </Text>
                <Text style={[styles.cardCopy, { color: colors.muted }]}>
                  {seat.seatCoordinate} • {seat.price.toLocaleString('vi-VN')} VND
                </Text>
              </View>
            ))}
            <Text style={[styles.totalPrice, { color: colors.text }]}>
              Tổng tiền {draftCheckout.totalPrice.toLocaleString('vi-VN')} VND
            </Text>
            <Text style={[styles.cardCopy, { color: colors.muted }]}>
              Giữ ghế đến {new Date(draftCheckout.heldUntil).toLocaleString('vi-VN')}
            </Text>
          </SectionCard>

          <SectionTitle
            tone="user"
            title="Phương thức thanh toán"
            description="Trạng thái ghế sẽ chuyển từ đang giữ sang đã thanh toán sau khi xác nhận."
          />
          <SectionCard tone="user">
            <View style={styles.chipRow}>
              {paymentMethods.map((method) => (
                <Chip
                  key={method.value}
                  tone="user"
                  label={formatPaymentMethod(method.value)}
                  active={paymentMethod === method.value}
                  onPress={() => setPaymentMethod(method.value)}
                />
              ))}
            </View>
            {error ? (
              <Text style={[styles.cardCopy, { color: colors.accent }]}>{error}</Text>
            ) : null}
            <ActionButton
              tone="user"
              label={submitting ? 'Đang thanh toán...' : 'Thanh toán và xuất vé'}
              onPress={handleConfirm}
              disabled={submitting}
            />
            <ActionButton
              tone="user"
              label={submitting ? 'Đang xử lý...' : 'Hủy phiên giữ ghế'}
              variant="secondary"
              onPress={handleCancel}
              disabled={submitting}
            />
          </SectionCard>
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
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: Fonts.sansBold,
  },
  cardCopy: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.sans,
  },
  totalPrice: {
    fontSize: 16,
    fontFamily: Fonts.sansBold,
  },
});
