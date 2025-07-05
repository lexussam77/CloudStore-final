import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function PrivacyPolicyScreen({ navigation }) {
  const { theme } = useTheme();
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.scrollContent}>
      <Text style={[styles.header, { color: theme.primary }]}>Privacy Policy</Text>
      <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}><Text style={[styles.text, { color: theme.text }]}>Your privacy is important to us. This Privacy Policy explains how CloudStore collects, uses, and protects your information.</Text></View>
      <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}><Text style={[styles.sectionHeader, { color: theme.primary }]}>1. What We Collect</Text><Text style={[styles.text, { color: theme.text }]}>We collect your name, email, and files you upload. We may also collect usage data to improve our service.</Text></View>
      <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}><Text style={[styles.sectionHeader, { color: theme.primary }]}>2. How We Use Your Data</Text><Text style={[styles.text, { color: theme.text }]}>We use your data to provide and improve CloudStore, communicate with you, and keep your account secure. We do not sell your personal information.</Text></View>
      <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}><Text style={[styles.sectionHeader, { color: theme.primary }]}>3. Your Rights</Text><Text style={[styles.text, { color: theme.text }]}>You can access, update, or delete your data at any time. Contact us to exercise your rights.</Text></View>
      <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}><Text style={[styles.sectionHeader, { color: theme.primary }]}>4. Security</Text><Text style={[styles.text, { color: theme.text }]}>We use industry-standard security to protect your data. However, no system is 100% secure.</Text></View>
      <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}><Text style={[styles.sectionHeader, { color: theme.primary }]}>5. Contact</Text><Text style={[styles.text, { color: theme.text }]}>If you have questions, contact us at privacy@cloudstore.com.</Text></View>
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={() => navigation.goBack()}>
        <Text style={[styles.buttonText, { color: theme.textInverse }]}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    marginBottom: 32,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  button: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignSelf: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'System',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 6,
    fontFamily: 'System',
  },
  card: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
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