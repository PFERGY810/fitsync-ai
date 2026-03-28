import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Camera, Upload, Play, CheckCircle, AlertTriangle, XCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFormAnalysis } from '@/hooks/use-form-analysis';

const EXERCISES = [
  'Squat',
  'Deadlift', 
  'Bench Press',
  'Push-up',
  'Pull-up',
  'Overhead Press',
  'Row',
  'Lunge'
];

export default function FormAnalysisScreen() {
  const [selectedExercise, setSelectedExercise] = useState('');
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const { currentFormAnalysis, isAnalyzingForm, analyzeForm } = useFormAnalysis();

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload videos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
      videoMaxDuration: 30, // 30 seconds max
    });

    if (!result.canceled && result.assets[0]) {
      setVideoUri(result.assets[0].uri);
    }
  };

  const recordVideo = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions to record videos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
      videoMaxDuration: 30,
    });

    if (!result.canceled && result.assets[0]) {
      setVideoUri(result.assets[0].uri);
    }
  };

  const analyzeVideo = async () => {
    if (!selectedExercise || !videoUri) {
      Alert.alert('Missing Information', 'Please select an exercise and upload a video.');
      return;
    }

    console.log('Starting video analysis for:', selectedExercise, 'with video:', videoUri);
    
    // Production-ready video analysis with multiple frame processing
    await analyzeForm({
      exercise: selectedExercise.toLowerCase(),
      videoUri: videoUri, // Pass the video URI for frame extraction
      userDescription: `Multi-frame video analysis for ${selectedExercise}`,
    });
  };

  const getStatusIcon = (status: 'good' | 'needs_improvement' | 'poor') => {
    const color = status === 'good' ? '#10B981' : status === 'needs_improvement' ? '#F59E0B' : '#EF4444';
    switch (status) {
      case 'good':
        return <CheckCircle size={20} color={color} />;
      case 'needs_improvement':
        return <AlertTriangle size={20} color={color} />;
      case 'poor':
        return <XCircle size={20} color={color} />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Form Analysis</Text>
        <Text style={styles.subtitle}>Upload a video to get AI-powered form feedback</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.cardsContainer, { opacity: fadeAnim }]}>
          
          {/* Exercise Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Exercise</Text>
            <View style={styles.exerciseGrid}>
              {EXERCISES.map((exercise) => (
                <TouchableOpacity
                  key={exercise}
                  style={[
                    styles.exerciseButton,
                    selectedExercise === exercise && styles.exerciseButtonSelected
                  ]}
                  onPress={() => setSelectedExercise(exercise)}
                >
                  <Text style={[
                    styles.exerciseText,
                    selectedExercise === exercise && styles.exerciseTextSelected
                  ]}>
                    {exercise}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Video Upload */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upload Video</Text>
            <View style={styles.uploadContainer}>
              {videoUri ? (
                <View style={styles.videoPreview}>
                  <Play size={48} color="#6366F1" />
                  <Text style={styles.videoText}>Video Ready</Text>
                  <Text style={styles.videoSubtext}>Tap analyze to get feedback</Text>
                </View>
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Camera size={48} color="#6B7280" />
                  <Text style={styles.uploadText}>No video selected</Text>
                  <Text style={styles.uploadSubtext}>Record or upload a video of your exercise</Text>
                </View>
              )}
            </View>
            
            <View style={styles.uploadButtons}>
              <TouchableOpacity style={styles.uploadButton} onPress={recordVideo}>
                <Camera size={20} color="#FFFFFF" />
                <Text style={styles.uploadButtonText}>Record</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.uploadButton} onPress={pickVideo}>
                <Upload size={20} color="#FFFFFF" />
                <Text style={styles.uploadButtonText}>Upload</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Analysis Button */}
          <TouchableOpacity
            style={[
              styles.analyzeButton,
              (!selectedExercise || !videoUri || isAnalyzingForm) && styles.analyzeButtonDisabled
            ]}
            onPress={analyzeVideo}
            disabled={!selectedExercise || !videoUri || isAnalyzingForm}
          >
            <Text style={styles.analyzeButtonText}>
              {isAnalyzingForm ? 'Analyzing...' : 'Analyze Form'}
            </Text>
          </TouchableOpacity>

          {/* Results */}
          {currentFormAnalysis && (
            <View style={styles.resultsContainer}>
              <Text style={styles.sectionTitle}>Analysis Results</Text>
              
              <View style={styles.scoreCard}>
                <Text style={styles.scoreTitle}>Overall Score</Text>
                <Text style={styles.scoreValue}>{currentFormAnalysis.overallScore}/100</Text>
                <Text style={styles.scoreExercise}>{currentFormAnalysis.exercise}</Text>
              </View>

              <View style={styles.metricsContainer}>
                <View style={styles.metric}>
                  {getStatusIcon(currentFormAnalysis.metrics.depth.status)}
                  <Text style={styles.metricLabel}>Depth</Text>
                  <Text style={styles.metricValue}>{currentFormAnalysis.metrics.depth.status}</Text>
                </View>
                
                <View style={styles.metric}>
                  {getStatusIcon(currentFormAnalysis.metrics.backAngle.status)}
                  <Text style={styles.metricLabel}>Back Angle</Text>
                  <Text style={styles.metricValue}>{currentFormAnalysis.metrics.backAngle.angle}°</Text>
                </View>
                
                <View style={styles.metric}>
                  {getStatusIcon(currentFormAnalysis.metrics.kneeTracking.status)}
                  <Text style={styles.metricLabel}>Knee Tracking</Text>
                  <Text style={styles.metricValue}>{currentFormAnalysis.metrics.kneeTracking.status}</Text>
                </View>
              </View>

              {currentFormAnalysis.improvements.length > 0 && (
                <View style={styles.improvementsCard}>
                  <Text style={styles.improvementsTitle}>Key Improvements</Text>
                  {currentFormAnalysis.improvements.map((improvement, index) => (
                    <Text key={index} style={styles.improvementText}>
                      • {improvement}
                    </Text>
                  ))}
                </View>
              )}

              {currentFormAnalysis.tips.length > 0 && (
                <View style={styles.tipsCard}>
                  <Text style={styles.tipsTitle}>Pro Tips</Text>
                  {currentFormAnalysis.tips.map((tip, index) => (
                    <Text key={index} style={styles.tipText}>
                      • {tip}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}

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
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cardsContainer: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  exerciseButton: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  exerciseButtonSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#1E1B4B',
  },
  exerciseText: {
    color: '#D1D5DB',
    fontSize: 14,
    fontWeight: '500',
  },
  exerciseTextSelected: {
    color: '#FFFFFF',
  },
  uploadContainer: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#374151',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  uploadSubtext: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  videoPreview: {
    alignItems: 'center',
  },
  videoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  videoSubtext: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 4,
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  analyzeButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  analyzeButtonDisabled: {
    backgroundColor: '#374151',
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    gap: 16,
  },
  scoreCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  scoreTitle: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 8,
  },
  scoreValue: {
    color: '#6366F1',
    fontSize: 32,
    fontWeight: '700',
  },
  scoreExercise: {
    color: '#D1D5DB',
    fontSize: 16,
    fontWeight: '500',
    textTransform: 'capitalize',
    marginTop: 4,
  },
  metricsContainer: {
    gap: 12,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  metricLabel: {
    color: '#D1D5DB',
    fontSize: 14,
    flex: 1,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  improvementsCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  improvementsTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  improvementText: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  tipsCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  tipsTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipText: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
});