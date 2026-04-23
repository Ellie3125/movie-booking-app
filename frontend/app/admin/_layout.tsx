import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import { useAppStore } from '@/lib/app-store';

export default function AdminLayout() {
  const { authStatus, isAuthenticated, currentUser } = useAppStore();

  if (authStatus === 'bootstrapping') {
    return (
      <View style={styles.loadingShell}>
        <ActivityIndicator color="#58D0FF" size="large" />
        <Text style={styles.loadingTitle}>Đang khởi tạo phiên quản trị</Text>
        <Text style={styles.loadingCopy}>
          Đang xác minh quyền truy cập vào khu vực quản lý hệ thống.
        </Text>
      </View>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return <Redirect href="/" />;
  }

  if (currentUser.role !== 'admin') {
    return <Redirect href="/home" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#09111F',
        },
        headerTintColor: '#F8FAFC',
        headerTitleStyle: {
          fontFamily: Fonts.sansBold,
        },
        contentStyle: {
          backgroundColor: '#09111F',
        },
      }}>
      <Stack.Screen name="index" options={{ title: 'Bảng điều khiển' }} />
      <Stack.Screen name="admins/index" options={{ title: 'Tài khoản admin' }} />
      <Stack.Screen name="movies/index" options={{ title: 'Quản lý phim' }} />
      <Stack.Screen name="cinemas/index" options={{ title: 'Quản lý rạp' }} />
      <Stack.Screen name="rooms/index" options={{ title: 'Quản lý phòng chiếu' }} />
      <Stack.Screen name="rooms/[roomId]/seat-layout" options={{ title: 'Sơ đồ ghế' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingShell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    backgroundColor: '#09111F',
    gap: 10,
  },
  loadingTitle: {
    fontSize: 20,
    fontFamily: Fonts.rounded,
    color: '#EFF6FF',
    textAlign: 'center',
  },
  loadingCopy: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: Fonts.sans,
    color: '#9FB0D0',
    textAlign: 'center',
  },
});
