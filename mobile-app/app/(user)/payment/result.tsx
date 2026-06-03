import { router, Stack, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';

import {
  ActionButton,
  PageScroll,
  SectionCard,
  getTonePalette,
} from '@/components/ui/experience';
import { Fonts } from '@/constants/theme';
import { useAppStore } from '@/lib/app-store';
import { isSuccessfulPaymentResult, parsePaymentResultUrl } from '@/lib/payment-result';

if (Platform.OS === 'web' && typeof window !== 'undefined') {
  WebBrowser.maybeCompleteAuthSession({ skipRedirectCheck: true });
}

const getParamValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default function PaymentResultScreen() {
  const params = useLocalSearchParams<{
    bookingId?: string;
    message?: string;
    paymentId?: string;
    status?: string;
    transactionCode?: string;
  }>();
  
  const { completeRemoteCheckout, bookings, movies, cinemas, showtimes } = useAppStore();
  const colors = getTonePalette('user');
  const [error, setError] = useState('');
  const paramsKey = JSON.stringify(params);

  const paymentResult = useMemo(() => {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      const normalizedValue = getParamValue(value);

      if (normalizedValue) {
        query.set(key, normalizedValue);
      }
    });

    return parsePaymentResultUrl(`frontend://payment/result?${query.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  // Tìm thông tin booking để hiển thị chi tiết lỗi nếu có
  const booking = useMemo(() => {
    return bookings.find((b) => b.id === paymentResult.bookingId);
  }, [bookings, paymentResult.bookingId]);

  const movie = useMemo(() => {
    return movies.find((m) => m.id === booking?.movieId);
  }, [movies, booking?.movieId]);

  const showtime = useMemo(() => {
    return showtimes.find((s) => s.id === booking?.showtimeId);
  }, [showtimes, booking?.showtimeId]);

  const cinema = useMemo(() => {
    return cinemas.find((c) => c.id === showtime?.cinemaId);
  }, [cinemas, showtime?.cinemaId]);

  useEffect(() => {
    let active = true;

    const confirmPayment = async () => {
      if (!isSuccessfulPaymentResult(paymentResult)) {
        setError(paymentResult.message || 'Thanh toán chưa hoàn tất.');
        return;
      }

      try {
        const confirmedBooking = await completeRemoteCheckout(paymentResult.bookingId || '');

        if (!active) {
          return;
        }

        if (confirmedBooking && (confirmedBooking.paidAt || confirmedBooking.status === 'confirmed')) {
          router.replace({
            pathname: '/(user)/bookings/[bookingId]',
            params: { bookingId: confirmedBooking.id },
          });
          return;
        }

        setError('Backend chưa xác nhận thanh toán. Vui lòng kiểm tra lại vé sau ít giây.');
      } catch (paymentError) {
        if (!active) {
          return;
        }

        setError(
          paymentError instanceof Error
            ? paymentError.message
            : 'Không thể đồng bộ kết quả thanh toán.',
        );
      }
    };

    confirmPayment();

    return () => {
      active = false;
    };
  }, [completeRemoteCheckout, paymentResult]);

  return (
    <PageScroll tone="user">
      <Stack.Screen options={{ title: 'Kết quả thanh toán' }} />
      <SectionCard tone="user">
        <View style={styles.centerBlock}>
          {error ? null : <ActivityIndicator color={colors.accent} size="large" />}
          <Text style={[styles.title, { color: colors.text }]}>
            {error ? 'Thanh toán thất bại / Bị hủy' : 'Đang xác nhận thanh toán'}
          </Text>
          <Text style={[styles.copy, { color: colors.muted }]}>
            {error || 'Hệ thống đang đồng bộ kết quả với backend và cập nhật vé của bạn.'}
          </Text>
        </View>

        {error && booking ? (
          <View style={[styles.detailsCard, { borderColor: colors.border }]}>
            <Text style={[styles.detailsTitle, { color: colors.text }]}>
              Chi tiết giao dịch bị lỗi:
            </Text>
            <Text style={[styles.detailsText, { color: colors.muted }]}>
              Mã đặt vé: <Text style={{ color: colors.text, fontWeight: 'bold' }}>{booking.id}</Text>
            </Text>
            <Text style={[styles.detailsText, { color: colors.muted }]}>
              Phim: <Text style={{ color: colors.text, fontWeight: 'bold' }}>{movie?.title || 'Đang cập nhật'}</Text>
            </Text>
            <Text style={[styles.detailsText, { color: colors.muted }]}>
              Rạp: {cinema?.name || 'Đang cập nhật'}
            </Text>
            {showtime ? (
              <Text style={[styles.detailsText, { color: colors.muted }]}>
                Suất chiếu: {new Date(showtime.startTime).toLocaleString('vi-VN')}
              </Text>
            ) : null}
            <Text style={[styles.detailsText, { color: colors.muted }]}>
              Ghế đã chọn: <Text style={{ color: colors.text, fontWeight: 'bold' }}>{booking.seats.map(s => s.seatLabel).join(', ')}</Text>
            </Text>
            <Text style={[styles.detailsText, { color: colors.muted }]}>
              Tổng tiền: <Text style={{ color: colors.accent, fontWeight: 'bold' }}>{booking.totalPrice.toLocaleString('vi-VN')} VND</Text>
            </Text>
          </View>
        ) : null}

        {error ? (
          <View style={{ marginTop: 20, gap: 10 }}>
            {paymentResult.bookingId ? (
              <ActionButton
                tone="user"
                label="Xem đơn đặt vé"
                onPress={() =>
                  router.replace({
                    pathname: '/(user)/bookings/[bookingId]',
                    params: { bookingId: paymentResult.bookingId || '' },
                  })
                }
              />
            ) : null}
            <ActionButton
              tone="user"
              label="Về trang đặt vé"
              variant="secondary"
              onPress={() => router.replace('/(user)/(tabs)/bookings')}
            />
          </View>
        ) : null}
      </SectionCard>
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  centerBlock: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.rounded,
    textAlign: 'center',
  },
  copy: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: Fonts.sans,
    textAlign: 'center',
  },
  detailsCard: {
    marginTop: 15,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    gap: 8,
  },
  detailsTitle: {
    fontSize: 15,
    fontFamily: Fonts.sansBold,
    marginBottom: 5,
  },
  detailsText: {
    fontSize: 14,
    fontFamily: Fonts.sans,
  },
});
