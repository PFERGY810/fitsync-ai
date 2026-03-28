import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
} from "react-native-reanimated";

const AnimatedView = Animated.createAnimatedComponent(View);

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { getUserProfile } from "@/lib/storage";
import { getApiUrl } from "@/lib/query-client";
import type { OnboardingProfile } from "@/types/onboarding";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Category buttons matching the reference mockup
const HEALTH_CATEGORIES = [
  { id: "sleep", icon: "moon", label: "Sleep", color: "#9B59B6" },
  { id: "cardio", icon: "heart", label: "Cardio", color: "#E74C3C" },
  { id: "supplements", icon: "package", label: "Supplements", color: "#2ECC71" },
  { id: "healing", icon: "activity", label: "Healing", color: "#3498DB" },
];

const QUICK_PROMPTS = [
  "Analyze my bloodwork",
  "Analyze my bloodwork",
];

export default function AICoachScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userProfile = await getUserProfile();
      setProfile(userProfile);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendChatMessage = async (messageText?: string) => {
    const text = messageText || chatInput.trim();
    if (!text || sendingMessage) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setChatInput("");
    setSendingMessage(true);

    try {
      const conversationHistory = updatedMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch(
        new URL("/api/coach/chat", getApiUrl()).toString(),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            profile: profile,
            profileId: profile?.id,
            userId: (profile as any)?.userId,
            conversationHistory: conversationHistory.slice(-6),
            context: {
              macros: profile?.calculatedMacros,
              program: (profile as any)?.generatedProgram,
              physiqueAnalysis: profile?.physiqueAnalysis,
            },
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API error:", errorData);
        throw new Error(errorData?.error || "Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Sorry, I encountered an error: ${error?.message || "Unknown error"}. Please try again.`,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const categoryLabel = HEALTH_CATEGORIES.find(c => c.id === categoryId)?.label;
    sendChatMessage(`Tell me about optimizing my ${categoryLabel?.toLowerCase()}`);
  };

  const renderChatMessage = ({
    item,
  }: {
    item: ChatMessage;
  }) => (
    <AnimatedView
      entering={FadeInUp.duration(300).delay(50)}
      style={[
        styles.messageContainer,
        item.role === "user"
          ? styles.userMessageContainer
          : styles.assistantMessageContainer,
      ]}
    >
      {item.role === "assistant" ? (
        <View
          style={[
            styles.avatarContainer,
            { backgroundColor: Colors.brand },
          ]}
        >
          <Feather name="cpu" size={16} color="#000" />
        </View>
      ) : null}
      <View
        style={[
          styles.messageBubble,
          item.role === "user"
            ? [styles.userBubble, { backgroundColor: Colors.brand }]
            : [
              styles.assistantBubble,
              { backgroundColor: theme.backgroundSecondary },
            ],
        ]}
      >
        <ThemedText
          type="body"
          style={{
            color: item.role === "user" ? "#000" : theme.text,
            lineHeight: 24,
            fontSize: 15,
          }}
        >
          {item.content}
        </ThemedText>
      </View>
    </AnimatedView>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      {/* Header */}
      <AnimatedView
        entering={FadeIn.duration(500)}
        style={styles.headerSection}
      >
        <View style={styles.headerRow}>
          <Feather name="chevron-left" size={24} color={theme.text} />
          <ThemedText type="h3" style={styles.headerTitle}>
            Healthmaxx & AI Coach Chat
          </ThemedText>
          <View style={{ width: 24 }} />
        </View>
      </AnimatedView>

      {/* Category Buttons */}
      <AnimatedView
        entering={FadeInDown.duration(400).delay(100)}
        style={styles.categoriesContainer}
      >
        {HEALTH_CATEGORIES.map((category, index) => (
          <Pressable
            key={category.id}
            style={[
              styles.categoryButton,
              { backgroundColor: category.color + "20" },
              selectedCategory === category.id && { borderColor: category.color, borderWidth: 2 },
            ]}
            onPress={() => handleCategoryPress(category.id)}
          >
            <View
              style={[
                styles.categoryIcon,
                { backgroundColor: category.color },
              ]}
            >
              <Feather name={category.icon as any} size={20} color="#fff" />
            </View>
            <ThemedText type="small" style={styles.categoryLabel}>
              {category.label}
            </ThemedText>
          </Pressable>
        ))}
      </AnimatedView>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      {/* AI Avatar and Welcome */}
      <AnimatedView
        entering={FadeInDown.duration(400).delay(200)}
        style={styles.welcomeSection}
      >
        <View style={[styles.aiAvatar, { backgroundColor: Colors.brand }]}>
          <Feather name="cpu" size={32} color="#000" />
        </View>
        <ThemedText type="body" style={styles.welcomeText}>
          Hello, Coach. We cracked your health scan to shows how your
          body likes to work to help you dial your lifestyle.
        </ThemedText>
      </AnimatedView>

      {/* Quick Prompts */}
      <AnimatedView
        entering={FadeInDown.duration(400).delay(300)}
        style={styles.quickPromptsContainer}
      >
        <Pressable
          style={[styles.quickPromptButton, { borderColor: theme.border }]}
          onPress={() => sendChatMessage("What are my bloodwork?")}
        >
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            What are my bloodwork?
          </ThemedText>
        </Pressable>
      </AnimatedView>

      {/* Bottom Quick Actions */}
      <AnimatedView
        entering={FadeInDown.duration(400).delay(400)}
        style={styles.bottomActions}
      >
        <Pressable
          style={[styles.actionPill, { backgroundColor: theme.backgroundSecondary }]}
          onPress={() => sendChatMessage("Analyze my bloodwork")}
        >
          <ThemedText type="small" style={{ color: theme.text }}>
            Analyze my bloodwork
          </ThemedText>
        </Pressable>
        <Pressable
          style={[styles.actionPill, { backgroundColor: theme.backgroundSecondary }]}
          onPress={() => sendChatMessage("Analyze my bloodwork")}
        >
          <ThemedText type="small" style={{ color: theme.text }}>
            Analyze my bloodwork
          </ThemedText>
        </Pressable>
      </AnimatedView>
    </View>
  );

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: theme.backgroundRoot },
        ]}
      >
        <ActivityIndicator size="large" color={Colors.brand} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={headerHeight}
    >
      <FlatList
        ref={flatListRef}
        data={chatMessages}
        renderItem={renderChatMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.chatList,
          { paddingTop: headerHeight + Spacing.md },
          chatMessages.length === 0 && styles.emptyList,
        ]}
        onContentSizeChange={() => {
          if (chatMessages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: true });
          }
        }}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {sendingMessage ? (
        <AnimatedView
          entering={FadeIn.duration(200)}
          style={[
            styles.typingIndicator,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <View
            style={[
              styles.smallAvatar,
              { backgroundColor: Colors.brand },
            ]}
          >
            <Feather name="cpu" size={14} color="#000" />
          </View>
          <View style={styles.typingDots}>
            <View style={[styles.dot, { backgroundColor: Colors.brand }]} />
            <View
              style={[
                styles.dot,
                { backgroundColor: Colors.brand, opacity: 0.7 },
              ]}
            />
            <View
              style={[
                styles.dot,
                { backgroundColor: Colors.brand, opacity: 0.4 },
              ]}
            />
          </View>
        </AnimatedView>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          {
            paddingBottom: insets.bottom + Spacing.sm,
            borderTopColor: theme.border,
          },
        ]}
      >
        <View
          style={[
            styles.inputWrapper,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <TextInput
            style={[styles.textInput, { color: theme.text }]}
            placeholder="Ask your AI coach..."
            placeholderTextColor={theme.textSecondary}
            value={chatInput}
            onChangeText={setChatInput}
            multiline
            maxLength={1000}
            testID="input-chat"
          />
          <Pressable
            style={[
              styles.sendButton,
              {
                backgroundColor: chatInput.trim()
                  ? Colors.brand
                  : "transparent",
              },
            ]}
            onPress={() => sendChatMessage()}
            disabled={!chatInput.trim() || sendingMessage}
            testID="button-send"
          >
            <Feather
              name="arrow-up"
              size={20}
              color={chatInput.trim() ? "#000" : theme.textSecondary}
            />
          </Pressable>
        </View>
        <ThemedText
          type="small"
          style={[styles.disclaimer, { color: theme.textSecondary }]}
        >
          AI can make mistakes. Verify important advice with professionals.
        </ThemedText>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  chatList: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyStateContainer: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  headerSection: {
    marginBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    textAlign: "center",
    flex: 1,
  },
  categoriesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  categoryButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  categoryLabel: {
    textAlign: "center",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginVertical: Spacing.lg,
  },
  welcomeSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  aiAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeText: {
    flex: 1,
    lineHeight: 22,
    opacity: 0.9,
  },
  quickPromptsContainer: {
    marginBottom: Spacing.xl,
  },
  quickPromptButton: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  bottomActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionPill: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    alignItems: "center",
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: Spacing.md,
    maxWidth: "90%",
  },
  userMessageContainer: {
    alignSelf: "flex-end",
  },
  assistantMessageContainer: {
    alignSelf: "flex-start",
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  smallAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  messageBubble: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    maxWidth: "100%",
    flexShrink: 1,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderBottomLeftRadius: 4,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginLeft: Spacing.md,
    marginBottom: Spacing.sm,
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  typingDots: {
    flexDirection: "row",
    gap: 4,
    marginLeft: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  inputContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: BorderRadius.xl,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.xs,
    paddingVertical: Spacing.xs,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    maxHeight: 120,
    paddingVertical: Spacing.sm,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.sm,
  },
  disclaimer: {
    textAlign: "center",
    marginTop: Spacing.sm,
    fontSize: 11,
  },
});
