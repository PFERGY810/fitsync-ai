import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import PhysiqueUploader from '@/components/physique/PhysiqueUploader';

export default function PhysiqueSetupScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Upload Physique Photos',
          headerStyle: {
            backgroundColor: '#121212',
          },
          headerTintColor: '#fff',
        }}
      />
      <PhysiqueUploader />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
});