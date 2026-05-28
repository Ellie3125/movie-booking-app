import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { Fonts } from '@/constants/theme';
import { createAvatarUploadFormData } from '@/lib/avatar-upload';
import { useAppStore } from '@/lib/app-store';
import { fetchAvatarOptions, type BackendAvatarOption } from '@/lib/backend-api';
import { normalizePosterUrl } from '@/lib/image-url';

const MAX_AVATAR_UPLOAD_SIZE = 2 * 1024 * 1024;
const DEFAULT_AVATAR_URL =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

export default function EditProfileScreen() {
  const { currentUser, updateProfile, uploadAvatar, changePassword, logout } = useAppStore();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [presetPickerVisible, setPresetPickerVisible] = useState(false);
  const [avatarOptions, setAvatarOptions] = useState<BackendAvatarOption[]>([]);
  const [avatarOptionsLoading, setAvatarOptionsLoading] = useState(false);
  const [avatarOptionsError, setAvatarOptionsError] = useState<string | null>(null);
  const [selectedPresetUrl, setSelectedPresetUrl] = useState<string | null>(null);

  const resetFormValues = useCallback(() => {
    setFullName(currentUser?.fullName ?? '');
    setPhoneNumber(currentUser?.phoneNumber ?? '');
    setAvatarUrl(currentUser?.avatarUrl ?? null);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  }, [currentUser]);

  useEffect(() => {
    resetFormValues();
  }, [resetFormValues]);

  const loadPresetAvatars = async () => {
    setAvatarOptionsLoading(true);
    setAvatarOptionsError(null);

    try {
      const options = await fetchAvatarOptions();
      setAvatarOptions(options);
    } catch {
      setAvatarOptionsError('Không thể tải thư viện ảnh mẫu từ backend.');
    } finally {
      setAvatarOptionsLoading(false);
    }
  };

  const handleOpenPresetPicker = () => {
    setPresetPickerVisible(true);
    if (avatarOptions.length === 0 && !avatarOptionsLoading) {
      void loadPresetAvatars();
    }
  };

  const handleCancel = () => {
    resetFormValues();
    setIsEditing(false);
    setPresetPickerVisible(false);
  };

  const handlePickAvatar = async (useCamera: boolean) => {
    try {
      let result;

      if (useCamera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Quyền truy cập', 'Cần cấp quyền camera để chụp ảnh.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        if (Platform.OS !== 'web') {
          const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!permission.granted) {
            Alert.alert('Quyền truy cập', 'Cần cấp quyền thư viện ảnh để chọn ảnh.');
            return;
          }
        }

        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];
      const selectedFileSize = asset.fileSize ?? asset.file?.size;

      if (selectedFileSize && selectedFileSize > MAX_AVATAR_UPLOAD_SIZE) {
        Alert.alert('Dung lượng ảnh quá lớn', 'Vui lòng chọn ảnh đại diện không quá 2MB.');
        return;
      }

      setUploading(true);
      const formData = createAvatarUploadFormData(asset);
      const res = await uploadAvatar(formData);
      setUploading(false);

      if (res.ok) {
        setAvatarUrl(res.user?.avatarUrl ?? avatarUrl);
        setPresetPickerVisible(false);
        Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện mới.');
      } else {
        Alert.alert('Lỗi', res.error || 'Không thể tải ảnh đại diện lên.');
      }
    } catch {
      setUploading(false);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi tải ảnh lên.');
    }
  };

  const handleSelectPresetAvatar = async (option: BackendAvatarOption) => {
    setSelectedPresetUrl(option.url);
    const result = await updateProfile({ avatarUrl: option.url });
    setSelectedPresetUrl(null);

    if (result.ok) {
      setAvatarUrl(option.url);
      setPresetPickerVisible(false);
      Alert.alert('Thành công', 'Đã cập nhật ảnh mẫu làm ảnh đại diện.');
    } else {
      Alert.alert('Lỗi', result.error || 'Không thể cập nhật ảnh mẫu.');
    }
  };

  const handleSave = async () => {
    const trimmedFullName = fullName.trim();
    if (!trimmedFullName) {
      Alert.alert('Lỗi', 'Họ tên không được để trống.');
      return;
    }

    const wantToChangePassword = newPassword.trim() !== '';
    if (wantToChangePassword) {
      if (!currentPassword) {
        Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu hiện tại.');
        return;
      }
      if (newPassword.length < 6) {
        Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự.');
        return;
      }
      if (newPassword !== confirmPassword) {
        Alert.alert('Lỗi', 'Mật khẩu mới và mật khẩu xác nhận không khớp.');
        return;
      }
    }

    setSaving(true);
    const profileResult = await updateProfile({
      fullName: trimmedFullName,
      phoneNumber: phoneNumber.trim(),
      avatarUrl,
    });

    if (!profileResult.ok) {
      setSaving(false);
      Alert.alert('Lỗi', profileResult.error || 'Có lỗi xảy ra khi lưu thông tin cá nhân.');
      return;
    }

    if (!wantToChangePassword) {
      setSaving(false);
      Alert.alert('Thành công', 'Thông tin hồ sơ đã được cập nhật.', [
        { text: 'OK', onPress: () => setIsEditing(false) },
      ]);
      return;
    }

    const passwordResult = await changePassword({
      currentPassword,
      newPassword,
      confirmPassword,
    });
    setSaving(false);

    if (passwordResult.ok) {
      Alert.alert(
        'Thành công',
        'Đã cập nhật hồ sơ và mật khẩu mới. Vui lòng đăng nhập lại.',
        [
          {
            text: 'OK',
            onPress: async () => {
              await logout();
              router.replace('/');
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Cập nhật một phần',
        `Thông tin cá nhân đã được lưu, nhưng đổi mật khẩu thất bại: ${passwordResult.error || 'Không thể đổi mật khẩu.'}`,
        [{ text: 'OK', onPress: () => setIsEditing(false) }]
      );
    }
  };

  const normalizedAvatarUrl = avatarUrl ? normalizePosterUrl(avatarUrl) : DEFAULT_AVATAR_URL;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#5A3E2B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Chỉnh sửa hồ sơ' : 'Thông tin cá nhân'}
          </Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <View style={styles.avatarSection}>
          <TouchableOpacity
            onPress={isEditing ? handleOpenPresetPicker : undefined}
            disabled={!isEditing}
            activeOpacity={0.8}
            style={[styles.avatarWrapper, !isEditing && styles.avatarWrapperReadOnly]}
            accessibilityRole="button"
            accessibilityLabel="Mở thư viện ảnh mẫu"
          >
            <Image source={{ uri: normalizedAvatarUrl || undefined }} style={styles.avatarImage} />
            {isEditing ? (
              uploading ? (
                <View style={styles.avatarOverlay}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                </View>
              ) : (
                <View style={styles.cameraIconBadge}>
                  <Ionicons name="camera" size={16} color="#FFFFFF" />
                </View>
              )
            ) : null}
          </TouchableOpacity>

          {isEditing ? (
            <>
              <Text style={styles.avatarHelpText}>Tải ảnh mới hoặc chọn ảnh mẫu từ backend</Text>
              <View style={styles.avatarActionRow}>
                <TouchableOpacity
                  onPress={() => handlePickAvatar(false)}
                  disabled={uploading || saving}
                  style={[styles.avatarActionButton, styles.avatarActionButtonPrimary]}
                  accessibilityRole="button"
                >
                  <Ionicons name="cloud-upload-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.avatarActionPrimaryText}>Tải ảnh lên</Text>
                </TouchableOpacity>

                {Platform.OS !== 'web' ? (
                  <TouchableOpacity
                    onPress={() => handlePickAvatar(true)}
                    disabled={uploading || saving}
                    style={styles.avatarActionButton}
                    accessibilityRole="button"
                  >
                    <Ionicons name="camera-outline" size={16} color="#E87A22" />
                    <Text style={styles.avatarActionText}>Chụp ảnh</Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  onPress={handleOpenPresetPicker}
                  disabled={uploading || saving}
                  style={styles.avatarActionButton}
                  accessibilityRole="button"
                >
                  <Ionicons name="images-outline" size={16} color="#E87A22" />
                  <Text style={styles.avatarActionText}>Chọn ảnh mẫu</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : null}

          {isEditing && presetPickerVisible ? (
            <View style={styles.avatarPresetPanel}>
              <View style={styles.avatarPresetHeader}>
                <View>
                  <Text style={styles.avatarPresetTitle}>Ảnh mẫu từ backend</Text>
                  <Text style={styles.avatarPresetSubtitle}>Chọn ảnh có sẵn trong thư viện backend</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setPresetPickerVisible(false)}
                  style={styles.avatarPresetCloseButton}
                  accessibilityRole="button"
                  accessibilityLabel="Đóng thư viện ảnh mẫu"
                >
                  <Ionicons name="close" size={18} color="#8A6A50" />
                </TouchableOpacity>
              </View>

              {avatarOptionsLoading ? (
                <View style={styles.avatarPresetStatus}>
                  <ActivityIndicator color="#E87A22" size="small" />
                  <Text style={styles.avatarPresetStatusText}>Đang tải ảnh mẫu...</Text>
                </View>
              ) : avatarOptionsError ? (
                <View style={styles.avatarPresetStatus}>
                  <Text style={styles.avatarPresetErrorText}>{avatarOptionsError}</Text>
                  <TouchableOpacity
                    onPress={loadPresetAvatars}
                    style={styles.avatarPresetRetryButton}
                    accessibilityRole="button"
                  >
                    <Text style={styles.avatarPresetRetryText}>Thử lại</Text>
                  </TouchableOpacity>
                </View>
              ) : avatarOptions.length === 0 ? (
                <View style={styles.avatarPresetStatus}>
                  <Text style={styles.avatarPresetStatusText}>
                    Backend chưa có ảnh mẫu nào để chọn.
                  </Text>
                </View>
              ) : (
                <View style={styles.avatarPresetGrid}>
                  {avatarOptions.map((option) => {
                    const optionUrl = normalizePosterUrl(option.url);
                    const isSelected = avatarUrl === option.url;
                    const isUpdating = selectedPresetUrl === option.url;

                    return (
                      <TouchableOpacity
                        key={option.name}
                        onPress={() => handleSelectPresetAvatar(option)}
                        disabled={saving || uploading || Boolean(selectedPresetUrl)}
                        style={[
                          styles.avatarPresetItem,
                          isSelected && styles.avatarPresetItemSelected,
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={`Chọn ảnh mẫu ${option.name}`}
                      >
                        <Image
                          source={{ uri: optionUrl || undefined }}
                          style={styles.avatarPresetImage}
                        />
                        {(isSelected || isUpdating) ? (
                          <View style={styles.avatarPresetSelectedBadge}>
                            {isUpdating ? (
                              <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                            )}
                          </View>
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          ) : null}
        </View>

        {!isEditing ? (
          <View style={styles.readOnlyContainer}>
            <View style={styles.infoCard}>
              <InfoRow icon="person-outline" label="Họ và tên" value={currentUser?.fullName || 'Chưa cập nhật'} />
              <InfoRow icon="mail-outline" label="Địa chỉ Email" value={currentUser?.email || 'Chưa cập nhật'} />
              <InfoRow icon="call-outline" label="Số điện thoại" value={currentUser?.phoneNumber || 'Chưa cập nhật'} />
              <InfoRow icon="key-outline" label="Mật khẩu bảo mật" value="••••••••••••" isLast />
            </View>

            <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
              <Ionicons name="create-outline" size={20} color="#FFFFFF" style={styles.editButtonIcon} />
              <Text style={styles.editButtonText}>Chỉnh sửa thông tin</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formContainer}>
            <Text style={styles.sectionHeading}>Thông tin cá nhân</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Họ và tên *</Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Nhập họ và tên"
                style={styles.input}
                placeholderTextColor="#C7C7CD"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                value={currentUser?.email ?? ''}
                editable={false}
                style={[styles.input, styles.disabledInput]}
              />
              <Text style={styles.inputSubtext}>Email đăng nhập không thể thay đổi</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Số điện thoại</Text>
              <TextInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Nhập số điện thoại"
                keyboardType="phone-pad"
                style={styles.input}
                placeholderTextColor="#C7C7CD"
              />
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionHeading}>Bảo mật & Đổi mật khẩu</Text>
            <Text style={styles.sectionSubtext}>
              Chỉ điền các trường dưới đây nếu bạn muốn thay đổi mật khẩu đăng nhập.
            </Text>

            <PasswordInput
              label="Mật khẩu hiện tại"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              visible={showCurrent}
              onToggleVisible={() => setShowCurrent((value) => !value)}
              placeholder="Nhập mật khẩu hiện tại"
            />
            <PasswordInput
              label="Mật khẩu mới"
              value={newPassword}
              onChangeText={setNewPassword}
              visible={showNew}
              onToggleVisible={() => setShowNew((value) => !value)}
              placeholder="Tối thiểu 6 ký tự"
            />
            <PasswordInput
              label="Xác nhận mật khẩu mới"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              visible={showConfirm}
              onToggleVisible={() => setShowConfirm((value) => !value)}
              placeholder="Nhập lại mật khẩu mới"
            />

            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={handleCancel}
                disabled={saving || uploading}
                style={[styles.actionButton, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Hủy bỏ</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSave}
                disabled={saving || uploading}
                style={[styles.actionButton, styles.saveButton]}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function InfoRow({
  icon,
  label,
  value,
  isLast,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.infoRow, isLast && styles.lastInfoRow]}>
      <View style={styles.infoIconWrapper}>
        <Ionicons name={icon} size={18} color="#E87A22" />
      </View>
      <View style={styles.infoTextWrapper}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function PasswordInput({
  label,
  value,
  onChangeText,
  visible,
  onToggleVisible,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  visible: boolean;
  onToggleVisible: () => void;
  placeholder: string;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.passwordInputContainer}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!visible}
          placeholder={placeholder}
          style={styles.passwordInput}
          placeholderTextColor="#C7C7CD"
        />
        <TouchableOpacity onPress={onToggleVisible} style={styles.eyeButton}>
          <Ionicons
            name={visible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color="#8A6A50"
          />
        </TouchableOpacity>
      </View>
    </View>
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
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 0,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.sansBold,
    color: '#5A3E2B',
  },
  headerPlaceholder: {
    width: 32,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
    shadowColor: '#5A3E2B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarWrapperReadOnly: {
    shadowOpacity: 0.05,
    elevation: 1,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#F3E8DC',
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E87A22',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarHelpText: {
    fontSize: 12,
    fontFamily: Fonts.sans,
    color: '#8A6A50',
    marginTop: 8,
  },
  avatarActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 12,
  },
  avatarActionButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#FFF8EF',
    borderWidth: 1,
    borderColor: '#F3B76C',
  },
  avatarActionButtonPrimary: {
    backgroundColor: '#E87A22',
    borderColor: '#E87A22',
  },
  avatarActionText: {
    fontSize: 13,
    fontFamily: Fonts.sansBold,
    color: '#E87A22',
  },
  avatarActionPrimaryText: {
    fontSize: 13,
    fontFamily: Fonts.sansBold,
    color: '#FFFFFF',
  },
  avatarPresetPanel: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3E8DC',
    borderRadius: 18,
    padding: 14,
    marginTop: 14,
  },
  avatarPresetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  avatarPresetTitle: {
    fontSize: 14,
    fontFamily: Fonts.sansBold,
    color: '#5A3E2B',
  },
  avatarPresetSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.sans,
    color: '#8A6A50',
    marginTop: 2,
  },
  avatarPresetCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8EF',
  },
  avatarPresetStatus: {
    minHeight: 88,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  avatarPresetStatusText: {
    fontSize: 13,
    fontFamily: Fonts.sans,
    color: '#8A6A50',
    textAlign: 'center',
  },
  avatarPresetErrorText: {
    fontSize: 13,
    fontFamily: Fonts.sansMedium,
    color: '#C2410C',
    textAlign: 'center',
  },
  avatarPresetRetryButton: {
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF2E0',
    borderWidth: 1,
    borderColor: '#E87A22',
  },
  avatarPresetRetryText: {
    fontSize: 13,
    fontFamily: Fonts.sansBold,
    color: '#E87A22',
  },
  avatarPresetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  avatarPresetItem: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    backgroundColor: '#F3E8DC',
  },
  avatarPresetItemSelected: {
    borderColor: '#E87A22',
  },
  avatarPresetImage: {
    width: '100%',
    height: '100%',
  },
  avatarPresetSelectedBadge: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232, 122, 34, 0.34)',
  },
  readOnlyContainer: {
    gap: 20,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F3E8DC',
    paddingHorizontal: 18,
    paddingVertical: 6,
    shadowColor: '#5A3E2B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#FAF5EF',
  },
  lastInfoRow: {
    borderBottomWidth: 0,
  },
  infoIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF2E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  infoTextWrapper: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: Fonts.sans,
    color: '#8A6A50',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontFamily: Fonts.sansMedium,
    color: '#5A3E2B',
  },
  editButton: {
    backgroundColor: '#E87A22',
    borderRadius: 16,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E87A22',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  editButtonIcon: {
    marginRight: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontFamily: Fonts.sansBold,
    color: '#FFFFFF',
  },
  formContainer: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 16,
    fontFamily: Fonts.sansBold,
    color: '#5A3E2B',
    marginBottom: 16,
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#FAF5EF',
    marginVertical: 24,
  },
  sectionSubtext: {
    fontSize: 13,
    fontFamily: Fonts.sans,
    color: '#8A6A50',
    marginBottom: 16,
    lineHeight: 18,
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
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3E8DC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: Fonts.sans,
    color: '#5A3E2B',
  },
  disabledInput: {
    backgroundColor: '#F7F2EB',
    borderColor: '#EFE6DA',
    color: '#8A6A50',
  },
  inputSubtext: {
    fontSize: 11,
    fontFamily: Fonts.sans,
    color: '#A1A1AA',
    marginTop: 4,
    marginLeft: 4,
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
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 28,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#FFF2E0',
    borderWidth: 1,
    borderColor: '#E87A22',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: Fonts.sansBold,
    color: '#E87A22',
  },
  saveButton: {
    backgroundColor: '#E87A22',
    shadowColor: '#E87A22',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: Fonts.sansBold,
    color: '#FFFFFF',
  },
});
