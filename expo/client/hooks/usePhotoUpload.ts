import { useState, useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert, Platform } from "react-native";

interface UsePhotoUploadOptions {
  maxPhotos?: number;
  aspect?: [number, number];
  quality?: number;
}

export function usePhotoUpload(options: UsePhotoUploadOptions = {}) {
  const {
    maxPhotos = 3,
    aspect = [3, 4],
    quality = 0.8,
  } = options;

  const [permission, requestPermission] = ImagePicker.useCameraPermissions();

  const takePhoto = useCallback(async (): Promise<string | null> => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          "Camera Permission Required",
          "Please enable camera access in settings to take progress photos.",
        );
        return null;
      }
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect,
      quality,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }

    return null;
  }, [permission, requestPermission, aspect, quality]);

  const pickPhoto = useCallback(async (): Promise<string | null> => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect,
      quality,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }

    return null;
  }, [aspect, quality]);

  const handlePhotoAction = useCallback(
    async (onPhotoSelected: (uri: string) => void) => {
      if (Platform.OS === "web") {
        const uri = await pickPhoto();
        if (uri) onPhotoSelected(uri);
      } else {
        Alert.alert("Add Photo", "How would you like to add this photo?", [
          {
            text: "Take Photo",
            onPress: async () => {
              const uri = await takePhoto();
              if (uri) onPhotoSelected(uri);
            },
          },
          {
            text: "Choose from Library",
            onPress: async () => {
              const uri = await pickPhoto();
              if (uri) onPhotoSelected(uri);
            },
          },
          { text: "Cancel", style: "cancel" },
        ]);
      }
    },
    [takePhoto, pickPhoto],
  );

  return {
    takePhoto,
    pickPhoto,
    handlePhotoAction,
    permission,
  };
}
