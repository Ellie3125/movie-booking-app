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
import { type PaymentMethod, useAppStore } from '@/lib/app-store';

const paymentMethods: { label: string; value: PaymentMethod }[] = [
  { label: 'Cash', value: 'cash' },
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
          : 'Thanh toan that bai. Vui long thu lai.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageScroll tone="user">
      <Stack.Screen options={{ title: 'Checkout' }} />
      {!draftCheckout || !movie || !showtime || !cinema ? (
        <EmptyNotice
          tone="user"
          title="Khong co phien checkout"
          description="Chon ghe truoc khi vao man hinh thanh toan."
        />
      ) : (
        <>
          <HeroCard
            tone="user"
            eyebrow="Checkout"
            title={movie.title}
            description={`${cinema.brand} ${cinema.name} • ${new Date(showtime.startTime).toLocaleString('vi-VN')}`}
          />

          <SectionTitle
            tone="user"
            title="Thong tin ghe"
            description="Seat label va toa do that duoc luu song song trong draft checkout."
          />
          <SectionCard tone="user">
            {draftCheckout.seats.map((seat) => (
              <View key={seat.seatCoordinate} style={styles.rowBetween}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Ghe {seat.seatLabel}
                </Text>
                <Text style={[styles.cardCopy, { color: colors.muted }]}>
                  {seat.seatCoordinate} • {seat.price.toLocaleString('vi-VN')} VND
                </Text>
              </View>
            ))}
            <Text style={[styles.totalPrice, { color: colors.text }]}>
              Tong tien {draftCheckout.totalPrice.toLocaleString('vi-VN')} VND
            </Text>
            <Text style={[styles.cardCopy, { color: colors.muted }]}>
              Giu ghe den {new Date(draftCheckout.heldUntil).toLocaleString('vi-VN')}
            </Text>
          </SectionCard>

          <SectionTitle
            tone="user"
            title="Phuong thuc thanh toan"
            description="Trang thai seat se chuyen tu held sang paid sau khi confirm."
          />
          <SectionCard tone="user">
            <View style={styles.chipRow}>
              {paymentMethods.map((method) => (
                <Chip
                  key={method.value}
                  tone="user"
                  label={method.label}
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
              label={submitting ? 'Dang thanh toan...' : 'Thanh toan va xuat ve'}
              onPress={handleConfirm}
              disabled={submitting}
            />
            <ActionButton
              tone="user"
              label={submitting ? 'Dang xu ly...' : 'Huy phien giu ghe'}
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
    fontWeight: '800',
  },
  cardCopy: {
    fontSize: 14,
    lineHeight: 20,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '800',
  },
});
