import { router, Stack } from 'expo-router';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useState, useEffect, useRef } from 'react';
import { Platform, StyleSheet, Text, View, Image, ActivityIndicator } from 'react-native';
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
import { getPaymentStatus } from '@/lib/backend-api';

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
    authToken, // Lấy token để gọi API status
  } = useAppStore();
  const colors = getTonePalette('user');

  const { control, handleSubmit, formState: { isSubmitting } } = useForm<CheckoutFormData>({
    defaultValues: {
      paymentMethod: 'mock_gateway',
    },
  });

  const [error, setError] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [qrSession, setQrSession] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 phút (600 giây)
  const pollingIntervalRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);

  const movie = movies.find((item) => item.id === draftCheckout?.movieId);
  const showtime = showtimes.find((item) => item.id === draftCheckout?.showtimeId);
  const cinema = cinemas.find((item) => item.id === showtime?.cinemaId);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

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

  const startPaymentFlow = (session: any) => {
    setQrSession(session);
    setShowQR(true);

    const expiryTime = session.expiredAt ? new Date(session.expiredAt).getTime() : Date.now() + 10 * 60 * 1000;
    const updateCountdown = () => {
      const diff = Math.max(0, Math.floor((expiryTime - Date.now()) / 1000));
      setTimeLeft(diff);

      if (diff <= 0) {
        clearInterval(pollingIntervalRef.current);
        clearInterval(countdownIntervalRef.current);
        router.replace({
          pathname: '/(user)/payment/result',
          params: {
            status: 'expired',
            bookingId: session.bookingId,
            message: 'Đã hết thời gian giữ ghế 10 phút. Giao dịch đặt vé đã bị hủy.',
          },
        });
      }
    };

    updateCountdown();
    countdownIntervalRef.current = setInterval(updateCountdown, 1000);

    pollingIntervalRef.current = setInterval(async () => {
      if (!authToken) return;

      try {
        const res = await getPaymentStatus(authToken, session.paymentId);
        const status = res.status.toLowerCase();

        if (status === 'success') {
          clearInterval(pollingIntervalRef.current);
          clearInterval(countdownIntervalRef.current);

          await completeRemoteCheckout(session.bookingId);
          navigateToBooking(session.bookingId);
        } else if (['failed', 'expired', 'cancelled'].includes(status)) {
          clearInterval(pollingIntervalRef.current);
          clearInterval(countdownIntervalRef.current);

          router.replace({
            pathname: '/(user)/payment/result',
            params: {
              status,
              bookingId: session.bookingId,
              paymentId: session.paymentId,
              message: status === 'expired'
                ? 'Giao dịch hết hạn thanh toán (quá 10 phút).'
                : (status === 'cancelled' ? 'Bạn đã hủy giao dịch.' : 'Giao dịch thanh toán thất bại.'),
            },
          });
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000);
  };

  const handleCancelQR = async () => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setShowQR(false);

    if (qrSession?.bookingId) {
      try {
        await releaseDraftCheckout();
      } catch (e) {
        console.warn(e);
      }
    }
    router.back();
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

      // Đối với mock_gateway, kích hoạt luồng QR Code và Polling thay vì mở WebBrowser
      if (confirmation.kind === 'gateway') {
        startPaymentFlow(confirmation);
        return;
      }
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : 'Thanh toán thất bại. Vui lòng thử lại.',
      );
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Trạng thái hiển thị giao diện QR Code
  if (showQR && qrSession && draftCheckout && movie && showtime && cinema) {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrSession.paymentUrl)}`;

    return (
      <PageScroll tone="user">
        <Stack.Screen options={{ title: 'Quét mã QR' }} />
        <HeroCard
          tone="user"
          eyebrow="Thanh toán QR"
          title={movie.title}
          description={`${cinema.brand} ${formatLocationName(cinema.name)} • ${showtime.startTime ? new Date(showtime.startTime).toLocaleString('vi-VN') : ''}`}
        />

        <SectionTitle tone="user" title="Quét mã để thanh toán" />
        <SectionCard tone="user">
          <View style={styles.qrContainer}>
            <Image
              source={{ uri: qrUrl }}
              style={styles.qrImage}
              resizeMode="contain"
            />
            <Text style={[styles.timerText, { color: colors.accent }]}>
              Thời gian giữ ghế: {formatTime(timeLeft)}
            </Text>
            <Text style={[styles.amountText, { color: colors.text }]}>
              Số tiền: {(draftCheckout?.totalPrice ?? qrSession?.amount ?? 0).toLocaleString('vi-VN')} VND
            </Text>
            <View style={styles.loaderRow}>
              <ActivityIndicator color={colors.accent} size="small" />
              <Text style={[styles.cardCopy, { color: colors.muted }]}>
                Đang chờ xác nhận giao dịch...
              </Text>
            </View>
          </View>

          <ActionButton
            tone="user"
            label="Hủy thanh toán"
            variant="secondary"
            onPress={handleCancelQR}
          />
        </SectionCard>
      </PageScroll>
    );
  }

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
            description={`${cinema.brand} ${formatLocationName(cinema.name)} • ${showtime.startTime ? new Date(showtime.startTime).toLocaleString('vi-VN') : ''}`}
          />

          <SectionTitle tone="user" title="Thông tin ghế" />
          <SectionCard tone="user">
            {draftCheckout.seats.map((seat) => (
              <View key={seat.seatCode} style={styles.rowBetween}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Ghế {seat.seatLabel}
                </Text>
                <Text style={[styles.cardCopy, { color: colors.muted }]}>
                  {seat.seatCode} • {(seat?.price ?? 0).toLocaleString('vi-VN')} VND
                </Text>
              </View>
            ))}
            <Text style={[styles.totalPrice, { color: colors.text }]}>
              Tổng tiền {(draftCheckout?.totalPrice ?? 0).toLocaleString('vi-VN')} VND
            </Text>
            <Text style={[styles.cardCopy, { color: colors.muted }]}>
              Hoàn tất thanh toán trước{' '}
              {draftCheckout?.heldUntil ? new Date(draftCheckout.heldUntil).toLocaleString('vi-VN') : ''}
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
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  qrImage: {
    width: 240,
    height: 240,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
  },
  timerText: {
    fontSize: 18,
    fontFamily: Fonts.sansBold,
    marginTop: 10,
  },
  amountText: {
    fontSize: 16,
    fontFamily: Fonts.sansBold,
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    marginBottom: 20,
  },
});
