import * as LegacyFileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

export async function convertImageToBase64(uri: string): Promise<string> {
  if (!uri) return "";

  if (uri.startsWith("data:")) {
    return uri;
  }

  if (Platform.OS === "web") {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting image on web:", error);
      return "";
    }
  }

  try {
    const fileInfo = await LegacyFileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      console.error("File does not exist:", uri);
      return "";
    }

    const base64 = await LegacyFileSystem.readAsStringAsync(uri, {
      encoding: LegacyFileSystem.EncodingType.Base64,
    });

    const extension = uri.toLowerCase().split(".").pop() || "jpeg";
    let mimeType = "image/jpeg";
    if (extension === "png") mimeType = "image/png";
    else if (extension === "gif") mimeType = "image/gif";
    else if (extension === "webp") mimeType = "image/webp";

    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error("Error converting image to base64:", error);

    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64);
        };
        reader.onerror = () => {
          console.error("FileReader fallback also failed");
          resolve("");
        };
        reader.readAsDataURL(blob);
      });
    } catch (fallbackError) {
      console.error("Fallback conversion also failed:", fallbackError);
      return "";
    }
  }
}

export async function convertPhotosToBase64(photos: {
  front?: string;
  side?: string;
  back?: string;
  legs?: string;
}): Promise<{
  front?: string;
  side?: string;
  back?: string;
  legs?: string;
}> {
  const result: {
    front?: string;
    side?: string;
    back?: string;
    legs?: string;
  } = {};

  const conversions = await Promise.all([
    photos.front ? convertImageToBase64(photos.front) : Promise.resolve(""),
    photos.side ? convertImageToBase64(photos.side) : Promise.resolve(""),
    photos.back ? convertImageToBase64(photos.back) : Promise.resolve(""),
    photos.legs ? convertImageToBase64(photos.legs) : Promise.resolve(""),
  ]);

  if (photos.front && conversions[0]) result.front = conversions[0];
  if (photos.side && conversions[1]) result.side = conversions[1];
  if (photos.back && conversions[2]) result.back = conversions[2];
  if (photos.legs && conversions[3]) result.legs = conversions[3];

  return result;
}
