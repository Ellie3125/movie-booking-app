import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import { useAppStore } from '@/lib/app-store';

export default function UsersLayout() {
  const { authStatus, isAuthenticated, currentUser } = useAppStore();

  if (authStatus === 'bootstrapping') {
    return (
      <View style={styles.loadingShell}>
        <ActivityIndicator color="#E87A22" size="large" />
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

  if (currentUser.role === 'admin') {
    return <Redirect href="/admin" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="(tabs)" />
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
    backgroundColor: '#FFF7EC',
    gap: 10,
  },
  loadingTitle: {
    fontSize: 20,
    fontFamily: Fonts.rounded,
    color: '#5A3E2B',
    textAlign: 'center',
  },
  loadingCopy: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: Fonts.sans,
    color: '#8A6A50',
    textAlign: 'center',
  },
});
