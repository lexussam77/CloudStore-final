import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function OpenSourceScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.header}>Open Source & Third Party Software</Text>
      <View style={styles.card}><Text style={styles.text}>CloudStore is built with the help of open source and third-party software. We are grateful to the open source community!</Text></View>
      <View style={styles.card}><Text style={styles.sectionHeader}>Key Open Source Components</Text><Text style={styles.text}>- React Native (MIT License){'\n'}- Expo (MIT License){'\n'}- react-navigation (MIT License){'\n'}- react-native-svg (MIT License){'\n'}- And many more</Text></View>
      <View style={styles.card}><Text style={styles.sectionHeader}>Licenses</Text><Text style={styles.text}>For a full list of dependencies and their licenses, please visit our GitHub repository or contact us at opensource@cloudstore.com.</Text></View>
      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 18,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: '#222',
    marginBottom: 32,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'System',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
    marginTop: 18,
    marginBottom: 6,
    fontFamily: 'System',
  },
  card: {
    backgroundColor: '#f7fafd',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#0061FF',
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