import React, { useState, useRef, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert, Image, ActivityIndicator, Animated, Easing } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, registerUser } from './api';
import CustomPrompt from './CustomPrompt';
import { AuthContext } from './AuthContext';

export default function AuthScreen({ navigation }) {
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
    <SafeAreaView style={styles.container}>
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
          <AntDesign name="cloud" size={38} color="#0061FF" style={{ marginBottom: 2 }} />
          <Text style={styles.logoText}>CloudStore</Text>
        </Animated.View>
        {/* Flip Card */}
        <Animated.View style={[styles.cardWrap, { opacity: cardAnim, transform: [{ translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}> 
        <View style={{ height: 340, width: '100%', alignItems: 'center', marginTop: 10 }}>
            <Animated.View
              style={[styles.flipCard, { transform: [{ rotateY: frontInterpolate }] }]}
              pointerEvents={isLogin ? 'auto' : 'none'}
            >
            {isLogin && (
              <View style={styles.form}>
                <TextInput
                  style={[styles.input, focusedInput === 'identifier' && styles.inputFocused]}
                  placeholder="Email or Username"
                  value={email}
                  onChangeText={setEmail}
                  placeholderTextColor="#888"
                  onFocus={() => setFocusedInput('identifier')}
                  onBlur={() => setFocusedInput('')}
                />
                <TextInput
                  style={[styles.input, focusedInput === 'password' && styles.inputFocused]}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor="#888"
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput('')}
                />
                <TouchableOpacity style={styles.submitBtn} activeOpacity={0.85} onPress={handleSubmit} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Log in</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={flipCard} style={styles.link}>
                  <Text style={styles.link}>Don't have an account? <Text style={{ color: '#0061FF' }}>Sign up</Text></Text>
                </TouchableOpacity>
                  <View style={styles.dividerRow}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>or</Text>
                    <View style={styles.divider} />
                  </View>
                <TouchableOpacity style={styles.googleBtn} activeOpacity={0.85} onPress={() => Alert.alert('Google Sign-In')}>
                  <Image source={require('../assets/images/Google.png')} style={styles.googleLogo} />
                  <Text style={styles.googleBtnText}>Continue with Google</Text>
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
                  style={[styles.input, focusedInput === 'name' && styles.inputFocused]}
                  placeholder="Full name"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor="#888"
                  onFocus={() => setFocusedInput('name')}
                  onBlur={() => setFocusedInput('')}
                />
                <TextInput
                  style={[styles.input, focusedInput === 'email' && styles.inputFocused]}
                  placeholder="Email address"
                  value={email}
                  onChangeText={setEmail}
                  placeholderTextColor="#888"
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput('')}
                />
                <TextInput
                  style={[styles.input, focusedInput === 'password' && styles.inputFocused]}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor="#888"
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput('')}
                />
                <TextInput
                  style={[styles.input, focusedInput === 'confirmPassword' && styles.inputFocused]}
                    placeholder="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholderTextColor="#888"
                  onFocus={() => setFocusedInput('confirmPassword')}
                  onBlur={() => setFocusedInput('')}
                />
                <TouchableOpacity style={styles.submitBtn} activeOpacity={0.85} onPress={handleSubmit} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Sign up</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={flipCard} style={styles.link}>
                  <Text style={styles.link}>Already have an account? <Text style={{ color: '#0061FF' }}>Log in</Text></Text>
                </TouchableOpacity>
                  <View style={styles.dividerRow}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>or</Text>
                    <View style={styles.divider} />
                  </View>
                <TouchableOpacity style={styles.googleBtn} activeOpacity={0.85} onPress={() => Alert.alert('Google Sign-In')}>
                  <Image source={require('../assets/images/Google.png')} style={styles.googleLogo} />
                  <Text style={styles.googleBtnText}>Continue with Google</Text>
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
    backgroundColor: '#fff',
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 18,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0061FF',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  cardWrap: {
    width: '92%',
    maxWidth: 400,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 18,
    shadowColor: '#0061FF',
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
    backgroundColor: '#f6f7f9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#222',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#f6f7f9',
    fontWeight: '500',
  },
  inputFocused: {
    borderColor: '#0061FF',
    backgroundColor: '#e6f0ff',
  },
  submitBtn: {
    width: '100%',
    backgroundColor: '#0061FF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 8,
    shadowColor: '#0061FF',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    color: '#0061FF',
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
    backgroundColor: '#e0e7ef',
    borderRadius: 1,
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e0e7ef',
    paddingVertical: 12,
    paddingHorizontal: 18,
    width: '100%',
    justifyContent: 'center',
    marginTop: 2,
    shadowColor: '#000',
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
    color: '#222',
    fontWeight: 'bold',
    fontSize: 15,
  },
}); 