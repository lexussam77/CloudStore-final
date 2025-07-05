import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function OpenSourceScreen({ navigation }) {
  const { theme } = useTheme();
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.scrollContent}>
      <Text style={[styles.header, { color: theme.primary }]}>Open Source & Third Party Software</Text>
      <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}><Text style={[styles.text, { color: theme.text }]}>CloudStore is built with the help of open source and third-party software. We are grateful to the open source community!</Text></View>
      <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}><Text style={[styles.sectionHeader, { color: theme.primary }]}>Key Open Source Components</Text><Text style={[styles.text, { color: theme.text }]}>- React Native (MIT License){'\n'}- Expo (MIT License){'\n'}- react-navigation (MIT License){'\n'}- react-native-svg (MIT License){'\n'}- And many more</Text></View>
      <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}><Text style={[styles.sectionHeader, { color: theme.primary }]}>Licenses</Text><Text style={[styles.text, { color: theme.text }]}>For a full list of dependencies and their licenses, please visit our GitHub repository or contact us at opensource@cloudstore.com.</Text></View>
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={() => navigation.goBack()}>
        <Text style={[styles.buttonText, { color: theme.textInverse }]}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    marginBottom: 32,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  button: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignSelf: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'System',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 6,
    fontFamily: 'System',
  },
  card: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  scrollContent: {
    paddingVertical: 24,
    paddingHorizontal: 8,
  },
}); 