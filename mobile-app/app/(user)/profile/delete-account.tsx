import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Fonts } from '@/constants/theme';
import { useAppStore } from '@/lib/app-store';

export default function DeleteAccountScreen() {
  const { deleteAccount } = useAppStore();
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isValid = password.trim().length > 0 && confirmation === 'DELETE';

  const handleDelete = async () => {
    if (!isValid) return;

    Alert.alert(
      'Xác nhận lần cuối',
      'Bạn chắc chắn muốn xóa tài khoản? Hành động này KHÔNG THỂ hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa vĩnh viễn',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            const res = await deleteAccount({
              currentPassword: password,
              confirmation,
            });
            setDeleting(false);

            if (res.ok) {
              Alert.alert(
                'Tài khoản đã bị xóa',
                'Tài khoản của bạn đã được xóa vĩnh viễn. Cảm ơn bạn đã sử dụng dịch vụ.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      router.replace('/');
                    },
                  },
                ]
              );
            } else {
              Alert.alert('Lỗi', res.error || 'Không thể xóa tài khoản. Vui lòng thử lại.');
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Warning Section */}
        <View style={styles.warningCard}>
          <Ionicons name="warning-outline" size={48} color="#EF4444" />
          <Text style={styles.warningTitle}>Xóa tài khoản vĩnh viễn</Text>
          <Text style={styles.warningDescription}>
            Khi xóa tài khoản, bạn sẽ mất tất cả dữ liệu liên quan và không thể khôi phục lại. Vui lòng đọc kỹ các hậu quả:
          </Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Ionicons name="close-circle" size={16} color="#EF4444" />
              <Text style={styles.bulletText}>Tất cả dữ liệu cá nhân sẽ bị xóa</Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="close-circle" size={16} color="#EF4444" />
              <Text style={styles.bulletText}>Lịch sử đặt vé sẽ không thể khôi phục</Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="close-circle" size={16} color="#EF4444" />
              <Text style={styles.bulletText}>Vé chưa sử dụng sẽ bị hủy</Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="close-circle" size={16} color="#EF4444" />
              <Text style={styles.bulletText}>Không thể đăng nhập lại bằng tài khoản này</Text>
            </View>
          </View>
        </View>

        {/* Input Section */}
        <View style={styles.formContainer}>
          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nhập mật khẩu xác nhận</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="Nhập mật khẩu hiện tại"
                style={styles.passwordInput}
                placeholderTextColor="#C7C7CD"
                editable={!deleting}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#8A6A50"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirmation Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Gõ DELETE để xác nhận</Text>
            <TextInput
              value={confirmation}
              onChangeText={setConfirmation}
              placeholder="DELETE"
              style={[
                styles.input,
                confirmation.length > 0 && confirmation !== 'DELETE' && styles.inputError,
              ]}
              placeholderTextColor="#FCA5A5"
              autoCapitalize="characters"
              editable={!deleting}
            />
            {confirmation.length > 0 && confirmation !== 'DELETE' && (
              <Text style={styles.errorHint}>Vui lòng gõ chính xác &quot;DELETE&quot;</Text>
            )}
          </View>
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          onPress={handleDelete}
          disabled={!isValid || deleting}
          style={[
            styles.deleteButton,
            (!isValid || deleting) && styles.deleteButtonDisabled,
          ]}
          activeOpacity={0.8}
        >
          {deleting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <View style={styles.deleteButtonContent}>
              <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
              <Text style={styles.deleteButtonText}>Xóa tài khoản của tôi</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Bottom note */}
        <Text style={styles.bottomNote}>
          Nếu bạn gặp vấn đề với tài khoản, hãy liên hệ bộ phận hỗ trợ trước khi xóa.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#FFFBF7',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  warningCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  warningTitle: {
    fontSize: 18,
    fontFamily: Fonts.sansBold,
    color: '#991B1B',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  warningDescription: {
    fontSize: 13,
    fontFamily: Fonts.sans,
    color: '#991B1B',
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.85,
  },
  bulletList: {
    width: '100%',
    gap: 10,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 4,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.sansMedium,
    color: '#991B1B',
    lineHeight: 18,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3E8DC',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#5A3E2B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: Fonts.sansBold,
    color: '#5A3E2B',
    marginBottom: 8,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3E8DC',
    borderRadius: 12,
    paddingRight: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: Fonts.sans,
    color: '#5A3E2B',
  },
  eyeButton: {
    padding: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3E8DC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: Fonts.sansBold,
    color: '#EF4444',
    letterSpacing: 2,
  },
  inputError: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  errorHint: {
    fontSize: 11,
    fontFamily: Fonts.sans,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },
  deleteButtonDisabled: {
    backgroundColor: '#FCA5A5',
    shadowOpacity: 0,
    elevation: 0,
  },
  deleteButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontFamily: Fonts.sansBold,
    color: '#FFFFFF',
  },
  bottomNote: {
    fontSize: 12,
    fontFamily: Fonts.sans,
    color: '#8A6A50',
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: 16,
  },
});
