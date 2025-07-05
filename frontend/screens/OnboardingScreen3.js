import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView } from 'react-native';

export default function OnboardingScreen3({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <Image source={require('../assets/images/settings.png')} style={styles.illustration} />
      <Text style={styles.headline}>Stay in control</Text>
      <Text style={styles.subtext}>Manage your files and settings with ease and security in CloudStore.</Text>
      <TouchableOpacity style={styles.button} activeOpacity={0.85} onPress={() => navigation.navigate('AddAccount')}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
      {/* After sign-up, user will be taken to EmailVerification, then Login, then MainTabs */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  illustration: {
    width: 140,
    height: 140,
    marginBottom: 36,
    resizeMode: 'contain',
    borderRadius: 24,
    backgroundColor: '#f5f3ef',
    shadowColor: '#007AFF',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  headline: {
    fontSize: 30,
    fontWeight: 'bold',
    fontFamily: 'System',
    color: '#2563eb',
    marginBottom: 14,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtext: {
    fontSize: 17,
    color: '#444',
    marginBottom: 36,
    textAlign: 'center',
    fontWeight: 'bold',
    fontFamily: 'System',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#2563eb',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'System',
    fontSize: 19,
    letterSpacing: 0.5,
  },
}); 