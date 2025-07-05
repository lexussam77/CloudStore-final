import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, SafeAreaView } from 'react-native';
import MyFilesSVG from '../assets/images/undraw_my-files_1xwx.svg';
import UploadSVG from '../assets/images/undraw_upload_cucu.svg';
import { useTheme } from '../theme/ThemeContext';

const { width } = Dimensions.get('window');

const slides = [
  {
    key: 'slide1',
    title: 'Welcome to CloudStore',
    description: 'Access your files anywhere, anytime. Secure, fast, and easy to use.',
    Illustration: MyFilesSVG,
  },
  {
    key: 'slide2',
    title: 'Upload & Share',
    description: 'Upload files of any type and share them with friends or colleagues instantly.',
    Illustration: UploadSVG,
  },
  {
    key: 'slide3',
    title: 'Stay Organized',
    description: 'Create folders, favorite files, and keep everything organized in the cloud.',
    Illustration: MyFilesSVG,
  },
];

export default function OnboardingScreen({ navigation }) {
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef();

  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.replace('Auth');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={item => item.key}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <item.Illustration width={220} height={180} style={styles.illustration} />
            <Text style={[styles.title, { color: theme.primary }]}>{item.title}</Text>
            <Text style={[styles.description, { color: theme.textSecondary }]}>{item.description}</Text>
          </View>
        )}
      />
      <View style={styles.dotsRow}>
        {slides.map((_, idx) => (
          <View
            key={idx}
            style={[styles.dot, { backgroundColor: theme.border }, currentIndex === idx && { backgroundColor: theme.primary, width: 18 }]}
          />
        ))}
      </View>
      <TouchableOpacity style={[styles.nextBtn, { backgroundColor: theme.primary }]} onPress={handleNext}>
        <Text style={[styles.nextBtnText, { color: theme.textInverse }]}>{currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  illustration: {
    marginBottom: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 32,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 6,
  },
  dotActive: {
    width: 18,
  },
  nextBtn: {
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignSelf: 'center',
    marginBottom: 32,
  },
  nextBtnText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
}); 