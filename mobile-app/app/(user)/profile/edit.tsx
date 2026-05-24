/**
 * SPEC Disclosure - EditProfileScreen:
 * 1. Autonomous Decisions:
 *    - Tích hợp thêm các trường mật khẩu (Mật khẩu hiện tại, Mật khẩu mới, Xác nhận mật khẩu mới) vào form Chỉnh sửa.
 *    - Việc thay đổi mật khẩu là tùy chọn (không bắt buộc). Form chỉ thực hiện đổi mật khẩu khi người dùng bắt đầu điền vào trường Mật khẩu mới.
 *    - Thêm icon con mắt cho phép ẩn/hiện mật khẩu trong các trường nhập mật khẩu giúp cải thiện trải nghiệm người dùng tối đa.
 *    - Hiển thị thêm dòng thông tin Mật khẩu tĩnh dạng "••••••••••••" ở chế độ xem thông tin để giao diện liền mạch.
 * 2. Deviations:
 *    - Gộp màn hình đổi mật khẩu trực tiếp vào màn hình sửa thông tin cá nhân.
 * 3. Trade-offs:
 *    - Khi đổi mật khẩu thành công, ứng dụng bắt buộc phải đăng xuất tài khoản để đảm bảo an toàn bảo mật (theo thiết kế từ backend), ta hiển thị cảnh báo rõ ràng cho người dùng trước khi đăng xuất.
 * 4. Context/Notes:
 *    - Tích hợp sử dụng `changePassword` và `logout` từ `useAppStore` của ứng dụng.
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { Fonts } from '@/constants/theme';
import { useAppStore } from '@/lib/app-store';
import { normalizePosterUrl } from '@/lib/image-url';

export default function EditProfileScreen() {
  const { currentUser, updateProfile, uploadAvatar, changePassword, logout } = useAppStore();
  const router = useRouter();

  // Mode state
  const [isEditing, setIsEditing] = useState(false);

  // Local state form fields
  const [name, setName] = useState(currentUser?.name || '');
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [dateOfBirth, setDateOfBirth] = useState(currentUser?.dateOfBirth || '');
  const [gender, setGender] = useState<any>(currentUser?.gender || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [country, setCountry] = useState(currentUser?.country || '');
  const [bio, setBio] = useState(currentUser?.bio || '');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Khôi phục giá trị form khi currentUser thay đổi hoặc khi Hủy chỉnh sửa
  const resetFormValues = () => {
    setName(currentUser?.name || '');
    setDisplayName(currentUser?.displayName || '');
    setPhone(currentUser?.phone || '');
    setDateOfBirth(currentUser?.dateOfBirth || '');
    setGender(currentUser?.gender || '');
    setAddress(currentUser?.address || '');
    setCountry(currentUser?.country || '');
    setBio(currentUser?.bio || '');

    // Reset password fields
    setCurrentPassword('');
    newPassword && setNewPassword('');
    confirmPassword && setConfirmPassword('');
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  useEffect(() => {
    resetFormValues();
  }, [currentUser]);

  const handleCancel = () => {
    resetFormValues();
    setIsEditing(false);
  };

  const handleSelectAvatar = () => {
    if (!isEditing) return; // Chỉ cho phép đổi avatar trong chế độ chỉnh sửa
    Alert.alert(
      'Cập nhật ảnh đại diện',
      'Chọn phương thức tải ảnh của bạn',
      [
        {
          text: 'Chụp ảnh mới',
          onPress: () => handlePickAvatar(true),
        },
        {
          text: 'Chọn từ thư viện',
          onPress: () => handlePickAvatar(false),
        },
        { text: 'Hủy', style: 'cancel' },
      ]
    );
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
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Quyền truy cập', 'Cần cấp quyền thư viện ảnh để chọn ảnh.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploading(true);
        const asset = result.assets[0];
        const localUri = asset.uri;
        const filename = localUri.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        const formData = new FormData();
        // @ts-ignore
        formData.append('avatar', {
          uri: localUri,
          name: filename,
          type,
        });

        const res = await uploadAvatar(formData);
        setUploading(false);
        if (res.ok) {
          Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện mới.');
        } else {
          Alert.alert('Lỗi', res.error || 'Không thể tải ảnh đại diện lên.');
        }
      }
    } catch {
      setUploading(false);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi tải ảnh lên.');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Họ tên không được để trống.');
      return;
    }

    const wantToChangePassword = newPassword.trim() !== '';

    // Validate mật khẩu nếu người dùng muốn đổi mật khẩu
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

    // 1. Cập nhật thông tin cá nhân
    const resProfile = await updateProfile({
      name,
      displayName,
      phone,
      dateOfBirth: dateOfBirth || null,
      gender,
      address,
      country,
      bio,
    });

    if (!resProfile.ok) {
      setSaving(false);
      Alert.alert('Lỗi', resProfile.error || 'Có lỗi xảy ra khi lưu thông tin cá nhân.');
      return;
    }

    // 2. Thực hiện đổi mật khẩu (nếu có yêu cầu)
    if (wantToChangePassword) {
      const resPassword = await changePassword({
        currentPassword,
        newPassword,
      });
      setSaving(false);

      if (resPassword.ok) {
        Alert.alert(
          'Thành công',
          'Đã cập nhật thông tin cá nhân và thay đổi mật khẩu mới. Bạn sẽ được đăng xuất để đăng nhập lại.',
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
          `Thông tin cá nhân đã được lưu, nhưng đổi mật khẩu thất bại: ${resPassword.error || 'Không thể đổi mật khẩu.'}`,
          [{ text: 'OK', onPress: () => setIsEditing(false) }]
        );
      }
    } else {
      setSaving(false);
      Alert.alert('Thành công', 'Thông tin hồ sơ đã được cập nhật.', [
        { text: 'OK', onPress: () => setIsEditing(false) },
      ]);
    }
  };

  const avatarUrl = currentUser?.avatar
    ? normalizePosterUrl(currentUser.avatar)
    : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

  const getGenderLabel = (g: string) => {
    switch (g) {
      case 'male':
        return 'Nam';
      case 'female':
        return 'Nữ';
      case 'other':
        return 'Khác';
      default:
        return 'Ẩn / Chưa cập nhật';
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header navigation bar */}
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#5A3E2B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Chỉnh sửa hồ sơ' : 'Thông tin cá nhân'}
          </Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Avatar Selection Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            onPress={handleSelectAvatar}
            disabled={!isEditing}
            activeOpacity={0.8}
            style={[styles.avatarWrapper, !isEditing && styles.avatarWrapperReadOnly]}
          >
            <Image source={{ uri: avatarUrl || undefined }} style={styles.avatar} />
            {isEditing && (
              <>
                {uploading ? (
                  <View style={styles.avatarOverlay}>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  </View>
                ) : (
                  <View style={styles.cameraIconBadge}>
                    <Ionicons name="camera" size={16} color="#FFFFFF" />
                  </View>
                )}
              </>
            )}
          </TouchableOpacity>
          {isEditing && <Text style={styles.avatarHelpText}>Chạm vào ảnh để thay đổi</Text>}
        </View>

        {/* Read-Only Mode (Chế độ xem) */}
        {!isEditing ? (
          <View style={styles.readOnlyContainer}>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoIconWrapper}>
                  <Ionicons name="person-outline" size={18} color="#E87A22" />
                </View>
                <View style={styles.infoTextWrapper}>
                  <Text style={styles.infoLabel}>Họ và tên</Text>
                  <Text style={styles.infoValue}>{currentUser?.name || 'Chưa cập nhật'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIconWrapper}>
                  <Ionicons name="bookmark-outline" size={18} color="#E87A22" />
                </View>
                <View style={styles.infoTextWrapper}>
                  <Text style={styles.infoLabel}>Tên hiển thị (Biệt danh)</Text>
                  <Text style={styles.infoValue}>{currentUser?.displayName || 'Chưa cập nhật'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIconWrapper}>
                  <Ionicons name="mail-outline" size={18} color="#E87A22" />
                </View>
                <View style={styles.infoTextWrapper}>
                  <Text style={styles.infoLabel}>Địa chỉ Email</Text>
                  <Text style={styles.infoValue}>{currentUser?.email}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIconWrapper}>
                  <Ionicons name="call-outline" size={18} color="#E87A22" />
                </View>
                <View style={styles.infoTextWrapper}>
                  <Text style={styles.infoLabel}>Số điện thoại</Text>
                  <Text style={styles.infoValue}>{currentUser?.phone || 'Chưa cập nhật'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIconWrapper}>
                  <Ionicons name="calendar-outline" size={18} color="#E87A22" />
                </View>
                <View style={styles.infoTextWrapper}>
                  <Text style={styles.infoLabel}>Ngày sinh</Text>
                  <Text style={styles.infoValue}>{currentUser?.dateOfBirth || 'Chưa cập nhật'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIconWrapper}>
                  <Ionicons name="transgender-outline" size={18} color="#E87A22" />
                </View>
                <View style={styles.infoTextWrapper}>
                  <Text style={styles.infoLabel}>Giới tính</Text>
                  <Text style={styles.infoValue}>{getGenderLabel(currentUser?.gender || '')}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIconWrapper}>
                  <Ionicons name="location-outline" size={18} color="#E87A22" />
                </View>
                <View style={styles.infoTextWrapper}>
                  <Text style={styles.infoLabel}>Địa chỉ cư trú</Text>
                  <Text style={styles.infoValue}>{currentUser?.address || 'Chưa cập nhật'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIconWrapper}>
                  <Ionicons name="earth-outline" size={18} color="#E87A22" />
                </View>
                <View style={styles.infoTextWrapper}>
                  <Text style={styles.infoLabel}>Quốc gia</Text>
                  <Text style={styles.infoValue}>{currentUser?.country || 'Chưa cập nhật'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIconWrapper}>
                  <Ionicons name="reader-outline" size={18} color="#E87A22" />
                </View>
                <View style={styles.infoTextWrapper}>
                  <Text style={styles.infoLabel}>Tiểu sử / Giới thiệu</Text>
                  <Text style={styles.infoValue}>{currentUser?.bio || 'Chưa cập nhật'}</Text>
                </View>
              </View>

              <View style={[styles.infoRow, styles.lastInfoRow]}>
                <View style={styles.infoIconWrapper}>
                  <Ionicons name="key-outline" size={18} color="#E87A22" />
                </View>
                <View style={styles.infoTextWrapper}>
                  <Text style={styles.infoLabel}>Mật khẩu bảo mật</Text>
                  <Text style={styles.infoValue}>••••••••••••</Text>
                </View>
              </View>
            </View>

            {/* Edit Trigger Button */}
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              style={styles.editButton}
            >
              <Ionicons name="create-outline" size={20} color="#FFFFFF" style={styles.editButtonIcon} />
              <Text style={styles.editButtonText}>Chỉnh sửa thông tin</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Editable Form Mode (Chế độ sửa) */
          <View style={styles.formContainer}>
            {/* Section: Thông tin cá nhân */}
            <Text style={styles.sectionHeading}>Thông tin cá nhân</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Họ và tên *</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Nhập họ và tên"
                style={styles.input}
                placeholderTextColor="#C7C7CD"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tên hiển thị (Biệt danh)</Text>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Nhập tên hiển thị (Biệt danh)"
                style={styles.input}
                placeholderTextColor="#C7C7CD"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                value={currentUser?.email}
                editable={false}
                style={[styles.input, styles.disabledInput]}
              />
              <Text style={styles.inputSubtext}>Email đăng nhập không thể thay đổi</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Số điện thoại</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Nhập số điện thoại"
                keyboardType="phone-pad"
                style={styles.input}
                placeholderTextColor="#C7C7CD"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ngày sinh</Text>
              <TextInput
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="YYYY-MM-DD"
                style={styles.input}
                placeholderTextColor="#C7C7CD"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Giới tính</Text>
              <View style={styles.genderContainer}>
                {[
                  { value: 'male', label: 'Nam' },
                  { value: 'female', label: 'Nữ' },
                  { value: 'other', label: 'Khác' },
                  { value: '', label: 'Ẩn' },
                ].map((g) => (
                  <TouchableOpacity
                    key={g.value}
                    onPress={() => setGender(g.value)}
                    style={[
                      styles.genderCapsule,
                      gender === g.value && styles.activeGenderCapsule,
                    ]}
                  >
                    <Text
                      style={[
                        styles.genderText,
                        gender === g.value && styles.activeGenderText,
                      ]}
                    >
                      {g.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Địa chỉ</Text>
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="Nhập địa chỉ của bạn"
                style={styles.input}
                placeholderTextColor="#C7C7CD"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Quốc gia</Text>
              <TextInput
                value={country}
                onChangeText={setCountry}
                placeholder="Nhập quốc gia"
                style={styles.input}
                placeholderTextColor="#C7C7CD"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tiểu sử / Giới thiệu ngắn</Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="Viết vài dòng giới thiệu ngắn về bạn..."
                multiline
                numberOfLines={3}
                style={[styles.input, styles.multilineInput]}
                placeholderTextColor="#C7C7CD"
              />
            </View>

            <View style={styles.divider} />

            {/* Section: Bảo mật & Đổi mật khẩu */}
            <Text style={styles.sectionHeading}>Bảo mật & Đổi mật khẩu</Text>
            <Text style={styles.sectionSubtext}>
              Chỉ điền các trường dưới đây nếu bạn muốn thay đổi mật khẩu đăng nhập của mình.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mật khẩu hiện tại</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrent}
                  placeholder="Nhập mật khẩu hiện tại"
                  style={styles.passwordInput}
                  placeholderTextColor="#C7C7CD"
                />
                <TouchableOpacity
                  onPress={() => setShowCurrent(!showCurrent)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showCurrent ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#8A6A50"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mật khẩu mới</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNew}
                  placeholder="Tối thiểu 6 ký tự"
                  style={styles.passwordInput}
                  placeholderTextColor="#C7C7CD"
                />
                <TouchableOpacity
                  onPress={() => setShowNew(!showNew)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showNew ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#8A6A50"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Xác nhận mật khẩu mới</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirm}
                  placeholder="Nhập lại mật khẩu mới"
                  style={styles.passwordInput}
                  placeholderTextColor="#C7C7CD"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirm(!showConfirm)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#8A6A50"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Action Buttons */}
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
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#F3E8DC',
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#E87A22',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarHelpText: {
    fontSize: 12,
    fontFamily: Fonts.sans,
    color: '#8A6A50',
    marginTop: 8,
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
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
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
  genderContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  genderCapsule: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3E8DC',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeGenderCapsule: {
    backgroundColor: '#FFF2E0',
    borderColor: '#E87A22',
  },
  genderText: {
    fontSize: 14,
    fontFamily: Fonts.sansMedium,
    color: '#8A6A50',
  },
  activeGenderText: {
    color: '#E87A22',
    fontFamily: Fonts.sansBold,
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
