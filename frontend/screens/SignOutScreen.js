import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './AuthContext';
import { useTheme } from '../theme/ThemeContext';

export default function SignOutScreen({ navigation }) {
  const { setJwt } = useContext(AuthContext);
  const { theme } = useTheme();

  const handleSignOut = async () => {
    await AsyncStorage.removeItem('jwt');
    setJwt(null);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.simpleTitle, { color: theme.text }]}>Sign Out</Text>
      <View style={[styles.iconWrap, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
        <Feather name="log-out" size={48} color={theme.primary} />
      </View>
      <Text style={[styles.header, { color: theme.primary }]}>Sign Out</Text>
      <Text style={[styles.message, { color: theme.textSecondary }]}>Are you sure you want to sign out of your CloudStore account?</Text>
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary, shadowColor: theme.shadow }]} onPress={handleSignOut} activeOpacity={0.85}>
        <Text style={[styles.buttonText, { color: theme.textInverse }]}>Sign Out</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
        <Text style={[styles.cancelButtonText, { color: theme.primary }]}>Cancel</Text>
      </TouchableOpacity>
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
  iconWrap: {
    borderRadius: 32,
    padding: 18,
    marginBottom: 18,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 18,
    fontFamily: 'System',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
    fontWeight: '400',
    fontFamily: 'System',
  },
  button: {
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily: 'System',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  cancelButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'System',
    textAlign: 'center',
  },
  simpleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
}); 