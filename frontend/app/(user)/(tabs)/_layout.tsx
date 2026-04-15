import { Tabs } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function UsersTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#E87A22',
        tabBarInactiveTintColor: '#9A7B67',
        tabBarStyle: {
          backgroundColor: '#FFFDF7',
          borderTopColor: 'rgba(140, 104, 86, 0.18)',
          height: 68,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons color={color} name="home-variant" size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="movies"
        options={{
          title: 'Movies',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons color={color} name="movie-open" size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="cinemas"
        options={{
          title: 'Cinemas',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons color={color} name="office-building" size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Tickets',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons color={color} name="ticket-confirmation" size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons color={color} name="account-circle" size={22} />
          ),
        }}
      />
    </Tabs>
  );
}
