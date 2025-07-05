import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export default function DeleteAccountScreen({ navigation }) {
  const { setJwt } = useContext(AuthContext);

  const handleDelete = async () => {
    // ... your delete logic here ...
    await AsyncStorage.removeItem('jwt');
    setJwt(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.simpleTitle}>Delete Account</Text>
      <View style={styles.iconWrap}>
        <Feather name="x-circle" size={48} color="crimson" />
      </View>
      <Text style={styles.header}>Delete Account</Text>
      <Text style={styles.message}>Are you sure you want to permanently delete your CloudStore account? This action cannot be undone.</Text>
      <TouchableOpacity style={styles.button} onPress={handleDelete} activeOpacity={0.85}>
        <Text style={styles.buttonText}>Delete Account</Text>
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
    shadowColor: 'crimson',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'crimson',
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
    backgroundColor: 'crimson',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: 'crimson',
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