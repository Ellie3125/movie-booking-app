import { Link } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function ForgotPasswordScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>Placeholder screen for password recovery.</Text>
        <Link href="/" style={styles.link}>
          Back to login
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF8ED',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#5A3E2B',
  },
  subtitle: {
    fontSize: 15,
    color: '#8A6A50',
    textAlign: 'center',
  },
  link: {
    color: '#FF8C00',
    fontSize: 15,
    fontWeight: '600',
  },
});
