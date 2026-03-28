import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  loading?: boolean;
  onClear?: () => void;
  autoFocus?: boolean;
  editable?: boolean;
}

export function SearchInput({
  value,
  onChangeText,
  placeholder = "Search...",
  loading = false,
  onClear,
  autoFocus = false,
  editable = true,
}: SearchInputProps) {
  const { theme } = useTheme();

  const handleClear = () => {
    onChangeText("");
    onClear?.();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <Feather
        name="search"
        size={20}
        color={theme.textSecondary}
        style={styles.icon}
      />
      <TextInput
        style={[styles.input, { color: theme.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        autoFocus={autoFocus}
        editable={editable}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {loading ? (
        <ActivityIndicator
          size="small"
          color={Colors.dark.primary}
          style={styles.rightIcon}
        />
      ) : value.length > 0 ? (
        <Pressable onPress={handleClear} hitSlop={8} style={styles.rightIcon}>
          <Feather name="x-circle" size={18} color={theme.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Spacing.sm,
  },
  rightIcon: {
    marginLeft: Spacing.sm,
  },
});

export default SearchInput;
