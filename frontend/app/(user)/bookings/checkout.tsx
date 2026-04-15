import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function CheckoutScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Checkout</Text>
        <Text style={styles.subtitle}>Placeholder checkout screen for the customer booking flow.</Text>
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
});
