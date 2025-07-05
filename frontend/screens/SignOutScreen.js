import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './AuthContext';

export default function SignOutScreen({ navigation }) {
  const { setJwt } = useContext(AuthContext);

  const handleSignOut = async () => {
    await AsyncStorage.removeItem('jwt');
    setJwt(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.simpleTitle}>Sign Out</Text>
      <View style={styles.iconWrap}>
        <Feather name="log-out" size={48} color="#0061FF" />
      </View>
      <Text style={styles.header}>Sign Out</Text>
      <Text style={styles.message}>Are you sure you want to sign out of your CloudStore account?</Text>
      <TouchableOpacity style={styles.button} onPress={handleSignOut} activeOpacity={0.85}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8fc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconWrap: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#0061FF',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0061FF',
    marginBottom: 18,
    fontFamily: 'System',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#888',
    marginBottom: 32,
    textAlign: 'center',
    fontWeight: '400',
    fontFamily: 'System',
  },
  button: {
    backgroundColor: '#0061FF',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#0061FF',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily: 'System',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  cancelButtonText: {
    color: '#0061FF',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'System',
    textAlign: 'center',
  },
  simpleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
}); 