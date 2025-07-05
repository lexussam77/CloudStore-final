import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, Animated } from 'react-native';
import SimplePrompt from './SimplePrompt';

export default function TwoFactorScreen({ navigation }) {
  const [promptVisible, setPromptVisible] = useState(false);
  const [promptMessage, setPromptMessage] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const handleEnable = () => {
    setPromptMessage('Fingerprint enabled for two-factor authentication!');
    setPromptVisible(true);
    setTimeout(() => navigation.goBack(), 1200);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        <Image source={{ uri: 'https://img.icons8.com/fluency/96/fingerprint.png' }} style={styles.fingerprintImg} />
        <Text style={styles.header}>Two-Factor Authentication</Text>
        <Text style={styles.info}>Add an extra layer of security to your account by enabling fingerprint authentication.</Text>
        <TouchableOpacity style={styles.button} onPress={handleEnable} activeOpacity={0.85}>
          <Text style={styles.buttonText}>Enable fingerprint</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
      </Animated.View>
      <SimplePrompt
        visible={promptVisible}
        message={promptMessage}
        onClose={() => setPromptVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 32,
    marginHorizontal: 10,
    shadowColor: '#0061FF',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fingerprintImg: {
    width: 64,
    height: 64,
    marginBottom: 12,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0061FF',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  info: {
    fontSize: 16,
    color: '#444',
    marginBottom: 22,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  button: {
    backgroundColor: '#0061FF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 8,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#0061FF',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  backBtn: {
    marginTop: 18,
    alignSelf: 'center',
  },
  backBtnText: {
    color: '#0061FF',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
}); 