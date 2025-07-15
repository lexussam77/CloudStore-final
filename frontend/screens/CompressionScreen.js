import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { listFiles, compressFile, extractFile, deleteFile } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from 'react-native-vector-icons/Feather';
import FileItem from './FileItem';
import { useTheme } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import HappyStudentBro from '../assets/images/pngs/Happy student-bro.png';

export default function CompressionScreen() {
  const { theme } = useTheme();
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [compressionSettings, setCompressionSettings] = useState({
    quality: 'medium', // for images/videos
    format: 'jpeg',    // for images, or 'mp4' for videos, or 'zip' for others
    bitrate: 'medium', // for videos
    archiveFormat: 'zip', // for others
  });
  const [compressing, setCompressing] = useState(false);
  const [compressionResults, setCompressionResults] = useState([]);
  const navigation = useNavigation();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt');
      if (!token) return;

      const res = await listFiles(token);
      if (res.success) {
        setFiles(res.data);
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

  const toggleFileSelection = (fileId) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleStarPress = async (item) => {
    // This would handle favoriting files
    console.log('Star pressed for:', item.name);
  };

  const handleMenuPress = (item) => {
    // This would show individual file menu
    console.log('Menu pressed for:', item.name);
  };

  // Helper to check if a file is image or video
  const isImageOrVideo = (file) => {
    if (!file || !file.name) return false;
    const ext = file.name.split('.').pop().toLowerCase();
    return [
      'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', // images
      'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv' // videos
    ].includes(ext);
  };

  // Helper to check file type
  const getFileType = (file) => {
    if (!file || !file.name) return 'other';
    const ext = file.name.split('.').pop().toLowerCase();
    if ([ 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp' ].includes(ext)) return 'image';
    if ([ 'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv' ].includes(ext)) return 'video';
    return 'other';
  };

  // Filtering for compressed files: only show files with '_compressed' in the name
  const compressedFiles = files.filter(f => f.name && f.name.includes('_compressed'));
  // Filtering for non-compressed files: only show files without '_compressed' in the name
  const nonCompressedFiles = files.filter(f => !f.name || !f.name.includes('_compressed'));

  // Determine selected file types
  const selectedFileObjs = files.filter(f => selectedFiles.includes(f.id));
  const selectedTypes = Array.from(new Set(selectedFileObjs.map(getFileType)));
  const isMixed = selectedTypes.length > 1;
  const onlyImages = selectedTypes.length === 1 && selectedTypes[0] === 'image';
  const onlyVideos = selectedTypes.length === 1 && selectedTypes[0] === 'video';
  const onlyOthers = selectedTypes.length === 1 && selectedTypes[0] === 'other';

  // Compression options UI
  const renderCompressionOptions = () => {
    if (isMixed) {
      // Only allow archiving for mixed types
      return (
        <View style={styles.settingGroup}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>Archive Format</Text>
          <View style={styles.settingOptions}>
            {['zip', 'rar', '7z'].map(fmt => (
              <TouchableOpacity
                key={fmt}
                style={[styles.settingOption, compressionSettings.archiveFormat === fmt && [styles.settingOptionSelected, { borderColor: theme.primary, backgroundColor: theme.primaryLight }]]}
                onPress={() => setCompressionSettings(s => ({ ...s, archiveFormat: fmt }))}
              >
                <Text style={[styles.settingOptionText, compressionSettings.archiveFormat === fmt && [styles.settingOptionTextSelected, { color: theme.primary }]]}>{fmt.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }
    if (onlyImages) {
      return (
        <>
          <View style={styles.settingGroup}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>Image Quality</Text>
            <View style={styles.settingOptions}>
              {['low', 'medium', 'high'].map(q => (
                <TouchableOpacity
                  key={q}
                  style={[styles.settingOption, compressionSettings.quality === q && [styles.settingOptionSelected, { borderColor: theme.primary, backgroundColor: theme.primaryLight }]]}
                  onPress={() => setCompressionSettings(s => ({ ...s, quality: q }))}
                >
                  <Text style={[styles.settingOptionText, compressionSettings.quality === q && [styles.settingOptionTextSelected, { color: theme.primary }]]}>{q.charAt(0).toUpperCase() + q.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.settingGroup}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>Format</Text>
            <View style={styles.settingOptions}>
              {['jpeg', 'png', 'webp'].map(fmt => (
                <TouchableOpacity
                  key={fmt}
                  style={[styles.settingOption, compressionSettings.format === fmt && [styles.settingOptionSelected, { borderColor: theme.primary, backgroundColor: theme.primaryLight }]]}
                  onPress={() => setCompressionSettings(s => ({ ...s, format: fmt }))}
                >
                  <Text style={[styles.settingOptionText, compressionSettings.format === fmt && [styles.settingOptionTextSelected, { color: theme.primary }]]}>{fmt.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </>
      );
    }
    if (onlyVideos) {
      return (
        <>
          <View style={styles.settingGroup}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>Video Quality</Text>
            <View style={styles.settingOptions}>
              {['low', 'medium', 'high'].map(q => (
                <TouchableOpacity
                  key={q}
                  style={[styles.settingOption, compressionSettings.quality === q && [styles.settingOptionSelected, { borderColor: theme.primary, backgroundColor: theme.primaryLight }]]}
                  onPress={() => setCompressionSettings(s => ({ ...s, quality: q }))}
                >
                  <Text style={[styles.settingOptionText, compressionSettings.quality === q && [styles.settingOptionTextSelected, { color: theme.primary }]]}>{q.charAt(0).toUpperCase() + q.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.settingGroup}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>Format</Text>
            <View style={styles.settingOptions}>
              {['mp4', 'webm'].map(fmt => (
                <TouchableOpacity
                  key={fmt}
                  style={[styles.settingOption, compressionSettings.format === fmt && [styles.settingOptionSelected, { borderColor: theme.primary, backgroundColor: theme.primaryLight }]]}
                  onPress={() => setCompressionSettings(s => ({ ...s, format: fmt }))}
                >
                  <Text style={[styles.settingOptionText, compressionSettings.format === fmt && [styles.settingOptionTextSelected, { color: theme.primary }]]}>{fmt.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </>
      );
    }
    if (onlyOthers) {
      return (
        <View style={styles.settingGroup}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>Archive Format</Text>
          <View style={styles.settingOptions}>
            {['zip', 'rar', '7z'].map(fmt => (
              <TouchableOpacity
                key={fmt}
                style={[styles.settingOption, compressionSettings.archiveFormat === fmt && [styles.settingOptionSelected, { borderColor: theme.primary, backgroundColor: theme.primaryLight }]]}
                onPress={() => setCompressionSettings(s => ({ ...s, archiveFormat: fmt }))}
              >
                <Text style={[styles.settingOptionText, compressionSettings.archiveFormat === fmt && [styles.settingOptionTextSelected, { color: theme.primary }]]}>{fmt.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }
    return null;
  };

  // Handle compress action
  const handleCompress = async () => {
    setCompressing(true);
    setCompressionResults([]);
    const token = await AsyncStorage.getItem('jwt');
    const results = [];
    let anySuccess = false;
    const qualityMap = { low: 0.3, medium: 0.6, high: 0.9 };
    for (const file of selectedFileObjs) {
      let dto = {};
      const type = getFileType(file);
      if (type === 'image') {
        dto = { type: 'image', quality: qualityMap[compressionSettings.quality], format: compressionSettings.format };
      } else if (type === 'video') {
        dto = { type: 'video', bitrate: 1000, format: compressionSettings.format };
      } else {
        dto = { type: 'archive', format: compressionSettings.archiveFormat };
      }
      try {
        const res = await compressFile(token, file.id, dto);
        results.push({ file, success: res.success, error: res.error });
        if (res.success) {
          anySuccess = true;
          // Delete the original file after successful compression
          await deleteFile(token, file.id);
        }
      } catch (err) {
        results.push({ file, success: false, error: err.message });
      }
    }
    console.log('Compression results:', results);
    setCompressionResults(results);
    setCompressing(false);
    setShowOptionsModal(false);
    await fetchFiles();
    if (anySuccess) {
      setSuccessMessage('File(s) compressed successfully!');
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        if (navigation.canGoBack()) {
          navigation.goBack();
        } // else do nothing
      }, 1500);
    } else {
      setErrorMessage('Compression failed for all selected files.');
      setShowErrorModal(true);
    }
  };

  // --- Analytics/Stats ---
  // Calculate stats
  const totalFiles = files.length;
  const compressedFilesCount = compressedFiles.length;
  const totalSize = files.reduce((sum, f) => sum + (f.size || 0), 0);
  const compressedSize = compressedFiles.reduce((sum, f) => sum + (f.size || 0), 0);
  const estimatedOriginalSize = compressedFilesCount > 0 ? compressedSize * 1.5 : 0; // crude estimate
  const spaceSaved = estimatedOriginalSize > 0 ? estimatedOriginalSize - compressedSize : 0;

  // Format bytes
  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading files...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshFiles} />
      }
    >
      {/* Feature Banner Image */}
      <View style={{ alignItems: 'center', marginTop: 12, marginBottom: 8 }}>
        <Image source={HappyStudentBro} style={{ width: 220, height: 140, borderRadius: 18 }} resizeMode="cover" />
      </View>
      {/* Analytics/Stats Section */}
      <View style={[styles.statsContainer, { backgroundColor: theme.card, shadowColor: theme.shadow }]}> 
        <Text style={[styles.statsTitle, { color: theme.text }]}>Your Cloud Analytics</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.secondaryLight }]}> 
            <Feather name="file" size={22} color="#2563eb" />
            <Text style={[styles.statNumber, { color: theme.text }]}>{totalFiles}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Files</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.secondaryLight }]}> 
            <Feather name="archive" size={22} color="#22c55e" />
            <Text style={[styles.statNumber, { color: theme.text }]}>{compressedFilesCount}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Compressed Files</Text>
          </View>
        </View>
        <View style={[styles.statsDivider, { backgroundColor: theme.border }]} />
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.secondaryLight }]}> 
            <Feather name="database" size={22} color="#a21caf" />
            <Text style={[styles.statNumber, { color: theme.text }]}>{formatBytes(totalSize)}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Storage</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.secondaryLight }]}> 
            <Feather name="trending-down" size={22} color="#f59e42" />
            <Text style={[styles.statNumber, { color: theme.text }]}>{formatBytes(spaceSaved)}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Est. Space Saved</Text>
          </View>
        </View>
      </View>
      {/* Section Divider */}
      <View style={{ height: 1, backgroundColor: theme.border, marginHorizontal: 24, marginBottom: 18, opacity: 0.18, borderRadius: 1 }} />
      {/* Compressed Files Section */}
      <View style={[styles.section, { backgroundColor: theme.card, shadowColor: theme.shadow }]}> 
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Compressed Files</Text>
        {compressedFiles.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="archive" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No compressed files available</Text>
          </View>
        ) : (
          compressedFiles.map((file, index) => (
            <View key={file.id || index} style={{ marginBottom: 8 }}>
              <FileItem
                item={file}
                onPress={() => {}}
                onMenuPress={() => handleMenuPress(file)}
                onStarPress={() => handleStarPress(file)}
              />
            </View>
          ))
        )}
      </View>
      {/* All Files Section (non-compressed) */}
      <View style={[styles.section, { backgroundColor: theme.card, shadowColor: theme.shadow }]}> 
        <Text style={[styles.sectionTitle, { color: theme.text }]}>All Files</Text>
        {nonCompressedFiles.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="file" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No files available for compression</Text>
          </View>
        ) : (
          nonCompressedFiles.map((file, index) => (
            <TouchableOpacity
              key={file.id || index}
              style={styles.fileItem}
              onPress={() => toggleFileSelection(file.id)}
              onLongPress={() => { setShowOptionsModal(true); }}
            >
              <View style={styles.fileItemContent}>
                <FileItem
                  item={file}
                  onPress={() => toggleFileSelection(file.id)}
                  onMenuPress={() => handleMenuPress(file)}
                  onStarPress={() => handleStarPress(file)}
                />
                {selectedFiles.includes(file.id) && (
                  <View style={[styles.selectionIndicator, { backgroundColor: theme.card }]}> 
                    <Feather name="check-circle" size={20} color={theme.primary} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
        {/* Compress Button */}
        <TouchableOpacity
          style={[
            styles.batchButton,
            { backgroundColor: theme.primary, marginTop: 16, alignSelf: 'center', borderRadius: 16, shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 }
          ]}
          onPress={() => setShowOptionsModal(true)}
          disabled={compressing}
        >
          <Feather name="archive" size={20} color={theme.textInverse} />
          <Text style={[styles.batchButtonText, { color: theme.textInverse }]}>Compress Selected</Text>
        </TouchableOpacity>
      </View>
      {/* Modals and overlays remain outside the ScrollView */}
      {showSuccessModal && (
        <Modal visible transparent animationType="fade">
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <View style={{ backgroundColor: theme.card, borderRadius: 20, padding: 32, alignItems: 'center' }}>
              <Feather name="check-circle" size={48} color={theme.primary} />
              <Text style={{ color: theme.text, fontSize: 18, fontWeight: 'bold', marginTop: 16 }}>{successMessage}</Text>
            </View>
          </View>
        </Modal>
      )}
      {showErrorModal && (
        <Modal visible transparent animationType="fade">
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <View style={{ backgroundColor: theme.card, borderRadius: 20, padding: 32, alignItems: 'center' }}>
              <Feather name="x-circle" size={48} color="crimson" />
              <Text style={{ color: theme.text, fontSize: 18, fontWeight: 'bold', marginTop: 16 }}>{errorMessage}</Text>
              <TouchableOpacity style={{ marginTop: 20 }} onPress={() => setShowErrorModal(false)}>
                <Text style={{ color: theme.primary, fontWeight: 'bold', fontSize: 16 }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
      {/* Compression Options Modal */}
      {showOptionsModal && (
        <Modal
          visible
          transparent
          animationType="slide"
          onRequestClose={() => setShowOptionsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.card }]}> 
              <View style={styles.modalHeader}>
                <Feather name="settings" size={22} color={theme.primary} />
                <Text style={[styles.modalTitle, { color: theme.text }]}>Compression Options</Text>
              </View>
              <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>Choose compression settings for selected file(s).</Text>
              {renderCompressionOptions()}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel, { backgroundColor: theme.secondary }]}
                  onPress={() => setShowOptionsModal(false)}
                  disabled={compressing}
                >
                  <Text style={[styles.modalButtonCancelText, { color: theme.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: theme.primary }]}
                  onPress={handleCompress}
                  disabled={compressing}
                >
                  {compressing ? (
                    <ActivityIndicator color={theme.textInverse} />
                  ) : (
                    <Text style={[styles.modalButtonConfirmText, { color: theme.textInverse }]}>Compress</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  statsContainer: {
    margin: 12,
    borderRadius: 14,
    padding: 10,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    // backgroundColor: '#fff', // use theme.card in render
  },
  statsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    minWidth: 60,
    alignItems: 'center',
    padding: 8,
    borderRadius: 10,
    // backgroundColor: '#f8fafc', // use theme.secondaryLight in render
    marginHorizontal: 2,
    marginBottom: 6,
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
    // color: '#222', // use theme.text in render
  },
  statLabel: {
    fontSize: 10,
    marginTop: 1,
    // color: '#666', // use theme.textSecondary in render
  },
  statsDivider: {
    height: 1,
    // backgroundColor: '#e5e7eb', // use theme.border in render
    marginVertical: 6,
    borderRadius: 1,
    opacity: 0.5,
  },
  section: {
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  batchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  batchButtonActive: {
    // backgroundColor applied dynamically
  },
  batchButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  fileItem: {
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  fileItemSelected: {
    // borderColor and backgroundColor applied dynamically
  },
  fileItemContent: {
    position: 'relative',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 10,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
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
    marginLeft: 12,
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 22,
  },
  settingGroup: {
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
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
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  settingOptionSelected: {
    // backgroundColor and borderColor applied dynamically
  },
  settingOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  settingOptionTextSelected: {
    // color applied dynamically
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    // backgroundColor applied dynamically
  },
  modalButtonConfirm: {
    // backgroundColor applied dynamically
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonConfirmText: {
    fontSize: 16,
    fontWeight: '600',
  },
  featureBannerDropbox: {
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  featureBannerImageWrapDropbox: {
    width: '100%',
    aspectRatio: 1.7,
    position: 'relative',
    overflow: 'hidden',
  },
  featureBannerImageDropbox: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },
  featureBannerTextOverlayDropbox: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: 'transparent',
    alignItems: 'flex-start',
  },
  featureBannerTitleDropbox: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'left',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
}); 