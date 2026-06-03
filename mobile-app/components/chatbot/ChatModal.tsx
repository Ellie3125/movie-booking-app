import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ChatMessage, Message } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";

const { height: SCREEN_H } = Dimensions.get("window");
const SHEET_HEIGHT = SCREEN_H * 0.85;

const BE_URL = "http://localhost:8000"; // ← đổi thành IP thực khi test trên device

interface ChatModalProps {
  visible: boolean;
  onClose: () => void;
  userId?: number;
  username?: string;
  userAvatar?: string;
}

export function ChatModal({
  visible,
  onClose,
  userId,
  username = "anonymous",
  userAvatar = "👤",
}: ChatModalProps) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const slideY   = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const flatRef = useRef<FlatList>(null);

  const sessionId = `user_${username}_session`;

  // Quick-send chips
  const CHIPS = [
    { label: "🎯 Phim cho tôi",    text: "Gợi ý phim phù hợp với sở thích của tôi" },
    { label: "⭐ Top phim hay",    text: "Phim có điểm đánh giá cao nhất?" },
    { label: "💥 Hành động",       text: "Phim hành động hay nhất hiện tại?" },
    { label: "❤️ Tình cảm",        text: "Tôi muốn xem phim tình cảm lãng mạn" },
    { label: "👻 Kinh dị",         text: "Phim kinh dị đáng sợ nhất?" },
  ];

  // ── Animation ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideY, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(backdrop, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      // Welcome message
      if (messages.length === 0) {
        setMessages([
          {
            id: "welcome",
            role: "bot",
            text: `Xin chào! 👋 Tôi là **CineBot** — trợ lý gợi ý phim AI.\n\nBộ nhớ phiên đã sẵn sàng. Bạn muốn xem gì hôm nay?`,
            timestamp: new Date(),
          },
        ]);
      }
    } else {
      Animated.parallel([
        Animated.timing(slideY, {
          toValue: SHEET_HEIGHT,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(backdrop, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideY, backdrop, messages.length]);

  // ── Send ────────────────────────────────────────────────────────────────────

  const sendMessage = useCallback(
    async (text: string) => {
      const userMsg: Message = {
        id:        Date.now().toString(),
        role:      "user",
        text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);

      try {
        const res  = await fetch(`${BE_URL}/api/chat/`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            user_id:    userId ?? null,
            message:    text,
          }),
        });
        const data = await res.json();
        const botMsg: Message = {
          id:        (Date.now() + 1).toString(),
          role:      "bot",
          text:      data.reply ?? "Xin lỗi, có lỗi xảy ra.",
          movieIds:  data.movie_ids ?? [],
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id:        (Date.now() + 1).toString(),
            role:      "bot",
            text:      "❌ Không thể kết nối BE. Kiểm tra server đang chạy chưa.",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsTyping(false);
        setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
      }
    },
    [sessionId, userId]
  );

  // ── Colors ──────────────────────────────────────────────────────────────────

  const colors = isDark
    ? {
        sheet:    "#0a0a0f",
        header:   "#111118",
        border:   "#2a2a3a",
        handle:   "#3a3a4a",
        accent:   "#e8c84a",
        close:    "#4a4a6a",
        chipBg:   "#1a1a24",
        chipText: "#7a7a9a",
        title:    "#f0eef8",
        subtitle: "#7a7a9a",
        dot:      "#4af0c8",
      }
    : {
        sheet:    "#ffffff",
        header:   "#fafafa",
        border:   "#ebebf0",
        handle:   "#d0d0dd",
        accent:   "#1a1a2e",
        close:    "#9999bb",
        chipBg:   "#f0f0f8",
        chipText: "#6666aa",
        title:    "#1a1a2e",
        subtitle: "#7777aa",
        dot:      "#22cc88",
      };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          { opacity: backdrop, backgroundColor: "rgba(0,0,0,0.55)" },
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            height:          SHEET_HEIGHT,
            backgroundColor: colors.sheet,
            transform:       [{ translateY: slideY }],
          },
        ]}
      >
        {/* Handle */}
        <View style={styles.handleWrap}>
          <View style={[styles.handle, { backgroundColor: colors.handle }]} />
        </View>

        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <View style={[styles.logoBox, { backgroundColor: colors.accent }]}>
              <ThemedText style={styles.logoIcon}>🎬</ThemedText>
            </View>
            <View>
              <ThemedText style={[styles.title, { color: colors.title }]}>
                CineBot
              </ThemedText>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: colors.dot }]} />
                <ThemedText style={[styles.statusText, { color: colors.subtitle }]}>
                  Đang hoạt động
                </ThemedText>
              </View>
            </View>
          </View>
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
            <ThemedText style={[styles.closeIcon, { color: colors.close }]}>✕</ThemedText>
          </Pressable>
        </View>

        {/* Quick chips */}
        <View style={[styles.chipsOuter, { borderBottomColor: colors.border }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            {CHIPS.map((c) => (
              <Pressable
                key={c.label}
                onPress={() => sendMessage(c.text)}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    backgroundColor: colors.chipBg,
                    borderColor:     colors.border,
                    opacity:         pressed ? 0.7 : 1,
                  },
                ]}
              >
                <ThemedText style={[styles.chipText, { color: colors.chipText }]}>
                  {c.label}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Messages */}
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={0}
        >
          <FlatList
            ref={flatRef}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => (
              <ChatMessage message={item} userAvatar={userAvatar} />
            )}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatRef.current?.scrollToEnd({ animated: true })
            }
            ListFooterComponent={isTyping ? <TypingIndicator /> : null}
          />

          <ChatInput onSend={sendMessage} disabled={isTyping} />
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    position: "absolute",
    bottom:   0,
    left:     0,
    right:    0,
    borderTopLeftRadius:  24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 24,
  },
  flex: { flex: 1 },
  handleWrap: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical:   12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems:    "center",
    gap: 12,
  },
  logoBox: {
    width:        38,
    height:       38,
    borderRadius: 11,
    alignItems:   "center",
    justifyContent: "center",
  },
  logoIcon: { fontSize: 18 },
  title: {
    fontSize:   17,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  statusRow: {
    flexDirection: "row",
    alignItems:    "center",
    gap: 5,
    marginTop: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
  },
  closeBtn: {
    width:  32,
    height: 32,
    alignItems:     "center",
    justifyContent: "center",
  },
  closeIcon: { fontSize: 16 },
  chipsOuter: {
    borderBottomWidth: 1,
    paddingVertical:   8,
  },
  chips: {
    paddingHorizontal: 14,
    gap: 7,
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical:    7,
    borderRadius:      20,
    borderWidth:       1,
  },
  chipText: {
    fontSize:   12,
    fontWeight: "500",
  },
  messagesList: {
    paddingTop: 16,
    paddingBottom: 8,
  },
});