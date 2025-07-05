import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SectionList, Modal, TouchableWithoutFeedback, Alert, SafeAreaView, FlatList, ScrollView, Image, ActivityIndicator, Animated, RefreshControl, Platform } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import * as DocumentPicker from 'expo-document-picker';
import { uploadFiles, searchFiles, createFolder, listFiles, listFolders, API_BASE_URL, renameFile, favoriteFile, deleteFile, downloadFile, getDownloadUrl, compressFile, deleteFolder, renameFolder } from './api';
import { useNavigation } from '@react-navigation/native';
import MyFilesSVG from '../assets/images/undraw_my-files_1xwx.svg';
import UploadSVG from '../assets/images/undraw_upload_cucu.svg';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FileItem from './FileItem';
import FolderItem from './FolderItem';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';

const folders = [];
const categories = [
  { key: 'all', label: 'All' },
  { key: 'favourites', label: 'Favourites' },
  { key: 'folders', label: 'Folders' },
  { key: 'compressed', label: 'Compressed Files' },
];
const files = [];
const recentlyDeleted = [];

const sections = [
  {
    title: 'Folders',
    data: folders.length ? folders : [{}],
    key: 'folders',
  },
  {
    title: 'Files',
    data: files.length ? files : [{}],
    key: 'files',
  },
  {
    title: 'Compressed Files',
    data: recentlyDeleted.length ? recentlyDeleted : [{}],
    key: 'compressed',
  },
];

// Helper for breadcrumbs - now uses actual folder path
const getBreadcrumbs = (folderPath) => {
  const breadcrumbs = ['All Files'];
  
  // Add each folder in the path
  folderPath.forEach(folder => {
    breadcrumbs.push(folder.name);
  });
  
  return breadcrumbs;
};

// Skeleton Loader Component
function SkeletonLoader({ type = 'file' }) {
  return (
    <View style={type === 'file' ? styles.skeletonFile : styles.skeletonFolder}>
      <View style={styles.skeletonIcon} />
      <View style={styles.skeletonTextBlock} />
      {type === 'file' && <View style={styles.skeletonTextBlockSmall} />}
    </View>
  );
}

