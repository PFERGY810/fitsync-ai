import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from "expo-camera";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

interface FoodItem {
  name: string;
  brand: string | null;
  barcode: string;
  fdcId?: number;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  imageUrl?: string;
  source: string;
}

export default function BarcodeScannerScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [foundFood, setFoundFood] = useState<FoodItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [servings, setServings] = useState(1);

  const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (scanned || loading) return;

    setScanned(true);
    setLoading(true);
    setError(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(
        new URL(`/api/food/barcode/${data}`, apiUrl).toString(),
      );

      if (!response.ok) {
        if (response.status === 404) {
          setError("Product not found. Try searching by name instead.");
        } else {
          setError("Failed to look up product. Please try again.");
        }
        return;
      }

      const foodItem = await response.json();
      setFoundFood(foodItem);
    } catch (err) {
      console.error("Barcode lookup error:", err);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFood = () => {
    if (!foundFood) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    navigation.navigate("AddFood", {
      food: foundFood,
      servings: servings,
    });
  };

  const handleScanAgain = () => {
    setScanned(false);
    setFoundFood(null);
    setError(null);
    setServings(1);
  };

  if (!permission) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </ThemedView>
    );
  }

  if (!permission.granted) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.permissionContainer}>
          <Feather name="camera-off" size={64} color={theme.textSecondary} />
          <ThemedText type="h3" style={styles.permissionTitle}>
            Camera Permission Required
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.permissionText, { color: theme.textSecondary }]}
          >
            Allow camera access to scan food barcodes for quick nutrition
            lookup.
          </ThemedText>
          <Button onPress={requestPermission}>Enable Camera</Button>
        </View>
      </ThemedView>
    );
  }

  if (Platform.OS === "web") {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.permissionContainer}>
          <Feather name="smartphone" size={64} color={theme.textSecondary} />
          <ThemedText type="h3" style={styles.permissionTitle}>
            Mobile Only Feature
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.permissionText, { color: theme.textSecondary }]}
          >
            Barcode scanning works best on your phone. Open this app in Expo Go
            to scan barcodes.
          </ThemedText>
          <Button onPress={() => navigation.navigate("FoodSearch")}>
            Search Foods Instead
          </Button>
        </View>
      </ThemedView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: "#000" }]}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: [
            "ean13",
            "ean8",
            "upc_a",
            "upc_e",
            "code128",
            "code39",
          ],
        }}
      />

      <View style={[styles.overlay, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Feather name="x" size={28} color="#fff" />
          </Pressable>
          <ThemedText type="h3" style={styles.headerTitle}>
            Scan Barcode
          </ThemedText>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.scanArea}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          {loading ? (
            <ActivityIndicator
              size="large"
              color={Colors.dark.primary}
              style={styles.loader}
            />
          ) : null}
        </View>

        <View
          style={[
            styles.bottomSection,
            { paddingBottom: insets.bottom + Spacing.lg },
          ]}
        >
          {error ? (
            <Card elevation={2} style={styles.errorCard}>
              <Feather
                name="alert-circle"
                size={24}
                color={Colors.dark.error}
              />
              <ThemedText type="body" style={styles.errorText}>
                {error}
              </ThemedText>
              <View style={styles.errorButtons}>
                <Pressable
                  onPress={handleScanAgain}
                  style={[
                    styles.outlineButton,
                    { borderColor: Colors.dark.primary },
                  ]}
                >
                  <ThemedText style={{ color: Colors.dark.primary }}>
                    Scan Again
                  </ThemedText>
                </Pressable>
                <Button onPress={() => navigation.navigate("FoodSearch")}>
                  Search Foods
                </Button>
              </View>
            </Card>
          ) : foundFood ? (
            <Card elevation={2} style={styles.foodCard}>
              <ThemedText type="h4" numberOfLines={2}>
                {foundFood.name}
              </ThemedText>
              {foundFood.brand ? (
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {foundFood.brand}
                </ThemedText>
              ) : null}

              <View style={styles.nutritionRow}>
                <View style={styles.nutritionItem}>
                  <ThemedText type="h3" style={{ color: Colors.dark.primary }}>
                    {Math.round(foundFood.calories * servings)}
                  </ThemedText>
                  <ThemedText
                    type="small"
                    style={{ color: theme.textSecondary }}
                  >
                    calories
                  </ThemedText>
                </View>
                <View style={styles.nutritionItem}>
                  <ThemedText type="body" style={{ fontWeight: "700" }}>
                    {Math.round(foundFood.protein * servings)}g
                  </ThemedText>
                  <ThemedText
                    type="small"
                    style={{ color: theme.textSecondary }}
                  >
                    protein
                  </ThemedText>
                </View>
                <View style={styles.nutritionItem}>
                  <ThemedText type="body" style={{ fontWeight: "700" }}>
                    {Math.round(foundFood.carbs * servings)}g
                  </ThemedText>
                  <ThemedText
                    type="small"
                    style={{ color: theme.textSecondary }}
                  >
                    carbs
                  </ThemedText>
                </View>
                <View style={styles.nutritionItem}>
                  <ThemedText type="body" style={{ fontWeight: "700" }}>
                    {Math.round(foundFood.fat * servings)}g
                  </ThemedText>
                  <ThemedText
                    type="small"
                    style={{ color: theme.textSecondary }}
                  >
                    fat
                  </ThemedText>
                </View>
              </View>

              <View style={styles.servingsRow}>
                <ThemedText type="body">Servings:</ThemedText>
                <View style={styles.servingsControls}>
                  <Pressable
                    onPress={() => setServings(Math.max(0.5, servings - 0.5))}
                    style={[
                      styles.servingButton,
                      { backgroundColor: theme.backgroundSecondary },
                    ]}
                  >
                    <Feather name="minus" size={18} color={theme.text} />
                  </Pressable>
                  <ThemedText type="h4" style={styles.servingsValue}>
                    {servings}
                  </ThemedText>
                  <Pressable
                    onPress={() => setServings(servings + 0.5)}
                    style={[
                      styles.servingButton,
                      { backgroundColor: theme.backgroundSecondary },
                    ]}
                  >
                    <Feather name="plus" size={18} color={theme.text} />
                  </Pressable>
                </View>
              </View>

              <View style={styles.foodButtons}>
                <Pressable
                  onPress={handleScanAgain}
                  style={[
                    styles.outlineButton,
                    { borderColor: Colors.dark.primary, flex: 1 },
                  ]}
                >
                  <ThemedText style={{ color: Colors.dark.primary }}>
                    Scan Again
                  </ThemedText>
                </Pressable>
                <Button
                  onPress={handleAddFood}
                  style={{ flex: 1, marginLeft: Spacing.sm }}
                >
                  Add Food
                </Button>
              </View>
            </Card>
          ) : (
            <View style={styles.instructions}>
              <ThemedText type="body" style={styles.instructionText}>
                Position the barcode within the frame
              </ThemedText>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  permissionTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  permissionText: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#fff",
  },
  scanArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 280,
    height: 180,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: Colors.dark.primary,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: BorderRadius.md,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: BorderRadius.md,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: BorderRadius.md,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: BorderRadius.md,
  },
  loader: {
    position: "absolute",
  },
  bottomSection: {
    padding: Spacing.lg,
  },
  instructions: {
    alignItems: "center",
  },
  instructionText: {
    color: "#fff",
    textAlign: "center",
  },
  errorCard: {
    alignItems: "center",
    padding: Spacing.lg,
  },
  errorText: {
    textAlign: "center",
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  errorButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  foodCard: {
    padding: Spacing.lg,
  },
  nutritionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  nutritionItem: {
    alignItems: "center",
  },
  servingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  servingsControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  servingButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  servingsValue: {
    width: 60,
    textAlign: "center",
  },
  foodButtons: {
    flexDirection: "row",
  },
  outlineButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: Spacing.xs,
  },
});
