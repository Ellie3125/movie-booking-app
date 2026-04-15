import { Stack } from 'expo-router';

export default function UserLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="movies/[id]" options={{ title: 'Movie Details', headerShown: true }} />
      <Stack.Screen name="bookings/checkout" options={{ title: 'Checkout', headerShown: true }} />
    </Stack>
  );
}
