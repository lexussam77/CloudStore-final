import React, { useState, useRef, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert, Image, ActivityIndicator, Animated, Easing } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, registerUser } from './api';
import CustomPrompt from './CustomPrompt';
import { AuthContext } from './AuthContext';
import { useTheme } from '../theme/ThemeContext';

export default function AuthScreen({ navigation }) {
  const { theme } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [promptVisible, setPromptVisible] = useState(false);
  const [promptMessage, setPromptMessage] = useState('');
  const [promptSuccess, setPromptSuccess] = useState(true);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [flipped, setFlipped] = useState(false);
  const [focusedInput, setFocusedInput] = useState('');
  const { setJwt } = useContext(AuthContext);
  const cardAnim = useRef(new Animated.Value(0)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(cardAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    Animated.timing(logoAnim, {
      toValue: isLogin ? 0 : 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [isLogin]);

  // Interpolate rotation
  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const flipCard = () => {
    if (!flipped) {
      Animated.timing(flipAnim, {
        toValue: 180,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }).start(() => setFlipped(true));
    } else {
      Animated.timing(flipAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }).start(() => setFlipped(false));
    }
    setIsLogin(!isLogin);
  };

  const handleSubmit = async () => {
    // Validation for login
    if (isLogin) {
      if (!email.trim() || !password.trim()) {
        setPromptMessage('Please enter both email/username and password.');
        setPromptSuccess(false);
        setPromptVisible(true);
        return;
      }
      if (password.length < 6) {
        setPromptMessage('Password must be at least 6 characters.');
        setPromptSuccess(false);
        setPromptVisible(true);
        return;
      }
    } else {
      // Validation for signup
      if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
        setPromptMessage('Please fill in all fields.');
        setPromptSuccess(false);
        setPromptVisible(true);
        return;
      }
      if (password.length < 6 || confirmPassword.length < 6) {
        setPromptMessage('Password must be at least 6 characters.');
        setPromptSuccess(false);
        setPromptVisible(true);
        return;
      }
      if (password !== confirmPassword) {
        setPromptMessage('Passwords do not match.');
        setPromptSuccess(false);
        setPromptVisible(true);
        return;
      }
    }
    setLoading(true);
    if (isLogin) {
      try {
        const res = await loginUser({ identifier: email, password });
        if (res.success && res.data.token) {
          await AsyncStorage.setItem('jwt', res.data.token);
          setJwt(res.data.token);
          setPromptMessage('Login Successful! Welcome back!');
          setPromptSuccess(true);
          setPromptVisible(true);
        } else {
          setPromptMessage(res.error || res.data?.message || 'Invalid credentials.');
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
    } else {
      try {
        const res = await registerUser({ email, password, name });
        if (res.success) {
          setPromptMessage('Registration Successful! Check your email for the verification code.');
          setPromptSuccess(true);
          setPromptVisible(true);
        } else {
          setPromptMessage(res.error || res.data?.message || 'Registration failed.');
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
    }
  };

  const handlePromptClose = () => {
    setPromptVisible(false);
    if (promptSuccess && !isLogin) {
      navigation.navigate('EmailVerification', { email });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        {/* Logo */}
        <Animated.View
          style={[
            styles.logoWrap,
            {
              transform: [
                {
                  translateY: logoAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -60],
                  }),
                },
              ],
            },
          ]}
        >
          <AntDesign name="cloud" size={38} color={theme.primary} style={{ marginBottom: 2 }} />
          <Text style={[styles.logoText, { color: theme.text }]}>CloudStore</Text>
        </Animated.View>
        {/* Flip Card */}
        <Animated.View style={[styles.cardWrap, { backgroundColor: theme.card, shadowColor: theme.shadow }, { opacity: cardAnim, transform: [{ translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}> 
        <View style={{ height: 340, width: '100%', alignItems: 'center', marginTop: 10 }}>
            <Animated.View
              style={[styles.flipCard, { transform: [{ rotateY: frontInterpolate }] }]}
              pointerEvents={isLogin ? 'auto' : 'none'}
            >
            {isLogin && (
              <View style={styles.form}>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.searchBackground, color: theme.searchText, borderColor: theme.border }, focusedInput === 'identifier' && { borderColor: theme.primary }]}
                  placeholder="Email or Username"
                  value={email}
                  onChangeText={setEmail}
                  placeholderTextColor={theme.searchPlaceholder}
                  onFocus={() => setFocusedInput('identifier')}
                  onBlur={() => setFocusedInput('')}
                />
                <TextInput
                  style={[styles.input, { backgroundColor: theme.searchBackground, color: theme.searchText, borderColor: theme.border }, focusedInput === 'password' && { borderColor: theme.primary }]}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor={theme.searchPlaceholder}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput('')}
                />
                <TouchableOpacity style={[styles.submitBtn, { backgroundColor: theme.primary }]} activeOpacity={0.85} onPress={handleSubmit} disabled={loading}>
                  {loading ? <ActivityIndicator color={theme.textInverse} /> : <Text style={[styles.submitText, { color: theme.textInverse }]}>Log in</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={flipCard} style={styles.link}>
                  <Text style={[styles.link, { color: theme.textSecondary }]}>Don't have an account? <Text style={{ color: theme.primary }}>Sign up</Text></Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
            <Animated.View
              style={[styles.flipCard, styles.flipCardBack, { transform: [{ rotateY: backInterpolate }] }]}
              pointerEvents={!isLogin ? 'auto' : 'none'}
            >
            {!isLogin && (
              <View style={styles.form}>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.searchBackground, color: theme.searchText, borderColor: theme.border }, focusedInput === 'name' && { borderColor: theme.primary }]}
                  placeholder="Full name"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor={theme.searchPlaceholder}
                  onFocus={() => setFocusedInput('name')}
                  onBlur={() => setFocusedInput('')}
                />
                <TextInput
                  style={[styles.input, { backgroundColor: theme.searchBackground, color: theme.searchText, borderColor: theme.border }, focusedInput === 'email' && { borderColor: theme.primary }]}
                  placeholder="Email address"
                  value={email}
                  onChangeText={setEmail}
                  placeholderTextColor={theme.searchPlaceholder}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput('')}
                />
                <TextInput
                  style={[styles.input, { backgroundColor: theme.searchBackground, color: theme.searchText, borderColor: theme.border }, focusedInput === 'password' && { borderColor: theme.primary }]}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor={theme.searchPlaceholder}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput('')}
                />
                <TextInput
                  style={[styles.input, { backgroundColor: theme.searchBackground, color: theme.searchText, borderColor: theme.border }, focusedInput === 'confirmPassword' && { borderColor: theme.primary }]}
                    placeholder="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholderTextColor={theme.searchPlaceholder}
                  onFocus={() => setFocusedInput('confirmPassword')}
                  onBlur={() => setFocusedInput('')}
                />
                <TouchableOpacity style={[styles.submitBtn, { backgroundColor: theme.primary }]} activeOpacity={0.85} onPress={handleSubmit} disabled={loading}>
                  {loading ? <ActivityIndicator color={theme.textInverse} /> : <Text style={[styles.submitText, { color: theme.textInverse }]}>Sign up</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={flipCard} style={styles.link}>
                  <Text style={[styles.link, { color: theme.textSecondary }]}>Already have an account? <Text style={{ color: theme.primary }}>Log in</Text></Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </View>
        </Animated.View>
      <CustomPrompt
        visible={promptVisible}
        message={promptMessage}
          success={promptSuccess}
        onClose={handlePromptClose}
      />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 18,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  cardWrap: {
    width: '92%',
    maxWidth: 400,
    alignItems: 'center',
    borderRadius: 22,
    padding: 18,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  flipCard: {
    width: '100%',
    height: 340,
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  flipCardBack: {
    zIndex: 2,
  },
  form: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  input: {
    width: '100%',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    fontWeight: '500',
  },
  inputFocused: {
    // Colors applied dynamically
  },
  submitBtn: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 8,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  submitText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    fontWeight: '500',
    fontSize: 15,
    marginTop: 2,
    marginBottom: 8,
    textAlign: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 8,
  },
  divider: {
    flex: 1,
    height: 1.5,
    borderRadius: 1,
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 18,
    width: '100%',
    justifyContent: 'center',
    marginTop: 2,
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  googleLogo: {
    width: 22,
    height: 22,
    marginRight: 10,
  },
  googleBtnText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
}); 