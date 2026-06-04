import { useRouter } from "expo-router";
import React from "react";
import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

export function ChatBubble() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.bubble}
        onPress={() => router.push("../(tabs)/chat")}
      >
        <View style={styles.dot} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 20,
    bottom: 30,
    zIndex: 999,
  },

  bubble: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFB247",

    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },

  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFF",
  },
});