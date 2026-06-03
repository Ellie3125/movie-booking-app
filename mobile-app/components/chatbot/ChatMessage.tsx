import React, { useRef, useEffect } from "react";
import { Animated, StyleSheet, View, useColorScheme } from "react-native";
import { ThemedText } from "@/components/ThemedText";

export interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  movieIds?: string[];
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  userAvatar?: string;
}

export function ChatMessage({ message, userAvatar = "👤" }: ChatMessageProps) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const isBot = message.role === "bot";

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  const colors = isDark
    ? {
        botBubble: "#14141e",
        botBorder: "#2a2a3a",
        userBubble: "#1e1e2e",
        userBorder: "rgba(232,200,74,0.25)",
        botText: "#f0eef8",
        userText: "#f0eef8",
        timeText: "#4a4a6a",
      }
    : {
        botBubble: "#f0f0f8",
        botBorder: "#dddde8",
        userBubble: "#1a1a2e",
        userBorder: "transparent",
        botText: "#1a1a2e",
        userText: "#f0eef8",
        timeText: "#9999aa",
      };

  const time = message.timestamp.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Animated.View
      style={[
        styles.row,
        isBot ? styles.rowBot : styles.rowUser,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      {/* Avatar */}
      <View style={[styles.avatar, isBot ? styles.avatarBot : styles.avatarUser]}>
        <ThemedText style={styles.avatarText}>
          {isBot ? "🎬" : userAvatar}
        </ThemedText>
      </View>

      {/* Bubble */}
      <View style={styles.bubbleWrap}>
        <View
          style={[
            styles.bubble,
            isBot
              ? [
                  styles.bubbleBot,
                  {
                    backgroundColor: colors.botBubble,
                    borderColor: colors.botBorder,
                  },
                ]
              : [
                  styles.bubbleUser,
                  {
                    backgroundColor: colors.userBubble,
                    borderColor: colors.userBorder,
                  },
                ],
          ]}
        >
          <ThemedText
            style={[
              styles.text,
              { color: isBot ? colors.botText : colors.userText },
              !isBot && styles.textRight,
            ]}
          >
            {message.text}
          </ThemedText>
        </View>
        <ThemedText
          style={[
            styles.time,
            { color: colors.timeText },
            !isBot && styles.timeRight,
          ]}
        >
          {time}
        </ThemedText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    alignItems: "flex-end",
  },
  rowBot: {
    justifyContent: "flex-start",
  },
  rowUser: {
    flexDirection: "row-reverse",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarBot: {
    backgroundColor: "#1a1a2e",
    borderWidth: 1,
    borderColor: "#2a2a3a",
  },
  avatarUser: {
    backgroundColor: "#2a1a1a",
    borderWidth: 1,
    borderColor: "rgba(255,107,107,0.3)",
  },
  avatarText: {
    fontSize: 14,
  },
  bubbleWrap: {
    maxWidth: "75%",
    gap: 3,
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  bubbleBot: {
    borderTopLeftRadius: 3,
  },
  bubbleUser: {
    borderTopRightRadius: 3,
  },
  text: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: "System",
  },
  textRight: {
    textAlign: "right",
  },
  time: {
    fontSize: 10,
    paddingHorizontal: 2,
  },
  timeRight: {
    textAlign: "right",
  },
});