export default function FilesScreen() {
  const [menuFileId, setMenuFileId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const menuButtonRefs = useRef({});
  const [folders, setFolders] = useState([]);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [fileList, setFileList] = useState(files);
  const [uploading, setUploading] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderPath, setFolderPath] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [sortOption, setSortOption] = useState('date');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [menuType, setMenuType] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameItem, setRenameItem] = useState(null);
  const [newName, setNewName] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadItem, setDownloadItem] = useState(null);
  const [showCompressModal, setShowCompressModal] = useState(false);
  const [compressItem, setCompressItem] = useState(null);
  const [compressionSettings, setCompressionSettings] = useState({
    quality: 'medium',
    format: 'zip',
    level: 'balanced'
  });
  const [compressing, setCompressing] = useState(false);
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);
  const [uploadSuccessType, setUploadSuccessType] = useState('');
  const uploadSuccessScale = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  const handleMenuPress = (item, type) => {
    if (menuButtonRefs.current[item.id]) {
      menuButtonRefs.current[item.id].measureInWindow((x, y, width, height) => {
        setMenuPosition({ x, y: y + height });
        setMenuFileId(item.id);
        setMenuType(type);
        setSelectedItem(item);
      });
    } else {
      setMenuFileId(item.id);
      setMenuType(type);
      setSelectedItem(item);
    }
  };
  const closeMenu = () => {
    setMenuFileId(null);
    setMenuType(null);
    setSelectedItem(null);
  };

  const handleMenuAction = async (action, item, type) => {
    closeMenu();
    let token = null;
    try {
      token = await AsyncStorage.getItem('jwt');
    } catch {}
    
    if (!token) {
      Alert.alert('Error', 'Authentication required');
      return;
    }

    try {
    if (type === 'file') {
        if (action === 'open') {
          handleFilePress(item);
        } else if (action === 'rename') {
          setRenameItem(item);
          setNewName(item.name);
          setShowRenameModal(true);
        } else if (action === 'compress') {
          setCompressItem(item);
          setShowCompressModal(true);
        } else if (action === 'download') {
          try {
            Alert.alert('Download', 'Getting download URL...');
            const res = await getDownloadUrl(token, item.id);
            if (res.success) {
              // Get the file URL from the response
              const fileUrl = res.data.url;
              if (!fileUrl) {
                Alert.alert('Error', 'No download URL available');
                return;
              }

              // Ask user where they want to save the file
              Alert.alert(
                'Save File',
                'Where would you like to save this file?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Downloads Folder', 
                    onPress: () => downloadToDownloads(fileUrl, item.name)
                  },
                  { 
                    text: 'Choose Location', 
                    onPress: () => downloadToCustomLocation(fileUrl, item.name)
                  }
                ]
              );
            } else {
              Alert.alert('Error', res.error || 'Failed to download file');
            }
          } catch (err) {
            console.error('Download error:', err);
            Alert.alert('Error', 'Failed to download file: ' + err.message);
          }
        } else if (action === 'delete') {
          Alert.alert(
            'Delete File',
            `Are you sure you want to permanently delete "${item.name}"?`,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                  const res = await deleteFile(token, item.id);
                  if (res.success) {
                    Alert.alert('Success', 'File deleted successfully!');
                    await refreshFiles();
                  } else {
                    Alert.alert('Error', res.error || 'Failed to delete file');
                  }
                }
              }
            ]
          );
        }
    } else if (type === 'folder') {
      if (action === 'open') {
        handleFolderPress(item);
      } else if (action === 'rename') {
        setRenameItem(item);
        setNewName(item.name);
        setShowRenameModal(true);
      } else if (action === 'delete') {
        Alert.alert(
          'Delete Folder',
          `Are you sure you want to delete "${item.name}" and all its contents?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: async () => {
                const res = await deleteFolder(token, item.id);
                if (res.success) {
                  Alert.alert('Success', 'Folder deleted successfully!');
                  await refreshFiles();
                } else {
                  Alert.alert('Error', res.error || 'Failed to delete folder');
                }
              }
            }
          ]
        );
      }
    }
    } catch (err) {
      Alert.alert('Error', err.message || 'Something went wrong');
    }
  };

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const files = result.assets || (result.type === 'success' ? [result] : []);
      if (!files.length) return;
      setUploading(true);
      setUploadProgress(0);
      
      console.log('Selected files:', files);
      
      // Get JWT token
      let token = null;
      try {
        token = await AsyncStorage.getItem('jwt');
      } catch {}
      if (!token) {
        Alert.alert('Error', 'Authentication required');
      setUploading(false);
        return;
      }
      
      console.log('JWT token obtained:', token ? 'present' : 'missing');
      
      // Use XMLHttpRequest for progress
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${CLOUDINARY_URL}/raw/upload`);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
      xhr.onload = async () => {
        setUploading(false);
        setUploadProgress(0);
        const data = JSON.parse(xhr.responseText);
        console.log('Cloudinary response:', data);
        
        if (data.secure_url) {
          console.log('File uploaded to Cloudinary, registering in backend...');
          // Register file in backend
          try {
            const registerData = {
              name: files[0].name || files[0].fileName || 'upload',
              url: data.secure_url,
              folderId: currentFolderId,
              type: files[0].mimeType || files[0].type,
              size: files[0].size,
            };
            console.log('Registering file with data:', registerData);
            
            const registerResponse = await fetch(`${API_BASE_URL}/files/register`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(registerData),
            });
            
            console.log('Backend register response status:', registerResponse.status);
            const registerResult = await registerResponse.json();
            console.log('Backend register response:', registerResult);
            
            if (registerResponse.ok) {
              console.log('File registered successfully, refreshing files...');
              // Refresh files after successful upload
              await refreshFiles();
              // Show upload success animation
              setUploadSuccessType('file');
              setShowUploadSuccess(true);
              Animated.spring(uploadSuccessScale, {
                toValue: 1,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
              }).start();
              setTimeout(() => {
                Animated.timing(uploadSuccessScale, {
                  toValue: 0,
                  duration: 200,
                  useNativeDriver: true,
                }).start(() => setShowUploadSuccess(false));
              }, 2000);
              setSuccessMessage('File uploaded successfully!');
              setShowSuccessModal(true);
      } else {
              console.log('Backend registration failed');
              Alert.alert('Error', 'Failed to register file in backend');
      }
    } catch (err) {
            console.log('Error registering file:', err);
            Alert.alert('Error', 'Failed to register file in backend');
          }
        } else {
          console.log('Cloudinary upload failed:', data);
          Alert.alert('Error', data.error?.message || 'Upload failed');
        }
      };
      xhr.onerror = () => {
      setUploading(false);
        setUploadProgress(0);
        console.log('XHR error occurred');
        Alert.alert('Upload error', 'Unknown error');
      };
      const formData = new FormData();
      formData.append('file', {
        uri: files[0].uri,
        type: files[0].mimeType || files[0].type || 'application/octet-stream',
        name: files[0].name || files[0].fileName || 'upload',
      });
      formData.append('upload_preset', UPLOAD_PRESET);
      console.log('Sending to Cloudinary...');
      xhr.send(formData);
    } catch (err) {
      setUploading(false);
      setUploadProgress(0);
      console.log('Upload error:', err);
      Alert.alert('Upload error', err.message || 'Unknown error');
    }
  };

  const handleScan = () => {
    Alert.alert('Scan', 'This would open a document scanner.');
  };
  const handleCreateFolder = () => {
    setShowFolderModal(true);
  };
  const handleAddFolder = async () => {
    if (!newFolderName || newFolderName.trim() === '') {
      Alert.alert('Error', 'Please enter a folder name');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('jwt');
      if (!token) {
        Alert.alert('Error', 'Authentication required');
        return;
      }

      const res = await createFolder(token, newFolderName.trim());
      if (res.success) {
        setShowFolderModal(false);
        setNewFolderName('');
        // Show folder creation success animation
        setUploadSuccessType('folder');
        setShowUploadSuccess(true);
        Animated.spring(uploadSuccessScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
        setTimeout(() => {
          Animated.timing(uploadSuccessScale, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start(() => setShowUploadSuccess(false));
        }, 2000);
        setSuccessMessage('Folder created successfully!');
        setShowSuccessModal(true);
        // Refresh files to show the new folder
        await refreshFiles();
      } else {
        Alert.alert('Error', res.error || 'Failed to create folder');
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to create folder');
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query) {
      setSearchResults(null);
      return;
    }
    const res = await searchFiles(token, query);
    if (res.success) {
      setSearchResults(res.data);
    } else {
      setSearchResults([]);
    }
  };

  const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/ds5gugfv0';
  const UPLOAD_PRESET = 'EXPO_UPLOAD';

  // Helper function to download file to Downloads folder
  const downloadToDownloads = async (fileUrl, fileName) => {
    try {
      // Request permissions for media library
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to save files to your device.');
        return;
      }

      // Create a unique filename for the download
      const fileExtension = fileName.includes('.') ? fileName.split('.').pop() : '';
      const baseName = fileName.includes('.') ? fileName.substring(0, fileName.lastIndexOf('.')) : fileName;
      const uniqueFileName = `${baseName}_${Date.now()}${fileExtension ? '.' + fileExtension : ''}`;
      
      // First download to cache directory
      const cacheDir = FileSystem.cacheDirectory + 'Downloads/';
      const cacheFileUri = cacheDir + uniqueFileName;
      
      // Create cache directory if it doesn't exist
      const dirInfo = await FileSystem.getInfoAsync(cacheDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
      }
      
      // Download the file to cache first
      const downloadResult = await FileSystem.downloadAsync(fileUrl, cacheFileUri, {
        onProgress: (progress) => {
          const percent = Math.round((progress.totalBytesWritten / progress.totalBytesExpectedToWrite) * 100);
          console.log(`Download progress: ${percent}%`);
        }
      });
      
      if (downloadResult.statusCode === 200 || downloadResult.status === 200) {
        // Save to device's Downloads folder using MediaLibrary
        try {
          const asset = await MediaLibrary.createAssetAsync(cacheFileUri);
          await MediaLibrary.createAlbumAsync('Downloads', asset, false);
          
          Alert.alert(
            'Download Complete', 
            `File saved to your device's Downloads folder\n\nFile: "${uniqueFileName}"`,
            [
              { text: 'OK', style: 'default' },
              { 
                text: 'Open File', 
                onPress: async () => {
                  try {
                    if (await Sharing.isAvailableAsync()) {
                      await Sharing.shareAsync(cacheFileUri);
                    } else {
                      Alert.alert('Sharing not available', 'File has been saved to your device');
                    }
                  } catch (err) {
                    Alert.alert('Error', 'Could not open file');
                  }
                }
              },
              {
                text: 'Show in Gallery',
                onPress: async () => {
                  try {
                    await MediaLibrary.openAssetAsync(asset);
                  } catch (err) {
                    Alert.alert('Error', 'Could not open file in gallery');
                  }
                }
              }
            ]
          );
        } catch (mediaError) {
          console.error('MediaLibrary error:', mediaError);
          // Fallback to cache directory if MediaLibrary fails
          Alert.alert(
            'Download Complete', 
            `File saved to app cache folder\n\nFile: "${uniqueFileName}"`,
            [
              { text: 'OK', style: 'default' },
              { 
                text: 'Open File', 
                onPress: async () => {
                  try {
                    if (await Sharing.isAvailableAsync()) {
                      await Sharing.shareAsync(cacheFileUri);
                    } else {
                      Alert.alert('Sharing not available', 'File has been saved to your device');
                    }
                  } catch (err) {
                    Alert.alert('Error', 'Could not open file');
                  }
                }
              }
            ]
          );
        }
      } else {
        Alert.alert('Error', 'Failed to download file to device');
      }
    } catch (err) {
      console.error('Download error:', err);
      Alert.alert('Error', 'Failed to download file: ' + err.message);
    }
  };

  // Helper function to download file to custom location
  const downloadToCustomLocation = async (fileUrl, fileName) => {
    try {
      // Let user choose where to save the file
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: false,
        multiple: false,
        mode: 'import'
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedFile = result.assets[0];
        const targetUri = selectedFile.uri;
        
        // Download the file to the selected location
        const downloadResult = await FileSystem.downloadAsync(fileUrl, targetUri, {
          onProgress: (progress) => {
            const percent = Math.round((progress.totalBytesWritten / progress.totalBytesExpectedToWrite) * 100);
            console.log(`Download progress: ${percent}%`);
          }
        });
        
        if (downloadResult.statusCode === 200 || downloadResult.status === 200) {
          Alert.alert(
            'Download Complete', 
            `File saved to your selected location`,
            [
              { text: 'OK', style: 'default' },
              { 
                text: 'Open File', 
                onPress: async () => {
                  try {
                    if (await Sharing.isAvailableAsync()) {
                      await Sharing.shareAsync(targetUri);
                    } else {
                      Alert.alert('Sharing not available', 'File has been saved to your device');
                    }
                  } catch (err) {
                    Alert.alert('Error', 'Could not open file');
                  }
                }
              }
            ]
          );
        } else {
          Alert.alert('Error', 'Failed to download file to selected location');
        }
      }
    } catch (err) {
      console.error('Download error:', err);
      Alert.alert('Error', 'Failed to download file: ' + err.message);
    }
  };

  const handleOptionPress = async (option) => {
    setShowUploadModal(false);
    let token = null;
    try {
      token = await AsyncStorage.getItem('jwt');
    } catch {}
    try {
      if (option === 'Create Folder') {
        setShowFolderModal(true);
        return;
      }
      setUploading(true);
      let fileAsset = null;
      let formData = new FormData();
      if (option === 'Take Photo') {
        const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1 });
        if (!result.canceled && result.assets && result.assets.length > 0) {
          fileAsset = result.assets[0];
          const name = fileAsset.fileName || fileAsset.name || `photo_${Date.now()}.jpg`;
          const type = fileAsset.mimeType || fileAsset.type || 'image/jpeg';
          formData.append('file', {
            uri: fileAsset.uri,
            type,
            name,
          });
        } else {
          setUploading(false);
          return;
        }
      } else {
        const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
        if (!result.canceled && result.assets && result.assets.length > 0) {
          fileAsset = result.assets[0];
          formData.append('file', {
            uri: fileAsset.uri,
            type: fileAsset.mimeType || fileAsset.type || 'application/octet-stream',
            name: fileAsset.name || fileAsset.fileName || 'upload',
          });
        } else {
          setUploading(false);
          return;
        }
      }
      formData.append('upload_preset', UPLOAD_PRESET);
      try {
        const res = await fetch(`${CLOUDINARY_URL}/raw/upload`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        console.log('Cloudinary response in handleOptionPress:', data);
        if (data.secure_url) {
          console.log('File uploaded to Cloudinary via handleOptionPress, registering in backend...');
          // Register file in backend
          try {
            const registerData = {
                name: fileAsset.name || fileAsset.fileName || 'upload',
                url: data.secure_url,
                folderId: currentFolderId,
                type: fileAsset.mimeType || fileAsset.type,
                size: fileAsset.size,
            };
            console.log('Registering file with data:', registerData);
            
            const registerResponse = await fetch(`${API_BASE_URL}/files/register`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(registerData),
            });
            
            console.log('Backend register response status:', registerResponse.status);
            
            if (registerResponse.ok) {
              console.log('File registered successfully, refreshing files...');
              // Refresh files after successful upload
              await refreshFiles();
              setSuccessMessage('File uploaded successfully!');
              setShowSuccessModal(true);
            } else {
              console.log('Backend registration failed');
              Alert.alert('Error', 'Failed to register file in backend');
            }
          } catch (err) {
            console.log('Error registering file:', err);
            Alert.alert('Error', 'Failed to register file in backend');
          }
        } else {
          console.log('Cloudinary upload failed:', data);
          Alert.alert('Error', data.error?.message || 'Upload failed');
        }
      } catch (err) {
        Alert.alert('Error', 'Upload failed');
      }
      setUploading(false);
    } catch (err) {
      setUploading(false);
      Alert.alert('Error', err.message || 'Unknown error');
    }
  };

  // Filtering logic for categories
  let filteredFiles = fileList;
  let showFolders = selectedCategory === 'all' || selectedCategory === 'folders';
  
  console.log('Current fileList:', fileList);
  console.log('Current folders:', folders);
  console.log('Selected category:', selectedCategory);
  console.log('Show folders:', showFolders);
  
  if (selectedCategory === 'favourites') {
    filteredFiles = fileList.filter(f => f.favourite || f.favorites);
  } else if (selectedCategory === 'folders') {
    // For folders tab, we don't need to filter files since we show folders separately
    filteredFiles = [];
  } else if (selectedCategory === 'compressed') {
    filteredFiles = fileList.filter(f => f.name && f.name.includes('_compressed'));
  }
  
  console.log('Filtered files:', filteredFiles);
  
  // Sorting logic
  if (sortOption === 'type') {
    filteredFiles = [...filteredFiles].sort((a, b) => {
      const extA = a.name?.split('.').pop().toLowerCase() || '';
      const extB = b.name?.split('.').pop().toLowerCase() || '';
      return extA.localeCompare(extB);
    });
  } else if (sortOption === 'date') {
    filteredFiles = [...filteredFiles].sort((a, b) => {
      // Assuming you have a 'modified' or 'createdAt' field as a date string or timestamp
      return (b.modifiedAt || 0) - (a.modifiedAt || 0);
    });
  } else if (sortOption === 'size') {
    filteredFiles = [...filteredFiles].sort((a, b) => (b.size || 0) - (a.size || 0));
  }

  const menuOptions = [
    { label: 'Upload Picture', icon: 'image' },
    { label: 'Take Photo', icon: 'camera' },
    { label: 'Upload Document', icon: 'file-text' },
    { label: 'Upload Audio', icon: 'music' },
    { label: 'Upload Video', icon: 'video' },
    { label: 'Create Folder', icon: 'folder-plus' },
  ];

  function RadialMenu({ onPress }) {
    const RADIUS = 110;
    const CENTER = 130;
    const angleStep = (2 * Math.PI) / menuOptions.length;
    return (
      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.wheel}>
          {menuOptions.map((opt, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = CENTER + RADIUS * Math.cos(angle) - 32;
            const y = CENTER + RADIUS * Math.sin(angle) - 32;
            return (
              <TouchableOpacity
                key={opt.label}
                style={[styles.iconButton, { left: x, top: y }]}
                onPress={() => onPress(opt.label)}
                activeOpacity={0.8}
              >
                <Feather name={opt.icon} size={32} color="#2563eb" />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

    const fetchFiles = async () => {
      let token = null;
      try {
      token = await AsyncStorage.getItem('jwt');
      } catch {}
      if (!token) return;
    setLoading(true);
    console.log('Fetching files with token:', token ? 'present' : 'missing');
    console.log('Current folder ID:', currentFolderId);
      
      // Fetch both files and folders
      const [filesRes, foldersRes] = await Promise.all([
        listFiles(token, currentFolderId),
        listFolders(token, currentFolderId)
      ]);
      
      console.log('Files API response:', filesRes);
      console.log('Folders API response:', foldersRes);
      
      if (filesRes && filesRes.success && Array.isArray(filesRes.data)) {
        console.log('Setting fileList to:', filesRes.data);
        setFileList(filesRes.data);
      } else {
        console.log('Files API response was not successful or data is not an array');
        setFileList([]);
      }
      
      if (foldersRes && foldersRes.success && Array.isArray(foldersRes.data)) {
        console.log('Setting folders to:', foldersRes.data);
        setFolders(foldersRes.data);
      } else {
        console.log('Folders API response was not successful or data is not an array');
        setFolders([]);
      }
      
    setLoading(false);
  };

  const refreshFiles = async () => {
    setRefreshing(true);
    await fetchFiles();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchFiles();
  }, [currentFolderId]);

  const handleRename = async () => {
    if (!newName || newName.trim() === '') return;
    
    let token = null;
    try {
      token = await AsyncStorage.getItem('jwt');
    } catch {}
    
    if (!token) {
      Alert.alert('Error', 'Authentication required');
      return;
    }

    try {
      console.log('Rename item:', renameItem);
      console.log('Item properties:', {
        id: renameItem.id,
        name: renameItem.name,
        url: renameItem.url,
        size: renameItem.size,
        type: renameItem.type
      });
      
      let res;
      // Check if it's a folder by looking for file-specific properties
      const isFolder = !renameItem.url && !renameItem.size && !renameItem.type;
      console.log('Is folder:', isFolder);
      
      if (isFolder) {
        // Rename folder
        console.log('Renaming folder with ID:', renameItem.id);
        res = await renameFolder(token, renameItem.id, newName.trim());
      } else {
        // Rename file
        console.log('Renaming file with ID:', renameItem.id);
        res = await renameFile(token, renameItem.id, newName.trim());
      }
      
      if (res.success) {
        setShowRenameModal(false);
        const itemType = isFolder ? 'Folder' : 'File';
        setSuccessMessage(`${itemType} renamed successfully!`);
        setShowSuccessModal(true);
        await refreshFiles();
      } else {
        Alert.alert('Error', res.error || 'Failed to rename item');
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to rename item');
    }
  };

  const handleStarPress = async (item) => {
    let token = null;
    try {
      token = await AsyncStorage.getItem('jwt');
    } catch {}
    
    if (!token) {
      Alert.alert('Error', 'Authentication required');
      return;
    }

    try {
      const res = await favoriteFile(token, item.id);
      if (res.success) {
        // Update the local state immediately for better UX
        setFileList(prevFiles => 
          prevFiles.map(file => 
            file.id === item.id 
              ? { ...file, favourite: !file.favourite, favorites: !file.favorites }
              : file
          )
        );
        
        // Show success message
        const action = item.favourite || item.favorites ? 'removed from' : 'added to';
        setSuccessMessage(`File ${action} favorites!`);
        setShowSuccessModal(true);
        
        // Refresh files to sync with backend
        await refreshFiles();
      } else {
        Alert.alert('Error', res.error || 'Failed to update favorite status');
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update favorite status');
    }
  };

  const handleCompress = async () => {
    if (!compressItem) return;
    
    let token = null;
    try {
      token = await AsyncStorage.getItem('jwt');
    } catch {}
    
    if (!token) {
      Alert.alert('Error', 'Authentication required');
      return;
    }

    setCompressing(true);
    try {
      // Call compression API
      const res = await compressFile(token, compressItem.id, compressionSettings);
      
      if (res.success) {
        setShowCompressModal(false);
        const compressionRatio = res.data.compressionRatio ? Math.round(res.data.compressionRatio) : 60;
        setSuccessMessage(`File compressed successfully! Size reduced by ${compressionRatio}%`);
        setShowSuccessModal(true);
        await refreshFiles();
      } else {
        Alert.alert('Error', res.error || 'Failed to compress file');
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to compress file');
    } finally {
      setCompressing(false);
    }
  };

  const handleFolderPress = (folder) => {
    console.log('Opening folder:', folder.name, 'ID:', folder.id);
    
    // Update current folder ID
    setCurrentFolderId(folder.id);
    
    // Update folder path
    setFolderPath(prevPath => [...prevPath, {
      id: folder.id,
      name: folder.name
    }]);
    
    // Refresh files and folders for this folder
    refreshFiles();
  };

  const handleBreadcrumbPress = (index) => {
    if (index === 0) {
      // Go to root (All Files)
      setCurrentFolderId(null);
      setFolderPath([]);
    } else {
      // Go to specific folder in path (subtract 1 because index 0 is "All Files")
      const folderIndex = index - 1;
      const newPath = folderPath.slice(0, folderIndex + 1);
      const targetFolder = newPath[newPath.length - 1];
      setCurrentFolderId(targetFolder.id);
      setFolderPath(newPath);
    }
    
    // Refresh files and folders
    refreshFiles();
  };

  const handleFilePress = (file) => {
    // Navigate to file viewer screen
    navigation.navigate('FileViewer', { file });
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Spinner overlay when uploading */}
      {uploading && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.6)' }}>
          <ActivityIndicator size="large" color="#2563eb" />
          {uploadProgress > 0 && (
            <View style={styles.uploadProgressWrap}>
              <View style={[styles.uploadProgressBar, { width: `${uploadProgress}%` }]} />
              <Text style={styles.uploadProgressText}>{uploadProgress}%</Text>
            </View>
          )}
        </View>
      )}

      {/* Upload Success Animation */}
      {showUploadSuccess && (
        <View style={styles.uploadSuccessOverlay}>
          <Animated.View 
            style={[
              styles.uploadSuccessCard,
              {
                transform: [{ scale: uploadSuccessScale }]
              }
            ]}
          >
            <View style={styles.uploadSuccessIcon}>
              <Feather 
                name={uploadSuccessType === 'folder' ? 'folder-plus' : 'upload-cloud'} 
                size={32} 
                color="#10b981" 
              />
            </View>
          </Animated.View>
        </View>
      )}
      <SafeAreaView style={styles.container}>
        {/* Breadcrumb Navigation */}
        <View style={styles.breadcrumbWrap}>
          {getBreadcrumbs(folderPath).map((crumb, idx, arr) => (
            <View key={idx} style={styles.breadcrumbItem}>
              <TouchableOpacity disabled={idx === arr.length - 1} onPress={() => handleBreadcrumbPress(idx)}>
                <Text style={[styles.breadcrumbText, idx === arr.length - 1 && styles.breadcrumbTextActive]}>{crumb}</Text>
              </TouchableOpacity>
              {idx < arr.length - 1 && <Text style={styles.breadcrumbSeparator}>/</Text>}
            </View>
          ))}
        </View>
        
        {/* Current Folder Indicator */}
        {currentFolderId && (
          <View style={styles.currentFolderIndicator}>
            <Feather name="folder" size={16} color="#0061FF" />
            <Text style={styles.currentFolderText}>
              Inside: {folderPath[folderPath.length - 1]?.name || 'Folder'}
            </Text>
          </View>
        )}
        <ScrollView 
          contentContainerStyle={{ paddingBottom: 40 }} 
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
          <View style={styles.searchBarWrap}>
            <Feather name="search" size={20} color="#888" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInputModern}
              placeholder="Search"
              placeholderTextColor="#bbb"
              value={searchQuery}
              onChangeText={handleSearch}
            />
            <TouchableOpacity onPress={refreshFiles} style={{ padding: 8 }}>
              <Feather name="refresh-cw" size={20} color="#0061FF" />
            </TouchableOpacity>
          </View>
          {/* Category Bar */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryBar}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.categoryButton,
                  selectedCategory === cat.key && styles.categoryButtonSelected,
                ]}
                activeOpacity={0.7}
                onPress={() => setSelectedCategory(cat.key)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === cat.key && styles.categoryButtonTextSelected,
                ]}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* Sort Bar */}
          <View style={styles.sortBar}>
            <View style={{ flex: 1, height: 2, backgroundColor: '#e0e7ef', borderRadius: 1 }} />
            <TouchableOpacity style={styles.sortIconBtn} onPress={() => setSortModalVisible(true)}>
              <Feather name="sliders" size={22} color="#2563eb" />
            </TouchableOpacity>
          </View>
          {/* Sort Modal */}
          <Modal
            visible={sortModalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setSortModalVisible(false)}
          >
            <View style={styles.sortModalOverlay}>
              <View style={styles.sortModalCard}>
                <Text style={styles.sortModalTitle}>Sort by</Text>
                <View style={styles.sortModalDivider} />
                {['type', 'date', 'size'].map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.sortOptionBtn, sortOption === opt && styles.sortOptionBtnSelected]}
                    onPress={() => {
                      setSortOption(opt);
                      setSortModalVisible(false);
                    }}
                  >
                    <Text style={[styles.sortOptionText, sortOption === opt && styles.sortOptionTextSelected]}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.sortModalCloseBtn} onPress={() => setSortModalVisible(false)}>
                  <Text style={styles.sortModalCloseText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          {/* SVG Illustration - Only show when no files and not in folders tab */}
          {filteredFiles.length === 0 && folders.length === 0 && selectedCategory !== 'folders' && (
          <View style={styles.uploadIllustrationWrap}>
            <UploadSVG width={120} height={90} />
          </View>
          )}
          {/* Folders Grid - Only show in 'all' and 'folders' tabs */}
          {showFolders && (
            <>
              {loading ? (
                <View style={styles.foldersGrid}>
                  {[...Array(2)].map((_, i) => <SkeletonLoader key={i} type="folder" />)}
                </View>
              ) : (
                <View style={styles.foldersGrid}>
                  {folders.length > 0 ? (
                    folders.map(folder => (
                      <FolderItem
                        key={folder.id}
                        item={folder}
                        onPress={() => handleFolderPress(folder)}
                        onMenuPress={() => handleMenuPress(folder, 'folder')}
                      />
                    ))
                  ) : (
                    <View style={styles.emptyFolderState}>
                      <Feather name="folder-plus" size={48} color="#cbd5e1" />
                    </View>
                  )}
                </View>
              )}
            </>
          )}
          {/* Files List */}
          {loading ? (
            <View>
              {[...Array(4)].map((_, i) => <SkeletonLoader key={i} type="file" />)}
            </View>
          ) : filteredFiles.length === 0 && selectedCategory !== 'folders' ? (
            <View style={styles.emptyFileState}>
              <Feather name="upload-cloud" size={48} color="#cbd5e1" />
            </View>
          ) : (
            filteredFiles.map((item, idx) => (
              <FileItem
                key={item.id || idx}
                item={item}
                onPress={() => handleFilePress(item)}
                onMenuPress={() => handleMenuPress(item, 'file')}
                onStarPress={() => handleStarPress(item)}
              />
            ))
          )}
        </ScrollView>
        {/* Centered File Menu Modal */}
        <Modal
          visible={menuFileId !== null}
          transparent
          animationType="fade"
          onRequestClose={closeMenu}
        >
          <TouchableOpacity style={styles.menuOverlay} onPress={closeMenu} activeOpacity={1}>
            <View style={styles.centeredMenuCard}>
            {menuType === 'file' ? (
              <>
                  <TouchableOpacity style={styles.centeredMenuItem} onPress={() => handleMenuAction('open', selectedItem, 'file')}>
                    <Feather name="eye" size={24} color="#0061FF" />
                    <Text style={styles.centeredMenuText}>Open</Text>
                </TouchableOpacity>
                  <TouchableOpacity style={styles.centeredMenuItem} onPress={() => handleMenuAction('rename', selectedItem, 'file')}>
                    <Feather name="edit-3" size={24} color="#0061FF" />
                    <Text style={styles.centeredMenuText}>Rename</Text>
                </TouchableOpacity>
                  <TouchableOpacity style={styles.centeredMenuItem} onPress={() => handleMenuAction('compress', selectedItem, 'file')}>
                    <Feather name="compress" size={24} color="#0061FF" />
                    <Text style={styles.centeredMenuText}>Compress</Text>
                </TouchableOpacity>
                  <TouchableOpacity style={styles.centeredMenuItem} onPress={() => handleMenuAction('download', selectedItem, 'file')}>
                    <Feather name="download" size={24} color="#0061FF" />
                    <Text style={styles.centeredMenuText}>Download</Text>
                </TouchableOpacity>
                  <TouchableOpacity style={styles.centeredMenuItem} onPress={() => handleMenuAction('delete', selectedItem, 'file')}>
                    <Feather name="trash" size={24} color="crimson" />
                    <Text style={[styles.centeredMenuText, { color: 'crimson' }]}>Delete</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                  <TouchableOpacity style={styles.centeredMenuItem} onPress={() => handleMenuAction('open', selectedItem, 'folder')}>
                    <Feather name="folder-open" size={24} color="#0061FF" />
                    <Text style={styles.centeredMenuText}>Open</Text>
                </TouchableOpacity>
                  <TouchableOpacity style={styles.centeredMenuItem} onPress={() => handleMenuAction('rename', selectedItem, 'folder')}>
                    <Feather name="edit-3" size={24} color="#0061FF" />
                    <Text style={styles.centeredMenuText}>Rename</Text>
                </TouchableOpacity>
                  <TouchableOpacity style={styles.centeredMenuItem} onPress={() => handleMenuAction('delete', selectedItem, 'folder')}>
                    <Feather name="trash" size={24} color="crimson" />
                    <Text style={[styles.centeredMenuText, { color: 'crimson' }]}>Delete</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
          </TouchableOpacity>
        </Modal>
        {/* Plus Button and Upload Modal */}
        <TouchableOpacity
          style={styles.plusButton}
          onPress={() => setShowUploadModal(true)}
          activeOpacity={0.85}
        >
          <Feather name="plus" size={28} color="#fff" />
        </TouchableOpacity>
        <Modal
          visible={showUploadModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowUploadModal(false)}
        >
          <TouchableOpacity style={styles.overlay} onPress={() => setShowUploadModal(false)} activeOpacity={1}>
            <RadialMenu onPress={handleOptionPress} />
          </TouchableOpacity>
        </Modal>

        {/* Rename Modal */}
        <Modal
          visible={showRenameModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowRenameModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowRenameModal(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Feather name="edit-3" size={24} color="#2563eb" />
                    <Text style={styles.modalTitle}>
                      Rename {(!renameItem?.url && !renameItem?.size && !renameItem?.type) ? 'Folder' : 'File'}
                    </Text>
                  </View>
                  
                  <Text style={styles.modalSubtitle}>
                    Enter a new name for "{renameItem?.name}"
                  </Text>
                  
                  <TextInput
                    style={styles.modalInput}
                    value={newName}
                    onChangeText={setNewName}
                    placeholder="Enter new name"
                    autoFocus={true}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalButtonCancel]}
                      onPress={() => setShowRenameModal(false)}
                    >
                      <Text style={styles.modalButtonCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalButtonConfirm]}
                      onPress={handleRename}
                    >
                      <Text style={styles.modalButtonConfirmText}>Rename</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Compression Modal */}
        <Modal
          visible={showCompressModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowCompressModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowCompressModal(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Feather name="compress" size={24} color="#2563eb" />
                    <Text style={styles.modalTitle}>Compress File</Text>
                  </View>
                  
                  <Text style={styles.modalSubtitle}>
                    Compress "{compressItem?.name}" to reduce file size
                  </Text>

                  {/* Quality Setting */}
                  <View style={styles.settingGroup}>
                    <Text style={styles.settingLabel}>Quality</Text>
                    <View style={styles.settingOptions}>
                      {['low', 'medium', 'high'].map((quality) => (
                        <TouchableOpacity
                          key={quality}
                          style={[
                            styles.settingOption,
                            compressionSettings.quality === quality && styles.settingOptionSelected
                          ]}
                          onPress={() => setCompressionSettings(prev => ({ ...prev, quality }))}
                        >
                          <Text style={[
                            styles.settingOptionText,
                            compressionSettings.quality === quality && styles.settingOptionTextSelected
                          ]}>
                            {quality.charAt(0).toUpperCase() + quality.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Format Setting */}
                  <View style={styles.settingGroup}>
                    <Text style={styles.settingLabel}>Format</Text>
                    <View style={styles.settingOptions}>
                      {['zip', 'rar', '7z'].map((format) => (
                        <TouchableOpacity
                          key={format}
                          style={[
                            styles.settingOption,
                            compressionSettings.format === format && styles.settingOptionSelected
                          ]}
                          onPress={() => setCompressionSettings(prev => ({ ...prev, format }))}
                        >
                          <Text style={[
                            styles.settingOptionText,
                            compressionSettings.format === format && styles.settingOptionTextSelected
                          ]}>
                            {format.toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Compression Level */}
                  <View style={styles.settingGroup}>
                    <Text style={styles.settingLabel}>Compression Level</Text>
                    <View style={styles.settingOptions}>
                      {['fast', 'balanced', 'maximum'].map((level) => (
                        <TouchableOpacity
                          key={level}
                          style={[
                            styles.settingOption,
                            compressionSettings.level === level && styles.settingOptionSelected
                          ]}
                          onPress={() => setCompressionSettings(prev => ({ ...prev, level }))}
                        >
                          <Text style={[
                            styles.settingOptionText,
                            compressionSettings.level === level && styles.settingOptionTextSelected
                          ]}>
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalButtonCancel]}
                      onPress={() => setShowCompressModal(false)}
                      disabled={compressing}
                    >
                      <Text style={styles.modalButtonCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalButtonConfirm]}
                      onPress={handleCompress}
                      disabled={compressing}
                    >
                      {compressing ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.modalButtonConfirmText}>Compress</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Create Folder Modal */}
        <Modal
          visible={showFolderModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowFolderModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowFolderModal(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Feather name="folder-plus" size={24} color="#2563eb" />
                    <Text style={styles.modalTitle}>Create New Folder</Text>
                  </View>
                  
                  <Text style={styles.modalSubtitle}>
                    Enter a name for your new folder
                  </Text>
                  
                  <TextInput
                    style={styles.modalInput}
                    value={newFolderName}
                    onChangeText={setNewFolderName}
                    placeholder="Folder name..."
                    autoFocus={true}
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={50}
                  />
                  
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalButtonCancel]}
                      onPress={() => {
                        setShowFolderModal(false);
                        setNewFolderName('');
                      }}
                    >
                      <Text style={styles.modalButtonCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalButtonConfirm]}
                      onPress={handleAddFolder}
                    >
                      <Text style={styles.modalButtonConfirmText}>Create Folder</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Success Modal */}
        <Modal
          visible={showSuccessModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowSuccessModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowSuccessModal(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.successModalContent}>
                  <View style={styles.successIconContainer}>
                    <Feather name="check-circle" size={48} color="#10b981" />
                  </View>
                  <Text style={styles.successTitle}>Success!</Text>
                  <Text style={styles.successMessage}>{successMessage}</Text>
                  <TouchableOpacity
                    style={styles.successButton}
                    onPress={() => setShowSuccessModal(false)}
                  >
                    <Text style={styles.successButtonText}>OK</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginTop: 10,
    marginBottom: 8,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBtn: {
    marginLeft: 18,
    padding: 6,
    borderRadius: 20,
  },
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f6f6',
    borderRadius: 18,
    marginHorizontal: 18,
    marginBottom: 18,
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
  searchInputModern: {
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 18,
    marginBottom: 8,
    marginTop: 8,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    letterSpacing: 0.1,
  },
  seeAll: {
    color: '#0061FF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  fileCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#faf9f7',
    borderRadius: 16,
    marginHorizontal: 18,
    marginBottom: 14,
    padding: 16,
    shadowColor: '#003366',
    shadowOpacity: 0.22,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  fileThumbWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0061FF',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  fileCardName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
    fontFamily: 'System',
    marginBottom: 2,
  },
  fileCardMeta: {
    fontSize: 13,
    color: '#aaa',
    fontWeight: '400',
    fontFamily: 'System',
  },
  menuButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 18,
  },
  emptyIllustration: {
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#bbb',
    fontWeight: 'bold',
    fontFamily: 'System',
    textAlign: 'center',
    marginHorizontal: 24,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createFolderModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    minWidth: 260,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    alignItems: 'stretch',
  },
  createFolderTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 14,
    fontFamily: 'System',
  },
  createFolderInput: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontFamily: 'System',
    color: '#222',
    backgroundColor: '#faf9f7',
  },
  categoryBar: {
    marginBottom: 18,
    marginLeft: 16,
    flexDirection: 'row',
    paddingVertical: 8,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: '#fff',
    shadowColor: '#0061FF',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryButtonSelected: {
    backgroundColor: '#0061FF',
    shadowColor: '#0061FF',
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  categoryButtonText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'System',
    letterSpacing: 0.2,
  },
  categoryButtonTextSelected: {
    color: '#fff',
  },
  uploadIllustrationWrap: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  scrollContent: {
    paddingBottom: 60,
    paddingTop: 10,
  },
  fileMenuModal: {
    position: 'absolute',
    right: 0,
    top: 48,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#003366',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    zIndex: 99,
  },
  fileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  fileMenuText: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
  },
  fileMenuClose: {
    marginTop: 8,
    alignItems: 'center',
  },
  fileMenuCloseText: {
    color: '#0061FF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 18,
    marginBottom: 8,
    marginTop: 2,
  },
  sortIconBtn: {
    marginLeft: 10,
    backgroundColor: '#f6f8fc',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1.5,
    borderColor: '#e0e7ef',
  },
  sortModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortModalCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingVertical: 36,
    paddingHorizontal: 32,
    minWidth: 240,
    shadowColor: '#003366',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  sortModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 10,
    textAlign: 'center',
  },
  sortModalDivider: {
    width: '100%',
    height: 1.5,
    backgroundColor: '#e0e7ef',
    marginBottom: 18,
    borderRadius: 1,
  },
  sortOptionBtn: {
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 16,
    marginBottom: 10,
    width: 160,
    alignItems: 'center',
    backgroundColor: '#f7fafd',
    borderWidth: 0,
  },
  sortOptionBtnSelected: {
    backgroundColor: '#e6f0fa',
    borderColor: '#2563eb',
    borderWidth: 2,
    shadowColor: '#2563eb',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sortOptionText: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
  },
  sortOptionTextSelected: {
    color: '#2563eb',
  },
  sortModalCloseBtn: {
    marginTop: 16,
    alignItems: 'center',
  },
  sortModalCloseText: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.2,
  },
  plusButton: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    backgroundColor: '#0061FF',
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-end',
  },
  wheel: {
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#e5e7eb',
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -130,
    marginTop: -130,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
  },
  iconButton: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  foldersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 18,
    marginBottom: 12,
  },
  folderCardGrid: {
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    marginBottom: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    shadowColor: '#003366',
    shadowOpacity: 0.22,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    minWidth: 110,
    maxWidth: 140,
  },
  folderIconImgGrid: {
    width: 40,
    height: 40,
    marginBottom: 6,
  },
  folderNameGrid: {
    fontSize: 15,
    color: '#222',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  breadcrumbWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 8,
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbText: {
    color: '#888',
    fontSize: 15,
    fontWeight: '500',
    marginRight: 2,
  },
  breadcrumbTextActive: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
  breadcrumbSeparator: {
    color: '#bbb',
    marginHorizontal: 2,
    fontSize: 15,
  },
  skeletonFile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f7f9',
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 4,
    padding: 12,
  },
  skeletonFolder: {
    alignItems: 'center',
    backgroundColor: '#f6f7f9',
    borderRadius: 12,
    margin: 8,
    padding: 12,
    width: 110,
  },
  skeletonIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#e0e7ef',
    marginRight: 12,
  },
  skeletonTextBlock: {
    height: 14,
    borderRadius: 6,
    backgroundColor: '#e0e7ef',
    flex: 1,
    marginBottom: 6,
  },
  skeletonTextBlockSmall: {
    height: 10,
    width: 60,
    borderRadius: 5,
    backgroundColor: '#e0e7ef',
    marginTop: 2,
  },
  uploadProgressWrap: {
    width: 220,
    height: 18,
    backgroundColor: '#e0e7ef',
    borderRadius: 9,
    marginTop: 18,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  uploadProgressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#2563eb',
    borderRadius: 9,
    height: 18,
    zIndex: 1,
  },
  uploadProgressText: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
    zIndex: 2,
  },
  centeredMenuCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  centeredMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: '100%',
    justifyContent: 'center',
  },
  centeredMenuText: {
    fontSize: 16,
    color: '#222',
    fontWeight: '600',
    marginLeft: 12,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 320,
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
  modalInput: {
    borderWidth: 1,
    borderColor: '#e0e7ef',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#222',
    backgroundColor: '#f8fafc',
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
    backgroundColor: '#2563eb',
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
  // Success Modal Styles
  successModalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    width: '85%',
    maxWidth: 300,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  successButton: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Compression Modal Styles
  settingGroup: {
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  settingOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  settingOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  settingOptionSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  settingOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  settingOptionTextSelected: {
    color: '#fff',
  },
  // Current Folder Indicator Styles
  currentFolderIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#0061FF',
  },
  currentFolderText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0061FF',
    marginLeft: 8,
  },
  // Upload Success Animation Styles
  uploadSuccessOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  uploadSuccessCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  uploadSuccessIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  uploadSuccessText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10b981',
    textAlign: 'center',
  },
  // Empty State Styles
  emptyFolderState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyFolderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyFolderSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  emptyFileState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyFileText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyFileSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
}); 