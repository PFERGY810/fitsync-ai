/**
 * Notification Service
 * Handles push notifications, local notifications, and scheduling
 * 
 * Note: Requires expo-notifications package to be installed:
 * npx expo install expo-notifications expo-device
 */

import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Storage keys
const KEYS = {
  NOTIFICATION_SETTINGS: "fitsync_notification_settings",
  SCHEDULED_NOTIFICATIONS: "fitsync_scheduled_notifications",
  PUSH_TOKEN: "fitsync_push_token",
};

// Notification types
export type NotificationType =
  | "workout_reminder"
  | "checkin_reminder"
  | "meal_reminder"
  | "achievement_unlocked"
  | "streak_warning"
  | "weekly_summary"
  | "coach_tip";

export interface NotificationSettings {
  enabled: boolean;
  workoutReminders: boolean;
  checkinReminders: boolean;
  mealReminders: boolean;
  achievementAlerts: boolean;
  coachTips: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string; // "07:00"
}

export interface ScheduledNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  scheduledTime: string;
  data?: Record<string, unknown>;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  workoutReminders: true,
  checkinReminders: true,
  mealReminders: true,
  achievementAlerts: true,
  coachTips: true,
  quietHoursStart: "22:00",
  quietHoursEnd: "07:00",
};

// Notification content templates
const NOTIFICATION_CONTENT: Record<
  NotificationType,
  { title: string; bodies: string[] }
> = {
  workout_reminder: {
    title: "Time to Train!",
    bodies: [
      "Your workout is waiting. Let's crush it today!",
      "Don't skip leg day! Time to hit the gym.",
      "Consistency builds champions. Ready to train?",
    ],
  },
  checkin_reminder: {
    title: "Daily Check-in",
    bodies: [
      "How are you feeling today? Log your check-in.",
      "Track your progress! Complete your daily check-in.",
      "A quick check-in helps optimize your program.",
    ],
  },
  meal_reminder: {
    title: "Nutrition Reminder",
    bodies: [
      "Don't forget to log your meals!",
      "Fuel your gains! Time to eat.",
      "Track your macros to stay on target.",
    ],
  },
  achievement_unlocked: {
    title: "Achievement Unlocked!",
    bodies: ["You've earned a new achievement!"],
  },
  streak_warning: {
    title: "Keep Your Streak!",
    bodies: [
      "Your streak is at risk! Check in today to keep it going.",
      "Don't break the chain! Complete today's check-in.",
    ],
  },
  weekly_summary: {
    title: "Weekly Summary Ready",
    bodies: ["Check out your progress from this week!"],
  },
  coach_tip: {
    title: "Coach Tip",
    bodies: [
      "Focus on progressive overload for continuous gains.",
      "Sleep is crucial for muscle recovery. Aim for 7-9 hours.",
      "Stay hydrated! Water helps with performance and recovery.",
      "Mind-muscle connection improves exercise effectiveness.",
    ],
  },
};

