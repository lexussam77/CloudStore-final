import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function TermsOfServiceScreen({ navigation }) {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.scrollContent}>
      <Animated.View style={{ opacity: fadeAnim }}>
      <Text style={[styles.header, { color: theme.primary }]}>Terms of Service</Text>
      <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}><Text style={[styles.text, { color: theme.text }]}>Welcome to CloudStore! Please read these Terms of Service ("Terms") carefully before using our app. By accessing or using CloudStore, you agree to be bound by these Terms.</Text></View>
      <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}><Text style={[styles.sectionHeader, { color: theme.primary }]}>1. Using CloudStore</Text><Text style={[styles.text, { color: theme.text }]}>You must be at least 13 years old to use CloudStore. You are responsible for your account and all activity on it. Please keep your password secure.</Text></View>
      <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}><Text style={[styles.sectionHeader, { color: theme.primary }]}>2. Your Content</Text><Text style={[styles.text, { color: theme.text }]}>You retain ownership of your files. By uploading, you grant us permission to store and back up your files as needed to provide our service. We do not claim ownership of your content.</Text></View>
      <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}><Text style={[styles.sectionHeader, { color: theme.primary }]}>3. Prohibited Use</Text><Text style={[styles.text, { color: theme.text }]}>Do not use CloudStore to store or share illegal, harmful, or infringing content. We reserve the right to suspend accounts that violate these rules.</Text></View>
      <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}><Text style={[styles.sectionHeader, { color: theme.primary }]}>4. Termination</Text><Text style={[styles.text, { color: theme.text }]}>You may stop using CloudStore at any time. We may suspend or terminate your account if you violate these Terms.</Text></View>
      <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}><Text style={[styles.sectionHeader, { color: theme.primary }]}>5. Changes</Text><Text style={[styles.text, { color: theme.text }]}>We may update these Terms from time to time. We will notify you of significant changes.</Text></View>
      <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}><Text style={[styles.sectionHeader, { color: theme.primary }]}>6. Contact</Text><Text style={[styles.text, { color: theme.text }]}>If you have questions, contact us at support@cloudstore.com.</Text></View>
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary, shadowColor: theme.shadow }]} onPress={() => navigation.goBack()}>
        <Text style={[styles.buttonText, { color: theme.textInverse }]}>Back</Text>
      </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  text: {
    fontSize: 16,
    marginBottom: 24,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  button: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignSelf: 'center',
    width: '100%',
    marginTop: 10,
    marginBottom: 10,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
    letterSpacing: 0.1,
  },
  card: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  scrollContent: {
    paddingVertical: 24,
    paddingHorizontal: 8,
  },
}); 