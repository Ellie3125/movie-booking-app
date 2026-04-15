import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const backgroundImage = require('../assets/images/background-popcron.jpg');
const logoImage = require('../assets/images/popcorn-logo-cutout.png');

export default function EntryScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  return (
    <ImageBackground
      source={backgroundImage}
      style={[styles.background, { width, minHeight: height }]}
      imageStyle={styles.backgroundImage}>
      <SafeAreaView style={[styles.container, { minHeight: height }]}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" />
        <ScrollView
          contentContainerStyle={[styles.contentContainer, { minHeight: height }]}
          showsVerticalScrollIndicator={false}>
          <View style={styles.cardShell}>
            <Image source={logoImage} style={styles.logoFloating} />

            <View style={styles.card}>
              <Text style={styles.eyebrow}>BeatCinema Workspace</Text>
              <Text style={styles.title}>Chọn giao diện làm việc</Text>
              <Text style={styles.subtitle}>
                Vì hiện chưa có auth thật nên không cần giữ riêng route group `(auth)`.
                Landing page này chỉ làm cổng vào cho `Users` và `Admin`.
              </Text>

              <Pressable style={styles.primaryButton} onPress={() => router.replace('/home')}>
                <MaterialCommunityIcons name="movie-open-play" size={20} color="#FFFDF8" />
                <Text style={styles.primaryButtonText}>Vào Users App</Text>
              </Pressable>

              <Pressable style={styles.secondaryButton} onPress={() => router.push('/admin')}>
                <MaterialCommunityIcons name="shield-crown-outline" size={20} color="#6B4F3A" />
                <Text style={styles.secondaryButtonText}>Vào Admin Console</Text>
              </Pressable>
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
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  cardShell: {
    width: '100%',
    maxWidth: 420,
    paddingTop: 82,
  },
  logoFloating: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    width: 220,
    height: 150,
    resizeMode: 'contain',
    zIndex: 2,
  },
  card: {
    backgroundColor: 'rgba(255, 246, 229, 0.94)',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(224, 190, 128, 0.55)',
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 28,
    gap: 16,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: '#C57817',
    fontWeight: '800',
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#5A3E2B',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#8A6A50',
    textAlign: 'center',
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: '#E87A22',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryButtonText: {
    color: '#FFFDF8',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D7B179',
    backgroundColor: 'rgba(255, 250, 240, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  secondaryButtonText: {
    color: '#6B4F3A',
    fontSize: 15,
    fontWeight: '800',
  },
});
