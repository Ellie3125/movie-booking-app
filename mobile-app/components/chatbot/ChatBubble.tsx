import React, { useRef, useEffect } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";

interface ChatBubbleProps {
  onPress: () => void;
  hasUnread?: boolean;
}

export function ChatBubble({ onPress, hasUnread = false }: ChatBubbleProps) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const pulse = useRef(new Animated.Value(1)).current;
  const float = useRef(new Animated.Value(0)).current;

  // Floating animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: -6,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [float]);

  // Pulse on unread
  useEffect(() => {
    if (hasUnread) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1.15,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulse.stopAnimation();
      pulse.setValue(1);
    }
  }, [hasUnread, pulse]);

  const colors = isDark
    ? { bubble: "#E8C84A", icon: "#0a0a0f", ring: "rgba(232,200,74,0.25)" }
    : { bubble: "#1a1a2e", icon: "#f0eef8", ring: "rgba(26,26,46,0.2)" };

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { transform: [{ translateY: float }, { scale: pulse }] },
      ]}
    >
      {/* Glow ring */}
      <Animated.View
        style={[
          styles.ring,
          { backgroundColor: colors.ring, transform: [{ scale: pulse }] },
        ]}
      />
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.bubble,
          { backgroundColor: colors.bubble, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <ThemedText style={[styles.icon, { color: colors.icon }]}>
          🎬
        </ThemedText>
      </Pressable>

      {hasUnread && (
        <View style={[styles.badge, { borderColor: isDark ? "#0a0a0f" : "#fff" }]} />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 32,
    right: 24,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  ring: {
    position: "absolute",
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  bubble: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  icon: {
    fontSize: 26,
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#ff6b6b",
    borderWidth: 2,
  },
});