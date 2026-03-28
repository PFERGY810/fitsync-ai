import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { OnboardingLayout } from "@/components/OnboardingLayout";
import { useOnboarding } from "@/context/OnboardingContext";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { Card } from "@/components/Card";
import { WireframeGraphic } from "@/components/WireframeGraphic";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";

export default function BasicProfileScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { profile, updateProfile } = useOnboarding();

  const getInitialFeetInches = () => {
    if (profile.heightUnit === "in" && profile.height) {
      const totalInches = profile.height;
      return {
        feet: Math.floor(totalInches / 12).toString(),
        inches: (totalInches % 12).toString(),
      };
    }
    return { feet: "", inches: "" };
  };

  const initialFeetInches = getInitialFeetInches();
  const [height, setHeight] = useState(
    profile.heightUnit === "cm" ? profile.height?.toString() || "" : "",
  );
  const [heightFeet, setHeightFeet] = useState(initialFeetInches.feet);
  const [heightInches, setHeightInches] = useState(initialFeetInches.inches);
  const [weight, setWeight] = useState(profile.weight?.toString() || "");
  const [age, setAge] = useState(profile.age || 25);
  const [sex, setSex] = useState<"male" | "female">(profile.sex || "male");
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft">(
    profile.heightUnit === "in" ? "ft" : profile.heightUnit || "cm",
  );
  const [weightUnit, setWeightUnit] = useState<"lbs" | "kg">(
    profile.weightUnit || "lbs",
  );

  const getTotalInches = (): number => {
    const feet = parseInt(heightFeet) || 0;
    const inches = parseInt(heightInches) || 0;
    return feet * 12 + inches;
  };

  const hasValidHeight =
    heightUnit === "ft"
      ? heightFeet && parseInt(heightFeet) >= 4 && parseInt(heightFeet) <= 8
      : height && parseFloat(height) >= 100 && parseFloat(height) <= 250;

  const canContinue = hasValidHeight && weight && age;

  const handleContinue = () => {
    let heightValue: number;
    let heightUnitToSave: "cm" | "in";

    if (heightUnit === "ft") {
      heightValue = getTotalInches();
      heightUnitToSave = "in";
    } else {
      heightValue = parseFloat(height);
      heightUnitToSave = "cm";
    }

    updateProfile({
      height: heightValue,
      heightUnit: heightUnitToSave,
      weight: parseFloat(weight),
      weightUnit,
      age,
      sex,
    });
    navigation.navigate("ProgressPhotos");
  };

  return (
    <OnboardingLayout
      step={2}
      title="Let's get to know you"
      subtitle="This helps us calculate your optimal nutrition and training"
      onContinue={handleContinue}
      canContinue={!!canContinue}
    >
      <View style={styles.sexSelector}>
        <Pressable
          onPress={() => setSex("male")}
          style={[
            styles.sexOption,
            {
              backgroundColor: sex === "male" ? Colors.dark.neonCyan + "30" : Colors.dark.panelBackground,
              borderColor: sex === "male" ? Colors.dark.neonCyan : Colors.dark.panelBorder,
              borderWidth: 2,
            },
          ]}
        >
          <Feather
            name="user"
            size={32}
            color={sex === "male" ? Colors.dark.neonCyan : theme.textSecondary}
          />
          <ThemedText
            style={[
              styles.sexText,
              {
                color: sex === "male" ? Colors.dark.neonCyan : theme.textSecondary,
              },
            ]}
            glow={sex === "male"}
            glowColor={Colors.dark.neonCyan}
          >
            Male
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => setSex("female")}
          style={[
            styles.sexOption,
            {
              backgroundColor: sex === "female" ? Colors.dark.neonCyan + "30" : Colors.dark.panelBackground,
              borderColor: sex === "female" ? Colors.dark.neonCyan : Colors.dark.panelBorder,
              borderWidth: 2,
            },
          ]}
        >
          <Feather
            name="user"
            size={32}
            color={sex === "female" ? Colors.dark.neonCyan : theme.textSecondary}
          />
          <ThemedText
            style={[
              styles.sexText,
              {
                color: sex === "female" ? Colors.dark.neonCyan : theme.textSecondary,
              },
            ]}
            glow={sex === "female"}
            glowColor={Colors.dark.neonCyan}
          >
            Female
          </ThemedText>
        </Pressable>
      </View>

      <Card elevation={2} style={styles.inputCard} translucent glowColor={Colors.dark.neonCyan}>
        <WireframeGraphic type="dumbbell" size={150} opacity={0.15} style={styles.wireframe} />
        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Height
            </ThemedText>
            {heightUnit === "ft" ? (
              <View style={styles.inputWithUnit}>
                <View style={styles.feetInchesContainer}>
                  <TextInput
                    style={[
                      styles.feetInput,
                      {
                        backgroundColor: theme.backgroundSecondary,
                        color: theme.text,
                        borderColor: Colors.dark.neonCyan + "40",
                        borderWidth: 1,
                      },
                    ]}
                    value={heightFeet}
                    onChangeText={(text) =>
                      setHeightFeet(text.replace(/[^0-9]/g, ""))
                    }
                    keyboardType="numeric"
                    placeholder="5"
                    placeholderTextColor={theme.textSecondary}
                    maxLength={1}
                    returnKeyType="next"
                  />
                  <ThemedText style={styles.feetLabel}>ft</ThemedText>
                  <TextInput
                    style={[
                      styles.inchesInput,
                      {
                        backgroundColor: theme.backgroundSecondary,
                        color: theme.text,
                        borderColor: Colors.dark.neonCyan + "40",
                        borderWidth: 1,
                      },
                    ]}
                    value={heightInches}
                    onChangeText={(text) => {
                      const num = text.replace(/[^0-9]/g, "");
                      if (parseInt(num) <= 11 || num === "")
                        setHeightInches(num);
                    }}
                    keyboardType="numeric"
                    placeholder="8"
                    placeholderTextColor={theme.textSecondary}
                    maxLength={2}
                    returnKeyType="done"
                  />
                  <ThemedText style={styles.feetLabel}>in</ThemedText>
                </View>
                <Pressable
                  onPress={() => setHeightUnit("cm")}
                  style={[
                    styles.unitButton,
                    { backgroundColor: theme.backgroundTertiary },
                  ]}
                >
                  <ThemedText type="small">ft</ThemedText>
                </Pressable>
              </View>
            ) : (
              <View style={styles.inputWithUnit}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.backgroundSecondary,
                      color: theme.text,
                      borderColor: Colors.dark.neonCyan + "40",
                      borderWidth: 1,
                    },
                  ]}
                  value={height}
                  onChangeText={(text) =>
                    setHeight(text.replace(/[^0-9.]/g, ""))
                  }
                  keyboardType="numeric"
                  placeholder="175"
                  placeholderTextColor={theme.textSecondary}
                  returnKeyType="done"
                />
                <Pressable
                  onPress={() => setHeightUnit("ft")}
                  style={[
                    styles.unitButton,
                    { backgroundColor: theme.backgroundTertiary },
                  ]}
                >
                  <ThemedText type="small">cm</ThemedText>
                </Pressable>
              </View>
            )}
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Current Weight
            </ThemedText>
            <View style={styles.inputWithUnit}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                  },
                ]}
                value={weight}
                onChangeText={(text) =>
                  setWeight(text.replace(/[^0-9.]/g, ""))
                }
                keyboardType="numeric"
                placeholder={weightUnit === "lbs" ? "180" : "82"}
                placeholderTextColor={theme.textSecondary}
                returnKeyType="done"
              />
              <Pressable
                onPress={() =>
                  setWeightUnit(weightUnit === "lbs" ? "kg" : "lbs")
                }
                style={[
                  styles.unitButton,
                  { backgroundColor: theme.backgroundTertiary },
                ]}
              >
                <ThemedText type="small">{weightUnit}</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Age
            </ThemedText>
            <View style={styles.ageSelectorRow}>
              <Pressable
                onPress={() => setAge(Math.max(18, age - 1))}
                style={[
                  styles.ageStepButton,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
              >
                <Feather name="minus" size={24} color={theme.text} />
              </Pressable>
              <View
                style={[
                  styles.ageDisplay,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    borderColor: Colors.dark.neonCyan + "40",
                    borderWidth: 1,
                  },
                ]}
              >
                <ThemedText style={styles.ageValue}>{age}</ThemedText>
                <ThemedText
                  type="small"
                  style={{ color: theme.textSecondary }}
                >
                  years
                </ThemedText>
              </View>
              <Pressable
                onPress={() => setAge(Math.min(100, age + 1))}
                style={[
                  styles.ageStepButton,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
              >
                <Feather name="plus" size={24} color={theme.text} />
              </Pressable>
            </View>
          </View>
        </View>
      </Card>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: Spacing.lg,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.dark.primary,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    marginBottom: Spacing.xl,
  },
  sexSelector: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  osVersion: {
    alignSelf: "center",
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  wireframe: {
    position: "absolute",
    top: -50,
    right: -50,
    opacity: 0.15,
    zIndex: 0,
  },
  sexOption: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    minHeight: 120,
  },
  sexText: {
    fontWeight: "600",
  },
  inputCard: {
    gap: Spacing.lg,
  },
  inputRow: {
    gap: Spacing.md,
  },
  inputGroup: {
    gap: Spacing.xs,
  },
  input: {
    flex: 1,
    height: 52,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    fontSize: 18,
    fontWeight: "600",
  },
  inputWithUnit: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  unitButton: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  ageSelectorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  ageStepButton: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  ageDisplay: {
    flex: 1,
    height: 52,
    borderRadius: BorderRadius.sm,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
  },
  ageValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  feetInchesContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  feetInput: {
    width: 50,
    height: 52,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  inchesInput: {
    width: 50,
    height: 52,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  feetLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginHorizontal: 2,
  },
});
