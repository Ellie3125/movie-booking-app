import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Fonts } from '@/constants/theme';
import { useAppStore } from '@/lib/app-store';

type Language = 'vi' | 'en';
type Theme = 'light' | 'dark' | 'system';
type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';

const formatDate = (date: Date, format: DateFormat): string => {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = String(date.getFullYear());

  switch (format) {
    case 'DD/MM/YYYY':
      return `${dd}/${mm}/${yyyy}`;
    case 'MM/DD/YYYY':
      return `${mm}/${dd}/${yyyy}`;
    case 'YYYY-MM-DD':
      return `${yyyy}-${mm}-${dd}`;
    default:
      return `${dd}/${mm}/${yyyy}`;
  }
};

export default function AppearanceScreen() {
  const { updatePreferences } = useAppStore();

  const [language, setLanguage] = useState<Language>('vi');
  const [theme, setTheme] = useState<Theme>('system');
  const [dateFormat, setDateFormat] = useState<DateFormat>('DD/MM/YYYY');

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  const savePreferences = useCallback(
    async (newPrefs: { language?: Language; theme?: Theme; dateFormat?: DateFormat }) => {
      setSaving(true);
      setSaved(false);
      const res = await updatePreferences(newPrefs);
      setSaving(false);

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    },
    [updatePreferences]
  );

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      savePreferences({ language, theme, dateFormat });
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [language, theme, dateFormat, savePreferences]);

  const today = new Date();

  const languageOptions: { value: Language; label: string; flag: string }[] = [
    { value: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    { value: 'en', label: 'English', flag: '🇬🇧' },
  ];

  const themeOptions: { value: Theme; label: string; icon: string }[] = [
    { value: 'light', label: 'Sáng', icon: '☀️' },
    { value: 'dark', label: 'Tối', icon: '🌙' },
    { value: 'system', label: 'Hệ thống', icon: '🖥️' },
  ];

  const dateFormatOptions: { value: DateFormat; example: string }[] = [
    { value: 'DD/MM/YYYY', example: formatDate(today, 'DD/MM/YYYY') },
    { value: 'MM/DD/YYYY', example: formatDate(today, 'MM/DD/YYYY') },
    { value: 'YYYY-MM-DD', example: formatDate(today, 'YYYY-MM-DD') },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle-outline" size={20} color="#E87A22" />
        <Text style={styles.infoText}>
          Tùy chỉnh ngôn ngữ, giao diện và định dạng hiển thị theo sở thích của bạn. Thay đổi sẽ được lưu tự động.
        </Text>
      </View>

      {/* Saving Indicator */}
      {(saving || saved) && (
        <View style={styles.savingIndicator}>
          {saving ? (
            <>
              <ActivityIndicator size="small" color="#E87A22" />
              <Text style={styles.savingText}>Đang lưu...</Text>
            </>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
              <Text style={[styles.savingText, { color: '#22C55E' }]}>Đã lưu</Text>
            </>
          )}
        </View>
      )}

      {/* Section 1: Language */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Ngôn ngữ</Text>
        <View style={styles.languageRow}>
          {languageOptions.map((opt) => {
            const isActive = language === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setLanguage(opt.value)}
                style={[
                  styles.selectableCard,
                  isActive && styles.selectableCardActive,
                ]}
                activeOpacity={0.7}
              >
                <Text style={styles.cardEmoji}>{opt.flag}</Text>
                <Text
                  style={[
                    styles.cardLabel,
                    isActive && styles.cardLabelActive,
                  ]}
                >
                  {opt.label}
                </Text>
                {isActive && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Section 2: Theme */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Giao diện</Text>
        <View style={styles.themeRow}>
          {themeOptions.map((opt) => {
            const isActive = theme === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setTheme(opt.value)}
                style={[
                  styles.selectableCard,
                  styles.themeCard,
                  isActive && styles.selectableCardActive,
                ]}
                activeOpacity={0.7}
              >
                <Text style={styles.cardEmoji}>{opt.icon}</Text>
                <Text
                  style={[
                    styles.cardLabel,
                    isActive && styles.cardLabelActive,
                  ]}
                >
                  {opt.label}
                </Text>
                {isActive && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Section 3: Date Format */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Định dạng ngày</Text>
        <View style={styles.datePreview}>
          <Ionicons name="calendar-outline" size={16} color="#E87A22" />
          <Text style={styles.datePreviewText}>
            Hôm nay: {formatDate(today, dateFormat)}
          </Text>
        </View>
        <View style={styles.dateFormatList}>
          {dateFormatOptions.map((opt) => {
            const isActive = dateFormat === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setDateFormat(opt.value)}
                style={[
                  styles.radioRow,
                  isActive && styles.radioRowActive,
                ]}
                activeOpacity={0.7}
              >
                <View style={[styles.radioCircle, isActive && styles.radioCircleActive]}>
                  {isActive && <View style={styles.radioInner} />}
                </View>
                <View style={styles.radioContent}>
                  <Text
                    style={[
                      styles.radioLabel,
                      isActive && styles.radioLabelActive,
                    ]}
                  >
                    {opt.value}
                  </Text>
                  <Text style={styles.radioExample}>VD: {opt.example}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
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
  savingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
    paddingVertical: 6,
  },
  savingText: {
    fontSize: 13,
    fontFamily: Fonts.sansMedium,
    color: '#E87A22',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3E8DC',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#5A3E2B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  sectionLabel: {
    fontSize: 16,
    fontFamily: Fonts.sansBold,
    color: '#5A3E2B',
    marginBottom: 12,
  },
  languageRow: {
    flexDirection: 'row',
    gap: 12,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  selectableCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F3E8DC',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  selectableCardActive: {
    backgroundColor: '#FFF2E0',
    borderColor: '#E87A22',
  },
  themeCard: {
    paddingVertical: 14,
  },
  cardEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  cardLabel: {
    fontSize: 13,
    fontFamily: Fonts.sansMedium,
    color: '#8A6A50',
  },
  cardLabelActive: {
    color: '#E87A22',
    fontFamily: Fonts.sansBold,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#E87A22',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF7EC',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  datePreviewText: {
    fontSize: 13,
    fontFamily: Fonts.sansBold,
    color: '#E87A22',
  },
  dateFormatList: {
    gap: 8,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAF8',
    borderWidth: 1,
    borderColor: '#F3E8DC',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  radioRowActive: {
    backgroundColor: '#FFF2E0',
    borderColor: '#E87A22',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D9CCC0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#E87A22',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E87A22',
  },
  radioContent: {
    flex: 1,
  },
  radioLabel: {
    fontSize: 14,
    fontFamily: Fonts.sansMedium,
    color: '#5A3E2B',
  },
  radioLabelActive: {
    fontFamily: Fonts.sansBold,
    color: '#E87A22',
  },
  radioExample: {
    fontSize: 12,
    fontFamily: Fonts.sans,
    color: '#8A6A50',
    marginTop: 2,
  },
});