class NotificationService {
  private settings: NotificationSettings = DEFAULT_SETTINGS;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Load saved settings
      const savedSettings = await AsyncStorage.getItem(
        KEYS.NOTIFICATION_SETTINGS
      );
      if (savedSettings) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) };
      }

      // Request permissions
      await this.requestPermissions();

      this.initialized = true;
      console.log("[Notifications] Service initialized");
    } catch (error) {
      console.error("[Notifications] Failed to initialize:", error);
    }
  }

  async requestPermissions(): Promise<boolean> {
    // This would use expo-notifications when installed
    // For now, return true as a placeholder
    if (Platform.OS === "android") {
      // Android 13+ requires explicit permission
      console.log("[Notifications] Android notification permissions required");
    }
    return true;
  }

  async getSettings(): Promise<NotificationSettings> {
    const saved = await AsyncStorage.getItem(KEYS.NOTIFICATION_SETTINGS);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
    return DEFAULT_SETTINGS;
  }

  async updateSettings(
    updates: Partial<NotificationSettings>
  ): Promise<NotificationSettings> {
    this.settings = { ...this.settings, ...updates };
    await AsyncStorage.setItem(
      KEYS.NOTIFICATION_SETTINGS,
      JSON.stringify(this.settings)
    );
    return this.settings;
  }

  async scheduleWorkoutReminder(
    dayOfWeek: number,
    hour: number,
    minute: number
  ): Promise<string | null> {
    if (!this.settings.enabled || !this.settings.workoutReminders) {
      return null;
    }

    const content = this.getRandomContent("workout_reminder");
    const notificationId = `workout_${dayOfWeek}_${hour}_${minute}`;

    // Store scheduled notification info
    await this.saveScheduledNotification({
      id: notificationId,
      type: "workout_reminder",
      title: content.title,
      body: content.body,
      scheduledTime: `${dayOfWeek}:${hour}:${minute}`,
    });

    console.log(
      `[Notifications] Scheduled workout reminder: ${notificationId}`
    );
    return notificationId;
  }

  async scheduleCheckinReminder(hour: number, minute: number): Promise<string | null> {
    if (!this.settings.enabled || !this.settings.checkinReminders) {
      return null;
    }

    const content = this.getRandomContent("checkin_reminder");
    const notificationId = `checkin_${hour}_${minute}`;

    await this.saveScheduledNotification({
      id: notificationId,
      type: "checkin_reminder",
      title: content.title,
      body: content.body,
      scheduledTime: `daily:${hour}:${minute}`,
    });

    console.log(`[Notifications] Scheduled checkin reminder: ${notificationId}`);
    return notificationId;
  }

  async scheduleMealReminder(
    mealType: "breakfast" | "lunch" | "dinner",
    hour: number,
    minute: number
  ): Promise<string | null> {
    if (!this.settings.enabled || !this.settings.mealReminders) {
      return null;
    }

    const content = this.getRandomContent("meal_reminder");
    const notificationId = `meal_${mealType}`;

    await this.saveScheduledNotification({
      id: notificationId,
      type: "meal_reminder",
      title: content.title,
      body: content.body,
      scheduledTime: `daily:${hour}:${minute}`,
    });

    console.log(`[Notifications] Scheduled meal reminder: ${notificationId}`);
    return notificationId;
  }

  async sendAchievementNotification(
    achievementTitle: string,
    points: number
  ): Promise<void> {
    if (!this.settings.enabled || !this.settings.achievementAlerts) {
      return;
    }

    const notification = {
      title: "Achievement Unlocked!",
      body: `${achievementTitle} - +${points} points`,
    };

    console.log(
      `[Notifications] Would send achievement notification:`,
      notification
    );
    // When expo-notifications is installed, this would trigger an immediate notification
  }

  async sendStreakWarning(currentStreak: number): Promise<void> {
    if (!this.settings.enabled) {
      return;
    }

    const notification = {
      title: "Keep Your Streak!",
      body: `You have a ${currentStreak}-day streak! Don't let it end today.`,
    };

    console.log(
      `[Notifications] Would send streak warning:`,
      notification
    );
  }

  async sendCoachTip(): Promise<void> {
    if (!this.settings.enabled || !this.settings.coachTips) {
      return;
    }

    const content = this.getRandomContent("coach_tip");
    console.log(`[Notifications] Would send coach tip:`, content);
  }

  async cancelNotification(notificationId: string): Promise<void> {
    const scheduled = await this.getScheduledNotifications();
    const updated = scheduled.filter((n) => n.id !== notificationId);
    await AsyncStorage.setItem(
      KEYS.SCHEDULED_NOTIFICATIONS,
      JSON.stringify(updated)
    );
    console.log(`[Notifications] Cancelled notification: ${notificationId}`);
  }

  async cancelAllNotifications(): Promise<void> {
    await AsyncStorage.setItem(KEYS.SCHEDULED_NOTIFICATIONS, JSON.stringify([]));
    console.log("[Notifications] Cancelled all notifications");
  }

  async getScheduledNotifications(): Promise<ScheduledNotification[]> {
    const saved = await AsyncStorage.getItem(KEYS.SCHEDULED_NOTIFICATIONS);
    return saved ? JSON.parse(saved) : [];
  }

  private async saveScheduledNotification(
    notification: ScheduledNotification
  ): Promise<void> {
    const scheduled = await this.getScheduledNotifications();
    const existingIndex = scheduled.findIndex((n) => n.id === notification.id);
    if (existingIndex >= 0) {
      scheduled[existingIndex] = notification;
    } else {
      scheduled.push(notification);
    }
    await AsyncStorage.setItem(
      KEYS.SCHEDULED_NOTIFICATIONS,
      JSON.stringify(scheduled)
    );
  }

  private getRandomContent(type: NotificationType): { title: string; body: string } {
    const template = NOTIFICATION_CONTENT[type];
    const bodyIndex = Math.floor(Math.random() * template.bodies.length);
    return {
      title: template.title,
      body: template.bodies[bodyIndex],
    };
  }

  private isInQuietHours(): boolean {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = this.settings.quietHoursStart
      .split(":")
      .map(Number);
    const [endHour, endMin] = this.settings.quietHoursEnd.split(":").map(Number);

    const quietStart = startHour * 60 + startMin;
    const quietEnd = endHour * 60 + endMin;

    if (quietStart > quietEnd) {
      // Quiet hours span midnight
      return currentTime >= quietStart || currentTime < quietEnd;
    }
    return currentTime >= quietStart && currentTime < quietEnd;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Export utility functions
export async function setupDefaultReminders(): Promise<void> {
  const service = notificationService;
  await service.initialize();

  // Schedule daily check-in reminder at 9 AM
  await service.scheduleCheckinReminder(9, 0);

  // Schedule meal reminders
  await service.scheduleMealReminder("breakfast", 8, 0);
  await service.scheduleMealReminder("lunch", 12, 30);
  await service.scheduleMealReminder("dinner", 18, 30);

  console.log("[Notifications] Default reminders configured");
}
