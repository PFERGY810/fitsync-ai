import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

// Only trigger haptics on supported platforms
const isHapticsSupported = Platform.OS === "ios" || Platform.OS === "android";

/**
 * Light tap feedback - for selections, toggles
 */
export async function lightTap() {
  if (!isHapticsSupported) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Silently fail if haptics not available
  }
}

/**
 * Medium tap feedback - for button presses
 */
export async function mediumTap() {
  if (!isHapticsSupported) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
    // Silently fail
  }
}

/**
 * Heavy tap feedback - for important actions, confirmations
 */
export async function heavyTap() {
  if (!isHapticsSupported) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch {
    // Silently fail
  }
}

/**
 * Selection changed feedback - for pickers, sliders
 */
export async function selectionChanged() {
  if (!isHapticsSupported) return;
  try {
    await Haptics.selectionAsync();
  } catch {
    // Silently fail
  }
}

/**
 * Success notification - task completed, goal reached
 */
export async function success() {
  if (!isHapticsSupported) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Silently fail
  }
}

/**
 * Warning notification - approaching limit, caution needed
 */
export async function warning() {
  if (!isHapticsSupported) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch {
    // Silently fail
  }
}

/**
 * Error notification - action failed, validation error
 */
export async function error() {
  if (!isHapticsSupported) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch {
    // Silently fail
  }
}

/**
 * Celebration pattern - achievements, PRs, milestones
 */
export async function celebrate() {
  if (!isHapticsSupported) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await new Promise((r) => setTimeout(r, 100));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await new Promise((r) => setTimeout(r, 100));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Silently fail
  }
}

/**
 * Workout complete pattern
 */
export async function workoutComplete() {
  if (!isHapticsSupported) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await new Promise((r) => setTimeout(r, 150));
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Silently fail
  }
}

// Export all as default object for convenience
export default {
  lightTap,
  mediumTap,
  heavyTap,
  selectionChanged,
  success,
  warning,
  error,
  celebrate,
  workoutComplete,
};
