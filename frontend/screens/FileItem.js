import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

function getFileIcon(name) {
  if (!name) return 'file-text';
  const ext = name.split('.').pop().toLowerCase();
  if (['pdf'].includes(ext)) return 'file-text';
  if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'image';
  if (['doc', 'docx'].includes(ext)) return 'file';
  if (['xls', 'xlsx'].includes(ext)) return 'bar-chart-2';
  if (['ppt', 'pptx'].includes(ext)) return 'file';
  if (['mp3', 'wav'].includes(ext)) return 'music';
  if (['mp4', 'mov', 'avi'].includes(ext)) return 'film';
  return 'file-text';
}

export default function FileItem({ item, onMenuPress, onPress, onStarPress }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const starScaleAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleStarPress = () => {
    // Add a small scale animation
    Animated.sequence([
      Animated.timing(starScaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(starScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    onStarPress();
  };

  const isImage = item.name && ['jpg', 'jpeg', 'png', 'gif'].includes(item.name.split('.').pop().toLowerCase());
  const isFavorited = item.favourite || item.favorites;
  
  return (
    <Animated.View style={[styles.fileCardRow, { opacity: fadeAnim }]}> 
      <TouchableOpacity style={styles.fileCardRow} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.fileThumbWrap}>
          {isImage && item.url ? (
            <Image source={{ uri: item.url }} style={styles.fileThumbImg} />
          ) : (
            <Feather name={getFileIcon(item.name)} size={32} color={'#2563eb'} />
          )}
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.fileCardName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.fileCardMeta} numberOfLines={1}>{item.modifiedAt ? new Date(item.modifiedAt).toLocaleString() : ''} {item.size ? `• ${item.size}` : ''}</Text>
        </View>
        <Animated.View style={{ transform: [{ scale: starScaleAnim }] }}>
          <TouchableOpacity 
            style={styles.starButton} 
            onPress={handleStarPress} 
            activeOpacity={0.7}
          >
            <Feather 
              name={isFavorited ? "star" : "star"} 
              size={20} 
              color={isFavorited ? "#fbbf24" : "#ddd"} 
            />
          </TouchableOpacity>
        </Animated.View>
        <TouchableOpacity style={styles.menuButton} onPress={onMenuPress} activeOpacity={0.7}>
          <Feather name="more-vertical" size={22} color="#888" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fileCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 4,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  fileThumbWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f4fa',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fileThumbImg: {
    width: 40,
    height: 40,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  fileCardName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
  },
  fileCardMeta: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  menuButton: {
    padding: 6,
    borderRadius: 20,
  },
  starButton: {
    padding: 6,
    borderRadius: 20,
    marginRight: 4,
  },
}); 