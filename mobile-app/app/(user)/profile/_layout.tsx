import { Stack } from 'expo-router';
import { Fonts } from '@/constants/theme';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FFF7EC',
        },
        headerTintColor: '#5A3E2B',
        headerTitleStyle: {
          fontFamily: Fonts.sansBold,
          fontSize: 17,
        },
        headerBackTitleStyle: {
          fontFamily: Fonts.sans,
          fontSize: 14,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Cài đặt tài khoản',
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          title: 'Thông tin cá nhân',
        }}
      />
      <Stack.Screen
        name="change-password"
        options={{
          title: 'Đổi mật khẩu',
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          title: 'Cài đặt thông báo',
        }}
      />
      <Stack.Screen
        name="appearance"
        options={{
          title: 'Tuỳ chỉnh giao diện',
        }}
      />
      <Stack.Screen
        name="delete-account"
        options={{
          title: 'Xóa tài khoản',
          headerStyle: {
            backgroundColor: '#FEE2E2',
          },
          headerTintColor: '#991B1B',
        }}
      />
      <Stack.Screen
        name="terms"
        options={{
          title: 'Điều khoản sử dụng',
        }}
      />
      <Stack.Screen
        name="privacy"
        options={{
          title: 'Chính sách bảo mật',
        }}
      />
      <Stack.Screen
        name="support"
        options={{
          title: 'Trung tâm hỗ trợ',
        }}
      />
    </Stack>
  );
}
