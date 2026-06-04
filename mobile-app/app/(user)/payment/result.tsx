import { router, Stack, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import {
  ActionButton,
  PageScroll,
  SectionCard,
  getTonePalette,
} from '@/components/ui/experience';
import { Fonts } from '@/constants/theme';
import { useAppStore } from '@/lib/app-store';
import { isSuccessfulPaymentResult, parsePaymentResultUrl } from '@/lib/payment-result';
import { getSeatDisplayLabel } from '@/lib/seat-display';

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
  
  const {
    completeRemoteCheckout,
    retryPendingPayment,
    bookings,
    movies,
    cinemas,
    showtimes,
  } = useAppStore();
  const colors = getTonePalette('user');
  const [error, setError] = useState('');
  const [retrying, setRetrying] = useState(false);
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
  }, [paramsKey]);

  // Sync status state: 'pending' (loading), 'success', 'failed'
  const [syncStatus, setSyncStatus] = useState<'pending' | 'success' | 'failed'>(
    isSuccessfulPaymentResult(paymentResult) ? 'pending' : 'failed'
  );
  
  // Find booking details to display
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

  const createPaymentReturnUrl = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return `${window.location.origin}/payment/result`;
    }

    return Linking.createURL('/payment/result');
  };

  const handleRetryPayment = async () => {
    if (!paymentResult.bookingId) {
      return;
    }

    try {
      setRetrying(true);
      setError('');

      const returnUrl = createPaymentReturnUrl();
      const confirmation = await retryPendingPayment(paymentResult.bookingId, {
        returnUrl,
      });

      if (!confirmation || confirmation.kind !== 'gateway') {
        setError('Không thể khởi tạo lại cổng thanh toán. Vui lòng thử lại.');
        return;
      }

      router.replace({
        pathname: '/(user)/booking/checkout',
        params: {
          resume: 'true',
          bookingId: confirmation.bookingId,
          paymentTransactionId: confirmation.paymentId,
          paymentUrl: confirmation.paymentUrl,
          expiredAt: confirmation.expiredAt || '',
        },
      });
    } catch (paymentError) {
      setError(
        paymentError instanceof Error
          ? paymentError.message
          : 'Không thể tiếp tục thanh toán.',
      );
    } finally {
      setRetrying(false);
    }
  };

  useEffect(() => {
    let active = true;

    const confirmPayment = async () => {
      if (!isSuccessfulPaymentResult(paymentResult)) {
        setSyncStatus('failed');
        setError(paymentResult.message || 'Thanh toán chưa hoàn tất.');
        return;
      }

      try {
        const confirmedBooking = await completeRemoteCheckout(paymentResult.bookingId || '');

        if (!active) {
          return;
        }

        if (confirmedBooking && (confirmedBooking.paidAt || confirmedBooking.status === 'confirmed')) {
          setSyncStatus('success');
          setError('');
          return;
        }

        setSyncStatus('failed');
        setError('Backend chưa xác nhận thanh toán. Vui lòng kiểm tra lại vé sau ít giây.');
      } catch (paymentError) {
        if (!active) {
          return;
        }

        setSyncStatus('failed');
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
          {syncStatus === 'pending' && <ActivityIndicator color={colors.accent} size="large" />}
          {syncStatus === 'success' && (
            <MaterialCommunityIcons name="check-circle" size={72} color="#16A34A" />
          )}
          {syncStatus === 'failed' && (
            <MaterialCommunityIcons name="close-circle" size={72} color="#DC2626" />
          )}
          
          <Text
            style={[
              styles.title,
              {
                color:
                  syncStatus === 'success'
                    ? '#16A34A'
                    : syncStatus === 'failed'
                      ? '#DC2626'
                      : colors.text,
              },
            ]}>
            {syncStatus === 'pending' && 'Đang xác nhận thanh toán'}
            {syncStatus === 'success' && 'Thanh toán thành công!'}
            {syncStatus === 'failed' && 'Thanh toán thất bại / Bị hủy'}
          </Text>
          
          <Text style={[styles.copy, { color: colors.muted }]}>
            {syncStatus === 'pending' && 'Hệ thống đang đồng bộ kết quả với backend và cập nhật vé của bạn.'}
            {syncStatus === 'success' && 'Giao dịch đã được ghi nhận. Vé của bạn đã được xuất.'}
            {syncStatus === 'failed' && (error || 'Giao dịch thanh toán chưa được xác nhận hoặc bị hủy.')}
          </Text>
        </View>

        {booking ? (
          <View style={[styles.detailsCard, { borderColor: colors.border }]}>
            <Text style={[styles.detailsTitle, { color: colors.text }]}>
              Chi tiết giao dịch:
            </Text>
            <Text style={[styles.detailsText, { color: colors.muted }]}>
              Mã đặt vé: <Text style={{ color: colors.text, fontWeight: 'bold' }}>{booking.id}</Text>
            </Text>
            {paymentResult.paymentId ? (
              <Text style={[styles.detailsText, { color: colors.muted }]}>
                Mã thanh toán: <Text style={{ color: colors.text, fontWeight: 'bold' }}>{paymentResult.paymentId}</Text>
              </Text>
            ) : null}
            {paymentResult.transactionCode ? (
              <Text style={[styles.detailsText, { color: colors.muted }]}>
                Mã giao dịch: <Text style={{ color: colors.text, fontWeight: 'bold' }}>{paymentResult.transactionCode}</Text>
              </Text>
            ) : null}
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
              Ghế đã chọn: <Text style={{ color: colors.text, fontWeight: 'bold' }}>{booking.seats.map(getSeatDisplayLabel).join(', ')}</Text>
            </Text>
            <Text style={[styles.detailsText, { color: colors.muted }]}>
              Tổng tiền: <Text style={{ color: colors.accent, fontWeight: 'bold' }}>{booking.totalPrice.toLocaleString('vi-VN')} VND</Text>
            </Text>
          </View>
        ) : null}

        <View style={{ marginTop: 24, gap: 12 }}>
          {syncStatus === 'success' && paymentResult.bookingId ? (
            <ActionButton
              tone="user"
              label="Xem chi tiết vé"
              onPress={() =>
                router.replace({
                  pathname: '/(user)/bookings/[bookingId]',
                  params: { bookingId: paymentResult.bookingId || '' },
                })
              }
            />
          ) : null}

          {syncStatus === 'failed' && paymentResult.bookingId ? (
            <ActionButton
              tone="user"
              label={retrying ? 'Đang mở lại cổng thanh toán...' : 'Tiếp tục thanh toán'}
              onPress={handleRetryPayment}
              disabled={retrying}
            />
          ) : null}

          {syncStatus === 'failed' && paymentResult.bookingId ? (
            <ActionButton
              tone="user"
              label="Xem đơn đặt vé"
              variant="secondary"
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
            label="Quay lại trang chủ"
            variant="secondary"
            onPress={() => router.replace('/')}
          />
        </View>
      </SectionCard>
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  centerBlock: {
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
  },
  title: {
    fontSize: 22,
    fontFamily: Fonts.rounded,
    textAlign: 'center',
    marginTop: 6,
  },
  copy: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.sansMedium,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  detailsCard: {
    marginTop: 20,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    shadowColor: '#002B5C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
    gap: 8,
  },
  detailsTitle: {
    fontSize: 15,
    fontFamily: Fonts.sansBold,
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 13,
    fontFamily: Fonts.sansMedium,
  },
});
