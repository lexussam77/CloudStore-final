import React, { useContext, useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SectionList, Alert, SafeAreaView, ScrollView, Image, Animated } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Feather from 'react-native-vector-icons/Feather';
import { AuthContext } from './AuthContext';
import LogoutSVG from '../assets/images/undraw_log-out_2vod.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

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
  const [avatarUri, setAvatarUri] = useState('https://randomuser.me/api/portraits/men/32.jpg');
  const [storage, setStorage] = useState('4.0 MB / 2.0 GB');
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

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets[0]?.uri) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Account</Text>
        <TouchableOpacity style={styles.settingsIconWrap} onPress={() => navigation.navigate('Settings')} activeOpacity={0.7}>
          <Feather name="settings" size={26} color="#888" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <Animated.View style={[styles.profileCard, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}> 
              <TouchableOpacity onPress={pickImage} activeOpacity={0.8} style={styles.avatarCircleImgWrap}>
                <Image source={{ uri: avatarUri }} style={styles.avatarCircleImg} />
                <View style={styles.editAvatarOverlay}>
                  <Feather name="edit-3" size={16} color="#fff" />
                </View>
                </TouchableOpacity>
                <Text style={styles.name}>{user.name}</Text>
                <Text style={styles.email}>{user.email}</Text>
        </Animated.View>
        {/* Plan and Storage Card */}
        <Animated.View style={[styles.singleCard, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}> 
          <View style={styles.planRow}>
                  <Feather name="award" size={22} color="#0061FF" style={styles.planIcon} />
            <Text style={styles.planBadge}>{user.plan}</Text>
                </View>
          <View style={styles.storageBarBg}>
            <View style={[styles.storageBarFill, { width: '0.2%' }]} />
                </View>
          <Text style={styles.storageValueText}>{storage}</Text>
          <TouchableOpacity style={styles.upgradeBtnWide} activeOpacity={0.85} onPress={() => navigation.navigate('ManagePlan')}>
                  <Text style={styles.upgradeBtnText}>Upgrade</Text>
                </TouchableOpacity>
        </Animated.View>
        {/* Security Section */}
        <Animated.View style={[styles.sectionCard, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}> 
          <Text style={styles.sectionTitle}>Security</Text>
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
              <Feather name={item.icon} size={20} color="#0061FF" style={styles.sectionIcon} />
              <Text style={styles.sectionLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
        {/* Connected Apps Section */}
        <Animated.View style={[styles.sectionCard, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}> 
          <Text style={styles.sectionTitle}>Connected apps</Text>
          {connectedApps.map((item, idx) => {
            let iconColor = '#888';
            if (item.label.toLowerCase().includes('github')) iconColor = '#181717';
            if (item.label.toLowerCase().includes('slack')) iconColor = '#611f69';
            return (
              <View key={idx} style={styles.sectionRow}>
                <Feather name={item.icon} size={20} color={iconColor} style={styles.sectionIcon} />
                <Text style={styles.sectionLabel}>{item.label}</Text>
              </View>
            );
          })}
        </Animated.View>
        {/* Recent Logins Section */}
        <Animated.View style={[styles.sectionCard, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}> 
          <Text style={styles.sectionTitle}>Recent logins</Text>
          {recentLogins.map((item, idx) => (
            <View key={idx} style={styles.sectionRow}>
              <Feather name={item.icon} size={20} color="#888" style={styles.sectionIcon} />
              <Text style={styles.sectionLabel}>{item.label}</Text>
            </View>
          ))}
        </Animated.View>
        {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={async () => {
          await logout();
            navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
        }}
        activeOpacity={0.85}
      >
          <LogoutSVG width={32} height={32} style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
      </ScrollView>
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
  settingsIconWrap: {
    position: 'absolute',
    right: 16,
    top: 8,
    padding: 4,
    borderRadius: 20,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 18,
    padding: 24,
    shadowColor: '#0061FF',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  avatarCircleImgWrap: {
    position: 'relative',
    marginBottom: 10,
  },
  avatarCircleImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eee',
  },
  editAvatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0061FF',
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
    textAlign: 'center',
  },
  email: {
    fontSize: 15,
    color: '#888',
    marginBottom: 8,
    textAlign: 'center',
  },
  singleCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 18,
    padding: 20,
    shadowColor: '#0061FF',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
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
    color: '#0061FF',
    fontWeight: 'bold',
    backgroundColor: '#e6f0ff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  storageBarBg: {
    width: '100%',
    height: 10,
    backgroundColor: '#e0e7ef',
    borderRadius: 5,
    marginBottom: 6,
    marginTop: 2,
    overflow: 'hidden',
  },
  storageBarFill: {
    height: 10,
    backgroundColor: '#0061FF',
    borderRadius: 5,
  },
  storageValueText: {
    fontSize: 13,
    color: '#888',
    marginBottom: 8,
    textAlign: 'center',
  },
  upgradeBtnWide: {
    backgroundColor: '#0061FF',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 32,
    marginTop: 4,
  },
  upgradeBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
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
    color: '#222',
    fontWeight: '500',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 18,
    paddingVertical: 14,
    shadowColor: '#0061FF',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  logoutText: {
    color: '#0061FF',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
}); 