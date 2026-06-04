import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AzureColors, Fonts } from '@/constants/theme';
import { useAppStore } from '@/lib/app-store';

export default function UsersLayout() {
  const { authStatus, isAuthenticated, currentUser } = useAppStore();

  if (authStatus === 'bootstrapping') {
    return (
      <View style={styles.loadingShell}>
        <ActivityIndicator color={AzureColors.primary} size="large" />
        <Text style={styles.loadingTitle}>Đang khởi tạo phiên người dùng</Text>
        <Text style={styles.loadingCopy}>
          Đang xác thực token đã lưu và đồng bộ dữ liệu người dùng từ backend.
        </Text>
      </View>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return <Redirect href="/" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="profile"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="movies/[id]"
        options={{ headerShown: true, title: 'Chi tiết phim', headerTitleStyle: { fontFamily: Fonts.sansBold } }}
      />
      <Stack.Screen
        name="cinemas/[id]"
        options={{ headerShown: true, title: 'Chi tiết rạp', headerTitleStyle: { fontFamily: Fonts.sansBold } }}
      />
      <Stack.Screen
        name="booking/seats"
        options={{ headerShown: true, title: 'Chọn ghế', headerTitleStyle: { fontFamily: Fonts.sansBold } }}
      />
      <Stack.Screen
        name="booking/checkout"
        options={{ headerShown: true, title: 'Thanh toán', headerTitleStyle: { fontFamily: Fonts.sansBold } }}
      />
      <Stack.Screen
        name="payment/result"
        options={{ headerShown: true, title: 'Kết quả thanh toán', headerTitleStyle: { fontFamily: Fonts.sansBold } }}
      />
      <Stack.Screen
        name="bookings/[bookingId]"
        options={{ headerShown: true, title: 'Chi tiết vé', headerTitleStyle: { fontFamily: Fonts.sansBold } }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingShell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    backgroundColor: AzureColors.appBackground,
    gap: 10,
  },
  loadingTitle: {
    fontSize: 20,
    fontFamily: Fonts.rounded,
    color: AzureColors.textPrimary,
    textAlign: 'center',
  },
  loadingCopy: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: Fonts.sans,
    color: AzureColors.textSecondary,
    textAlign: 'center',
  },
});
