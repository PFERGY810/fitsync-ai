import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '@/stores/user-store';
import { useAIStore } from '@/stores/ai-store';
import { ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';



// Experience level options
const EXPERIENCE_LEVELS = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

// Goals options
const GOALS = [
  { id: 'Build Muscle', label: 'Build Muscle' },
  { id: 'Lose Weight', label: 'Lose Weight' },
  { id: 'Improve Strength', label: 'Improve Strength' },
  { id: 'Increase Endurance', label: 'Increase Endurance' },
  { id: 'Improve Flexibility', label: 'Improve Flexibility' },
];

// Equipment options
const EQUIPMENT = [
  { id: 'Full Gym', label: 'Full Gym' },
  { id: 'Home Gym', label: 'Home Gym' },
  { id: 'Dumbbells', label: 'Dumbbells' },
  { id: 'Resistance Bands', label: 'Resistance Bands' },
  { id: 'Bodyweight Only', label: 'Bodyweight Only' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateUserProfile } = useUserStore();
  const { updateUserProfile: updateAIProfile } = useAIStore();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(50)).current;
  
  // Form state
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [experience, setExperience] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [injuries, setInjuries] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [weeklyBudget, setWeeklyBudget] = useState('');
  
  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Fade in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name) newErrors.name = 'Name is required';
    if (!age) newErrors.age = 'Age is required';
    else if (isNaN(Number(age)) || Number(age) < 16 || Number(age) > 100) {
      newErrors.age = 'Please enter a valid age between 16 and 100';
    }
    
    if (!height) newErrors.height = 'Height is required';
    else if (isNaN(Number(height)) || Number(height) < 100 || Number(height) > 250) {
      newErrors.height = 'Please enter a valid height in cm (100-250)';
    }
    
    if (!weight) newErrors.weight = 'Weight is required';
    else if (isNaN(Number(weight)) || Number(weight) < 30 || Number(weight) > 250) {
      newErrors.weight = 'Please enter a valid weight in kg (30-250)';
    }
    
    if (selectedGoals.length === 0) {
      newErrors.goals = 'Please select at least one goal';
    }
    
    if (selectedEquipment.length === 0) {
      newErrors.equipment = 'Please select at least one equipment option';
    }
    
    if (weeklyBudget && (isNaN(Number(weeklyBudget)) || Number(weeklyBudget) < 0)) {
      newErrors.weeklyBudget = 'Please enter a valid budget amount';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleContinue = () => {
    if (!validateForm()) return;
    
    // Update user profile in store
    updateUserProfile({
      name,
      age: Number(age),
      gender,
      height: Number(height),
      weight: Number(weight),
      experience,
      goals: selectedGoals,
      injuries: injuries ? injuries.split(',').map(i => i.trim()) : [],
      zipCode,
      weeklyBudget: weeklyBudget ? Number(weeklyBudget) : 100,
      onboardingCompleted: true,
    });
    
    // Update AI profile
    updateAIProfile({
      experience,
      goals: selectedGoals,
      injuries: injuries ? injuries.split(',').map(i => i.trim()) : [],
      equipment: selectedEquipment,
      preferences: [],
    });
    
    // Navigate to physique setup
    router.push('/physique-setup');
  };
  
  const toggleGoal = (goalId: string) => {
    if (selectedGoals.includes(goalId)) {
      setSelectedGoals(selectedGoals.filter(id => id !== goalId));
    } else {
      setSelectedGoals([...selectedGoals, goalId]);
    }
  };
  
  const toggleEquipment = (equipmentId: string) => {
    if (selectedEquipment.includes(equipmentId)) {
      setSelectedEquipment(selectedEquipment.filter(id => id !== equipmentId));
    } else {
      setSelectedEquipment([...selectedEquipment, equipmentId]);
    }
  };
  
  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <ScrollView style={styles.scrollContainer} contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 40 }]}>
        <Animated.View style={[
          styles.headerContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateAnim }]
          }
        ]}>
          <Text style={styles.title}>Tell us about yourself</Text>
          <Text style={styles.subtitle}>
            We need some basic info to personalize your experience
          </Text>
        </Animated.View>
        
        <Animated.View style={[
          styles.formContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateAnim }]
          }
        ]}>
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor="#666"
                value={name}
                onChangeText={setName}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="Your age"
                placeholderTextColor="#666"
                keyboardType="number-pad"
                value={age}
                onChangeText={setAge}
              />
              {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    gender === 'male' && styles.selectedOption
                  ]}
                  onPress={() => setGender('male')}
                >
                  <Text style={[
                    styles.optionText,
                    gender === 'male' && styles.selectedOptionText
                  ]}>Male</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    gender === 'female' && styles.selectedOption
                  ]}
                  onPress={() => setGender('female')}
                >
                  <Text style={[
                    styles.optionText,
                    gender === 'female' && styles.selectedOptionText
                  ]}>Female</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="Height in cm"
                placeholderTextColor="#666"
                keyboardType="number-pad"
                value={height}
                onChangeText={setHeight}
              />
              {errors.height && <Text style={styles.errorText}>{errors.height}</Text>}
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="Weight in kg"
                placeholderTextColor="#666"
                keyboardType="number-pad"
                value={weight}
                onChangeText={setWeight}
              />
              {errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}
            </View>
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Fitness Profile</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Experience Level</Text>
              <View style={styles.optionsRow}>
                {EXPERIENCE_LEVELS.map(level => (
                  <TouchableOpacity
                    key={level.id}
                    style={[
                      styles.optionButton,
                      experience === level.id && styles.selectedOption
                    ]}
                    onPress={() => setExperience(level.id as 'beginner' | 'intermediate' | 'advanced')}
                  >
                    <Text style={[
                      styles.optionText,
                      experience === level.id && styles.selectedOptionText
                    ]}>{level.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Fitness Goals</Text>
              <View style={styles.optionsGrid}>
                {GOALS.map(goal => (
                  <TouchableOpacity
                    key={goal.id}
                    style={[
                      styles.optionButton,
                      selectedGoals.includes(goal.id) && styles.selectedOption
                    ]}
                    onPress={() => toggleGoal(goal.id)}
                  >
                    <Text style={[
                      styles.optionText,
                      selectedGoals.includes(goal.id) && styles.selectedOptionText
                    ]}>{goal.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.goals && <Text style={styles.errorText}>{errors.goals}</Text>}
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Available Equipment</Text>
              <View style={styles.optionsGrid}>
                {EQUIPMENT.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.optionButton,
                      selectedEquipment.includes(item.id) && styles.selectedOption
                    ]}
                    onPress={() => toggleEquipment(item.id)}
                  >
                    <Text style={[
                      styles.optionText,
                      selectedEquipment.includes(item.id) && styles.selectedOptionText
                    ]}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.equipment && <Text style={styles.errorText}>{errors.equipment}</Text>}
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Injuries or Limitations (optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="List any injuries or limitations, separated by commas"
                placeholderTextColor="#666"
                multiline
                numberOfLines={3}
                value={injuries}
                onChangeText={setInjuries}
              />
            </View>
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>ZIP Code (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="For local nutrition recommendations"
                placeholderTextColor="#666"
                value={zipCode}
                onChangeText={setZipCode}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Weekly Grocery Budget (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Weekly budget in $"
                placeholderTextColor="#666"
                keyboardType="number-pad"
                value={weeklyBudget}
                onChangeText={setWeeklyBudget}
              />
              {errors.weeklyBudget && <Text style={styles.errorText}>{errors.weeklyBudget}</Text>}
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.continueButtonContainer}
            onPress={handleContinue}
          >
            <LinearGradient
              colors={['#FF4500', '#FF7E50']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.continueButton}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
              <ChevronRight size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  headerContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 24,
  },
  formContainer: {
    gap: 24,
  },
  formSection: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  selectedOption: {
    backgroundColor: '#1E1B4B',
    borderColor: '#6366F1',
  },
  optionText: {
    color: '#D1D5DB',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  continueButtonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  continueButton: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});