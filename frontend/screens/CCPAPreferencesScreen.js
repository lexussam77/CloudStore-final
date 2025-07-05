import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';

export default function CCPAPreferencesScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.simpleTitle}>CCPA Preferences</Text>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}><Text style={styles.text}>As a California resident, you have rights under the California Consumer Privacy Act (CCPA). You can request access to your data, request deletion, or opt out of the sale of your personal information.</Text></View>
        <View style={styles.card}><TouchableOpacity style={styles.actionBtn} onPress={() => {}}><Text style={styles.buttonText}>Request My Data</Text></TouchableOpacity></View>
        <View style={styles.card}><TouchableOpacity style={styles.actionBtn} onPress={() => {}}><Text style={styles.buttonText}>Delete My Data</Text></TouchableOpacity></View>
        <View style={styles.card}><TouchableOpacity style={styles.actionBtn} onPress={() => {}}><Text style={styles.buttonText}>Do Not Sell My Info</Text></TouchableOpacity></View>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  simpleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: '#222',
    marginBottom: 32,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'System',
  },
  actionBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignSelf: 'center',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#f7fafd',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#0061FF',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  scrollContent: {
    paddingVertical: 24,
    paddingHorizontal: 8,
  },
}); 