import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, SafeAreaView, ScrollView, Image, Animated, FlatList, RefreshControl, Dimensions, Modal, TouchableWithoutFeedback } from 'react-native';
import { searchFiles, listFiles } from './api';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';



const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const user = { name: 'Lazarus', avatar: 'https://img.icons8.com/color/96/user-male-circle--v2.png' };

export default function HomeScreen() {
  const { theme } = useTheme();
  const [folders, setFolders] = useState([]);
  const [allFiles, setAllFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const heroAnim = useRef(new Animated.Value(0)).current;
  const recentAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(heroAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
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

  const getFilePreview = (file) => {
    if (!file || !file.name) return null;
    
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    // For images, show the actual image
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      return { type: 'image', source: file.url };
    }
    
    // For videos, show a video thumbnail with play icon
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(extension)) {
      return { type: 'video', source: file.url };
    }
    
    // For audio, show audio waveform or music icon
    if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'].includes(extension)) {
      return { type: 'audio', source: file.url };
    }
    
    // For PDFs, show PDF icon with preview
    if (extension === 'pdf') {
      return { type: 'pdf', source: file.url };
    }
    
    // For text files, show text preview
    if (['txt', 'md', 'json', 'xml', 'html', 'css', 'js', 'py', 'java', 'cpp', 'c', 'php'].includes(extension)) {
      return { type: 'text', source: file.url };
    }
    
    // For other files, show file icon
    return { type: 'file', source: null };
  };

  const handleFilePress = (file) => {
    // Navigate to file viewer screen
    navigation.navigate('FileViewer', { file });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshFiles} tintColor={theme.primary} />}
        >
          {/* Home Title */}
          <View style={styles.homeTitleContainer}>
            <Text style={[styles.homeTitle, { color: theme.text }]}>Home</Text>
          </View>
          
          {/* Search Bar */}
          <Animated.View style={[styles.heroSearchBarWrap, { 
            backgroundColor: theme.searchBackground,
            shadowColor: theme.shadow,
            opacity: heroAnim, 
            transform: [{ translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] 
          }]}> 
            <Feather name="search" size={20} color={theme.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: theme.searchText }]}
              placeholder="Search files..."
              placeholderTextColor={theme.searchPlaceholder}
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </Animated.View>
          
          {/* Search Results */}
          {searchQuery && searchResults !== null && (
            <Animated.View style={[styles.sectionCard, { 
              backgroundColor: theme.card,
              shadowColor: theme.shadow,
              opacity: recentAnim, 
              transform: [{ translateY: recentAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] 
            }]}> 
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Search Results</Text>
              {searchResults.length > 0 ? (
                <FlatList
                  data={searchResults}
                  keyExtractor={item => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.recentFilesList}
                  renderItem={({ item }) => {
                    const preview = getFilePreview(item);
                    return (
                      <TouchableOpacity 
                        style={[styles.recentFileCard, { backgroundColor: theme.surface }]}
                        onPress={() => handleFilePress(item)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.filePreviewContainer}>
                          {preview?.type === 'image' ? (
                            <Image 
                              source={{ uri: preview.source }} 
                              style={styles.filePreviewImage}
                              resizeMode="cover"
                            />
                          ) : preview?.type === 'video' ? (
                            <View style={styles.videoPreviewContainer}>
                              <Image 
                                source={{ uri: preview.source }} 
                                style={styles.filePreviewImage}
                                resizeMode="cover"
                              />
                              <View style={[styles.videoPlayOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]}> 
                                <Feather name="play" size={16} color="#fff" />
                              </View>
                            </View>
                          ) : preview?.type === 'audio' ? (
                            <View style={[styles.audioPreviewContainer, { backgroundColor: theme.primary }]}> 
                              <Feather name="music" size={24} color={theme.textInverse} />
                            </View>
                          ) : preview?.type === 'pdf' ? (
                            <View style={[styles.pdfPreviewContainer, { backgroundColor: '#ff4444' }]}> 
                              <Feather name="file-text" size={24} color="#fff" />
                            </View>
                          ) : preview?.type === 'text' ? (
                            <View style={[styles.textPreviewContainer, { backgroundColor: theme.primary }]}> 
                              <Feather name="file-text" size={24} color={theme.textInverse} />
                            </View>
                          ) : (
                            <Image source={{ uri: item.thumb }} style={styles.recentFileThumbImg} />
                          )}
                        </View>
                        <Text style={[styles.recentFileName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                        <Text style={[styles.recentFileMeta, { color: theme.textSecondary }]}>{formatDate(item.modifiedAt || item.createdAt)}</Text>
                        <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}>
                          <Feather name="more-vertical" size={20} color={theme.textSecondary} />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    );
                  }}
                />
              ) : (
                <View style={styles.emptyState}>
                  <View style={styles.sketchSearch}>
                    <View style={[styles.sketchSearchIcon, { backgroundColor: theme.textTertiary }]} />
                    <View style={[styles.sketchSearchLine, { backgroundColor: theme.textTertiary }]} />
                  </View>
                  <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No files found</Text>
                </View>
              )}
            </Animated.View>
          )}
          
          {/* Starred Section */}
          {starredFiles.length > 0 && (
            <View style={[styles.sectionCard, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Starred Files</Text>
              <FlatList
                data={starredFiles}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recentFilesList}
                renderItem={({ item }) => {
                  const preview = getFilePreview(item.file);
                  return (
                  <TouchableOpacity 
                      style={[styles.recentFileCard, { backgroundColor: theme.surface }]}
                    onPress={() => handleFilePress(item.file)}
                    activeOpacity={0.8}
                  >
                      <View style={styles.filePreviewContainer}>
                        {preview?.type === 'image' ? (
                          <Image 
                            source={{ uri: preview.source }} 
                            style={styles.filePreviewImage}
                            resizeMode="cover"
                          />
                        ) : preview?.type === 'video' ? (
                          <View style={styles.videoPreviewContainer}>
                            <Image 
                              source={{ uri: preview.source }} 
                              style={styles.filePreviewImage}
                              resizeMode="cover"
                            />
                            <View style={[styles.videoPlayOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]}> 
                              <Feather name="play" size={16} color="#fff" />
                            </View>
                          </View>
                        ) : preview?.type === 'audio' ? (
                          <View style={[styles.audioPreviewContainer, { backgroundColor: theme.primary }]}> 
                            <View style={styles.sketchAudio}>
                              <View style={[styles.sketchWave, { backgroundColor: theme.textInverse }]} />
                              <View style={[styles.sketchWave, { backgroundColor: theme.textInverse, width: '60%' }]} />
                              <View style={[styles.sketchWave, { backgroundColor: theme.textInverse, width: '80%' }]} />
                            </View>
                          </View>
                        ) : preview?.type === 'pdf' ? (
                          <View style={[styles.pdfPreviewContainer, { backgroundColor: '#ff4444' }]}> 
                            <View style={styles.sketchDocument}>
                              <View style={[styles.sketchPage, { backgroundColor: '#fff' }]} />
                              <View style={[styles.sketchLine, { backgroundColor: '#fff', width: '80%' }]} />
                              <View style={[styles.sketchLine, { backgroundColor: '#fff', width: '60%' }]} />
                            </View>
                          </View>
                        ) : preview?.type === 'text' ? (
                          <View style={[styles.textPreviewContainer, { backgroundColor: theme.primary }]}> 
                            <View style={styles.sketchText}>
                              <View style={[styles.sketchTextLine, { backgroundColor: theme.textInverse }]} />
                              <View style={[styles.sketchTextLine, { backgroundColor: theme.textInverse, width: '70%' }]} />
                              <View style={[styles.sketchTextLine, { backgroundColor: theme.textInverse, width: '90%' }]} />
                            </View>
                          </View>
                        ) : (
                    <Image source={{ uri: item.thumb }} style={styles.recentFileThumbImg} />
                        )}
                      </View>
                      <Text style={[styles.recentFileName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                      <Text style={[styles.recentFileMeta, { color: theme.textSecondary }]}>{item.modified}</Text>
                    <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}>
                        <Feather name="more-vertical" size={20} color={theme.textSecondary} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          )}
          
          {/* Recent Files Horizontal Scroll */}
          <Animated.View style={[styles.sectionCard, { 
            backgroundColor: theme.card,
            shadowColor: theme.shadow,
            opacity: recentAnim, 
            transform: [{ translateY: recentAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] 
          }]}> 
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Files</Text>
            {recentFiles.length > 0 ? (
              <FlatList
                data={recentFiles}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recentFilesList}
                renderItem={({ item }) => {
                  const preview = getFilePreview(item.file);
                  return (
                  <TouchableOpacity 
                      style={[styles.recentFileCard, { backgroundColor: theme.surface }]}
                    onPress={() => handleFilePress(item.file)}
                    activeOpacity={0.8}
                  >
                      <View style={styles.filePreviewContainer}>
                        {preview?.type === 'image' ? (
                          <Image 
                            source={{ uri: preview.source }} 
                            style={styles.filePreviewImage}
                            resizeMode="cover"
                          />
                        ) : preview?.type === 'video' ? (
                          <View style={styles.videoPreviewContainer}>
                            <Image 
                              source={{ uri: preview.source }} 
                              style={styles.filePreviewImage}
                              resizeMode="cover"
                            />
                            <View style={[styles.videoPlayOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]}> 
                              <Feather name="play" size={16} color="#fff" />
                            </View>
                          </View>
                        ) : preview?.type === 'audio' ? (
                          <View style={[styles.audioPreviewContainer, { backgroundColor: theme.primary }]}> 
                            <View style={styles.sketchAudio}>
                              <View style={[styles.sketchWave, { backgroundColor: theme.textInverse }]} />
                              <View style={[styles.sketchWave, { backgroundColor: theme.textInverse, width: '60%' }]} />
                              <View style={[styles.sketchWave, { backgroundColor: theme.textInverse, width: '80%' }]} />
                            </View>
                          </View>
                        ) : preview?.type === 'pdf' ? (
                          <View style={[styles.pdfPreviewContainer, { backgroundColor: '#ff4444' }]}> 
                            <View style={styles.sketchDocument}>
                              <View style={[styles.sketchPage, { backgroundColor: '#fff' }]} />
                              <View style={[styles.sketchLine, { backgroundColor: '#fff', width: '80%' }]} />
                              <View style={[styles.sketchLine, { backgroundColor: '#fff', width: '60%' }]} />
                            </View>
                          </View>
                        ) : preview?.type === 'text' ? (
                          <View style={[styles.textPreviewContainer, { backgroundColor: theme.primary }]}> 
                            <View style={styles.sketchText}>
                              <View style={[styles.sketchTextLine, { backgroundColor: theme.textInverse }]} />
                              <View style={[styles.sketchTextLine, { backgroundColor: theme.textInverse, width: '70%' }]} />
                              <View style={[styles.sketchTextLine, { backgroundColor: theme.textInverse, width: '90%' }]} />
                            </View>
                          </View>
                        ) : (
                    <Image source={{ uri: item.thumb }} style={styles.recentFileThumbImg} />
                        )}
                      </View>
                      <Text style={[styles.recentFileName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                      <Text style={[styles.recentFileMeta, { color: theme.textSecondary }]}>{item.modified}</Text>
                    <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}>
                        <Feather name="more-vertical" size={20} color={theme.textSecondary} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                }}
              />
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.sketchEmpty}>
                  <View style={[styles.sketchFile, { backgroundColor: theme.textTertiary }]} />
                  <View style={[styles.sketchFile, { backgroundColor: theme.textTertiary, width: '80%' }]} />
                  <View style={[styles.sketchFile, { backgroundColor: theme.textTertiary, width: '60%' }]} />
                </View>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No recent files</Text>
              </View>
            )}
          </Animated.View>

          {/* Popular Files Section */}
          <View style={[styles.sectionCard, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Popular Files</Text>
            <FlatList
              data={allFiles.slice(0, 3)}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentFilesList}
              renderItem={({ item }) => {
                const preview = getFilePreview(item);
                return (
                  <TouchableOpacity 
                    style={[styles.recentFileCard, { backgroundColor: theme.surface }]}
                    onPress={() => handleFilePress(item)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.filePreviewContainer}>
                      {preview?.type === 'image' ? (
                        <Image 
                          source={{ uri: preview.source }} 
                          style={styles.filePreviewImage}
                          resizeMode="cover"
                        />
                      ) : preview?.type === 'video' ? (
                        <View style={styles.videoPreviewContainer}>
                          <Image 
                            source={{ uri: preview.source }} 
                            style={styles.filePreviewImage}
                            resizeMode="cover"
                          />
                          <View style={[styles.videoPlayOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]}> 
                            <Feather name="play" size={16} color="#fff" />
                          </View>
                        </View>
                      ) : preview?.type === 'audio' ? (
                        <View style={[styles.audioPreviewContainer, { backgroundColor: theme.primary }]}> 
                          <Feather name="music" size={24} color={theme.textInverse} />
                        </View>
                      ) : preview?.type === 'pdf' ? (
                        <View style={[styles.pdfPreviewContainer, { backgroundColor: '#ff4444' }]}> 
                          <Feather name="file-text" size={24} color="#fff" />
                        </View>
                      ) : preview?.type === 'text' ? (
                        <View style={[styles.textPreviewContainer, { backgroundColor: theme.primary }]}> 
                          <Feather name="file-text" size={24} color={theme.textInverse} />
                        </View>
                      ) : (
                        <Image source={{ uri: getFileIcon(item.name) }} style={styles.recentFileThumbImg} />
                      )}
                    </View>
                    <Text style={[styles.recentFileName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[styles.recentFileMeta, { color: theme.textSecondary }]}>{formatDate(item.modifiedAt || item.createdAt)}</Text>
                    <View style={styles.popularBadge}>
                      <Feather name="trending-up" size={12} color="#fff" />
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
          
          {/* Folders Grid */}
          {folders.length > 0 && (
            <View style={styles.foldersGrid}>
              {folders.map(folder => (
                <TouchableOpacity key={folder.id} style={[styles.folderCardGrid, { backgroundColor: theme.card, shadowColor: theme.shadow }]} onPress={() => Alert.alert('Open Folder', `Open folder: ${folder.name}`)}>
                  <Image source={{ uri: 'https://img.icons8.com/color/96/folder-invoices--v2.png' }} style={styles.folderIconImgGrid} />
                  <Text style={[styles.folderNameGrid, { color: theme.text }]}>{folder.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 80,
  },
  homeTitleContainer: {
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  homeTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  heroSearchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 18,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowOpacity: 0.1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'System',
  },
  sectionCard: {
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 20,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.1,
    marginBottom: 12,
  },
  sketchIllustration: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 40,
    width: 60,
  },
  sketchCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginBottom: 4,
  },
  sketchLine: {
    width: '100%',
    height: 3,
    borderRadius: 2,
    marginBottom: 4,
  },
  sketchDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  sketchBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 3,
    width: '100%',
  },
  sketchLink: {
    height: 2,
    borderRadius: 1,
    marginBottom: 3,
    width: '100%',
  },
  sketchTimeline: {
    width: 2,
    height: '100%',
    borderRadius: 1,
    position: 'absolute',
    right: 10,
  },
  sketchFile: {
    height: 3,
    borderRadius: 2,
    marginBottom: 3,
    width: '100%',
  },
  sketchStar: {
    height: 3,
    borderRadius: 2,
    marginBottom: 3,
    width: '100%',
  },
  sketchFileType: {
    height: 4,
    borderRadius: 2,
    marginBottom: 4,
    width: '100%',
  },
  sketchCloud: {
    width: 30,
    height: 20,
    borderRadius: 15,
    marginBottom: 6,
  },
  sketchSync: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginBottom: 6,
  },
  sketchShield: {
    width: 25,
    height: 30,
    borderRadius: 12,
    marginBottom: 6,
  },
  sketchLock: {
    width: 20,
    height: 25,
    borderRadius: 10,
    marginBottom: 6,
  },
  sketchKey: {
    width: 15,
    height: 20,
    borderRadius: 8,
    marginBottom: 6,
  },
  sketchBackup: {
    width: 25,
    height: 25,
    borderRadius: 12,
    marginBottom: 6,
  },
  sketchArrow: {
    width: 20,
    height: 3,
    borderRadius: 2,
    marginBottom: 6,
  },
  sketchServer: {
    width: 30,
    height: 20,
    borderRadius: 10,
    marginBottom: 6,
  },
  sketchUsers: {
    width: 25,
    height: 25,
    borderRadius: 12,
    marginBottom: 6,
  },
  sketchChat: {
    width: 20,
    height: 15,
    borderRadius: 8,
    marginBottom: 6,
  },
  sketchEdit: {
    width: 15,
    height: 20,
    borderRadius: 8,
    marginBottom: 6,
  },
  sketchGraph: {
    width: 30,
    height: 20,
    borderRadius: 10,
    marginBottom: 6,
  },
  sketchMetric: {
    width: 20,
    height: 15,
    borderRadius: 8,
    marginBottom: 6,
  },
  sketchTrend: {
    width: 25,
    height: 3,
    borderRadius: 2,
    marginBottom: 6,
  },
  sketchShare: {
    width: 25,
    height: 25,
    borderRadius: 12,
    marginBottom: 6,
  },
  sketchAudio: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  sketchWave: {
    height: 2,
    borderRadius: 1,
    marginBottom: 2,
    width: '100%',
  },
  sketchDocument: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  sketchPage: {
    width: 20,
    height: 25,
    borderRadius: 2,
    marginBottom: 3,
  },
  sketchText: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  sketchTextLine: {
    height: 2,
    borderRadius: 1,
    marginBottom: 2,
    width: '100%',
  },
  sketchEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  sketchSearch: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  sketchSearchIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginBottom: 6,
  },
  sketchSearchLine: {
    width: 16,
    height: 2,
    borderRadius: 1,
  },
  recentFilesList: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentFileCard: {
    borderRadius: 16,
    marginRight: 16,
    padding: 16,
    width: 130,
    alignItems: 'center',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  recentFileThumbImg: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginBottom: 6,
  },
  recentFileName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  recentFileMeta: {
    fontSize: 12,
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
    borderRadius: 12,
    margin: 8,
    padding: 12,
    width: 110,
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
    marginBottom: 2,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 20,
    width: screenWidth * 0.95,
    height: screenHeight * 0.9,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 16,
  },
  modalCloseButton: {
    padding: 8,
    borderRadius: 20,
  },
  modalBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  previewScrollView: {
    flex: 1,
    width: '100%',
  },
  previewScrollContent: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%',
  },
  previewImage: {
    width: screenWidth * 0.9,
    height: screenHeight * 0.6,
    borderRadius: 12,
  },
  previewVideoContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewVideo: {
    width: screenWidth * 0.9,
    height: screenHeight * 0.6,
    borderRadius: 12,
  },
  previewAudioContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  audioVisualizer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  audioTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewWebView: {
    flex: 1,
    width: '100%',
    borderRadius: 12,
  },
  previewText: {
    fontSize: 16,
    padding: 20,
    lineHeight: 24,
  },
  previewUnsupported: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  previewUnsupportedText: {
    fontSize: 18,
    marginBottom: 24,
    textAlign: 'center',
  },
  openFileButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  openFileButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  filePreviewContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 6,
    overflow: 'hidden',
  },
  filePreviewImage: {
    width: '100%',
    height: '100%',
  },
  videoPreviewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioPreviewContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfPreviewContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textPreviewContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  sketchContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    height: 60,
  },
  illustrationText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },

  popularBadge: {
    backgroundColor: '#ff6b35',
    borderRadius: 12,
    padding: 4,
    position: 'absolute',
    top: 8,
    right: 8,
  },
  illustrationImage: {
    width: '100%',
    height: 120,
    marginBottom: 12,
    borderRadius: 12,
  },
}); 