import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Animated } from 'react-native';
import SimplePrompt from './SimplePrompt';

export default function ChangePasswordScreen({ navigation }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [promptVisible, setPromptVisible] = useState(false);
  const [promptMessage, setPromptMessage] = useState('');
  const [focusedInput, setFocusedInput] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const handleSubmit = () => {
    if (!current || !next || !confirm) {
      setPromptMessage('Please fill all fields.');
      setPromptVisible(true);
      return;
    }
    if (next !== confirm) {
      setPromptMessage('Passwords do not match.');
      setPromptVisible(true);
      return;
    }
    setPromptMessage('Password changed successfully!');
    setPromptVisible(true);
    setTimeout(() => navigation.goBack(), 1200);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        <Text style={styles.header}>Change Password</Text>
        <TextInput
          style={[styles.inputAligned, focusedInput === 'current' && styles.inputFocused]}
          placeholder="Current password"
          secureTextEntry
          value={current}
          onChangeText={setCurrent}
          onFocus={() => setFocusedInput('current')}
          onBlur={() => setFocusedInput('')}
        />
        <TextInput
          style={[styles.inputAligned, focusedInput === 'next' && styles.inputFocused]}
          placeholder="New password"
          secureTextEntry
          value={next}
          onChangeText={setNext}
          onFocus={() => setFocusedInput('next')}
          onBlur={() => setFocusedInput('')}
        />
        <TextInput
          style={[styles.inputAligned, focusedInput === 'confirm' && styles.inputFocused]}
          placeholder="Confirm new password"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
          onFocus={() => setFocusedInput('confirm')}
          onBlur={() => setFocusedInput('')}
        />
        <TouchableOpacity style={styles.button} onPress={handleSubmit} activeOpacity={0.85}>
          <Text style={styles.buttonText}>Change Password</Text>
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
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0061FF',
    marginBottom: 18,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  inputAligned: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#f6f7f9',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#222',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#e0e7ef',
    fontWeight: '500',
  },
  inputFocused: {
    borderColor: '#0061FF',
    backgroundColor: '#e6f0ff',
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