import React, { useContext, useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SectionList, Alert, SafeAreaView, ScrollView, Image, Animated, Modal, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Feather from 'react-native-vector-icons/Feather';
import { AuthContext } from './AuthContext';
import LogoutSVG from '../assets/images/undraw_log-out_2vod.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { getCurrentUser } from './api';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { BlurView } from 'expo-blur';
import EyesBro from '../assets/images/pngs/Eyes-bro.png';
import ExpertsBro from '../assets/images/pngs/Experts-bro.png';
import NerdBro from '../assets/images/pngs/Nerd-bro.png';

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

const DEEP_BLUE_GRADIENT = ['#0a0f1c', '#12203a', '#1a2a4f'];
const GLASS_BG_DEEP = 'rgba(20,40,80,0.32)';
const GLASS_BORDER = 'rgba(255,255,255,0.10)';
const WHITE = '#fff';
const LIGHT_TEXT = '#e0e6f0';
const BLUE_ACCENT = '#2979FF';

export default function AccountScreen({ navigation }) {
  const { logout } = useContext(AuthContext);
  const { theme } = useTheme();
  const [avatarUri, setAvatarUri] = useState(null);
  const [storage, setStorage] = useState('4.0 MB / 2.0 GB');
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
      } else {
        setStorage('4.0 MB / 2.0 GB');
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

  const [userProfile, setUserProfile] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await AsyncStorage.getItem('jwt');
        if (!token) {
          setError('No token found.');
          
          setLoading(false);
          return;
        }
        const res = await getCurrentUser(token);
        console.log('User profile response:', res);
        if (res.success && res.data) {
          setUserProfile({ name: res.data.name, email: res.data.email });
        } else {
          setError('Failed to fetch user profile.');
        }
      } catch (err) {
        setError('Failed to fetch user profile.');
      }
      setLoading(false);
    };
    fetchUserProfile();
  }, [isFocused]);

  let [fontsLoaded] = useFonts({ Inter_400Regular, Inter_700Bold });
  if (!fontsLoaded) return null;

  return (
    <LinearGradient colors={DEEP_BLUE_GRADIENT} style={styles.gradientContainer}>
      <SafeAreaView style={styles.container}>
      {/* Top Bar */}
        <View style={styles.topBar}>
        <TouchableOpacity style={styles.settingsIconWrap} onPress={() => navigation.navigate('Settings')} activeOpacity={0.7}>
            <Feather name="settings" size={26} color={WHITE} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <Animated.View style={[styles.glassCard, styles.profileCard, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}> 
            <View style={styles.profileImageWrap}>
              <TouchableOpacity onPress={pickImage} activeOpacity={0.8} style={styles.avatarCircleImgWrap}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarCircleImg} />
                ) : (
                  <View style={[styles.avatarCircleImg, { backgroundColor: '#1a237e', alignItems: 'center', justifyContent: 'center' }]}> 
                    <Feather name="user" size={40} color={BLUE_ACCENT} />
                  </View>
                )}
                <View style={styles.editAvatarOverlay}>
                  <Feather name="edit-3" size={16} color={WHITE} />
                </View>
                </TouchableOpacity>
            </View>
            <View style={styles.profileTextWrap}>
                {loading ? (
                <ActivityIndicator size="small" color={BLUE_ACCENT} />
                ) : error ? (
                <Text style={{ color: 'red', fontFamily: 'Inter_400Regular' }}>{error}</Text>
                ) : (
                  <>
                  <Text style={[styles.name, { fontFamily: 'Inter_700Bold' }]}>{userProfile.name}</Text>
                  <Text style={[styles.email, { fontFamily: 'Inter_400Regular' }]}>{userProfile.email}</Text>
                  </>
                )}
            </View>
        </Animated.View>
        
        {/* Plan and Storage Card */}
        <Animated.View style={[styles.glassCard, styles.planStorageCard, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}> 
          <View style={{ alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 19, color: WHITE, textAlign: 'center' }}>Need more storage?</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 999, backgroundColor: BLUE_ACCENT, paddingVertical: 14, paddingHorizontal: 32, shadowOpacity: 0.10, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }} activeOpacity={0.85} onPress={() => navigation.navigate('ManagePlan')}>
                <Text style={{ color: WHITE, fontFamily: 'Inter_700Bold', fontSize: 16 }}>Upgrade</Text>
                <Feather name="arrow-right" size={16} color={WHITE} style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </View>
        </Animated.View>

        {/* Privacy Protection Image as background between pads */}
        <View style={{ width: '100%', height: 120, marginTop: -36, marginBottom: -36, position: 'relative', zIndex: 1, alignItems: 'center', justifyContent: 'center' }} pointerEvents="none">
          <Image source={EyesBro} style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, opacity: 0.92 }} resizeMode="cover" />
        </View>

        {/* Security Section */}
        <Animated.View style={[styles.glassCard, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}> 
          <Text style={[styles.sectionTitle, { fontFamily: 'Inter_700Bold', fontSize: 22 }]}>Security</Text>
          <View style={styles.specsRow}>
          {securityOptions.map((item, idx) => (
                <BlurView intensity={120} tint="dark" style={styles.specCard} key={idx}>
            <TouchableOpacity
                    style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}
              activeOpacity={0.85}
              onPress={() => {
                if (item.label === 'Change password') navigation.navigate('ChangePassword');
                if (item.label === 'Two-factor authentication') navigation.navigate('TwoFactor');
              }}
            >
                    <Feather name={item.icon} size={28} color={BLUE_ACCENT} style={styles.specIcon} />
                    <Text style={[styles.specLabel, { fontFamily: 'Inter_400Regular', fontSize: 16 }]}>{item.label}</Text>
            </TouchableOpacity>
                </BlurView>
              ))}
            </View>
          </Animated.View>

        {/* 24/7 Support Section (image and main text only) */}
        <View style={{ alignItems: 'center', marginBottom: 32, width: '100%' }}>
          <View style={{ width: '100%', aspectRatio: 1.8, marginBottom: 10 }}>
            <Image source={NerdBro} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          </View>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 22, color: WHITE, textAlign: 'center' }}>24/7 Support</Text>
        </View>

        {/* Connected Apps Section */}
        <Animated.View style={[styles.glassCard, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}> 
          <Text style={[styles.sectionTitle, { fontFamily: 'Inter_700Bold', fontSize: 22 }]}>Connected apps</Text>
          <View style={styles.specsRow}>
              {connectedApps.map((item, idx) => (
                <BlurView intensity={120} tint="dark" style={styles.specCard} key={idx}>
                  <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                    <Feather name={item.icon} size={28} color={BLUE_ACCENT} style={styles.specIcon} />
                    <Text style={[styles.specLabel, { fontFamily: 'Inter_400Regular', fontSize: 16 }]}>{item.label}</Text>
                  </View>
                </BlurView>
              ))}
              </View>
        </Animated.View>

        {/* Recent Logins Section */}
        <Animated.View style={[styles.glassCard, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}> 
          <Text style={[styles.sectionTitle, { fontFamily: 'Inter_700Bold', fontSize: 22 }]}>Recent logins</Text>
          <View style={styles.specsRow}>
          {recentLogins.map((item, idx) => (
                <BlurView intensity={120} tint="dark" style={styles.specCard} key={idx}>
                  <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                    <Feather name={item.icon} size={28} color={BLUE_ACCENT} style={styles.specIcon} />
                    <Text style={[styles.specLabel, { fontFamily: 'Inter_400Regular', fontSize: 16 }]}>{item.label}</Text>
                  </View>
                </BlurView>
              ))}
            </View>
        </Animated.View>

        {/* Logout Button */}
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 28, marginHorizontal: 16, marginTop: 36, paddingVertical: 20, backgroundColor: BLUE_ACCENT, shadowOpacity: 0.18, shadowRadius: 12, elevation: 10 }} onPress={() => setShowLogoutModal(true)} activeOpacity={0.85}>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 19, textAlign: 'center', color: WHITE }}>Log Out</Text>
            <Feather name="log-out" size={20} color={WHITE} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <BlurView intensity={120} tint="dark" style={{ ...StyleSheet.absoluteFillObject, zIndex: 1 }}>
            <View style={{ flex: 1, backgroundColor: 'rgba(10,10,20,0.55)' }} />
          </BlurView>
          <BlurView intensity={90} tint="dark" style={{ backgroundColor: GLASS_BG_DEEP, borderRadius: 24, padding: 32, alignItems: 'center', width: 320, borderWidth: 1.5, borderColor: GLASS_BORDER, zIndex: 2, shadowColor: '#000', shadowOpacity: 0.22, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 16 }}>
            <View style={{ width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 20, backgroundColor: BLUE_ACCENT }}>
                <Feather name="log-out" size={32} color={WHITE} />
            </View>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 23, color: WHITE, marginBottom: 12, textAlign: 'center' }}>Log Out</Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 17, color: LIGHT_TEXT, marginBottom: 28, textAlign: 'center', lineHeight: 24 }}>Are you sure you want to log out of your CloudStore account?</Text>
            <View style={{ flexDirection: 'row', gap: 16, width: '100%' }}>
              <TouchableOpacity
                style={{ flex: 1, borderRadius: 18, paddingVertical: 16, paddingHorizontal: 22, alignItems: 'center', backgroundColor: '#23272f' }}
                onPress={() => setShowLogoutModal(false)}
                activeOpacity={0.85}
              >
                <Text style={{ color: WHITE, fontFamily: 'Inter_700Bold', fontSize: 17, textAlign: 'center' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, borderRadius: 18, paddingVertical: 16, paddingHorizontal: 22, alignItems: 'center', backgroundColor: BLUE_ACCENT }}
                onPress={async () => {
                  setShowLogoutModal(false);
                  await logout();
                  navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
                }}
                activeOpacity={0.85}
              >
                <Text style={{ color: WHITE, fontFamily: 'Inter_700Bold', fontSize: 17, textAlign: 'center' }}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </Modal>
    </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingBottom: 80,
    paddingTop: 8,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 56,
    borderBottomWidth: 0,
    paddingHorizontal: 16,
    marginBottom: 2,
  },
  settingsIconWrap: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(41,121,255,0.12)',
  },
  glassCard: {
    backgroundColor: GLASS_BG_DEEP,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 32,
  },
  profileCard: {
    flexDirection: 'row',
    gap: 18,
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 36,
  },
  profileImageWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircleImgWrap: {
    position: 'relative',
    marginBottom: 0,
  },
  avatarCircleImg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: BLUE_ACCENT,
    backgroundColor: '#1a237e',
  },
  editAvatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 18,
    padding: 8,
    borderWidth: 2,
    backgroundColor: BLUE_ACCENT,
    borderColor: GLASS_BG_DEEP,
  },
  profileTextWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 4,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'left',
    color: WHITE,
  },
  email: {
    fontSize: 17,
    marginBottom: 8,
    textAlign: 'left',
    color: LIGHT_TEXT,
  },
  planStorageCard: {
    marginBottom: 28,
    paddingBottom: 18,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  planLabel: {
    fontSize: 19,
    fontWeight: 'bold',
    color: WHITE,
  },
  upgradeBtn: {
    backgroundColor: WHITE,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: BLUE_ACCENT,
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 6,
  },
  upgradeBtnText: {
    color: BLUE_ACCENT,
    fontWeight: 'bold',
    fontSize: 17,
  },
  storageText: {
    color: LIGHT_TEXT,
    fontSize: 16,
    marginTop: 6,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 18,
    color: WHITE,
  },
  specsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  specCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingVertical: 28,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    overflow: 'hidden', // Ensures blur stays within rounded corners
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  specIcon: {
    marginBottom: 10,
  },
  specLabel: {
    fontSize: 16,
    color: WHITE,
    fontWeight: '500',
    textAlign: 'center',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    marginHorizontal: 16,
    marginTop: 36,
    paddingVertical: 20,
    backgroundColor: WHITE,
    shadowColor: BLUE_ACCENT,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 10,
  },
  logoutText: {
    fontWeight: 'bold',
    fontSize: 19,
    textAlign: 'center',
    color: BLUE_ACCENT,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10,10,20,0.7)',
  },
  modalCard: {
    borderRadius: 28,
    padding: 32,
    width: '85%',
    maxWidth: 360,
    alignItems: 'center',
    backgroundColor: GLASS_BG_DEEP,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  modalIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: BLUE_ACCENT,
  },
  modalTitle: {
    fontSize: 23,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: WHITE,
  },
  modalMessage: {
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 24,
    color: LIGHT_TEXT,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 22,
    alignItems: 'center',
    borderWidth: 0,
  },
  modalButtonCancel: {
    backgroundColor: '#23272f',
  },
  modalButtonConfirm: {
    backgroundColor: BLUE_ACCENT,
  },
  modalButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: WHITE,
  },
  // New styles for outerGlassCard and innerGlassPad
  outerGlassCard: {
    borderRadius: 36,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
    padding: 32,
    marginHorizontal: 16,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
    backgroundColor: 'transparent',
  },
  innerGradientPad: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999, // Perfect pill/oval for the light glow
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingVertical: 28,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
}); 