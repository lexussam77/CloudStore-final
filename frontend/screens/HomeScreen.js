import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, SafeAreaView, ScrollView, Image, Animated, FlatList, RefreshControl, Modal } from 'react-native';
import { searchFiles, listFiles, createFolder } from './api';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const user = { name: 'Lazarus', avatar: 'https://img.icons8.com/color/96/user-male-circle--v2.png' };

const quickActions = [
  { icon: 'folder-plus', label: 'Create Folder', onPress: () => setShowCreateFolderModal(true) },
  { icon: 'file-plus', label: 'Create File', onPress: () => Alert.alert('Create File', 'Create file functionality coming soon!') },
];

export default function HomeScreen() {
  const [folders, setFolders] = useState([]);
  const [allFiles, setAllFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const heroAnim = useRef(new Animated.Value(0)).current;
  const quickAnim = useRef(new Animated.Value(0)).current;
  const recentAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(heroAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(quickAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(recentAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
    
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt');
      if (!token) return;

      const res = await listFiles(token);
      if (res.success) {
        setAllFiles(res.data);
      }
    } catch (err) {
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshFiles = async () => {
    setRefreshing(true);
    await fetchFiles();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    if (diffDays <= 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays <= 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return 'https://img.icons8.com/color/96/file.png';
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return 'https://img.icons8.com/color/96/pdf.png';
      case 'doc':
      case 'docx':
        return 'https://img.icons8.com/color/96/ms-word.png';
      case 'xls':
      case 'xlsx':
        return 'https://img.icons8.com/color/96/ms-excel.png';
      case 'ppt':
      case 'pptx':
        return 'https://img.icons8.com/color/96/ms-powerpoint.png';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
        return 'https://img.icons8.com/color/96/image.png';
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'wmv':
        return 'https://img.icons8.com/color/96/video.png';
      case 'mp3':
      case 'wav':
      case 'flac':
        return 'https://img.icons8.com/color/96/music.png';
      case 'zip':
      case 'rar':
      case '7z':
        return 'https://img.icons8.com/color/96/zip.png';
      case 'txt':
        return 'https://img.icons8.com/color/96/text.png';
      default:
        return 'https://img.icons8.com/color/96/file.png';
    }
  };

  // Get recent files (last 5 files, excluding compressed ones)
  const recentFiles = allFiles
    .filter(file => !file.name?.includes('_compressed'))
    .slice(0, 5)
    .map(file => ({
      id: file.id,
      name: file.name,
      modified: formatDate(file.modifiedAt || file.createdAt),
      thumb: getFileIcon(file.name),
      file: file
    }));

  // Get starred files
  const starredFiles = allFiles
    .filter(file => (file.favourite || file.favorites) && !file.name?.includes('_compressed'))
    .slice(0, 5)
    .map(file => ({
      id: file.id,
      name: file.name,
      modified: formatDate(file.modifiedAt || file.createdAt),
      thumb: getFileIcon(file.name),
      file: file
    }));

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query) {
      setSearchResults(null);
      return;
    }
    
    try {
      const token = await AsyncStorage.getItem('jwt');
      if (!token) return;
      
      const res = await searchFiles(token, query);
      if (res.success) {
        setSearchResults(res.data);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    }
  };

  const handleFilePress = (file) => {
    // Navigate to file viewer screen
    navigation.navigate('FileViewer', { file });
  };

  const handleCreateFolder = async () => {
    if (!newFolderName || newFolderName.trim() === '') {
      Alert.alert('Error', 'Please enter a folder name');
      return;
    }

    setCreatingFolder(true);
    try {
      const token = await AsyncStorage.getItem('jwt');
      if (!token) {
        Alert.alert('Error', 'Authentication required');
        return;
      }

      const res = await createFolder(token, newFolderName.trim());
      if (res.success) {
        setShowCreateFolderModal(false);
        setNewFolderName('');
        Alert.alert('Success', 'Folder created successfully!');
        // Refresh files to show the new folder
        await fetchFiles();
      } else {
        Alert.alert('Error', res.error || 'Failed to create folder');
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to create folder');
    } finally {
      setCreatingFolder(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Home</Text>
        <TouchableOpacity style={styles.avatarBtn} activeOpacity={0.7}>
          <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
        </TouchableOpacity>
      </View>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshFiles}
            colors={['#0061FF']}
            tintColor="#0061FF"
          />
        }
      >
        {/* Search Bar */}
        <Animated.View style={[styles.heroSearchBarWrap, { opacity: heroAnim, transform: [{ translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}> 
          <Feather name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search files..."
            placeholderTextColor="#bbb"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </Animated.View>
        
        {/* Quick Actions Row */}
        <Animated.View style={[styles.quickActionsRow, { opacity: quickAnim, transform: [{ translateY: quickAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}> 
          {quickActions.map((action, idx) => (
            <TouchableOpacity key={action.label} style={styles.quickActionBtn} onPress={action.onPress} activeOpacity={0.8}>
              <View style={styles.quickActionIconWrap}>
                <Feather name={action.icon} size={22} color="#0061FF" />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
        
        {/* Starred Section */}
        {starredFiles.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Starred Files</Text>
            <FlatList
              data={starredFiles}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentFilesList}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.recentFileCard}
                  onPress={() => handleFilePress(item.file)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: item.thumb }} style={styles.recentFileThumbImg} />
                  <Text style={styles.recentFileName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.recentFileMeta}>{item.modified}</Text>
                  <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}>
                    <Feather name="more-vertical" size={20} color="#888" />
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
        
        {/* Recent Files Horizontal Scroll */}
        <Animated.View style={[styles.sectionCard, { opacity: recentAnim, transform: [{ translateY: recentAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}> 
          <Text style={styles.sectionTitle}>Recent Files</Text>
          {recentFiles.length > 0 ? (
            <FlatList
              data={recentFiles}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentFilesList}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.recentFileCard}
                  onPress={() => handleFilePress(item.file)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: item.thumb }} style={styles.recentFileThumbImg} />
                  <Text style={styles.recentFileName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.recentFileMeta}>{item.modified}</Text>
                  <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}>
                    <Feather name="more-vertical" size={20} color="#888" />
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            />
          ) : (
            <View style={styles.emptyState}>
              <Feather name="file" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No recent files</Text>
            </View>
          )}
        </Animated.View>
        
        {/* Folders Grid */}
        {folders.length > 0 && (
          <View style={styles.foldersGrid}>
            {folders.map(folder => (
              <TouchableOpacity key={folder.id} style={styles.folderCardGrid} onPress={() => Alert.alert('Open Folder', `Open folder: ${folder.name}`)}>
                <Image source={{ uri: 'https://img.icons8.com/color/96/folder-invoices--v2.png' }} style={styles.folderIconImgGrid} />
                <Text style={styles.folderNameGrid}>{folder.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Create Folder Modal */}
      <Modal
        visible={showCreateFolderModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCreateFolderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.createFolderModal}>
            <View style={styles.modalHeader}>
              <Feather name="folder-plus" size={24} color="#0061FF" />
              <Text style={styles.modalTitle}>Create New Folder</Text>
            </View>
            
            <Text style={styles.modalSubtitle}>
              Enter a name for your new folder
            </Text>

            <TextInput
              style={styles.folderNameInput}
              placeholder="Folder name..."
              placeholderTextColor="#bbb"
              value={newFolderName}
              onChangeText={setNewFolderName}
              autoFocus={true}
              maxLength={50}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowCreateFolderModal(false);
                  setNewFolderName('');
                }}
                disabled={creatingFolder}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleCreateFolder}
                disabled={creatingFolder}
              >
                {creatingFolder ? (
                  <Text style={styles.modalButtonConfirmText}>Creating...</Text>
                ) : (
                  <Text style={styles.modalButtonConfirmText}>Create Folder</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 80,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    paddingHorizontal: 16,
    marginBottom: 2,
  },
  topBarTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
    textAlign: 'center',
  },
  avatarBtn: {
    position: 'absolute',
    right: 16,
    top: 8,
    padding: 4,
    borderRadius: 20,
  },
  avatarImg: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  heroSearchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f7f9',
    borderRadius: 18,
    marginHorizontal: 18,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 17,
    color: '#222',
    fontWeight: '500',
    fontFamily: 'System',
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 18,
    marginBottom: 10,
    marginTop: 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  quickActionBtn: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 6,
  },
  quickActionIconWrap: {
    backgroundColor: '#f0f8ff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 4,
    shadowColor: '#0061FF',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  quickActionLabel: {
    fontSize: 13,
    color: '#0061FF',
    marginTop: 2,
    fontWeight: '500',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 18,
    padding: 16,
    shadowColor: '#0061FF',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  recentFilesList: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentFileCard: {
    backgroundColor: '#f6f7f9',
    borderRadius: 14,
    marginRight: 14,
    padding: 14,
    width: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  recentFileThumbImg: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginBottom: 6,
  },
  recentFileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222',
    marginBottom: 2,
    textAlign: 'center',
  },
  recentFileMeta: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
    textAlign: 'center',
  },
  menuButton: {
    padding: 6,
    borderRadius: 20,
    position: 'absolute',
    top: 8,
    right: 8,
  },
  foldersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginHorizontal: 10,
    marginBottom: 10,
  },
  folderCardGrid: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 8,
    padding: 12,
    width: 110,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  folderIconImgGrid: {
    width: 48,
    height: 48,
    marginBottom: 6,
  },
  folderNameGrid: {
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
    marginBottom: 2,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginTop: 12,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createFolderModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginLeft: 12,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 22,
  },
  folderNameInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#222',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#f1f5f9',
  },
  modalButtonConfirm: {
    backgroundColor: '#0061FF',
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  modalButtonConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
}); 