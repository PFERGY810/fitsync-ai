import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAIStore } from '@/stores/ai-store';
import { Camera, ArrowRight } from 'lucide-react-native';

export default function PhysiqueAnalysisScreen() {
  const router = useRouter();
  const { currentPhysiqueAnalysis, physiqueAnalysisHistory } = useAIStore();
  
  const navigateToPhysiqueSetup = () => {
    router.push('/physique-setup');
  };
  
  const navigateToResults = () => {
    router.push('/physique-results');
  };
  
  return (
    <ScrollView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Physique Analysis',
          headerStyle: {
            backgroundColor: '#121212',
          },
          headerTintColor: '#fff',
        }}
      />
      
      <View style={styles.header}>
        <Text style={styles.title}>Physique Analysis</Text>
        <Text style={styles.subtitle}>
          Upload photos to get personalized feedback on your physique
        </Text>
      </View>
      
      {currentPhysiqueAnalysis ? (
        <TouchableOpacity 
          style={styles.currentAnalysisCard}
          onPress={navigateToResults}
        >
          <View style={styles.cardContent}>
            <View>
              <Text style={styles.cardTitle}>Current Analysis</Text>
              <Text style={styles.cardDate}>{currentPhysiqueAnalysis.date}</Text>
              
              <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>{currentPhysiqueAnalysis.metrics.muscleMass}%</Text>
                  <Text style={styles.metricLabel}>Muscle Mass</Text>
                </View>
                
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>{currentPhysiqueAnalysis.metrics.bodyFat}%</Text>
                  <Text style={styles.metricLabel}>Body Fat</Text>
                </View>
              </View>
            </View>
            
            <ArrowRight size={24} color="#3a7bfd" />
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.emptyStateContainer}>
          <Camera size={48} color="#666" />
          <Text style={styles.emptyStateText}>No analysis available</Text>
          <Text style={styles.emptyStateSubtext}>
            Upload photos to get personalized feedback
          </Text>
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.uploadButton}
        onPress={navigateToPhysiqueSetup}
      >
        <Camera size={20} color="#fff" />
        <Text style={styles.uploadButtonText}>
          {currentPhysiqueAnalysis ? 'New Analysis' : 'Upload Photos'}
        </Text>
      </TouchableOpacity>
      
      {physiqueAnalysisHistory.length > 0 && (
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Analysis History</Text>
          
          {physiqueAnalysisHistory.map((analysis, index) => (
            <View key={`history-${index}`} style={styles.historyItem}>
              <View style={styles.historyItemContent}>
                <Text style={styles.historyItemDate}>{analysis.date}</Text>
                
                <View style={styles.historyMetrics}>
                  <Text style={styles.historyMetric}>
                    Muscle Mass: {analysis.metrics.muscleMass}%
                  </Text>
                  <Text style={styles.historyMetric}>
                    Body Fat: {analysis.metrics.bodyFat}%
                  </Text>
                  <Text style={styles.historyMetric}>
                    Symmetry: {analysis.metrics.symmetry}/10
                  </Text>
                </View>
                
                {analysis.weakPoints.length > 0 && (
                  <Text style={styles.historyWeakPoints}>
                    Focus areas: {analysis.weakPoints.join(', ')}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
      
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Why Analyze Your Physique?</Text>
        <Text style={styles.infoText}>
          Our AI analyzes your physique to identify muscle development, symmetry, and areas for improvement.
          This helps create personalized workout and nutrition plans tailored to your specific needs.
        </Text>
        
        <Text style={styles.infoTitle}>How It Works</Text>
        <View style={styles.stepContainer}>
          <View style={styles.stepCircle}>
            <Text style={styles.stepNumber}>1</Text>
          </View>
          <Text style={styles.stepText}>Upload photos from different angles</Text>
        </View>
        
        <View style={styles.stepContainer}>
          <View style={styles.stepCircle}>
            <Text style={styles.stepNumber}>2</Text>
          </View>
          <Text style={styles.stepText}>AI analyzes muscle development, symmetry, and body composition</Text>
        </View>
        
        <View style={styles.stepContainer}>
          <View style={styles.stepCircle}>
            <Text style={styles.stepNumber}>3</Text>
          </View>
          <Text style={styles.stepText}>Get personalized workout and nutrition plans</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 24,
  },
  currentAnalysisCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  metricItem: {
    marginRight: 24,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3a7bfd',
  },
  metricLabel: {
    fontSize: 14,
    color: '#aaa',
  },
  emptyStateContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 32,
    marginHorizontal: 16,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
  },
  uploadButton: {
    backgroundColor: '#3a7bfd',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  historySection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  historyItem: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  historyItemContent: {
    flex: 1,
  },
  historyItemDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  historyMetrics: {
    marginBottom: 8,
  },
  historyMetric: {
    fontSize: 14,
    color: '#bbb',
    marginBottom: 4,
  },
  historyWeakPoints: {
    fontSize: 14,
    color: '#ff4d4d',
    fontStyle: 'italic',
  },
  infoSection: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#bbb',
    lineHeight: 20,
    marginBottom: 16,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3a7bfd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  stepText: {
    fontSize: 14,
    color: '#bbb',
    flex: 1,
  },
});