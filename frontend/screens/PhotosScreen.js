import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Dimensions, SafeAreaView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const PHOTO_SIZE = (Dimensions.get('window').width - 64) / 3;
const photos = [
  { id: '1', uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb' }, // family in field
  { id: '2', uri: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308' }, // group selfie
  { id: '3', uri: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91' }, // father and son
  { id: '4', uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9' }, // family group
  { id: '5', uri: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca' }, // kids on beach
  { id: '6', uri: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e' }, // family at home
  { id: '7', uri: 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92' }, // family at beach
  { id: '8', uri: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d' }, // mom and daughter
  { id: '9', uri: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2' }, // polaroid collage
];

export default function PhotosScreen() {
  const navigation = useNavigation();

  const pickAndUploadFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({});
    if (result.type === 'success') {
      const formData = new FormData();
      formData.append('files', {
        uri: result.uri,
        name: result.name,
        type: result.mimeType || 'application/octet-stream',
      });
      // Replace with your backend URL and add auth headers if needed
      await axios.post('http://YOUR_BACKEND_URL/api/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Optionally show a success prompt or refresh
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f6f2' }}>
      <FlatList
        data={[]}
        ListHeaderComponent={
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Photos</Text>
            <Text style={styles.cardSubtitle}>Today</Text>
            <FlatList
              data={photos}
              keyExtractor={item => item.id}
              numColumns={3}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <Image source={{ uri: item.uri }} style={styles.photo} />
              )}
              contentContainerStyle={styles.grid}
            />
          </View>
        }
        ListFooterComponent={
          <>
            <Text style={styles.title}>Photos</Text>
            <Text style={styles.subtitle}>Come here to view and edit photos and videos, and manage camera uploads.</Text>
            <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85} onPress={() => navigation.navigate('BackupLoading')}>
              <Text style={styles.primaryBtnText}>Back up photos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.85} onPress={pickAndUploadFile}>
              <Text style={styles.secondaryBtnText}>Upload photos</Text>
              </TouchableOpacity>
          </>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 0,
    alignItems: 'stretch',
    backgroundColor: '#f6f6f2',
    paddingBottom: 10,
    minHeight: undefined,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 18,
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    paddingTop: 12,
    paddingBottom: 10,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    alignSelf: 'flex-start',
    marginLeft: 16,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#444',
    alignSelf: 'flex-start',
    marginLeft: 16,
    marginBottom: 6,
    fontWeight: '500',
  },
  grid: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 8,
    margin: 4,
    backgroundColor: '#eee',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
    alignSelf: 'flex-start',
    marginLeft: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 10,
    alignSelf: 'flex-start',
    marginLeft: 16,
    marginRight: 16,
  },
  primaryBtn: {
    backgroundColor: '#0061FF',
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '80%',
    marginBottom: 16,
    alignSelf: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  secondaryBtn: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '80%',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    marginBottom: 8,
    alignSelf: 'center',
  },
  secondaryBtnText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 18,
  },
}); 