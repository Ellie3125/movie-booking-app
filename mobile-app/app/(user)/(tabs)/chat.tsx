import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  SafeAreaViewBase,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// ── Types ──────────────────────────────────────────────────────────────────────
type Role = "user" | "bot";

interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
}

// ── Mock movie cards (nếu bot gợi ý phim) ─────────────────────────────────────
interface MovieCard {
  id: number;
  title: string;
  year: number;
  rating: number;
  emoji: string;
}

const MOCK_USER = {
  name: "Bob Trần",
  avatar: "👨‍🎨",
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const formatTime = (date: Date) =>
  date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

// ── Message bubble ─────────────────────────────────────────────────────────────
const Bubble = ({ msg }: { msg: Message }) => {
  const isUser = msg.role === "user";
  return (
    <View
      style={[
        styles.bubbleRow,
        isUser ? styles.bubbleRowUser : styles.bubbleRowBot,
      ]}
    >
      {!isUser && (
        <View style={styles.botAvatar}>
          <Text style={styles.botAvatarText}>🎬</Text>
        </View>
      )}
      <View style={{ maxWidth: "75%" }}>
        <View
          style={[
            styles.bubble,
            isUser ? styles.bubbleUser : styles.bubbleBot,
          ]}
        >
          <Text
            style={[
              styles.bubbleText,
              isUser ? styles.bubbleTextUser : styles.bubbleTextBot,
            ]}
          >
            {msg.text}
          </Text>
        </View>
        <Text
          style={[
            styles.timestamp,
            isUser ? styles.timestampUser : styles.timestampBot,
          ]}
        >
          {formatTime(msg.timestamp)}
        </Text>
      </View>
      {isUser && (
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>{MOCK_USER.avatar}</Text>
        </View>
      )}
    </View>
  );
};

// ── Movie suggestion chip ──────────────────────────────────────────────────────
const MovieChip = ({ movie }: { movie: MovieCard }) => (
  <View style={styles.movieChip}>
    <Text style={styles.movieEmoji}>{movie.emoji}</Text>
    <View style={{ flex: 1 }}>
      <Text style={styles.movieTitle} numberOfLines={1}>
        {movie.title}
      </Text>
      <Text style={styles.movieMeta}>
        {movie.year} · ⭐ {movie.rating}
      </Text>
    </View>
  </View>
);

// ── Quick suggestion buttons ───────────────────────────────────────────────────
const SUGGESTIONS = [
  "Gợi ý phim hành động",
  "Phim hay nhất 2023",
  "Phim tình cảm lãng mạn",
  "Phim kinh dị đặc sắc",
];

// ── Main screen ────────────────────────────────────────────────────────────────
export default function ChatScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "bot",
      text: `Xin chào ${MOCK_USER.name}! 👋 Tôi là CineBot — trợ lý gợi ý phim thông minh. Hôm nay bạn muốn xem thể loại phim gì?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const content = text ?? input.trim();
    if (!content || loading) return;

    setInput("");
    setShowSuggestions(false);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Gọi API backend
      const res = await fetch("http://127.0.0.1:8000/api/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: "user_bob_session",
          message: content,
          user_id: 7,
        }),
      });
      const data = await res.json();
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        text: data.text ?? "Có lỗi xảy ra, vui lòng thử lại.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "bot",
          text: "⚠️ Không thể kết nối server. Vui lòng kiểm tra lại.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaViewBase style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBtn}
          accessibilityLabel="Quay lại"
        >
          <Ionicons name="chevron-back" size={24} color="#1a1a2e" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.botAvatarHeader}>
            <Text style={{ fontSize: 20 }}>🎬</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>CineBot</Text>
            <Text style={styles.headerSub}>Trợ lý gợi ý phim AI</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            setMessages([
              {
                id: "0",
                role: "bot",
                text: `Xin chào ${MOCK_USER.name}! Cuộc trò chuyện mới bắt đầu. Tôi có thể giúp gì cho bạn?`,
                timestamp: new Date(),
              },
            ]);
            setShowSuggestions(true);
          }}
          style={styles.headerBtn}
          accessibilityLabel="Làm mới"
        >
          <Ionicons name="refresh-outline" size={22} color="#1a1a2e" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Bubble msg={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            loading ? (
              <View style={styles.typingRow}>
                <View style={styles.botAvatar}>
                  <Text style={styles.botAvatarText}>🎬</Text>
                </View>
                <View style={styles.typingBubble}>
                  <ActivityIndicator size="small" color="#4a90d9" />
                  <Text style={styles.typingText}>CineBot đang trả lời…</Text>
                </View>
              </View>
            ) : null
          }
        />

        {/* Quick suggestions */}
        {showSuggestions && !loading && (
          <View style={styles.suggestionsWrap}>
            <Text style={styles.suggestionsLabel}>Gợi ý nhanh</Text>
            <View style={styles.suggestionsRow}>
              {SUGGESTIONS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={styles.suggestionChip}
                  onPress={() => sendMessage(s)}
                >
                  <Text style={styles.suggestionChipText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Nhập tin nhắn…"
            placeholderTextColor="#7a9bbf"
            multiline
            maxLength={500}
            onSubmitEditing={() => sendMessage()}
            returnKeyType="send"
            blurOnSubmit
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!input.trim() || loading) && styles.sendBtnDisabled,
            ]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || loading}
            accessibilityLabel="Gửi"
          >
            <Ionicons
              name="send"
              size={20}
              color={!input.trim() || loading ? "#a0bcd8" : "#fff"}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaViewBase>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const BLUE_LIGHT = "#e8f3fb";
const BLUE_MID   = "#4a90d9";
const BLUE_DARK  = "#1a3a5c";
const BLACK      = "#1a1a2e";

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BLUE_LIGHT,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#d0e8f7",
    borderBottomWidth: 0.5,
    borderBottomColor: "#b0cfe8",
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    marginHorizontal: 8,
  },
  botAvatarHeader: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: BLUE_MID,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: BLACK,
  },
  headerSub: {
    fontSize: 12,
    color: "#4a6fa5",
  },

  // List
  list: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 12,
  },

  // Bubble
  bubbleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 4,
  },
  bubbleRowUser: {
    justifyContent: "flex-end",
  },
  bubbleRowBot: {
    justifyContent: "flex-start",
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    maxWidth: "100%",
  },
  bubbleUser: {
    backgroundColor: BLUE_MID,
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
    borderWidth: 0.5,
    borderColor: "#b0cfe8",
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  bubbleTextUser: {
    color: "#fff",
  },
  bubbleTextBot: {
    color: BLACK,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 3,
    color: "#7a9bbf",
  },
  timestampUser: {
    textAlign: "right",
  },
  timestampBot: {
    textAlign: "left",
    marginLeft: 4,
  },

  // Avatars
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#b0cfe8",
  },
  botAvatarText: {
    fontSize: 16,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#d0e8f7",
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarText: {
    fontSize: 18,
  },

  // Typing indicator
  typingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    paddingLeft: 4,
  },
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    borderWidth: 0.5,
    borderColor: "#b0cfe8",
  },
  typingText: {
    fontSize: 13,
    color: "#4a6fa5",
    fontStyle: "italic",
  },

  // Movie chip
  movieChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f0f8ff",
    borderRadius: 12,
    padding: 10,
    borderWidth: 0.5,
    borderColor: "#b0cfe8",
    marginTop: 6,
  },
  movieEmoji: {
    fontSize: 24,
  },
  movieTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: BLACK,
  },
  movieMeta: {
    fontSize: 12,
    color: "#4a6fa5",
    marginTop: 2,
  },

  // Quick suggestions
  suggestionsWrap: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  suggestionsLabel: {
    fontSize: 12,
    color: "#4a6fa5",
    marginBottom: 6,
    fontWeight: "500",
  },
  suggestionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: BLUE_MID,
  },
  suggestionChipText: {
    fontSize: 13,
    color: BLUE_MID,
    fontWeight: "500",
  },

  // Input bar
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#d0e8f7",
    borderTopWidth: 0.5,
    borderTopColor: "#b0cfe8",
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    fontSize: 15,
    color: BLACK,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: "#b0cfe8",
    lineHeight: 20,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BLUE_MID,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    backgroundColor: "#c5ddf0",
  },
});