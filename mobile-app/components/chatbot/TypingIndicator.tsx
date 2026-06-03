import React, { useRef, useEffect } from "react";
import { Animated, StyleSheet, View, useColorScheme } from "react-native";

export function TypingIndicator() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  const animDot = (dot: Animated.Value, delay: number) =>
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(dot, {
          toValue: -6,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dot, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(600),
      ])
    );

  useEffect(() => {
    Animated.parallel([
      animDot(dot1, 0),
      animDot(dot2, 200),
      animDot(dot3, 400),
    ]).start();
  }, [dot1, dot2, dot3]);

  const dotColor = isDark ? "#4a4a6a" : "#9999aa";
  const bg = isDark ? "#14141e" : "#f0f0f8";
  const border = isDark ? "#2a2a3a" : "#dddde8";

  return (
    <View style={[styles.row]}>
      <View style={[styles.avatar, { backgroundColor: "#1a1a2e", borderColor: "#2a2a3a" }]}>
      </View>
      <View style={[styles.bubble, { backgroundColor: bg, borderColor: border }]}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: dotColor, transform: [{ translateY: dot }] },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    alignItems: "flex-end",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderTopLeftRadius: 3,
    borderWidth: 1,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});