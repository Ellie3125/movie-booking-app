import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fonts } from '@/constants/theme';
import { useAppStore } from '@/lib/app-store';

const backgroundImage = require('../assets/images/background-popcron.jpg');
const mascotTopImage = require('../assets/images/popcorn-logo-cutout.png');
const mascotLeftImage = require('../assets/images/popcorn1-cutout.png');
const mascotRightImage = require('../assets/images/popcorn2-cutout.png');

type AuthMode = 'login' | 'register';
type FieldErrors = Partial<Record<'name' | 'email' | 'password' | 'confirmPassword', string>>;

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export default function EntryScreen() {
  const router = useRouter();
  const { height } = useWindowDimensions();
  const { authStatus, isAuthenticated, login, register } = useAppStore();

  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberSession, setRememberSession] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Redirect href="/home" />;
  }

  const isBootstrapping = authStatus === 'bootstrapping';
  const isBusy = isSubmitting || isBootstrapping;

  const handleModeChange = (nextMode: AuthMode) => {
    setMode(nextMode);
    setFieldErrors({});
    setFormError(null);
    setPassword('');
    setConfirmPassword('');

    if (nextMode === 'login') {
      setName('');
    }
  };

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
    setFormError(null);
  };

  const validateForm = () => {
    const nextErrors: FieldErrors = {};
    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (mode === 'register' && trimmedName.length < 2) {
      nextErrors.name = 'Tên phải có ít nhất 2 ký tự.';
    }

    if (!normalizedEmail) {
      nextErrors.email = 'Email là bắt buộc.';
    } else if (!isValidEmail(normalizedEmail)) {
      nextErrors.email = 'Email không hợp lệ.';
    }

    if (!password.trim()) {
      nextErrors.password = 'Mật khẩu là bắt buộc.';
    } else if (password.trim().length < 6) {
      nextErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
    }

    if (mode === 'register' && confirmPassword !== password) {
      nextErrors.confirmPassword = 'Mật khẩu nhập lại không khớp.';
    }

    setFieldErrors(nextErrors);

    return {
      isValid: Object.keys(nextErrors).length === 0,
      trimmedName,
      normalizedEmail,
    };
  };

  const handleUserAuth = async () => {
    const { isValid, trimmedName, normalizedEmail } = validateForm();

    if (!isValid) {
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const result =
      mode === 'login'
        ? await login({
            email: normalizedEmail,
            password,
            persistSession: rememberSession,
          })
        : await register({
            name: trimmedName,
            email: normalizedEmail,
            password,
            persistSession: rememberSession,
          });

    setIsSubmitting(false);

    if (!result.ok) {
      setFormError(result.error || 'Không thể xác thực với backend.');
      return;
    }

    router.replace('/home');
  };

  const handleForgotPassword = () => {
    setFormError('Chức năng quên mật khẩu chưa được triển khai.');
  };

  const renderInput = ({
    icon,
    placeholder,
    value,
    onChangeText,
    error,
    secureTextEntry = false,
    keyboardType,
  }: {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    placeholder: string;
    value: string;
    onChangeText: (value: string) => void;
    error?: string;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address';
  }) => (
    <View style={styles.fieldGroup}>
      <View style={[styles.inputShell, error ? styles.inputShellError : null]}>
        <MaterialCommunityIcons name={icon} size={20} color="#F0A439" />
        <TextInput
          autoCapitalize={
            keyboardType === 'email-address' || secureTextEntry ? 'none' : 'words'
          }
          autoCorrect={false}
          editable={!isBusy}
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#C9A278"
          secureTextEntry={secureTextEntry}
          style={styles.input}
          value={value}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );

  return (
    <ImageBackground
      source={backgroundImage}
      style={[styles.background, { minHeight: height }]}
      imageStyle={styles.backgroundImage}>
      <View style={styles.overlay} />
      <SafeAreaView style={[styles.container, { minHeight: height }]}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" />
        <ScrollView
          contentContainerStyle={[styles.contentContainer, { minHeight: height }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.screen}>
            <View style={styles.heroWrap}>
              <Image source={mascotTopImage} style={styles.heroMascot} />
            </View>

            <View style={styles.card}>
              <Text style={styles.title}>
                {mode === 'login' ? 'Đăng nhập Popcorn' : 'Đăng ký Popcorn'}
              </Text>

              <View style={styles.formArea}>
                {mode === 'register'
                  ? renderInput({
                      icon: 'account-outline',
                      placeholder: 'Họ và tên',
                      value: name,
                      onChangeText: (value) => {
                        setName(value);
                        clearFieldError('name');
                      },
                      error: fieldErrors.name,
                    })
                  : null}

                {renderInput({
                  icon: 'email-outline',
                  placeholder: 'Email',
                  value: email,
                  onChangeText: (value) => {
                    setEmail(value);
                    clearFieldError('email');
                  },
                  error: fieldErrors.email,
                  keyboardType: 'email-address',
                })}

                {renderInput({
                  icon: 'lock-outline',
                  placeholder: 'Mật khẩu',
                  value: password,
                  onChangeText: (value) => {
                    setPassword(value);
                    clearFieldError('password');
                  },
                  error: fieldErrors.password,
                  secureTextEntry: true,
                })}

                {mode === 'register'
                  ? renderInput({
                      icon: 'shield-check-outline',
                      placeholder: 'Nhập lại mật khẩu',
                      value: confirmPassword,
                      onChangeText: (value) => {
                        setConfirmPassword(value);
                        clearFieldError('confirmPassword');
                      },
                      error: fieldErrors.confirmPassword,
                      secureTextEntry: true,
                    })
                  : null}

                {mode === 'login' ? (
                  <View style={styles.utilityRow}>
                    <Pressable
                      style={styles.rememberRow}
                      disabled={isBusy}
                      onPress={() => setRememberSession((current) => !current)}>
                      <View
                        style={[
                          styles.toggleTrack,
                          rememberSession ? styles.toggleTrackActive : null,
                        ]}>
                        <View
                          style={[
                            styles.toggleThumb,
                            rememberSession ? styles.toggleThumbActive : null,
                          ]}
                        />
                      </View>
                      <Text style={styles.utilityText}>Ghi nhớ đăng nhập</Text>
                    </Pressable>

                    <Pressable disabled={isBusy} onPress={handleForgotPassword}>
                      <Text style={styles.forgotText}>Quên mật khẩu?</Text>
                    </Pressable>
                  </View>
                ) : null}

                {formError ? <Text style={styles.formError}>{formError}</Text> : null}

                <Pressable
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && !isBusy ? styles.buttonPressed : null,
                    isBusy ? styles.buttonDisabled : null,
                  ]}
                  disabled={isBusy}
                  onPress={handleUserAuth}>
                  {isBusy ? (
                    <ActivityIndicator color="#FFFDF8" size="small" />
                  ) : null}
                  <Text style={styles.primaryButtonText}>
                    {isBootstrapping
                      ? 'Đang tải...'
                      : mode === 'login'
                        ? 'Đăng nhập'
                        : 'Đăng ký'}
                  </Text>
                </Pressable>

                <View style={styles.footerLine}>
                  <Text style={styles.footerText}>
                    {mode === 'login'
                      ? 'Chưa có tài khoản?'
                      : 'Đã có tài khoản?'}
                  </Text>
                  <Pressable
                    disabled={isBusy}
                    onPress={() => handleModeChange(mode === 'login' ? 'register' : 'login')}>
                    <Text style={styles.footerLink}>
                      {mode === 'login' ? 'Đăng ký' : 'Đăng nhập'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>

            <View style={styles.bottomMascots}>
              <Image source={mascotLeftImage} style={styles.bottomMascotLeft} />
              <Image source={mascotRightImage} style={styles.bottomMascotRight} />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    opacity: 0.84,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 246, 226, 0.36)',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 30,
  },
  screen: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    paddingTop: 78,
    paddingBottom: 22,
  },
  heroWrap: {
    position: 'absolute',
    top: -34,
    alignItems: 'center',
    justifyContent: 'center',
    width: 144,
    height: 144,
    zIndex: 3,
  },
  heroMascot: {
    width: 116,
    height: 116,
    resizeMode: 'contain',
  },
  card: {
    width: '100%',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(230, 208, 169, 0.78)',
    backgroundColor: 'rgba(255, 249, 238, 0.96)',
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 24,
    shadowColor: '#D39A48',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 5,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: Fonts.rounded,
    color: '#65462E',
    textAlign: 'center',
  },
  formArea: {
    marginTop: 22,
    gap: 14,
  },
  fieldGroup: {
    gap: 6,
  },
  inputShell: {
    minHeight: 44,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0DEBA',
    backgroundColor: '#FFF5E4',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
  },
  inputShellError: {
    borderColor: '#E68767',
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.sansMedium,
    color: '#6C4C36',
    paddingVertical: 10,
  },
  utilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 2,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleTrack: {
    width: 38,
    height: 18,
    borderRadius: 999,
    backgroundColor: '#FFC64A',
    padding: 2,
    justifyContent: 'center',
  },
  toggleTrackActive: {
    backgroundColor: '#FFC64A',
  },
  toggleThumb: {
    width: 14,
    height: 14,
    borderRadius: 999,
    backgroundColor: '#FFF6E7',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
    backgroundColor: '#0D9FA7',
  },
  utilityText: {
    fontSize: 13,
    fontFamily: Fonts.sansMedium,
    color: '#7B654E',
  },
  forgotText: {
    fontSize: 13,
    fontFamily: Fonts.sansBold,
    color: '#FF8E2A',
  },
  formError: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: Fonts.sansBold,
    color: '#C15C44',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: Fonts.sansBold,
    color: '#C15C44',
    paddingHorizontal: 4,
  },
  primaryButton: {
    minHeight: 48,
    marginTop: 8,
    borderRadius: 999,
    backgroundColor: '#FFB247',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    shadowColor: '#F0A234',
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    elevation: 5,
  },
  primaryButtonText: {
    fontSize: 17,
    fontFamily: Fonts.sansBold,
    color: '#FFFDF7',
  },
  buttonPressed: {
    opacity: 0.92,
  },
  buttonDisabled: {
    opacity: 0.72,
  },
  footerLine: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  footerText: {
    fontSize: 13,
    fontFamily: Fonts.sansMedium,
    color: '#8C735C',
  },
  footerLink: {
    fontSize: 13,
    fontFamily: Fonts.sansBold,
    color: '#FF8E2A',
  },
  bottomMascots: {
    width: '100%',
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 6,
  },
  bottomMascotLeft: {
    width: 62,
    height: 62,
    resizeMode: 'contain',
  },
  bottomMascotRight: {
    width: 66,
    height: 66,
    resizeMode: 'contain',
  },
});
