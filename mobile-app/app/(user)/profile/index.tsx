import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Fonts } from '@/constants/theme';
import { useAppStore } from '@/lib/app-store';
import { normalizePosterUrl } from '@/lib/image-url';

type ProfileMenuItem = {
  icon: string;
  label: string;
  sublabel: string;
  route: string;
  color: string;
  isDanger?: boolean;
};

type ProfileMenuGroup = {
  title: string;
  items: ProfileMenuItem[];
};

export default function ProfileScreen() {
  const { currentUser, logout } = useAppStore();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  const avatarUrl = currentUser?.avatarUrl
    ? normalizePosterUrl(currentUser.avatarUrl)
    : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

  const menuGroups: ProfileMenuGroup[] = [
    {
      title: 'Tài khoản & Bảo mật',
      items: [
        {
          icon: 'person-outline',
          label: 'Thông tin cá nhân',
          sublabel: 'Tên hiển thị, email, số điện thoại...',
          route: '/profile/edit',
          color: '#E87A22',
        },
        {
          icon: 'key-outline',
          label: 'Đổi mật khẩu',
          sublabel: 'Cập nhật mật khẩu đăng nhập',
          route: '/profile/change-password',
          color: '#3B82F6',
        },
      ],
    },
    {
      title: 'Cài đặt ứng dụng',
      items: [
        {
          icon: 'notifications-outline',
          label: 'Cài đặt thông báo',
          sublabel: 'Kênh nhận tin vé và khuyến mãi',
          route: '/profile/notifications',
          color: '#10B981',
        },
        {
          icon: 'color-palette-outline',
          label: 'Tuỳ chỉnh giao diện',
          sublabel: 'Ngôn ngữ, theme sáng/tối...',
          route: '/profile/appearance',
          color: '#8B5CF6',
        },
      ],
    },
    {
      title: 'Hỗ trợ & Thông tin',
      items: [
        {
          icon: 'headset-outline',
          label: 'Trung tâm hỗ trợ',
          sublabel: 'Liên hệ, FAQ, hotline...',
          route: '/profile/support',
          color: '#3B82F6',
        },
        {
          icon: 'document-text-outline',
          label: 'Điều khoản sử dụng',
          sublabel: 'Quy định và điều kiện dịch vụ',
          route: '/profile/terms',
          color: '#6366F1',
        },
        {
          icon: 'shield-checkmark-outline',
          label: 'Chính sách bảo mật',
          sublabel: 'Cách chúng tôi bảo vệ dữ liệu',
          route: '/profile/privacy',
          color: '#10B981',
        },
      ],
    },
    {
      title: 'Khác',
      items: [
        {
          icon: 'trash-outline',
          label: 'Xóa tài khoản',
          sublabel: 'Yêu cầu gỡ bỏ tài khoản vĩnh viễn',
          route: '/profile/delete-account',
          color: '#EF4444',
          isDanger: true,
        },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.headerCard}>
        <Image source={{ uri: avatarUrl || undefined }} style={styles.avatarImage} />
        <View style={styles.profileTextContainer}>
          <Text style={styles.profileName}>
            {currentUser?.fullName || 'Khách hàng'}
          </Text>
          <Text style={styles.profileEmail}>{currentUser?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {currentUser?.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
            </Text>
          </View>
        </View>
      </View>

      {/* Menu Groups */}
      {menuGroups.map((group, groupIdx) => (
        <View key={groupIdx} style={styles.groupContainer}>
          <Text style={styles.groupTitle}>{group.title}</Text>
          <View style={styles.groupCard}>
            {group.items.map((item, itemIdx) => (
              <TouchableOpacity
                key={itemIdx}
                onPress={() => router.push(item.route as any)}
                style={[
                  styles.menuItem,
                  itemIdx === group.items.length - 1 && styles.lastMenuItem,
                ]}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: `${item.color}15` },
                  ]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={item.color}
                  />
                </View>

                <View style={styles.menuTextContainer}>
                  <Text
                    style={[
                      styles.menuLabel,
                      item.isDanger && styles.dangerLabel,
                    ]}
                  >
                    {item.label}
                  </Text>
                  <Text style={styles.menuSublabel}>{item.sublabel}</Text>
                </View>

                <Ionicons
                  name="chevron-forward-outline"
                  size={16}
                  color="#A1A1AA"
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Logout Button */}
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBF7',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#5A3E2B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3E8DC',
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F3E8DC',
  },
  profileTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontFamily: Fonts.sansBold,
    color: '#5A3E2B',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: Fonts.sans,
    color: '#8A6A50',
    marginBottom: 6,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF2E0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 11,
    fontFamily: Fonts.sansMedium,
    color: '#E87A22',
  },
  groupContainer: {
    marginBottom: 20,
  },
  groupTitle: {
    fontSize: 13,
    fontFamily: Fonts.sansBold,
    color: '#8A6A50',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 8,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#5A3E2B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3E8DC',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FAF5EF',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  menuLabel: {
    fontSize: 15,
    fontFamily: Fonts.sansMedium,
    color: '#5A3E2B',
  },
  dangerLabel: {
    color: '#EF4444',
  },
  menuSublabel: {
    fontSize: 12,
    fontFamily: Fonts.sans,
    color: '#A1A1AA',
    marginTop: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutText: {
    fontSize: 15,
    fontFamily: Fonts.sansBold,
    color: '#EF4444',
    marginLeft: 8,
  },
});
