import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
// If using expo-blur, uncomment the next line:
// import { BlurView } from 'expo-blur';

export default function SimplePrompt({ visible, message, onClose }) {
  if (!visible) return null;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* Uncomment BlurView below if using expo-blur, else use fallback overlay */}
      {/* <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} /> */}
      <View style={styles.overlay} />
      <View style={styles.card}>
        <Text style={styles.text}>{message}</Text>
        <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.85}>
          <Text style={styles.buttonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    // If using BlurView, you can remove this backgroundColor
  },
  card: {
    position: 'absolute',
    top: '40%',
    left: '8%',
    right: '8%',
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#003366',
    shadowOpacity: 0.22,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  text: {
    fontSize: 17,
    color: '#2563eb',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 18,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 36,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 