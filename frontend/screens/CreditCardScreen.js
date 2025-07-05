import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Alert, Animated, ActivityIndicator, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CreditCardScreen({ navigation, route }) {
  const { plan } = route.params || {};
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [focusedInput, setFocusedInput] = useState('');

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const handleSubmit = async () => {
    if (!cardNumber || !expiry || !cvc || !name) {
      return;
    }
    setLoading(true);
    setTimeout(async () => {
      setLoading(false);
      setSuccess(true);
      // Save new storage to AsyncStorage
      if (plan?.storage) {
        await AsyncStorage.setItem('user_storage', plan.storage);
      }
      setTimeout(() => {
        setSuccess(false);
        navigation.navigate('MainTabs');
      }, 1800);
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.centeredContainer}
        contentContainerStyle={styles.centeredContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}> 
          <Text style={styles.header}>Enter Card Details</Text>
          <Text style={styles.planInfo}>{plan?.name} - {plan?.price}</Text>
          <TextInput
            style={[styles.input, focusedInput === 'name' && styles.inputFocused]}
            placeholder="Cardholder Name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#888"
            onFocus={() => setFocusedInput('name')}
            onBlur={() => setFocusedInput('')}
          />
          <TextInput
            style={[styles.input, focusedInput === 'card' && styles.inputFocused]}
            placeholder="Card Number"
            value={cardNumber}
            onChangeText={setCardNumber}
            keyboardType="number-pad"
            maxLength={19}
            placeholderTextColor="#888"
            onFocus={() => setFocusedInput('card')}
            onBlur={() => setFocusedInput('')}
          />
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.inputHalf, focusedInput === 'expiry' && styles.inputFocused]}
              placeholder="MM/YY"
              value={expiry}
              onChangeText={setExpiry}
              keyboardType="number-pad"
              maxLength={5}
              placeholderTextColor="#888"
              onFocus={() => setFocusedInput('expiry')}
              onBlur={() => setFocusedInput('')}
            />
            <TextInput
              style={[styles.input, styles.inputHalf, { marginLeft: 10 }, focusedInput === 'cvc' && styles.inputFocused]}
              placeholder="CVC"
              value={cvc}
              onChangeText={setCvc}
              keyboardType="number-pad"
              maxLength={4}
              placeholderTextColor="#888"
              onFocus={() => setFocusedInput('cvc')}
              onBlur={() => setFocusedInput('')}
            />
          </View>
          <TouchableOpacity style={styles.ctaButton} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
            <Text style={styles.ctaButtonText}>{loading ? 'Processing...' : 'Start Free Trial'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()} disabled={loading}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
        {/* Loading Modal */}
        <Modal visible={loading} transparent animationType="fade">
          <View style={styles.modalBg}>
            <View style={styles.modalCard}>
              <ActivityIndicator size="large" color="#0061FF" />
              <Text style={{ marginTop: 16, fontSize: 16, color: '#222' }}>Processing payment...</Text>
            </View>
          </View>
        </Modal>
        {/* Success Modal */}
        <Modal visible={success} transparent animationType="fade">
          <View style={styles.modalBg}>
            <View style={styles.modalCard}>
              <Text style={{ fontSize: 22, color: '#0061FF', fontWeight: 'bold', marginBottom: 10 }}>Successfully purchased!</Text>
              <Text style={{ fontSize: 16, color: '#222' }}>Your plan has been upgraded.</Text>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 28,
    margin: 18,
    shadowColor: '#0061FF',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 320,
    maxWidth: 400,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0061FF',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  planInfo: {
    fontSize: 16,
    color: '#222',
    marginBottom: 18,
    textAlign: 'center',
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
  inputHalf: {
    width: '48%',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  ctaButton: {
    width: '100%',
    backgroundColor: '#0061FF',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#0061FF',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  ctaButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  cancelBtn: {
    marginTop: 16,
  },
  cancelBtnText: {
    color: '#0061FF',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0061FF',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    minWidth: 260,
  },
  inputFocused: {
    borderColor: '#0061FF',
    backgroundColor: '#e6f0ff',
  },
}); 