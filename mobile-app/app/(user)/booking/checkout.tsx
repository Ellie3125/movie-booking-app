import { router, Stack, useLocalSearchParams } from 'expo-router';
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
import { getSeatDisplayLabel } from '@/lib/seat-display';
import { formatLocationName, formatPaymentMethod } from '@/lib/user-display';
import { getPaymentStatus, getBookingPaymentStatus } from '@/lib/backend-api';


const paymentMethods: { label: string; value: PaymentMethod }[] = [
  { label: 'Cổng thanh toán', value: 'mock_gateway' },
];

type CheckoutFormData = {
  paymentMethod: PaymentMethod;
};

export default function CheckoutScreen() {
  const params = useLocalSearchParams<{
    showtimeId?: string;
    seatIds?: string;
    bookingId?: string;
    paymentTransactionId?: string;
    expiredAt?: string;
    paymentUrl?: string;
    resume?: string;
  }>();

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
  const [activeTransaction, setActiveTransaction] = useState<any>(null);
  const [checkingActive, setCheckingActive] = useState(false);

  const pollingIntervalRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);
  const resumeSessionKeyRef = useRef('');

  const movie = movies.find((item) => item.id === draftCheckout?.movieId);
  const showtime = showtimes.find((item) => item.id === draftCheckout?.showtimeId);
  const cinema = cinemas.find((item) => item.id === showtime?.cinemaId);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  // Nếu điều hướng từ seats với flag resume = true, tự động kích hoạt QR
  useEffect(() => {
    const resumeSessionKey =
      params.bookingId && params.paymentTransactionId && params.paymentUrl
        ? `${params.bookingId}:${params.paymentTransactionId}:${params.paymentUrl}`
        : '';

    if (
      params.resume === 'true' &&
      resumeSessionKey &&
      draftCheckout &&
      resumeSessionKeyRef.current !== resumeSessionKey
    ) {
      resumeSessionKeyRef.current = resumeSessionKey;
      const session = {
        bookingId: params.bookingId,
        paymentId: params.paymentTransactionId,
        paymentUrl: params.paymentUrl,
        expiredAt: params.expiredAt,
        amount: draftCheckout?.totalPrice ?? 0,
      };
      startPaymentFlow(session);
    }
  }, [params, draftCheckout]);

  // Nếu mở checkout bình thường, tự động check backend xem đơn hàng này đã có QR/transaction active hay chưa
  useEffect(() => {
    const checkActiveTransaction = async () => {
      if (!authToken || !draftCheckout || params.resume === 'true') return;
      try {
        setCheckingActive(true);
        const res = await getBookingPaymentStatus(authToken, draftCheckout.id);
        if (res.status === 'pending_payment' && res.paymentTransactionId && res.qrCode) {
          const now = Date.now();
          const expiresAt = new Date(res.holdExpiresAt).getTime();
          if (expiresAt > now) {
            setActiveTransaction(res);
          }
        }
      } catch (e) {
        console.warn('Check active transaction failed:', e);
      } finally {
        setCheckingActive(false);
      }
    };
    checkActiveTransaction();
  }, [draftCheckout, authToken, params.resume]);

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

          router.replace({
            pathname: '/(user)/payment/result',
            params: {
              status,
              bookingId: session.bookingId,
              paymentId: session.paymentId,
              message: 'Thanh toán thành công.',
            },
          });
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
            {draftCheckout.seats.map((seat) => {
              const displayLabel = getSeatDisplayLabel(seat);
              const seatMeta = seat.seatType === 'couple' ? 'Ghế đôi' : seat.seatCode;

              return (
                <View key={seat.seatCode} style={styles.rowBetween}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    Ghế {displayLabel}
                  </Text>
                  <Text style={[styles.cardCopy, { color: colors.muted }]}>
                    {seatMeta} • {(seat?.price ?? 0).toLocaleString('vi-VN')} VND
                  </Text>
                </View>
              );
            })}
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
              <Text style={[styles.cardCopy, { color: colors.accent, marginBottom: 8 }]}>{error}</Text>
            ) : null}

            {activeTransaction ? (
              <>
                <Text style={[styles.cardCopy, { color: colors.accent, marginBottom: 10, fontStyle: 'italic' }]}>
                  * Bạn đang có một giao dịch thanh toán QR còn hiệu lực cho vé này.
                </Text>
                <ActionButton
                  tone="user"
                  label="Tiếp tục thanh toán QR"
                  onPress={() => startPaymentFlow({
                    bookingId: activeTransaction.bookingId,
                    paymentId: activeTransaction.paymentTransactionId,
                    paymentUrl: activeTransaction.qrCode,
                    expiredAt: activeTransaction.holdExpiresAt,
                    amount: activeTransaction.amount,
                  })}
                />
              </>
            ) : (
              <ActionButton
                tone="user"
                label={isSubmitting ? 'Đang mở cổng thanh toán...' : 'Mở cổng thanh toán'}
                onPress={handleSubmit(onConfirm)}
                disabled={isSubmitting || checkingActive}
              />
            )}

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
    fontSize: 15,
    fontFamily: Fonts.sansBold,
  },
  cardCopy: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Fonts.sansMedium,
  },
  totalPrice: {
    fontSize: 16,
    fontFamily: Fonts.sansBold,
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E9F1F7',
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  qrImage: {
    width: 240,
    height: 240,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 14,
    shadowColor: '#002B5C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: '#E9F1F7',
  },
  timerText: {
    fontSize: 18,
    fontFamily: Fonts.rounded,
    color: '#EF4444',
    marginTop: 10,
  },
  amountText: {
    fontSize: 18,
    fontFamily: Fonts.sansBold,
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
});
