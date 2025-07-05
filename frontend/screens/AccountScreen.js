import React, { useContext, useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SectionList, Alert, SafeAreaView, ScrollView, Image, Animated, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Feather from 'react-native-vector-icons/Feather';
import { AuthContext } from './AuthContext';
import LogoutSVG from '../assets/images/undraw_log-out_2vod.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';

const user = {
  name: 'lazarus sam',
  email: 'akombea77@gmail.com',
  plan: 'Dropbox Basic',
  storage: '4.0 MB / 2.0 GB',
};
const securityOptions = [
  { icon: 'lock', label: 'Change password' },
  { icon: 'shield', label: 'Two-factor authentication' },
];
const connectedApps = [
  { icon: 'slack', label: 'Slack' },
  { icon: 'github', label: 'GitHub' },
];
const recentLogins = [
  { icon: 'monitor', label: 'Windows 10 · 2 hours ago' },
  { icon: 'smartphone', label: 'iPhone 13 · 1 day ago' },
];

const sections = [
  { title: 'Security', data: securityOptions.length ? securityOptions : [{}], key: 'security' },
  { title: 'Connected apps', data: connectedApps.length ? connectedApps : [{}], key: 'apps' },
  { title: 'Recent logins', data: recentLogins.length ? recentLogins : [{}], key: 'logins' },
  { title: 'Keep work moving', data: [{}], key: 'keepwork' },
];

export default function AccountScreen({ navigation }) {
  const { logout } = useContext(AuthContext);
  const { theme } = useTheme();
  const [avatarUri, setAvatarUri] = useState(null);
  const [storage, setStorage] = useState('4.0 MB / 2.0 GB');
  const [storagePercentage, setStoragePercentage] = useState(0.2);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const isFocused = useIsFocused();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);
  useEffect(() => {
    const fetchStorage = async () => {
      const newStorage = await AsyncStorage.getItem('user_storage');
      if (newStorage) {
        setStorage(`4.0 MB / ${newStorage}`);
        // Calculate percentage (4.0 MB out of 2.0 GB = 0.2%)
        setStoragePercentage(0.002);
      } else {
        setStorage('4.0 MB / 2.0 GB');
        setStoragePercentage(0.002);
      }
    };
    fetchStorage();
  }, [isFocused]);

  useEffect(() => {
    const loadProfilePicture = async () => {
      try {
        const savedAvatarUri = await AsyncStorage.getItem('user_avatar_uri');
        if (savedAvatarUri) {
          setAvatarUri(savedAvatarUri);
        }
      } catch (error) {
        console.log('Error loading profile picture:', error);
      }
    };
    loadProfilePicture();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets[0]?.uri) {
      const newAvatarUri = result.assets[0].uri;
      setAvatarUri(newAvatarUri);
      // Save to AsyncStorage for persistence
      try {
        await AsyncStorage.setItem('user_avatar_uri', newAvatarUri);
      } catch (error) {
        console.log('Error saving profile picture:', error);
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.settingsIconWrap} onPress={() => navigation.navigate('Settings')} activeOpacity={0.7}>
          <Feather name="settings" size={26} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <Animated.View style={[styles.profileCard, { backgroundColor: theme.card, shadowColor: theme.shadow, shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 4 }, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}>
              <TouchableOpacity onPress={pickImage} activeOpacity={0.8} style={styles.avatarCircleImgWrap}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarCircleImg} />
                ) : (
                  <View style={[styles.avatarCircleImg, { backgroundColor: theme.primaryLight, alignItems: 'center', justifyContent: 'center' }]}>
                    <Feather name="user" size={40} color={theme.primary} />
                  </View>
                )}
                <View style={[styles.editAvatarOverlay, { backgroundColor: theme.primary, borderColor: theme.card }]}>
                  <Feather name="edit-3" size={16} color={theme.textInverse} />
                </View>
                </TouchableOpacity>
                <Text style={[styles.name, { color: theme.text }]}>{user.name}</Text>
                <Text style={[styles.email, { color: theme.textSecondary }]}>{user.email}</Text>
        </Animated.View>
        {/* Plan and Storage Card */}
        <Animated.View style={[styles.singleCard, { backgroundColor: theme.card, shadowColor: theme.shadow, shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 4 }, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}>
          <View style={styles.planRow}>
            <Feather name="award" size={22} color={theme.primary} style={styles.planIcon} />
            <Text style={[styles.planBadge, { color: theme.primary, backgroundColor: theme.primaryLight }]}>{user.plan}</Text>
          </View>
          
          {/* Circular Storage Progress */}
          <View style={styles.storageCircleContainer}>
            <View style={[styles.storageCircle, { borderColor: theme.secondaryDark }]}>
              <View style={[styles.storageCircleFill, { 
                borderTopColor: storagePercentage > 0.125 ? theme.primary : 'transparent',
                borderRightColor: storagePercentage > 0.25 ? theme.primary : 'transparent',
                borderBottomColor: storagePercentage > 0.375 ? theme.primary : 'transparent',
                borderLeftColor: storagePercentage > 0.5 ? theme.primary : 'transparent',
                transform: [{ rotate: '-90deg' }],
              }]} />
              <View style={[styles.storageCircleInner, { backgroundColor: theme.card }]}>
                <Text style={[styles.storageUsedText, { color: theme.text }]}>4.0 MB</Text>
                <Text style={[styles.storageTotalText, { color: theme.textSecondary }]}>of 2.0 GB</Text>
                <Text style={[styles.storagePercentageText, { color: theme.primary }]}>
                  {Math.round(storagePercentage * 100)}%
                </Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity style={[styles.upgradeBtnWide, { backgroundColor: theme.primary }]} activeOpacity={0.85} onPress={() => navigation.navigate('ManagePlan')}>
            <Text style={[styles.upgradeBtnText, { color: theme.textInverse }]}>Upgrade</Text>
          </TouchableOpacity>
        </Animated.View>
        {/* Security Section */}
        <Animated.View style={[styles.sectionCard, { backgroundColor: theme.card, shadowColor: theme.shadow }, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}> 
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Security</Text>
          {securityOptions.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.sectionRow}
              activeOpacity={0.85}
              onPress={() => {
                if (item.label === 'Change password') navigation.navigate('ChangePassword');
                if (item.label === 'Two-factor authentication') navigation.navigate('TwoFactor');
              }}
            >
              <Feather name={item.icon} size={20} color={theme.primary} style={styles.sectionIcon} />
              <Text style={[styles.sectionLabel, { color: theme.text }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
        {/* Connected Apps Section */}
        <Animated.View style={[styles.sectionCard, { backgroundColor: theme.card, shadowColor: theme.shadow }, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}> 
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Connected apps</Text>
          {connectedApps.map((item, idx) => {
            let iconColor = theme.textSecondary;
            if (item.label.toLowerCase().includes('github')) iconColor = '#181717';
            if (item.label.toLowerCase().includes('slack')) iconColor = '#611f69';
            return (
              <View key={idx} style={styles.sectionRow}>
                <Feather name={item.icon} size={20} color={iconColor} style={styles.sectionIcon} />
                <Text style={[styles.sectionLabel, { color: theme.text }]}>{item.label}</Text>
              </View>
            );
          })}
        </Animated.View>
        {/* Recent Logins Section */}
        <Animated.View style={[styles.sectionCard, { backgroundColor: theme.card, shadowColor: theme.shadow }, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}> 
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent logins</Text>
          {recentLogins.map((item, idx) => (
            <View key={idx} style={styles.sectionRow}>
              <Feather name={item.icon} size={20} color={theme.textSecondary} style={styles.sectionIcon} />
              <Text style={[styles.sectionLabel, { color: theme.text }]}>{item.label}</Text>
            </View>
          ))}
        </Animated.View>
        {/* Logout Button */}
      <TouchableOpacity
        style={[styles.logoutBtn, { backgroundColor: theme.card, shadowColor: theme.shadow }]}
        onPress={() => setShowLogoutModal(true)}
        activeOpacity={0.85}
      >
          <LogoutSVG width={32} height={32} style={{ marginRight: 8 }} />
        <Text style={[styles.logoutText, { color: theme.primary }]}>Log Out</Text>
      </TouchableOpacity>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
            <View style={[styles.modalIconContainer, { backgroundColor: theme.primaryLight }]}>
              <Feather name="log-out" size={32} color={theme.primary} />
            </View>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Log Out</Text>
            <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>
              Are you sure you want to log out of your CloudStore account?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel, { backgroundColor: theme.secondary, borderColor: theme.border }]}
                onPress={() => setShowLogoutModal(false)}
                activeOpacity={0.85}
              >
                <Text style={[styles.modalButtonText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: theme.primary }]}
                onPress={async () => {
                  setShowLogoutModal(false);
                  await logout();
                  navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
                }}
                activeOpacity={0.85}
              >
                <Text style={[styles.modalButtonText, { color: theme.textInverse }]}>Log Out</Text>
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
  },
  scrollContent: {
    paddingBottom: 80,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 56,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 2,
  },
  settingsIconWrap: {
    padding: 4,
    borderRadius: 20,
  },
  profileCard: {
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 20,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  avatarCircleImgWrap: {
    position: 'relative',
    marginBottom: 8,
  },
  avatarCircleImg: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  editAvatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'center',
  },
  email: {
    fontSize: 14,
    marginBottom: 6,
    textAlign: 'center',
  },
  singleCard: {
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 24,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    alignItems: 'center',
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  planIcon: {
    marginRight: 8,
  },
  planBadge: {
    fontSize: 15,
    fontWeight: 'bold',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  storageCircleContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  storageCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  storageCircleFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: 60,
    borderWidth: 8,
    borderColor: 'transparent',
    borderTopColor: 'currentColor',
    borderRightColor: 'currentColor',
    transform: [{ rotate: '-90deg' }],
  },
  storageCircleInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storageUsedText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  storageTotalText: {
    fontSize: 12,
    opacity: 0.8,
  },
  storagePercentageText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  upgradeBtnWide: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 32,
    marginTop: 4,
  },
  upgradeBtnText: {
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
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
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  sectionIcon: {
    marginRight: 12,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 16,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  logoutText: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 320,
    alignItems: 'center',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalButtonCancel: {
    borderWidth: 1,
  },
  modalButtonConfirm: {
    borderWidth: 0,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 