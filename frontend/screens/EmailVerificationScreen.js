import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, verifyEmail } from './api';
import CustomPrompt from './CustomPrompt';
import { useTheme } from '../theme/ThemeContext';

export default function EmailVerificationScreen({ navigation, route }) {
  const { theme } = useTheme();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState(route?.params?.email || '');
  const inputs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const [loading, setLoading] = useState(false);
  const [promptVisible, setPromptVisible] = useState(false);
  const [promptMessage, setPromptMessage] = useState('');
  const [promptSuccess, setPromptSuccess] = useState(true);
  const cardAnim = useRef(new Animated.Value(0)).current;
  const [focusedInput, setFocusedInput] = useState(-1);

  // If email is not passed, try to get it from AsyncStorage
  useEffect(() => {
    if (!email) {
      AsyncStorage.getItem('email').then(storedEmail => {
        if (storedEmail) setEmail(storedEmail);
      });
    }
  }, []);

  useEffect(() => {
    Animated.timing(cardAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const handleChange = (text, idx) => {
    if (/^[0-9]?$/.test(text)) {
      const newCode = [...code];
      newCode[idx] = text;
      setCode(newCode);
      if (text && idx < 5) {
        inputs[idx + 1].current.focus();
      }
      if (!text && idx > 0) {
        inputs[idx - 1].current.focus();
      }
    }
  };

  const handleVerify = async () => {
    setLoading(true);
      const codeStr = code.join('');
    if (codeStr.length !== 6) {
      setPromptMessage('Please enter the 6-digit code.');
      setPromptSuccess(false);
      setPromptVisible(true);
      setLoading(false);
      return;
    }
    if (!email) {
      setPromptMessage('Email is missing.');
      setPromptSuccess(false);
      setPromptVisible(true);
      setLoading(false);
      return;
    }
    console.log('Verifying email:', email, 'with code:', codeStr);
    try {
      const res = await verifyEmail({ email, code: codeStr });
      if (res.success) {
        setPromptMessage('Email verified! You can now log in.');
        setPromptSuccess(true);
        setPromptVisible(true);
      } else {
        setPromptMessage(res.error || res.data?.message || 'Invalid code.');
        setPromptSuccess(false);
        setPromptVisible(true);
      }
    } catch (err) {
      setPromptMessage(err.message || 'Network error.');
      setPromptSuccess(false);
      setPromptVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePromptClose = () => {
    setPromptVisible(false);
    if (promptSuccess) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }, { opacity: cardAnim, transform: [{ translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}>
        <Text style={[styles.header, { color: theme.primary }]}>Verify your CloudStore email</Text>
        <Text style={[styles.message, { color: theme.textSecondary }]}>Enter the 6-digit verification code sent to your email address.</Text>
        <View style={styles.codeInputRow}>
          {code.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={inputs[idx]}
              style={[
                styles.input, 
                { backgroundColor: theme.searchBackground, color: theme.searchText, borderColor: theme.border },
                digit && { borderColor: theme.primary, backgroundColor: theme.primaryLight },
                focusedInput === idx && { borderColor: theme.primary }
              ]}
              value={digit}
              onChangeText={text => handleChange(text, idx)}
              keyboardType="number-pad"
              maxLength={1}
              placeholder=""
              placeholderTextColor="transparent"
              returnKeyType="next"
              autoFocus={idx === 0}
              onFocus={() => setFocusedInput(idx)}
              onBlur={() => setFocusedInput(-1)}
            />
          ))}
        </View>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} activeOpacity={0.85} onPress={handleVerify} disabled={loading}>
          {loading ? <ActivityIndicator color={theme.textInverse} /> : <Text style={[styles.buttonText, { color: theme.textInverse }]}>Verify Email</Text>}
        </TouchableOpacity>
      </Animated.View>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      )}
      <CustomPrompt
        visible={promptVisible}
        message={promptMessage}
        onClose={handlePromptClose}
        success={promptSuccess}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 350,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    alignItems: 'center',
    marginBottom: 18,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  message: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 18,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  codeInputRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
    gap: 4, // reduced from 12
    alignSelf: 'center',
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 0,
    paddingVertical: 12,
    fontSize: 24,
    borderWidth: 1.5,
    textAlign: 'center',
    width: 40, // reduced from 44
    height: 64, // increased from 50
    fontWeight: 'bold',
    letterSpacing: 1,
    includeFontPadding: false,
    textAlignVertical: 'center',
    marginHorizontal: 2, // reduced from 4
    backgroundColor: 'transparent',
  },
  inputFilled: {
    // Colors applied dynamically
  },
  inputFocused: {
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  button: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
}); 