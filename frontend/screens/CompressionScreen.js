import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, ActivityIndicator, RefreshControl } from 'react-native';
import { listFiles, compressFile } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from 'react-native-vector-icons/Feather';
import FileItem from './FileItem';

export default function CompressionScreen() {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [compressing, setCompressing] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchSettings, setBatchSettings] = useState({
    quality: 'medium',
    format: 'zip',
    level: 'balanced'
  });
  const [compressionStats, setCompressionStats] = useState({
    totalFiles: 0,
    compressedFiles: 0,
    totalSpaceSaved: 0,
    averageCompressionRatio: 0
  });
  const [refreshing, setRefreshing] = useState(false);

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
        calculateStats(res.data);
      }
    } catch (err) {
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (fileList) => {
    const compressedFiles = fileList.filter(file => file.name.includes('_compressed'));
    const totalSpaceSaved = compressedFiles.reduce((total, file) => {
      // This would need to be calculated from original vs compressed size
      return total + (file.size || 0);
    }, 0);

    setCompressionStats({
      totalFiles: fileList.length,
      compressedFiles: compressedFiles.length,
      totalSpaceSaved,
      averageCompressionRatio: compressedFiles.length > 0 ? 60 : 0 // Placeholder
    });
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

  const handleBatchCompress = async () => {
    if (selectedFiles.length === 0) {
      Alert.alert('No Files Selected', 'Please select files to compress');
      return;
    }

    setCompressing(true);
    try {
      const token = await AsyncStorage.getItem('jwt');
      if (!token) {
        Alert.alert('Error', 'Authentication required');
        return;
      }

      let successCount = 0;
      let totalCompressionRatio = 0;

      for (const fileId of selectedFiles) {
        try {
          const res = await compressFile(token, fileId, batchSettings);
          if (res.success) {
            successCount++;
            totalCompressionRatio += res.data.compressionRatio || 60;
          }
        } catch (err) {
          console.error(`Error compressing file ${fileId}:`, err);
        }
      }

      setShowBatchModal(false);
      setSelectedFiles([]);
      
      const avgRatio = successCount > 0 ? Math.round(totalCompressionRatio / successCount) : 0;
      Alert.alert(
        'Batch Compression Complete',
        `Successfully compressed ${successCount} out of ${selectedFiles.length} files.\nAverage compression: ${avgRatio}%`
      );
      
      await fetchFiles();
    } catch (err) {
      Alert.alert('Error', 'Failed to compress files');
    } finally {
      setCompressing(false);
    }
  };

  const handleStarPress = async (item) => {
    // This would handle favoriting files
    console.log('Star pressed for:', item.name);
  };

  const handleMenuPress = (item) => {
    // This would show individual file menu
    console.log('Menu pressed for:', item.name);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0061FF" />
        <Text style={styles.loadingText}>Loading files...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshFiles} />
      }
    >
      {/* Compression Statistics */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Compression Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Feather name="file" size={24} color="#0061FF" />
            <Text style={styles.statNumber}>{compressionStats.totalFiles}</Text>
            <Text style={styles.statLabel}>Total Files</Text>
          </View>
          <View style={styles.statCard}>
            <Feather name="package" size={24} color="#10b981" />
            <Text style={styles.statNumber}>{compressionStats.compressedFiles}</Text>
            <Text style={styles.statLabel}>Compressed</Text>
          </View>
          <View style={styles.statCard}>
            <Feather name="hard-drive" size={24} color="#f59e0b" />
            <Text style={styles.statNumber}>{Math.round(compressionStats.totalSpaceSaved / 1024 / 1024)}MB</Text>
            <Text style={styles.statLabel}>Space Saved</Text>
          </View>
          <View style={styles.statCard}>
            <Feather name="trending-down" size={24} color="#ef4444" />
            <Text style={styles.statNumber}>{compressionStats.averageCompressionRatio}%</Text>
            <Text style={styles.statLabel}>Avg. Reduction</Text>
          </View>
        </View>
      </View>

      {/* Batch Compression Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Batch Compression</Text>
          <TouchableOpacity 
            style={[styles.batchButton, selectedFiles.length > 0 && styles.batchButtonActive]}
            onPress={() => setShowBatchModal(true)}
            disabled={selectedFiles.length === 0}
          >
            <Feather name="package" size={20} color="#fff" />
            <Text style={styles.batchButtonText}>
              Compress Selected ({selectedFiles.length})
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionSubtitle}>
          Select multiple files to compress them together with the same settings
        </Text>
      </View>

      {/* Files List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Files</Text>
        {files.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="file" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No files available for compression</Text>
          </View>
        ) : (
          files.map((file, index) => (
            <TouchableOpacity
              key={file.id || index}
              style={[
                styles.fileItem,
                selectedFiles.includes(file.id) && styles.fileItemSelected
              ]}
              onPress={() => toggleFileSelection(file.id)}
            >
              <View style={styles.fileItemContent}>
                <FileItem
                  item={file}
                  onPress={() => toggleFileSelection(file.id)}
                  onMenuPress={() => handleMenuPress(file)}
                  onStarPress={() => handleStarPress(file)}
                />
                {selectedFiles.includes(file.id) && (
                  <View style={styles.selectionIndicator}>
                    <Feather name="check-circle" size={20} color="#0061FF" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Batch Compression Modal */}
      <Modal
        visible={showBatchModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBatchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Feather name="package" size={24} color="#0061FF" />
              <Text style={styles.modalTitle}>Batch Compression</Text>
            </View>
            
            <Text style={styles.modalSubtitle}>
              Compress {selectedFiles.length} files with the same settings
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
                      batchSettings.quality === quality && styles.settingOptionSelected
                    ]}
                    onPress={() => setBatchSettings(prev => ({ ...prev, quality }))}
                  >
                    <Text style={[
                      styles.settingOptionText,
                      batchSettings.quality === quality && styles.settingOptionTextSelected
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
                      batchSettings.format === format && styles.settingOptionSelected
                    ]}
                    onPress={() => setBatchSettings(prev => ({ ...prev, format }))}
                  >
                    <Text style={[
                      styles.settingOptionText,
                      batchSettings.format === format && styles.settingOptionTextSelected
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
                      batchSettings.level === level && styles.settingOptionSelected
                    ]}
                    onPress={() => setBatchSettings(prev => ({ ...prev, level }))}
                  >
                    <Text style={[
                      styles.settingOptionText,
                      batchSettings.level === level && styles.settingOptionTextSelected
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
                onPress={() => setShowBatchModal(false)}
                disabled={compressing}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleBatchCompress}
                disabled={compressing}
              >
                {compressing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalButtonConfirmText}>Compress All</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: 80,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
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
    color: '#222',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  batchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ccc',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  batchButtonActive: {
    backgroundColor: '#0061FF',
  },
  batchButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  fileItem: {
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  fileItemSelected: {
    borderColor: '#0061FF',
    backgroundColor: '#f0f8ff',
  },
  fileItemContent: {
    position: 'relative',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
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
    backgroundColor: '#0061FF',
    borderColor: '#0061FF',
  },
  settingOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  settingOptionTextSelected: {
    color: '#fff',
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