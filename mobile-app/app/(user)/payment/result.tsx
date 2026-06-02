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
  const { completeRemoteCheckout } = useAppStore();
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

  useEffect(() => {
    let active = true;

    const confirmPayment = async () => {
      if (!isSuccessfulPaymentResult(paymentResult)) {
        setError(paymentResult.message || 'Thanh toán chưa hoàn tất.');
        return;
      }

      try {
        const booking = await completeRemoteCheckout(paymentResult.bookingId || '');

        if (!active) {
          return;
        }

        if (booking && (booking.paidAt || booking.status === 'confirmed')) {
          router.replace({
            pathname: '/(user)/bookings/[bookingId]',
            params: { bookingId: booking.id },
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
            {error ? 'Thanh toán chưa hoàn tất' : 'Đang xác nhận thanh toán'}
          </Text>
          <Text style={[styles.copy, { color: colors.muted }]}>
            {error || 'Hệ thống đang đồng bộ kết quả với backend và cập nhật vé của bạn.'}
          </Text>
        </View>
        {error ? (
          <>
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
          </>
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
});
