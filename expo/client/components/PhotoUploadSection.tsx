import React from "react";
import { View, StyleSheet, Pressable, Alert, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
const AnimatedView = Animated.createAnimatedComponent(View);
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface PhotoUploadSectionProps {
  type: "front" | "side" | "back" | "legs";
  label: string;
  description: string;
  icon: string;
  photos: string[];
  maxPhotos?: number;
  onAddPhoto: (type: string, uri: string) => void;
  onRemovePhoto: (type: string, index: number) => void;
}

const TYPE_COLORS: Record<string, string> = {
  front: "#BD10E0", // Purple
  side: "#00D084", // Green
  back: "#FF9500", // Orange
  legs: "#FF69B4", // Pink
};

export function PhotoUploadSection({
  type,
  label,
  description,
  icon,
  photos = [],
  maxPhotos = 3,
  onAddPhoto,
  onRemovePhoto,
}: PhotoUploadSectionProps) {
  const { theme } = useTheme();
  const [permission, requestPermission] = ImagePicker.useCameraPermissions();

  const takePhoto = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          "Camera Permission Required",
          "Please enable camera access in settings to take progress photos.",
        );
        return;
      }
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onAddPhoto(type, result.assets[0].uri);
    }
  };

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onAddPhoto(type, result.assets[0].uri);
    }
  };

  const handlePhotoAction = () => {
    if (photos.length >= maxPhotos) {
      Alert.alert("Maximum Photos", `You can upload up to ${maxPhotos} photos for ${label}.`);
      return;
    }

    if (Platform.OS === "web") {
      pickPhoto();
    } else {
      Alert.alert("Add Photo", "How would you like to add this photo?", [
        { text: "Take Photo", onPress: takePhoto },
        { text: "Choose from Library", onPress: pickPhoto },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  const iconColor = TYPE_COLORS[type] || Colors.dark.primary;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + "20" }]}>
          <Feather name={icon as any} size={20} color={iconColor} />
        </View>
        <View style={styles.labelContainer}>
          <ThemedText type="body" style={styles.label}>
            {label}
          </ThemedText>
          <ThemedText type="small" style={[styles.counter, { color: theme.textSecondary }]}>
            {photos.length}/{maxPhotos}
          </ThemedText>
        </View>
      </View>

      <ThemedText type="small" style={[styles.description, { color: theme.textSecondary }]}>
        {description}
      </ThemedText>

      <View style={styles.photosGrid}>
        {photos.map((photo, index) => (
          <AnimatedView
            key={index}
            entering={FadeInDown.delay(index * 100).duration(300)}
            style={styles.photoContainer}
          >
            <Image source={{ uri: photo }} style={styles.photo} contentFit="cover" />
            <Pressable
              style={styles.removeButton}
              onPress={() => onRemovePhoto(type, index)}
            >
              <Feather name="x" size={16} color="#FFF" />
            </Pressable>
            <View style={[styles.photoBadge, { backgroundColor: iconColor }]}>
              <ThemedText type="small" style={styles.badgeText}>
                {index + 1}
              </ThemedText>
            </View>
          </AnimatedView>
        ))}

        {photos.length < maxPhotos && (
          <AnimatedView entering={FadeInRight.delay(photos.length * 100).duration(300)}>
            <Pressable
              style={[styles.addButton, { borderColor: iconColor }]}
              onPress={handlePhotoAction}
            >
              <Feather name="plus" size={24} color={iconColor} />
              <ThemedText type="small" style={[styles.addText, { color: iconColor }]}>
                Add
              </ThemedText>
            </Pressable>
          </AnimatedView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.sm,
  },
  labelContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontWeight: "600",
  },
  counter: {
    fontWeight: "600",
  },
  description: {
    marginBottom: Spacing.md,
    marginLeft: 44,
  },
  photosGrid: {
    flexDirection: "row",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  photoContainer: {
    width: 100,
    height: 133,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  removeButton: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  photoBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.dark.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
  },
  addButton: {
    width: 100,
    height: 133,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    backgroundColor: "transparent",
  },
  addText: {
    marginTop: Spacing.xs,
    fontWeight: "600",
    fontSize: 12,
  },
});
