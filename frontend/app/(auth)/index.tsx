import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  type TextStyle,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const backgroundImage = require('../../assets/images/background-popcron.jpg');
const logoImage = require('../../assets/images/popcorn-logo-cutout.png');
const characterOne = require('../../assets/images/popcorn1-cutout.png');
const characterTwo = require('../../assets/images/popcorn2-cutout.png');

export default function LoginScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const isDesktopWeb = Platform.OS === 'web' && width >= 1024;
  const cardMinHeight = isDesktopWeb
    ? Math.min(Math.max(height * 0.56, 500), 620)
    : Math.min(Math.max(height * 0.58, 430), 540);
  const webInputReset =
    Platform.OS === 'web'
      ? ({ outlineStyle: 'none', boxShadow: 'none' } as unknown as TextStyle)
      : undefined;

  return (
    <ImageBackground
      source={backgroundImage}
      style={[styles.background, { width, minHeight: height }]}
      imageStyle={styles.backgroundImage}
      resizeMode={isDesktopWeb ? 'stretch' : 'cover'}>
      <SafeAreaView style={[styles.container, { minHeight: height }]}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" />
        <KeyboardAvoidingView
          style={styles.keyboardWrap}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.contentContainer, { minHeight: height }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}>
            <View style={styles.cardShell}>
              <Image source={logoImage} style={styles.logoFloating} />

              <View style={[styles.card, { minHeight: cardMinHeight }]}>
                <View style={styles.cardContent}>
                  <View style={styles.headerSection}>
                    <Text style={styles.title}>Popcorn Login</Text>
                    <Text style={styles.subtitle}>Sign in to continue your movie night.</Text>
                  </View>

                  <View style={styles.formSection}>
                    <View style={styles.input}>
                      <MaterialCommunityIcons name="email-outline" size={22} color="#D88922" />
                      <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Email"
                        placeholderTextColor="#B48A67"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        style={[styles.inputField, webInputReset]}
                      />
                    </View>

                    <View style={styles.input}>
                      <MaterialCommunityIcons name="lock-outline" size={22} color="#D88922" />
                      <TextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Password"
                        placeholderTextColor="#B48A67"
                        secureTextEntry
                        style={[styles.inputField, webInputReset]}
                      />
                    </View>

                    <View style={styles.options}>
                      <View style={styles.rememberControl}>
                        <Switch
                          value={rememberMe}
                          onValueChange={setRememberMe}
                          trackColor={{ false: '#E3D6BA', true: '#FFD45E' }}
                          thumbColor="#FFFDF6"
                          ios_backgroundColor="#E3D6BA"
                        />
                        <Pressable onPress={() => setRememberMe((current) => !current)}>
                          <Text style={styles.remember}>Remember me</Text>
                        </Pressable>
                      </View>

                      <Pressable
                        style={styles.forgotButton}
                        onPress={() => router.push('/forgot-password')}>
                        <Text style={styles.forgot}>Forgot password?</Text>
                      </Pressable>
                    </View>
                  </View>

                  <View style={styles.actionSection}>
                    <Pressable style={styles.button} onPress={() => router.replace('/home')}>
                      <Text style={styles.buttonText}>Login</Text>
                    </Pressable>

                    <Pressable style={styles.adminPortalButton} onPress={() => router.push('/admin')}>
                      <Text style={styles.adminPortalButtonText}>Admin portal</Text>
                    </Pressable>

                    <Pressable onPress={() => router.push('/register')}>
                      <Text style={styles.signup}>
                        Don&apos;t have an account? <Text style={styles.signupLink}>Sign up</Text>
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              <View style={styles.footerCharacters}>
                <View style={styles.footerCharactersRow}>
                  <Image source={characterOne} style={[styles.character, styles.characterLeft]} />
                  <Image source={characterTwo} style={[styles.character, styles.characterRight]} />
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(255, 249, 236, 0.04)',
  },
  keyboardWrap: {
    flex: 1,
    width: '100%',
  },
  scroll: {
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    flexGrow: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 72,
  },
  cardShell: {
    width: '88%',
    maxWidth: 420,
    alignSelf: 'center',
    position: 'relative',
    marginTop: 72,
    paddingBottom: 116,
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255, 246, 229, 0.92)',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(224, 190, 128, 0.55)',
    paddingHorizontal: 25,
    paddingTop: 42,
    paddingBottom: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  cardContent: {
    width: '100%',
    flex: 1,
    justifyContent: 'space-between',
  },
  headerSection: {
    width: '100%',
    alignItems: 'center',
  },
  formSection: {
    width: '100%',
  },
  actionSection: {
    width: '100%',
    alignItems: 'center',
  },
  logoFloating: {
    position: 'absolute',
    top: -112,
    alignSelf: 'center',
    width: 220,
    height: 150,
    resizeMode: 'contain',
    zIndex: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#5A3E2B',
    marginTop: 0,
  },
  subtitle: {
    fontSize: 14,
    color: '#8A6A50',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 241, 217, 0.94)',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(222, 197, 151, 0.65)',
  },
  inputField: {
    flex: 1,
    color: '#5A3E2B',
    paddingVertical: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
    outlineWidth: 0,
    outlineColor: 'transparent',
  },
  options: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  rememberControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  remember: {
    fontSize: 12,
    color: '#7A5A40',
  },
  forgotButton: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  forgot: {
    fontSize: 12,
    color: '#FF7A00',
    fontWeight: '600',
  },
  button: {
    width: '100%',
    backgroundColor: '#FFB347',
    padding: 14,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#C78517',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  adminPortalButton: {
    width: '100%',
    marginTop: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D7B179',
    padding: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 250, 240, 0.72)',
  },
  adminPortalButtonText: {
    color: '#6B4F3A',
    fontWeight: '600',
    fontSize: 15,
  },
  signup: {
    marginTop: 15,
    fontSize: 13,
    color: '#6B4F3A',
    textAlign: 'center',
  },
  signupLink: {
    color: '#FF8C00',
    fontWeight: '600',
  },
  footerCharacters: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 12,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  footerCharactersRow: {
    width: 220,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  character: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
  },
  characterLeft: {
    marginBottom: 4,
  },
  characterRight: {
    width: 86,
    height: 86,
  },
});
