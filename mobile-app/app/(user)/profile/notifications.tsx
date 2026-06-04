import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Fonts } from '@/constants/theme';
import { useAppStore } from '@/lib/app-store';

type NotificationPreferences = {
  email: {
    bookingConfirmation: boolean;
    promotions: boolean;
    systemUpdates: boolean;
  };
  push: {
    bookingConfirmation: boolean;
    promotions: boolean;
    showReminders: boolean;
  };
};

const DEFAULT_PREFERENCES: NotificationPreferences = {
  email: {
    bookingConfirmation: true,
    promotions: true,
    systemUpdates: true,
  },
  push: {
    bookingConfirmation: true,
    promotions: true,
    showReminders: true,
  },
};

type ToggleItemConfig = {
  key: string;
  label: string;
  sublabel: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

const EMAIL_ITEMS: ToggleItemConfig[] = [
  {
    key: 'bookingConfirmation',
    label: 'Xác nhận đặt vé',
    sublabel: 'Nhận email xác nhận sau khi đặt vé thành công',
    icon: 'ticket-outline',
    color: '#10B981',
  },
  {
    key: 'promotions',
    label: 'Khuyến mãi & ưu đãi',
    sublabel: 'Nhận thông tin ưu đãi và mã giảm giá mới nhất',
    icon: 'gift-outline',
    color: '#F59E0B',
  },
  {
    key: 'systemUpdates',
    label: 'Cập nhật hệ thống',
    sublabel: 'Thông báo bảo trì, cập nhật tính năng mới',
    icon: 'settings-outline',
    color: '#6366F1',
  },
];

const PUSH_ITEMS: ToggleItemConfig[] = [
  {
    key: 'bookingConfirmation',
    label: 'Xác nhận đặt vé',
    sublabel: 'Nhận thông báo đẩy khi đặt vé thành công',
    icon: 'checkmark-circle-outline',
    color: '#10B981',
  },
  {
    key: 'promotions',
    label: 'Khuyến mãi & ưu đãi',
    sublabel: 'Thông báo đẩy về chương trình khuyến mãi',
    icon: 'megaphone-outline',
    color: '#F59E0B',
  },
  {
    key: 'showReminders',
    label: 'Nhắc lịch chiếu',
    sublabel: 'Nhắc nhở trước giờ chiếu phim bạn đã đặt',
    icon: 'alarm-outline',
    color: '#8B5CF6',
  },
];

export default function NotificationsScreen() {
  const { updateNotificationPreferences } = useAppStore();

  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);

  const [saving, setSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  const savePreferences = useCallback(
    async (prefs: NotificationPreferences) => {
      setSaving(true);
      const res = await updateNotificationPreferences(prefs);
      setSaving(false);
      if (!res.ok) {
        Alert.alert('Lỗi', res.error || 'Không thể lưu cài đặt thông báo.');
      }
    },
    [updateNotificationPreferences]
  );

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      savePreferences(preferences);
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [preferences, savePreferences]);

  const handleToggleEmail = (key: string, value: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      email: {
        ...prev.email,
        [key]: value,
      },
    }));
  };

  const handleTogglePush = (key: string, value: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      push: {
        ...prev.push,
        [key]: value,
      },
    }));
  };

  const renderToggleItem = (
    item: ToggleItemConfig,
    value: boolean,
    onToggle: (key: string, val: boolean) => void,
    isLast: boolean
  ) => (
    <View
      key={item.key}
      style={[styles.toggleRow, !isLast && styles.toggleRowBorder]}
    >
      <View style={[styles.toggleIconCircle, { backgroundColor: item.color + '18' }]}>
        <Ionicons name={item.icon} size={20} color={item.color} />
      </View>
      <View style={styles.toggleTextContainer}>
        <Text style={styles.toggleLabel}>{item.label}</Text>
        <Text style={styles.toggleSublabel}>{item.sublabel}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={(val) => onToggle(item.key, val)}
        trackColor={{ false: '#E5E7EB', true: '#FDE68A' }}
        thumbColor={value ? '#E87A22' : '#F9FAFB'}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle-outline" size={20} color="#E87A22" />
        <Text style={styles.infoText}>
          Tùy chỉnh cách bạn nhận thông báo từ ứng dụng. Thay đổi sẽ được tự động lưu lại.
        </Text>
      </View>

      {/* Saving Indicator */}
      {saving && (
        <View style={styles.savingBanner}>
          <ActivityIndicator size="small" color="#E87A22" />
          <Text style={styles.savingText}>Đang lưu...</Text>
        </View>
      )}

      {/* Email Section */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="mail-outline" size={22} color="#E87A22" />
          <Text style={styles.sectionTitle}>Email</Text>
        </View>
        {EMAIL_ITEMS.map((item, index) =>
          renderToggleItem(
            item,
            (preferences.email as any)[item.key],
            handleToggleEmail,
            index === EMAIL_ITEMS.length - 1
          )
        )}
      </View>

      {/* Push Section */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="notifications-outline" size={22} color="#E87A22" />
          <Text style={styles.sectionTitle}>Thông báo đẩy</Text>
        </View>
        {PUSH_ITEMS.map((item, index) =>
          renderToggleItem(
            item,
            (preferences.push as any)[item.key],
            handleTogglePush,
            index === PUSH_ITEMS.length - 1
          )
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBF7',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF2E0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFE0B2',
    gap: 10,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.sansMedium,
    color: '#D86A12',
    lineHeight: 18,
  },
  savingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF8F0',
    borderRadius: 10,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  savingText: {
    fontSize: 13,
    fontFamily: Fonts.sansMedium,
    color: '#E87A22',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F3E8DC',
    marginBottom: 20,
    shadowColor: '#5A3E2B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3E8DC',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.sansBold,
    color: '#5A3E2B',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 12,
  },
  toggleRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F8F2EC',
  },
  toggleIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 14,
    fontFamily: Fonts.sansBold,
    color: '#5A3E2B',
    marginBottom: 2,
  },
  toggleSublabel: {
    fontSize: 12,
    fontFamily: Fonts.sans,
    color: '#8A6A50',
    lineHeight: 16,
  },
});