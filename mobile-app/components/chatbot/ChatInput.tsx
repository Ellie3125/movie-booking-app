import React, { useState, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Hỏi tôi về phim...",
}: ChatInputProps) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const [text, setText] = useState("");
  const sendScale = useRef(new Animated.Value(1)).current;

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    // Bounce animation
    Animated.sequence([
      Animated.timing(sendScale, {
        toValue: 0.88,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(sendScale, {
        toValue: 1,
        tension: 200,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
    onSend(trimmed);
    setText("");
  };

  const colors = isDark
    ? {
        wrap: "#111118",
        border: "#2a2a3a",
        focusBorder: "#e8c84a",
        input: "#f0eef8",
        placeholder: "#4a4a6a",
        send: "#e8c84a",
        sendIcon: "#0a0a0f",
        hint: "#4a4a6a",
      }
    : {
        wrap: "#ffffff",
        border: "#dddde8",
        focusBorder: "#1a1a2e",
        input: "#1a1a2e",
        placeholder: "#9999bb",
        send: "#1a1a2e",
        sendIcon: "#ffffff",
        hint: "#9999bb",
      };

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <View style={[styles.container, { backgroundColor: colors.wrap, borderTopColor: colors.border }]}>
      <View style={[styles.row, { borderColor: canSend ? colors.focusBorder : colors.border }]}>
        <TextInput
          style={[styles.input, { color: colors.input }]}
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          multiline
          maxLength={500}
          editable={!disabled}
        />
        <Animated.View style={{ transform: [{ scale: sendScale }] }}>
          <Pressable
            onPress={handleSend}
            disabled={!canSend}
            style={[
              styles.sendBtn,
              {
                backgroundColor: canSend ? colors.send : "transparent",
                borderColor: colors.border,
                borderWidth: canSend ? 0 : 1,
              },
            ]}
          >
            <ThemedText style={[styles.sendIcon, { color: canSend ? colors.sendIcon : colors.placeholder }]}>
              ➤
            </ThemedText>
          </Pressable>
        </Animated.View>
      </View>
      <ThemedText style={[styles.hint, { color: colors.hint }]}>
        Nhấn ↵ để gửi
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    maxHeight: 100,
    fontFamily: "System",
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sendIcon: {
    fontSize: 14,
  },
  hint: {
    fontSize: 10,
    textAlign: "center",
    marginTop: 6,
  },
});