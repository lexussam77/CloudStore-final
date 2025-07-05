import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Animated } from 'react-native';
import SimplePrompt from './SimplePrompt';
import { useTheme } from '../theme/ThemeContext';

export default function ChangePasswordScreen({ navigation }) {
  const { theme } = useTheme();
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow, opacity: fadeAnim }]}>
        <Text style={[styles.header, { color: theme.primary }]}>Change Password</Text>
        <TextInput
          style={[
            styles.inputAligned, 
            { backgroundColor: theme.input, color: theme.text, borderColor: theme.border },
            focusedInput === 'current' && [styles.inputFocused, { borderColor: theme.primary, backgroundColor: theme.primaryLight }]
          ]}
          placeholder="Current password"
          placeholderTextColor={theme.textSecondary}
          secureTextEntry
          value={current}
          onChangeText={setCurrent}
          onFocus={() => setFocusedInput('current')}
          onBlur={() => setFocusedInput('')}
        />
        <TextInput
          style={[
            styles.inputAligned, 
            { backgroundColor: theme.input, color: theme.text, borderColor: theme.border },
            focusedInput === 'next' && [styles.inputFocused, { borderColor: theme.primary, backgroundColor: theme.primaryLight }]
          ]}
          placeholder="New password"
          placeholderTextColor={theme.textSecondary}
          secureTextEntry
          value={next}
          onChangeText={setNext}
          onFocus={() => setFocusedInput('next')}
          onBlur={() => setFocusedInput('')}
        />
        <TextInput
          style={[
            styles.inputAligned, 
            { backgroundColor: theme.input, color: theme.text, borderColor: theme.border },
            focusedInput === 'confirm' && [styles.inputFocused, { borderColor: theme.primary, backgroundColor: theme.primaryLight }]
          ]}
          placeholder="Confirm new password"
          placeholderTextColor={theme.textSecondary}
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
          onFocus={() => setFocusedInput('confirm')}
          onBlur={() => setFocusedInput('')}
        />
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary, shadowColor: theme.shadow }]} onPress={handleSubmit} activeOpacity={0.85}>
          <Text style={[styles.buttonText, { color: theme.textInverse }]}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={[styles.backBtnText, { color: theme.primary }]}>Back</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 22,
    padding: 32,
    marginHorizontal: 10,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 350,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  inputAligned: {
    width: '100%',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    fontWeight: '500',
    height: 52,
  },
  inputFocused: {
    borderColor: '#0061FF',
    backgroundColor: '#e6f0ff',
  },
  button: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 8,
    alignItems: 'center',
    width: '100%',
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
  backBtn: {
    marginTop: 18,
    alignSelf: 'center',
  },
  backBtnText: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
}); 