import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Upload, CheckCircle } from 'lucide-react-native';
import { usePhysiqueAnalysis } from '@/hooks/use-physique-analysis';
import { useUserStore } from '@/stores/user-store';
import { PhysiqueAnalysisRequest } from '@/types/ai';
import { LinearGradient } from 'expo-linear-gradient';

const POSE_TYPES = [
  { id: 'front', label: 'Front' },
  { id: 'back', label: 'Back' },
  { id: 'side', label: 'Side' },
  { id: 'legs', label: 'Legs' },
];

// Add glutes for female users
const FEMALE_POSE_TYPES = [
  ...POSE_TYPES,
  { id: 'glutes', label: 'Glutes' },
];



export const PhysiqueUploader = () => {
  const router = useRouter();
  const { userProfile } = useUserStore();
  const { analyzePhysique, isAnalyzing, error } = usePhysiqueAnalysis();
  
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [currentPoseType, setCurrentPoseType] = useState<string>('front');
  const [uploadComplete, setUploadComplete] = useState(false);
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;
  const progressAnim = React.useRef(new Animated.Value(0)).current;

  const poseTypes = userProfile?.gender === 'female' ? FEMALE_POSE_TYPES : POSE_TYPES;

  useEffect(() => {
    // Fade in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, scaleAnim]);

  useEffect(() => {
    // Update progress animation when photos are added
    const completedPhotos = Object.keys(photos).length;
    const totalPhotos = poseTypes.length;
    const progress = completedPhotos / totalPhotos;
    
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
    
    setUploadProgress(Math.round(progress * 100));
  }, [photos, poseTypes.length, progressAnim]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      
      // Validate URI is not empty
      if (!imageUri || imageUri.trim() === '') {
        console.error('Invalid image URI received');
        return;
      }
      
      setPhotos(prev => ({
        ...prev,
        [currentPoseType]: imageUri
      }));
      
      // Check if all required photos are uploaded
      const requiredPoses = poseTypes.map(pose => pose.id);
      const updatedPhotos = { ...photos, [currentPoseType]: imageUri };
      
      const allUploaded = requiredPoses.every(pose => updatedPhotos[pose] && updatedPhotos[pose].trim() !== '');
      setUploadComplete(allUploaded);
      
      // Move to next pose type if available
      const currentIndex = poseTypes.findIndex(pose => pose.id === currentPoseType);
      if (currentIndex < poseTypes.length - 1) {
        setTimeout(() => {
          setCurrentPoseType(poseTypes[currentIndex + 1].id);
          setCurrentPoseIndex(currentIndex + 1);
        }, 500);
      }
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      
      // Validate URI is not empty
      if (!imageUri || imageUri.trim() === '') {
        console.error('Invalid image URI received');
        return;
      }
      
      setPhotos(prev => ({
        ...prev,
        [currentPoseType]: imageUri
      }));
      
      // Check if all required photos are uploaded
      const requiredPoses = poseTypes.map(pose => pose.id);
      const updatedPhotos = { ...photos, [currentPoseType]: imageUri };
      
      const allUploaded = requiredPoses.every(pose => updatedPhotos[pose] && updatedPhotos[pose].trim() !== '');
      setUploadComplete(allUploaded);
      
      // Move to next pose type if available
      const currentIndex = poseTypes.findIndex(pose => pose.id === currentPoseType);
      if (currentIndex < poseTypes.length - 1) {
        setTimeout(() => {
          setCurrentPoseType(poseTypes[currentIndex + 1].id);
          setCurrentPoseIndex(currentIndex + 1);
        }, 500);
      }
    }
  };

  const startAnalysis = async () => {
    setAnalysisStarted(true);
    
    try {
      // Analyze each photo sequentially
      for (const poseType of poseTypes) {
        const imageUri = photos[poseType.id];
        
        if (imageUri && imageUri.trim() !== '') {
          const request: PhysiqueAnalysisRequest = {
            poseType: poseType.id,
            imageUri: imageUri.trim(),
          };
          
          await analyzePhysique(request);
        } else {
          console.warn(`Skipping analysis for ${poseType.id} - no valid image URI`);
        }
      }
      
      // Navigate to results after all analyses are complete
      router.push('/physique-results');
    } catch (err) {
      console.error('Error during physique analysis:', err);
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <ScrollView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.title}>Upload Physique Photos</Text>
        <Text style={styles.subtitle}>
          We&apos;ll analyze your photos to create a personalized plan
        </Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
          <Text style={styles.progressText}>{uploadProgress}% Complete</Text>
        </View>
        
        <View style={styles.poseSelector}>
          {poseTypes.map((pose, index) => (
            <TouchableOpacity
              key={pose.id}
              style={[
                styles.poseButton,
                currentPoseType === pose.id && styles.activePoseButton,
                photos[pose.id] ? styles.completedPoseButton : null
              ]}
              onPress={() => {
                setCurrentPoseType(pose.id);
                setCurrentPoseIndex(index);
              }}
            >
              {photos[pose.id] && (
                <CheckCircle size={16} color="#10B981" style={styles.checkIcon} />
              )}
              <Text 
                style={[
                  styles.poseButtonText,
                  currentPoseType === pose.id && styles.activePoseButtonText,
                  photos[pose.id] && styles.completedPoseButtonText
                ]}
              >
                {pose.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.photoContainer}>
          {photos[currentPoseType] && photos[currentPoseType].trim() !== '' ? (
            <Image 
              source={{ uri: photos[currentPoseType] }} 
              style={styles.photoPreview} 
              resizeMode="cover"
              onError={(error) => {
                console.error('Image load error:', error);
                // Remove the invalid URI from photos
                setPhotos(prev => {
                  const updated = { ...prev };
                  delete updated[currentPoseType];
                  return updated;
                });
              }}
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Camera size={48} color="#6366F1" />
              <Text style={styles.placeholderText}>
                Upload a {currentPoseType} view photo
              </Text>
              <Text style={styles.placeholderSubtext}>
                {currentPoseIndex + 1} of {poseTypes.length}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.uploadButton} 
            onPress={pickImage}
          >
            <Upload size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Gallery</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cameraButton} 
            onPress={takePhoto}
          >
            <Camera size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Camera</Text>
          </TouchableOpacity>
        </View>
        
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        
        <TouchableOpacity 
          style={[
            styles.analyzeButton,
            (!uploadComplete || isAnalyzing) && styles.disabledButton
          ]} 
          onPress={startAnalysis}
          disabled={!uploadComplete || isAnalyzing}
        >
          {isAnalyzing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.analyzeButtonText}>Analyzing...</Text>
            </View>
          ) : (
            <LinearGradient
              colors={uploadComplete ? ['#FF4500', '#FF7E50'] : ['#6B7280', '#9CA3AF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.analyzeButtonText}>
                {analysisStarted ? 'Analyzing...' : 'Analyze Physique'}
              </Text>
            </LinearGradient>
          )}
        </TouchableOpacity>
        
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Tips for Best Results</Text>
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>Take photos in good lighting with a neutral background</Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>Wear fitted clothing that shows your physique clearly</Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>Stand in a relaxed pose with good posture</Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>Ensure your entire body is visible in the frame</Text>
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  content: {
    padding: 20,
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
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#1F2937',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF4500',
    borderRadius: 4,
  },
  progressText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'right',
  },
  poseSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 8,
  },
  poseButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#1F2937',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  activePoseButton: {
    backgroundColor: '#1E1B4B',
    borderColor: '#6366F1',
  },
  completedPoseButton: {
    backgroundColor: '#064E3B',
    borderColor: '#10B981',
  },
  poseButtonText: {
    color: '#D1D5DB',
    fontWeight: '500',
  },
  activePoseButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  completedPoseButtonText: {
    color: '#FFFFFF',
  },
  checkIcon: {
    marginRight: 6,
  },
  photoContainer: {
    width: '100%',
    height: 400,
    backgroundColor: '#111827',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    color: '#D1D5DB',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  placeholderSubtext: {
    color: '#6B7280',
    marginTop: 8,
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  cameraButton: {
    flex: 1,
    backgroundColor: '#1E1B4B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  analyzeButton: {
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F2937',
    paddingVertical: 16,
    gap: 8,
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  tipsContainer: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#374151',
  },
  tipsTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6366F1',
    marginTop: 6,
    marginRight: 8,
  },
  tipText: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});

export default PhysiqueUploader;