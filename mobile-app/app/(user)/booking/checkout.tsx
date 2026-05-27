import { router, Stack } from 'expo-router';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';

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
import { isSuccessfulPaymentResult, parsePaymentResultUrl } from '@/lib/payment-result';
import { formatLocationName, formatPaymentMethod } from '@/lib/user-display';

const paymentMethods: { label: string; value: PaymentMethod }[] = [
  { label: 'Cổng thanh toán', value: 'mock_gateway' },
];

type CheckoutFormData = {
  paymentMethod: PaymentMethod;
};

export default function CheckoutScreen() {
  const {
    draftCheckout,
    movies,
    cinemas,
    showtimes,
    releaseDraftCheckout,
    confirmDraftCheckout,
    completeRemoteCheckout,
  } = useAppStore();
  const colors = getTonePalette('user');

  const { control, handleSubmit, formState: { isSubmitting } } = useForm<CheckoutFormData>({
    defaultValues: {
      paymentMethod: 'mock_gateway',
    },
  });

  const [error, setError] = useState('');

  const movie = movies.find((item) => item.id === draftCheckout?.movieId);
  const showtime = showtimes.find((item) => item.id === draftCheckout?.showtimeId);
  const cinema = cinemas.find((item) => item.id === showtime?.cinemaId);

  const handleCancel = async () => {
    await releaseDraftCheckout();
    router.back();
  };

  const createPaymentReturnUrl = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return `${window.location.origin}/payment/result`;
    }

    return Linking.createURL('/payment/result');
  };

  const navigateToBooking = (bookingId: string) => {
    router.replace({
      pathname: '/(user)/bookings/[bookingId]',
      params: { bookingId },
    });
  };

  const onConfirm = async (data: CheckoutFormData) => {
    try {
      setError('');
      const returnUrl = createPaymentReturnUrl();
      const confirmation = await confirmDraftCheckout(data.paymentMethod, { returnUrl });

      if (!confirmation) {
        return;
      }

      if (confirmation.kind === 'booking') {
        navigateToBooking(confirmation.booking.id);
        return;
      }

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.location.assign(confirmation.paymentUrl);
        return;
      }

      const browserResult = await WebBrowser.openAuthSessionAsync(
        confirmation.paymentUrl,
        confirmation.returnUrl,
        {
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.AUTOMATIC,
        },
      );

      if (browserResult.type !== 'success') {
        setError('Bạn đã đóng cổng thanh toán trước khi hoàn tất giao dịch.');
        return;
      }

      const paymentResult = parsePaymentResultUrl(browserResult.url);

      if (!isSuccessfulPaymentResult(paymentResult)) {
        setError(paymentResult.message || 'Thanh toán chưa hoàn tất. Vui lòng thử lại.');
        return;
      }

      const booking = await completeRemoteCheckout(
        paymentResult.bookingId || confirmation.bookingId,
      );

      if (!booking || (!booking.paidAt && booking.status !== 'confirmed')) {
        setError('Backend chưa xác nhận thanh toán. Vui lòng kiểm tra lại vé sau ít giây.');
        return;
      }

      navigateToBooking(booking.id);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : 'Thanh toán thất bại. Vui lòng thử lại.',
      );
    }
  };

  return (
    <PageScroll tone="user">
      <Stack.Screen options={{ title: 'Thanh toán' }} />
      {!draftCheckout || !movie || !showtime || !cinema ? (
        <EmptyNotice
          tone="user"
          title="Không có phiên thanh toán"
          description="Hãy quay lại màn chọn ghế để bắt đầu lại phiên thanh toán."
        />
      ) : (
        <>
          <HeroCard
            tone="user"
            eyebrow="Thanh toán"
            title={movie.title}
            description={`${cinema.brand} ${formatLocationName(cinema.name)} • ${new Date(showtime.startTime).toLocaleString('vi-VN')}`}
          />

          <SectionTitle tone="user" title="Thông tin ghế" />
          <SectionCard tone="user">
            {draftCheckout.seats.map((seat) => (
              <View key={seat.seatCode} style={styles.rowBetween}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Ghế {seat.seatLabel}
                </Text>
                <Text style={[styles.cardCopy, { color: colors.muted }]}>
                  {seat.seatCode} • {seat.price.toLocaleString('vi-VN')} VND
                </Text>
              </View>
            ))}
            <Text style={[styles.totalPrice, { color: colors.text }]}>
              Tổng tiền {draftCheckout.totalPrice.toLocaleString('vi-VN')} VND
            </Text>
            <Text style={[styles.cardCopy, { color: colors.muted }]}>
              Hoàn tất thanh toán trước{' '}
              {new Date(draftCheckout.heldUntil).toLocaleString('vi-VN')}
            </Text>
          </SectionCard>

          <SectionTitle tone="user" title="Phương thức thanh toán" />
          <SectionCard tone="user">
            <Controller
              name="paymentMethod"
              control={control}
              render={({ field: { value, onChange } }) => (
                <View style={styles.chipRow}>
                  {paymentMethods.map((method) => (
                    <Chip
                      key={method.value}
                      tone="user"
                      label={formatPaymentMethod(method.value)}
                      active={value === method.value}
                      onPress={() => onChange(method.value)}
                    />
                  ))}
                </View>
              )}
            />
            {error ? (
              <Text style={[styles.cardCopy, { color: colors.accent }]}>{error}</Text>
            ) : null}
            <ActionButton
              tone="user"
              label={isSubmitting ? 'Đang mở cổng thanh toán...' : 'Mở cổng thanh toán'}
              onPress={handleSubmit(onConfirm)}
              disabled={isSubmitting}
            />
            <ActionButton
              tone="user"
              label={isSubmitting ? 'Đang xử lý...' : 'Hủy thanh toán'}
              variant="secondary"
              onPress={handleCancel}
              disabled={isSubmitting}
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
