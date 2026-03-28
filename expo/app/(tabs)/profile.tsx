import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { User, Settings, LogOut, Target, TrendingUp, Award, Scale } from 'lucide-react-native';
import { useUserStore } from '@/stores/user-store';
import { router } from 'expo-router';
import { formatWeight, formatHeight, calculateBMI, getIdealWeightRange } from '@/utils/unit-conversions';

export default function ProfileScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { userProfile, clearUserData, setUnitSystem } = useUserStore();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            clearUserData();
            router.replace('/');
          }
        }
      ]
    );
  };

  const handleEditProfile = () => {
    // Navigate to edit profile
    console.log('Edit profile');
  };

  const toggleUnits = () => {
    if (userProfile) {
      const newSystem = userProfile.unitSystem === 'metric' ? 'imperial' : 'metric';
      setUnitSystem(newSystem);
    }
  };

  const getBMI = () => {
    if (!userProfile) return '22.9';
    return calculateBMI(userProfile.weight, userProfile.height).toString();
  };

  const getIdealWeight = () => {
    if (!userProfile) return 'N/A';
    const range = getIdealWeightRange(userProfile.height, userProfile.unitSystem);
    const unit = userProfile.unitSystem === 'metric' ? 'kg' : 'lbs';
    return `${range.min}-${range.max} ${unit}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity style={styles.settingsButton} onPress={handleEditProfile}>
          <Settings size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.cardsContainer, { opacity: fadeAnim }]}>
          
          {/* Profile Info */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <User size={32} color="#6366F1" />
              </View>
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Fitness Enthusiast</Text>
              <Text style={styles.profileLevel}>
                {userProfile?.experience || 'Beginner'} • {userProfile?.age || 25} years old
              </Text>
            </View>

            <View style={styles.profileStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {userProfile ? formatWeight(userProfile.weight, userProfile.unitSystem).split(' ')[0] : '70'}
                </Text>
                <Text style={styles.statLabel}>
                  {userProfile?.unitSystem === 'imperial' ? 'lbs' : 'kg'}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {userProfile ? formatHeight(userProfile.height, userProfile.unitSystem) : '175 cm'}
                </Text>
                <Text style={styles.statLabel}>height</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{getBMI()}</Text>
                <Text style={styles.statLabel}>BMI</Text>
              </View>
            </View>
          </View>

          {/* Unit System Toggle */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Scale size={20} color="#6366F1" />
              <Text style={styles.sectionTitle}>Units</Text>
            </View>
            <TouchableOpacity style={styles.unitToggle} onPress={toggleUnits}>
              <View style={styles.unitToggleContent}>
                <Text style={styles.unitToggleText}>
                  {userProfile?.unitSystem === 'metric' ? 'Metric (kg, cm)' : 'Imperial (lbs, ft/in)'}
                </Text>
                <Text style={styles.unitToggleSubtext}>Tap to switch</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Health Metrics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Health Metrics</Text>
            <View style={styles.metricsContainer}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Current BMI</Text>
                <Text style={styles.metricValue}>{getBMI()}</Text>
                <Text style={styles.metricStatus}>Normal Range</Text>
              </View>
              
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Ideal Weight</Text>
                <Text style={styles.metricValue}>{getIdealWeight()}</Text>
                <Text style={styles.metricStatus}>Healthy Range</Text>
              </View>
            </View>
          </View>

          {/* Goals */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Target size={20} color="#6366F1" />
              <Text style={styles.sectionTitle}>Your Goals</Text>
            </View>
            <View style={styles.goalsContainer}>
              {userProfile?.goals && userProfile.goals.length > 0 ? (
                userProfile.goals.map((goal, index) => (
                  <View key={index} style={styles.goalItem}>
                    <Text style={styles.goalText}>{goal}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No goals set</Text>
              )}
            </View>
          </View>

          {/* Achievements */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Award size={20} color="#F59E0B" />
              <Text style={styles.sectionTitle}>Achievements</Text>
            </View>
            <View style={styles.achievementsContainer}>
              <View style={styles.achievementItem}>
                <Text style={styles.achievementEmoji}>🏆</Text>
                <View style={styles.achievementContent}>
                  <Text style={styles.achievementTitle}>First Form Analysis</Text>
                  <Text style={styles.achievementDescription}>Completed your first video analysis</Text>
                </View>
              </View>
              
              <View style={styles.achievementItem}>
                <Text style={styles.achievementEmoji}>📸</Text>
                <View style={styles.achievementContent}>
                  <Text style={styles.achievementTitle}>Progress Tracker</Text>
                  <Text style={styles.achievementDescription}>Uploaded your first progress photo</Text>
                </View>
              </View>
              
              <View style={styles.achievementItem}>
                <Text style={styles.achievementEmoji}>💪</Text>
                <View style={styles.achievementContent}>
                  <Text style={styles.achievementTitle}>Workout Warrior</Text>
                  <Text style={styles.achievementDescription}>Completed 5 workouts this month</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Stats Overview */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <TrendingUp size={20} color="#10B981" />
              <Text style={styles.sectionTitle}>Your Stats</Text>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statCardValue}>24</Text>
                <Text style={styles.statCardLabel}>Workouts</Text>
                <Text style={styles.statCardSubtext}>this month</Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statCardValue}>8.7</Text>
                <Text style={styles.statCardLabel}>Avg Form</Text>
                <Text style={styles.statCardSubtext}>score</Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statCardValue}>12</Text>
                <Text style={styles.statCardLabel}>Progress</Text>
                <Text style={styles.statCardSubtext}>photos</Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statCardValue}>89%</Text>
                <Text style={styles.statCardLabel}>Consistency</Text>
                <Text style={styles.statCardSubtext}>rate</Text>
              </View>
            </View>
          </View>

          {/* Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <View style={styles.settingsContainer}>
              <TouchableOpacity style={styles.settingItem} onPress={handleEditProfile}>
                <User size={20} color="#9CA3AF" />
                <Text style={styles.settingText}>Edit Profile</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.settingItem}>
                <Settings size={20} color="#9CA3AF" />
                <Text style={styles.settingText}>App Settings</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.settingItem, styles.logoutItem]} onPress={handleLogout}>
                <LogOut size={20} color="#EF4444" />
                <Text style={[styles.settingText, styles.logoutText]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>

        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cardsContainer: {
    paddingBottom: 20,
  },
  profileCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#374151',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E1B4B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileLevel: {
    color: '#9CA3AF',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#6366F1',
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#374151',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  unitToggle: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  unitToggleContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unitToggleText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  unitToggleSubtext: {
    color: '#6366F1',
    fontSize: 12,
    fontWeight: '500',
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  metricLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    color: '#6366F1',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricStatus: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '500',
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalItem: {
    backgroundColor: '#1E1B4B',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  goalText: {
    color: '#6366F1',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontStyle: 'italic',
  },
  achievementsContainer: {
    gap: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  achievementEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  achievementDescription: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  statCardValue: {
    color: '#6366F1',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statCardLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  statCardSubtext: {
    color: '#9CA3AF',
    fontSize: 10,
  },
  settingsContainer: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#374151',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    gap: 12,
  },
  settingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#EF4444',
  },
});