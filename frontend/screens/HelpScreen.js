import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const helpTopics = [
  'How to upload files',
  'How to create folders',
  'How to scan documents',
  'Managing your storage',
  'Contact support',
];

const helpIcons = [
  'cloud-upload-outline',
  'folder-outline',
  'document-text-outline',
  'bar-chart-outline',
  'help-circle-outline',
];

export default function HelpScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>CloudStore Help</Text>
      {helpTopics.map((topic, idx) => (
        <TouchableOpacity key={idx} style={styles.row} activeOpacity={0.85}>
          <Ionicons name={helpIcons[idx]} size={22} color="#2563eb" style={styles.icon} />
          <Text style={styles.text}>{topic}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 10,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 16,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#faf9f7',
    borderRadius: 12,
    marginBottom: 10,
    paddingHorizontal: 10,
    shadowColor: '#2563eb',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  icon: {
    marginRight: 14,
  },
  text: {
    fontSize: 16,
    color: '#222',
  },
}); //ai man gengis