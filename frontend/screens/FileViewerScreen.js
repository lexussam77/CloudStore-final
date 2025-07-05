import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Audio } from 'expo-av';
import Feather from 'react-native-vector-icons/Feather';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { WebView } from 'react-native-webview';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function FileViewerScreen({ route, navigation }) {
  const { file } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [videoRef, setVideoRef] = useState(null);
  const [audioRef, setAudioRef] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    determineFileType();
    navigation.setOptions({
      title: file.name,
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            style={{ marginRight: 15 }}
            onPress={handleShare}
          >
            <Feather name="share-2" size={24} color="#0061FF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginRight: 15 }}
            onPress={handleDownload}
          >
            <Feather name="download" size={24} color="#0061FF" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [file]);

  const determineFileType = () => {
    if (!file.name) {
      setError('Invalid file');
      setLoading(false);
      return;
    }

    const extension = file.name.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      setFileType('image');
    } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(extension)) {
      setFileType('video');
    } else if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'].includes(extension)) {
      setFileType('audio');
    } else if (extension === 'pdf') {
      setFileType('pdf');
    } else if (['txt', 'md', 'json', 'xml', 'html', 'css', 'js', 'py', 'java', 'cpp', 'c', 'php'].includes(extension)) {
      setFileType('text');
    } else {
      setFileType('unsupported');
    }
    
    setLoading(false);
  };

  useEffect(() => {
    if (fileType === 'text') {
      loadTextContent();
    }
  }, [fileType]);

  const handleShare = async () => {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.url, {
          mimeType: file.type || 'application/octet-stream',
          dialogTitle: `Share ${file.name}`,
        });
      } else {
        Alert.alert('Sharing not available', 'Sharing is not available on this device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share file');
    }
  };

  const handleDownload = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to save files to your device.');
        return;
      }

      const fileName = file.name;
      const fileExtension = fileName.includes('.') ? fileName.split('.').pop() : '';
      const baseName = fileName.includes('.') ? fileName.substring(0, fileName.lastIndexOf('.')) : fileName;
      const uniqueFileName = `${baseName}_${Date.now()}${fileExtension ? '.' + fileExtension : ''}`;
      
      const cacheDir = FileSystem.cacheDirectory + 'Downloads/';
      const cacheFileUri = cacheDir + uniqueFileName;
      
      const dirInfo = await FileSystem.getInfoAsync(cacheDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
      }
      
      const downloadResult = await FileSystem.downloadAsync(file.url, cacheFileUri);
      
      if (downloadResult.statusCode === 200) {
        const asset = await MediaLibrary.createAssetAsync(cacheFileUri);
        await MediaLibrary.createAlbumAsync('Downloads', asset, false);
        Alert.alert('Success', 'File downloaded successfully!');
      } else {
        Alert.alert('Error', 'Failed to download file');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to download file: ' + error.message);
    }
  };

  const handleVideoLoad = (data) => {
    setDuration(data.durationMillis);
    setLoading(false);
  };

  const handleAudioLoad = (data) => {
    setDuration(data.durationMillis);
    setLoading(false);
  };

  const togglePlayPause = async () => {
    if (fileType === 'video' && videoRef) {
      if (isPlaying) {
        await videoRef.pauseAsync();
      } else {
        await videoRef.playAsync();
      }
      setIsPlaying(!isPlaying);
    } else if (fileType === 'audio' && audioRef) {
      if (isPlaying) {
        await audioRef.pauseAsync();
      } else {
        await audioRef.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      setPosition(status.positionMillis);
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
      }
    }
  };

  const seekTo = (time) => {
    if (fileType === 'video' && videoRef) {
      videoRef.setPositionAsync(time);
    } else if (fileType === 'audio' && audioRef) {
      audioRef.setPositionAsync(time);
    }
  };

  const formatTime = (millis) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const renderImage = () => (
    <ScrollView 
      style={styles.imageContainer}
      contentContainerStyle={styles.imageContentContainer}
      maximumZoomScale={3}
      minimumZoomScale={1}
    >
      <Image
        source={{ uri: file.url }}
        style={styles.image}
        resizeMode="contain"
        onLoad={() => setLoading(false)}
        onError={() => {
          setError('Failed to load image');
          setLoading(false);
        }}
      />
    </ScrollView>
  );

  const renderVideo = () => (
    <View style={styles.videoContainer}>
      <Video
        ref={setVideoRef}
        source={{ uri: file.url }}
        style={styles.video}
        useNativeControls={false}
        resizeMode={ResizeMode.CONTAIN}
        isLooping={false}
        onLoad={handleVideoLoad}
        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        onError={() => {
          setError('Failed to load video');
          setLoading(false);
        }}
      />
      {showControls && (
        <View style={styles.videoControls}>
          <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
            <Feather name={isPlaying ? 'pause' : 'play'} size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(position / duration) * 100}%` }]} />
            </View>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderAudio = () => (
    <View style={styles.audioContainer}>
      <View style={styles.audioVisualizer}>
        <Feather name="music" size={80} color="#0061FF" />
      </View>
      <Text style={styles.audioTitle}>{file.name}</Text>
      <View style={styles.audioControls}>
        <TouchableOpacity onPress={togglePlayPause} style={styles.audioPlayButton}>
          <Feather name={isPlaying ? 'pause' : 'play'} size={32} color="#fff" />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(position / duration) * 100}%` }]} />
          </View>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>
    </View>
  );

  const renderPDF = () => (
    <View style={styles.pdfContainer}>
      <WebView
        source={{ uri: file.url }}
        style={styles.pdfViewer}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError('Failed to load PDF');
          setLoading(false);
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0061FF" />
            <Text style={styles.loadingText}>Loading PDF...</Text>
          </View>
        )}
      />
    </View>
  );

  const [textContent, setTextContent] = useState('');
  const [textLoading, setTextLoading] = useState(false);

  const loadTextContent = async () => {
    setTextLoading(true);
    try {
      const response = await fetch(file.url);
      const text = await response.text();
      setTextContent(text);
      setTextLoading(false);
    } catch (error) {
      setError('Failed to load text file');
      setTextLoading(false);
    }
  };

  const renderText = () => {
    if (textLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0061FF" />
          <Text style={styles.loadingText}>Loading text file...</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.textContainer}>
        <Text style={styles.textContent}>{textContent}</Text>
      </ScrollView>
    );
  };

  const renderUnsupported = () => (
    <View style={styles.unsupportedContainer}>
      <Feather name="file" size={80} color="#ccc" />
      <Text style={styles.unsupportedTitle}>File Type Not Supported</Text>
      <Text style={styles.unsupportedText}>
        This file type cannot be previewed. You can download it to view on your device.
      </Text>
      <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
        <Feather name="download" size={20} color="#fff" />
        <Text style={styles.downloadButtonText}>Download File</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    switch (fileType) {
      case 'image':
        return renderImage();
      case 'video':
        return renderVideo();
      case 'audio':
        return renderAudio();
      case 'pdf':
        return renderPDF();
      case 'text':
        return renderText();
      case 'unsupported':
        return renderUnsupported();
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0061FF" />
        <Text style={styles.loadingText}>Loading file...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={80} color="#ef4444" />
        <Text style={styles.errorTitle}>Error Loading File</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#0061FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: screenWidth,
    height: screenHeight,
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  video: {
    flex: 1,
  },
  videoControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: '#fff',
    fontSize: 14,
    marginHorizontal: 10,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginHorizontal: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0061FF',
    borderRadius: 2,
  },
  audioContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  audioVisualizer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#f0f4fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  audioTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  audioControls: {
    width: '100%',
    alignItems: 'center',
  },
  audioPlayButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0061FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  pdfViewer: {
    flex: 1,
  },
  textContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  textContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  unsupportedContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  unsupportedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  unsupportedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  downloadButton: {
    backgroundColor: '#0061FF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 