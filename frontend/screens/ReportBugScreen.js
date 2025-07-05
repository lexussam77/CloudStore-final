import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';

export default function ReportBugScreen({ navigation }) {
  const handleEmail = (type) => {
    let subject = type === 'bug' ? 'Bug Report' : 'Other Complaint';
    let body = type === 'bug' ? 'Describe the bug you encountered:' : 'Describe your complaint:';
    Linking.openURL(`mailto:akombea77@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Report a Bug or Complaint</Text>
      <Text style={styles.description}>Help us improve CloudStore! Choose an option below to send us an email directly.</Text>
      <TouchableOpacity style={styles.button} onPress={() => handleEmail('bug')}>
        <Text style={styles.buttonText}>Report a Bug</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => handleEmail('complaint')}>
        <Text style={styles.buttonText}>Other Complaint</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backBtnText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafd',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 18,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#444',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 18,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backBtn: {
    marginTop: 18,
    alignSelf: 'center',
  },
  backBtnText: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 