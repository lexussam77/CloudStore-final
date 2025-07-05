import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { useTheme } from '../theme/ThemeContext';

export default function CustomPrompt({ visible, message, onClose, success = true }) {
  const { theme } = useTheme();
  
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
    <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
      <Animated.View style={[styles.iconWrap, { backgroundColor: theme.card, shadowColor: theme.shadow, transform: [{ scale: scaleAnim }] }] }>
        <AntDesign
          name={success ? 'checkcircle' : 'closecircle'}
          size={72}
          color={success ? theme.primary : 'crimson'}
        />
      </Animated.View>
      <Text style={[styles.promptText, { color: theme.primary }]}>{message}</Text>
      <TouchableOpacity onPress={onClose} activeOpacity={0.85} style={[styles.promptBtn, { backgroundColor: theme.primary }]}>
        <Text style={[styles.promptBtnText, { color: theme.textInverse }]}>OK</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  iconWrap: {
    marginBottom: 18,
    borderRadius: 48,
    padding: 16,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  promptText: {
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    marginHorizontal: 24,
  },
  promptBtn: {
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 4,
  },
  promptBtnText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 