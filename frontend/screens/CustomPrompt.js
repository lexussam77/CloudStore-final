import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';

export default function CustomPrompt({ visible, message, onClose, success = true }) {
  // Animation for icon pop
  const scaleAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0);
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.iconWrap, { transform: [{ scale: scaleAnim }] }] }>
        <AntDesign
          name={success ? 'checkcircle' : 'closecircle'}
          size={72}
          color={success ? '#0061FF' : 'crimson'}
        />
      </Animated.View>
      <Text style={styles.promptText}>{message}</Text>
      <TouchableOpacity onPress={onClose} activeOpacity={0.85} style={styles.promptBtn}>
        <Text style={styles.promptBtnText}>OK</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  iconWrap: {
    marginBottom: 18,
    backgroundColor: '#fff',
    borderRadius: 48,
    padding: 16,
    shadowColor: '#0061FF',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  promptText: {
    fontSize: 17,
    color: '#0061FF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    marginHorizontal: 24,
  },
  promptBtn: {
    backgroundColor: '#0061FF',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 4,
  },
  promptBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 