import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { reloadAppAsync } from "expo";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Slider } from "@/components/Slider";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { storage } from "@/lib/storage";
import { getApiUrl } from "@/lib/query-client";
import type { UserProfile, MacroTargets } from "@/types";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [macros, setMacros] = useState<MacroTargets | null>(null);
  const [height, setHeight] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft">("cm");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const [userProfile, macroTargets] = await Promise.all([
        storage.getUserProfile(),
        storage.getMacroTargets(),
      ]);
      if (userProfile) {
        setProfile(userProfile);
        const unit = userProfile.heightUnit === "in" ? "ft" : "cm";
        setHeightUnit(unit);
        if (unit === "ft" && userProfile.height) {
          const totalInches = userProfile.height;
          setHeightFeet(Math.floor(totalInches / 12).toString());
          setHeightInches((totalInches % 12).toString());
          setHeight("");
        } else {
          setHeight(userProfile.height?.toString() || "");
          setHeightFeet("");
          setHeightInches("");
        }
        setWeight(userProfile.weight.toString());
        setAge(userProfile.age.toString());
      }
      setMacros(macroTargets || null);
    };
    loadData();
  }, []);

  const handleSaveProfile = async () => {
    if (!profile) return;
    const heightValue =
      heightUnit === "ft"
        ? (parseInt(heightFeet) || 0) * 12 + (parseInt(heightInches) || 0)
        : parseFloat(height) || 0;
    const heightUnitToSave = heightUnit === "ft" ? "in" : "cm";

    await storage.saveUserProfile({
      ...profile,
      height: heightValue,
      heightUnit: heightUnitToSave,
      weight: parseFloat(weight) || 0,
      age: parseInt(age) || 0,
      sex: profile?.sex || "male",
      goal: profile?.goal || "recomp",
      experienceLevel: profile?.experienceLevel || "intermediate",
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSaveMacros = async () => {
    if (!macros) return;
    await storage.saveMacroTargets(macros);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleClearData = async () => {
    const doClear = async () => {
      await storage.clearAllData();
      if (Platform.OS === "web") {
        window.location.reload();
      } else {
        await reloadAppAsync();
      }
    };

    if (Platform.OS === "web") {
      if (confirm("Reset app and start fresh onboarding?")) {
        await doClear();
      }
    } else {
      Alert.alert(
        "Reset App",
        "This will clear all your data and restart onboarding. Continue?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Reset",
            style: "destructive",
            onPress: doClear,
          },
        ],
      );
    }
  };

  const handleExportData = async () => {
    if (!profile?.id) {
      Alert.alert("Export Unavailable", "No profile ID found.");
      return;
    }
    try {
      const response = await fetch(
        new URL(`/api/profile/${profile.id}/export`, getApiUrl()).toString(),
      );
      if (!response.ok) {
        throw new Error("Export failed");
      }
      const data = await response.json();
      console.log("GDPR export payload:", data);
      Alert.alert(
        "Export Ready",
        "Your data export is ready. Check console logs for the full payload.",
      );
    } catch (error) {
      console.error("Export error:", error);
      Alert.alert("Export Failed", "Unable to export your data right now.");
    }
  };

  const handleDeleteAccount = async () => {
    const doDelete = async () => {
      await storage.clearAllData();
      if (Platform.OS === "web") {
        window.location.reload();
      } else {
        await reloadAppAsync();
      }
    };

    Alert.alert(
      "Delete Data",
      "This will permanently delete your data and restart onboarding. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: doDelete },
      ],
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <Card elevation={2} style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Profile
        </ThemedText>
        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Height ({heightUnit === "ft" ? "ft/in" : "cm"})
            </ThemedText>
            {heightUnit === "ft" ? (
              <View style={styles.heightRow}>
                <TextInput
                  style={[
                    styles.heightInput,
                    {
                      backgroundColor: theme.backgroundSecondary,
                      color: theme.text,
                    },
                  ]}
                  value={heightFeet}
                  onChangeText={(text) =>
                    setHeightFeet(text.replace(/[^0-9]/g, ""))
                  }
                  keyboardType="number-pad"
                  placeholder="5"
                  placeholderTextColor={theme.textSecondary}
                  maxLength={1}
                />
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  ft
                </ThemedText>
                <TextInput
                  style={[
                    styles.heightInput,
                    {
                      backgroundColor: theme.backgroundSecondary,
                      color: theme.text,
                    },
                  ]}
                  value={heightInches}
                  onChangeText={(text) => {
                    const num = text.replace(/[^0-9]/g, "");
                    if (parseInt(num) <= 11 || num === "") setHeightInches(num);
                  }}
                  keyboardType="number-pad"
                  placeholder="8"
                  placeholderTextColor={theme.textSecondary}
                  maxLength={2}
                />
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  in
                </ThemedText>
                <Pressable
                  onPress={() => setHeightUnit("cm")}
                  style={[
                    styles.unitToggle,
                    { backgroundColor: theme.backgroundSecondary },
                  ]}
                >
                  <ThemedText type="small">cm</ThemedText>
                </Pressable>
              </View>
            ) : (
              <View style={styles.heightRow}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.backgroundSecondary,
                      color: theme.text,
                    },
                  ]}
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="decimal-pad"
                  placeholder="175"
                  placeholderTextColor={theme.textSecondary}
                />
                <Pressable
                  onPress={() => setHeightUnit("ft")}
                  style={[
                    styles.unitToggle,
                    { backgroundColor: theme.backgroundSecondary },
                  ]}
                >
                  <ThemedText type="small">ft</ThemedText>
                </Pressable>
              </View>
            )}
          </View>
          <View style={styles.inputGroup}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Weight ({profile?.weightUnit || "lbs"})
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.text,
                },
              ]}
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              placeholder="180"
              placeholderTextColor={theme.textSecondary}
            />
          </View>
          <View style={styles.inputGroup}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Age
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.text,
                },
              ]}
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              placeholder="30"
              placeholderTextColor={theme.textSecondary}
            />
          </View>
        </View>
        <Button onPress={handleSaveProfile} style={styles.saveButton}>
          Save Profile
        </Button>
      </Card>

      <Card elevation={2} style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Privacy & Data
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          Export or delete your data at any time.
        </ThemedText>
        <View style={styles.privacyButtons}>
          <Button variant="secondary" onPress={handleExportData}>
            Export My Data
          </Button>
          <Button variant="ghost" onPress={handleDeleteAccount}>
            Delete My Data
          </Button>
        </View>
      </Card>

      <Card elevation={2} style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Daily Macro Targets
        </ThemedText>
        {macros ? (
          <>
            <Slider
              label="Calories"
              value={macros.calories}
              onValueChange={(val) => setMacros({ ...macros, calories: val })}
              minimumValue={1200}
              maximumValue={5000}
              step={50}
            />
            <Slider
              label="Protein (g)"
              value={macros.protein}
              onValueChange={(val) => setMacros({ ...macros, protein: val })}
              minimumValue={50}
              maximumValue={350}
              step={5}
            />
            <Slider
              label="Carbs (g)"
              value={macros.carbs}
              onValueChange={(val) => setMacros({ ...macros, carbs: val })}
              minimumValue={50}
              maximumValue={600}
              step={5}
            />
            <Slider
              label="Fat (g)"
              value={macros.fat}
              onValueChange={(val) => setMacros({ ...macros, fat: val })}
              minimumValue={30}
              maximumValue={200}
              step={5}
            />
            <Button onPress={handleSaveMacros} style={styles.saveButton}>
              Save Macros
            </Button>
          </>
        ) : (
          <>
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              Macros not set
            </ThemedText>
            <ThemedText
              type="small"
              style={{ color: theme.textSecondary, marginTop: Spacing.xs }}
            >
              Complete onboarding or calculate macros to enable editing.
            </ThemedText>
          </>
        )}
      </Card>

      <Pressable
        onPress={() => navigation.navigate("CompoundInfo")}
        style={({ pressed }) => [
          styles.menuItem,
          { backgroundColor: theme.backgroundDefault },
          pressed && { opacity: 0.7 },
        ]}
      >
        <View style={styles.menuItemContent}>
          <View
            style={[
              styles.menuIcon,
              { backgroundColor: "rgba(255, 69, 0, 0.15)" },
            ]}
          >
            <Feather name="info" size={20} color={Colors.dark.primary} />
          </View>
          <View style={styles.menuTextContainer}>
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              Compound Information
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Educational information about common cycles
            </ThemedText>
          </View>
        </View>
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      </Pressable>

      <Pressable
        onPress={handleClearData}
        style={({ pressed }) => [
          styles.menuItem,
          { backgroundColor: theme.backgroundDefault },
          pressed && { opacity: 0.7 },
        ]}
      >
        <View style={styles.menuItemContent}>
          <View
            style={[
              styles.menuIcon,
              { backgroundColor: "rgba(255, 59, 48, 0.15)" },
            ]}
          >
            <Feather name="trash-2" size={20} color={Colors.dark.error} />
          </View>
          <ThemedText
            type="body"
            style={{ fontWeight: "600", color: Colors.dark.error }}
          >
            Clear All Data
          </ThemedText>
        </View>
      </Pressable>

      <View style={styles.footer}>
        <ThemedText
          type="small"
          style={{ color: theme.textSecondary, textAlign: "center" }}
        >
          FitSync AI v1.0.0
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  privacyButtons: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  inputRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  inputGroup: {
    flex: 1,
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.xs,
    fontSize: 16,
    fontWeight: "600",
  },
  heightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  heightInput: {
    width: 48,
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  unitToggle: {
    height: Spacing.inputHeight,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButton: {
    marginTop: Spacing.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius["2xl"],
    marginBottom: Spacing.md,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  menuTextContainer: {
    flex: 1,
  },
  footer: {
    marginTop: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
});
