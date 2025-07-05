import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../theme/ThemeContext';

export default function FolderItem({ item, onMenuPress, onPress }) {
  const { theme } = useTheme();
  
  const handleFolderPress = () => {
    if (onPress) {
      onPress(item);
    }
  };

  return (
    <TouchableOpacity style={[styles.folderCardGrid, { backgroundColor: theme.card, shadowColor: theme.shadow }]} onPress={handleFolderPress} activeOpacity={0.8}>
      <View style={styles.folderIconContainer}>
        <Feather name="folder" size={36} color={theme.primary} />
      </View>
      <Text style={[styles.folderNameGrid, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
      <Text style={[styles.folderMeta, { color: theme.textSecondary }]} numberOfLines={1}>{item.modifiedAt ? new Date(item.modifiedAt).toLocaleString() : ''}</Text>
      <TouchableOpacity style={styles.menuButton} onPress={onMenuPress} activeOpacity={0.7}>
        <Feather name="more-vertical" size={22} color={theme.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  folderCardGrid: {
    alignItems: 'center',
    borderRadius: 12,
    margin: 8,
    padding: 12,
    width: 110,
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    position: 'relative',
  },
  folderIconContainer: {
    width: 48,
    height: 48,
    marginBottom: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  folderNameGrid: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
    textAlign: 'center',
  },
  folderMeta: {
    fontSize: 12,
    marginBottom: 2,
    textAlign: 'center',
  },
  menuButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 6,
    borderRadius: 20,
  },
}); 