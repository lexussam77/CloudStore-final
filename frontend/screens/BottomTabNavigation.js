import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated } from 'react-native';
import HomeScreen from './HomeScreen';
import FilesScreen from './FilesScreen';
import PhotosScreen from './PhotosScreen';
import AccountScreen from './AccountScreen';
import CompressionScreen from './CompressionScreen';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../theme/ThemeContext';

const TABS = [
  { key: 'Home', label: 'Home', icon: 'home' },
  { key: 'Files', label: 'Files', icon: 'file' },
  { key: 'Compression', label: 'Compression', icon: 'package' },
  { key: 'Photos', label: 'Photos', icon: 'image' },
  { key: 'Account', label: 'Account', icon: 'user' },
];

export default function BottomTabNavigation({ navigation }) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('Home');
  const [pressedTab, setPressedTab] = useState(null);

  // Animation values for each tab
  const tabAnim = {};
  TABS.forEach(tab => {
    tabAnim[tab.key] = useRef(new Animated.Value(0)).current;
  });

  const handleTabPressIn = (tab) => {
    setPressedTab(tab.key);
    Animated.spring(tabAnim[tab.key], {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  };
  const handleTabPressOut = (tab) => {
    Animated.spring(tabAnim[tab.key], {
      toValue: 0,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start(() => setPressedTab(null));
  };

  let ScreenComponent;
  switch (activeTab) {
    case 'Files':
      ScreenComponent = FilesScreen;
      break;
    case 'Photos':
      ScreenComponent = PhotosScreen;
      break;
    case 'Account':
      ScreenComponent = (props) => <AccountScreen {...props} navigation={navigation} />;
      break;
    case 'Compression':
      ScreenComponent = CompressionScreen;
      break;
    case 'Home':
    default:
      ScreenComponent = HomeScreen;
  }

  const handleTabPress = (tab) => {
    setActiveTab(tab.key);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Main Screen Content */}
      <View style={styles.content}>
        {/* Top Bar with Title - Hide for Home tab */}
        {activeTab !== 'Home' && (
          <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
            <Text style={[styles.topBarTitle, { color: theme.text }]}>{activeTab}</Text>
          </View>
        )}
        <ScreenComponent />
      </View>
      {/* Bottom Tab Bar */}
      <View style={styles.tabBarWrap}>
        <View style={[styles.tabBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {TABS.map((tab, idx) => {
            const isCompression = tab.key === 'Compression';
            const isActive = activeTab === tab.key;
            const animStyle = {
              transform: [
                { translateY: tabAnim[tab.key].interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) },
                { scale: tabAnim[tab.key].interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) },
              ],
            };
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tabButton}
                onPress={() => handleTabPress(tab)}
                onPressIn={() => handleTabPressIn(tab)}
                onPressOut={() => handleTabPressOut(tab)}
              >
                <Animated.View style={animStyle}>
                  <Feather
                    name={tab.icon}
                    size={24}
                    color={isActive ? theme.primary : (theme.isDark ? '#ffffff' : theme.textSecondary)}
                    style={isActive ? styles.activeTabIcon : styles.tabIcon}
                  />
                </Animated.View>
                <Text style={[
                  styles.tabLabel, 
                  { color: isActive ? theme.primary : (theme.isDark ? '#ffffff' : theme.textSecondary) },
                  tab.key === 'Compression' && styles.compressionTabLabel
                ]}> 
                  {tab.key === 'Compression' ? 'Compress' : tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    top: 15,
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'System',
    flex: 1,
    textAlign: 'center',
  },

  content: {
    flex: 1,
  },
  tabBarWrap: {
    backgroundColor: 'transparent',
    position: 'relative',
    height: 80,
  },
  tabBar: {
    flexDirection: 'row',
    height: 64,
    borderTopWidth: 1,
    paddingBottom: 4,
    paddingTop: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowOpacity: 0.1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: -6 },
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  tabIcon: {
    marginBottom: 2,
  },
  activeTabIcon: {
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'System',
    marginTop: 4,
    textAlign: 'center',
  },
  activeTabLabel: {
    // Color will be applied dynamically
  },
  compressionTabLabel: {
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  compressionTabButton: {
    borderWidth: 2,
    borderRadius: 20,
    padding: 4,
  },
  compressionTabButtonActive: {
    // Background color will be applied dynamically
  },
  compressionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0061FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compressionIconWrapActive: {
    backgroundColor: '#fff',
  },
  compressionIcon: {
    width: 24,
    height: 24,
  },
});