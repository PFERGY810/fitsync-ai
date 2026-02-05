import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { PhysiqueResults } from '@/components/physique/PhysiqueResults';

export default function PhysiqueResultsScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Physique Analysis',
          headerStyle: {
            backgroundColor: '#121212',
          },
          headerTintColor: '#fff',
        }}
      />
      <PhysiqueResults />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
});