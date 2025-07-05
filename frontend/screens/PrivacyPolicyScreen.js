import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function PrivacyPolicyScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.header}>Privacy Policy</Text>
      <View style={styles.card}><Text style={styles.text}>Your privacy is important to us. This Privacy Policy explains how CloudStore collects, uses, and protects your information.</Text></View>
      <View style={styles.card}><Text style={styles.sectionHeader}>1. What We Collect</Text><Text style={styles.text}>We collect your name, email, and files you upload. We may also collect usage data to improve our service.</Text></View>
      <View style={styles.card}><Text style={styles.sectionHeader}>2. How We Use Your Data</Text><Text style={styles.text}>We use your data to provide and improve CloudStore, communicate with you, and keep your account secure. We do not sell your personal information.</Text></View>
      <View style={styles.card}><Text style={styles.sectionHeader}>3. Your Rights</Text><Text style={styles.text}>You can access, update, or delete your data at any time. Contact us to exercise your rights.</Text></View>
      <View style={styles.card}><Text style={styles.sectionHeader}>4. Security</Text><Text style={styles.text}>We use industry-standard security to protect your data. However, no system is 100% secure.</Text></View>
      <View style={styles.card}><Text style={styles.sectionHeader}>5. Contact</Text><Text style={styles.text}>If you have questions, contact us at privacy@cloudstore.com.</Text></View>
      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 18,
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
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
    marginTop: 18,
    marginBottom: 6,
    fontFamily: 'System',
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