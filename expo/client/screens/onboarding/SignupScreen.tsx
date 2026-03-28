import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { GlowingPanel } from "@/components/GlowingPanel";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { register, login } = useAuth();

  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const isValidEmail = email.includes("@") && email.includes(".");
  const isValidPassword = password.length >= 6;
  const passwordsMatch = password === confirmPassword;

  const canSubmit = isLogin
    ? isValidEmail && isValidPassword
    : isValidEmail && isValidPassword && passwordsMatch;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const result = await login(email, password);
        if (result.success) {
          navigation.reset({
            index: 0,
            routes: [{ name: "BasicProfile" }],
          });
        } else {
          setError(result.error || "Login failed");
        }
      } else {
        const result = await register(email, password, name || undefined);
        if (result.success) {
          navigation.reset({
            index: 0,
            routes: [{ name: "BasicProfile" }],
          });
        } else {
          setError(result.error || "Registration failed");
        }
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      >
        <LinearGradient
          colors={[Colors.brand + "20", "transparent"]}
          style={styles.gradient}
        />

        <View style={[styles.content, { paddingTop: insets.top + Spacing.xl }]}>
          <ThemedText type="small" style={styles.osVersion} glow glowColor={Colors.brand}>
            FITSYNC OS v2.0
          </ThemedText>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Feather name="activity" size={48} color={Colors.brand} />
            </View>
            <ThemedText type="h1" style={styles.title}>
              FitSync AI
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.subtitle, { color: theme.textSecondary }]}
            >
              Your AI-powered hypertrophy coach
            </ThemedText>
          </View>

          <Card elevation={2} style={styles.formCard} translucent glowColor={Colors.brand}>
            <View style={styles.tabContainer}>
              <Pressable
                onPress={() => {
                  setIsLogin(false);
                  setError(null);
                }}
                style={[
                  styles.tab,
                  !isLogin && {
                    borderBottomColor: Colors.dark.primary,
                    borderBottomWidth: 2,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.tabText,
                    !isLogin && { color: Colors.dark.primary },
                  ]}
                >
                  Sign Up
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={() => {
                  setIsLogin(true);
                  setError(null);
                }}
                style={[
                  styles.tab,
                  isLogin && {
                    borderBottomColor: Colors.dark.primary,
                    borderBottomWidth: 2,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.tabText,
                    isLogin && { color: Colors.dark.primary },
                  ]}
                >
                  Log In
                </ThemedText>
              </Pressable>
            </View>

            {!isLogin && (
              <View style={styles.inputGroup}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Name (optional)
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.backgroundSecondary,
                      color: theme.text,
                    },
                  ]}
                  placeholder="Your name"
                  placeholderTextColor={theme.textSecondary}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  testID="input-name"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Email
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                  },
                ]}
                placeholder="your@email.com"
                placeholderTextColor={theme.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                testID="input-email"
              />
              {email.length > 0 && !isValidEmail && (
                <ThemedText type="small" style={styles.errorText}>
                  Please enter a valid email
                </ThemedText>
              )}
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Password
              </ThemedText>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    {
                      backgroundColor: theme.backgroundSecondary,
                      color: theme.text,
                    },
                  ]}
                  placeholder="Min 6 characters"
                  placeholderTextColor={theme.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  testID="input-password"
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Feather
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={theme.textSecondary}
                  />
                </Pressable>
              </View>
              {password.length > 0 && !isValidPassword && (
                <ThemedText type="small" style={styles.errorText}>
                  Password must be at least 6 characters
                </ThemedText>
              )}
            </View>

            {!isLogin && (
              <View style={styles.inputGroup}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Confirm Password
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.backgroundSecondary,
                      color: theme.text,
                    },
                  ]}
                  placeholder="Confirm your password"
                  placeholderTextColor={theme.textSecondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  testID="input-confirm-password"
                />
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <ThemedText type="small" style={styles.errorText}>
                    {"Passwords don't match"}
                  </ThemedText>
                )}
              </View>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <Feather
                  name="alert-circle"
                  size={16}
                  color={Colors.dark.error}
                />
                <ThemedText
                  type="small"
                  style={[styles.errorText, { marginLeft: 8 }]}
                >
                  {error}
                </ThemedText>
              </View>
            )}

            <Button
              onPress={handleSubmit}
              disabled={!canSubmit || loading}
              style={styles.submitButton}
              testID={isLogin ? "button-login" : "button-register"}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <ThemedText
                  style={{ color: "#FFF", fontSize: 16, fontWeight: "600" }}
                >
                  {isLogin ? "Log In" : "Create Account"}
                </ThemedText>
              )}
            </Button>
          </Card>

          <View style={styles.footer}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
            </ThemedText>
            <Pressable
              onPress={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
            >
              <ThemedText
                type="small"
                style={{ color: Colors.brand, fontWeight: "600" }}
              >
                {isLogin ? "Sign Up" : "Log In"}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  osVersion: {
    alignSelf: "center",
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.brand + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.brand + "40",
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    textAlign: "center",
  },
  formCard: {
    padding: Spacing.lg,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: Spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  input: {
    height: 48,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    marginTop: Spacing.xs,
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    top: Spacing.xs,
    height: 48,
    justifyContent: "center",
  },
  errorText: {
    color: Colors.dark.error,
    marginTop: Spacing.xs,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.error + "20",
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  submitButton: {
    marginTop: Spacing.sm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Spacing.xl,
  },
});
