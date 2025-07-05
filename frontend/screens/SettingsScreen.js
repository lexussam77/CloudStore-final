import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SectionList, Alert, ScrollView, Image, Modal, Switch } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import TermsSVG from '../assets/images/undraw_terms_sx63.svg';
import FeedbackSVG from '../assets/images/undraw_feedback_ebmx.svg';
import CustomPrompt from './CustomPrompt';
import { useTheme } from '../theme/ThemeContext';

const accountSettings = [
  { icon: 'file-text', label: 'Terms of service', nav: 'TermsOfService' },
  { icon: 'shield', label: 'Privacy policy', nav: 'PrivacyPolicy' },
  { icon: 'code', label: 'Open source & third party soft..', nav: 'OpenSource' },
  { icon: 'settings', label: 'CCPA preferences', nav: 'CCPAPreferences' },
];
const appSettings = [
  { icon: 'info', label: 'App version 428.2.2', nav: null },
  { icon: 'refresh-cw', label: 'Reset photos tab', nav: null },
  { icon: 'search', label: 'Clear search history', nav: null },
  { icon: 'trash', label: 'Clear cache', nav: null },
  { icon: 'alert-circle', label: 'Report bug or complaint', nav: 'ReportBug' },
];
const dangerZone = [
  { icon: 'log-out', label: 'Sign out of this Dropbox', nav: 'SignOut', color: 'crimson' },
  { icon: 'x-circle', label: 'Delete account', nav: 'DeleteAccount', color: 'crimson' },
];

const sections = [
  { title: 'Your account', data: accountSettings, key: 'account' },
  { title: 'App', data: appSettings, key: 'app' },
  { title: 'Danger Zone', data: dangerZone, key: 'danger' },
];

export default function SettingsScreen({ navigation }) {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [promptVisible, setPromptVisible] = useState(false);
  const [promptMessage, setPromptMessage] = useState('');
  const [promptSuccess, setPromptSuccess] = useState(true);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState('');

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=800&q=80' }} style={styles.headerImage} resizeMode="cover" />
        <View style={styles.settingsInfoSection}>
          <Text style={[styles.settingsCaption, { color: theme.primary }]}>Settings & Preferences</Text>
          <Text style={[styles.settingsDescription, { color: theme.textSecondary }]}>Customize your CloudStore experience with dark mode by default, manage your privacy, and keep your app running smoothly.</Text>
        </View>
        <View style={styles.illustrationWrap}>
          <TermsSVG width={120} height={90} />
        </View>
        <View style={[styles.sectionCard, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
          <Text style={[styles.sectionHeaderText, { color: theme.textSecondary }]}>Your account</Text>
          {accountSettings.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}
              activeOpacity={0.85}
              onPress={() => {
                if (item.nav) navigation.navigate(item.nav);
                else if (item.label.includes('App version')) Alert.alert('CloudStore App Version', '428.2.2');
              }}
            >
              <Feather name={item.icon} size={22} color={theme.primary} style={styles.icon} />
              <Text style={[styles.text, { color: theme.text }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={[styles.sectionCard, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
          <Text style={[styles.sectionHeaderText, { color: theme.textSecondary }]}>App</Text>
          {appSettings.map((item, idx) => (
        <TouchableOpacity
              key={idx}
          style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}
          activeOpacity={0.85}
          onPress={() => {
            if (item.nav) navigation.navigate(item.nav);
            else if (item.label.includes('App version')) {
              setPromptMessage('CloudStore App Version\n428.2.2');
              setPromptSuccess(true);
              setPromptVisible(true);
            } else if (item.label.toLowerCase().includes('reset photos tab')) {
              setPromptMessage('Photos tab reset successfully!');
              setPromptSuccess(true);
              setPromptVisible(true);
            } else if (item.label.toLowerCase().includes('clear cache')) {
              setConfirmAction('cache');
              setConfirmVisible(true);
            } else if (item.label.toLowerCase().includes('search history')) {
              setConfirmAction('search');
              setConfirmVisible(true);
            }
          }}
        >
              <Feather name={item.icon} size={22} color={theme.textSecondary} style={styles.icon} />
              <Text style={[styles.text, { color: theme.text }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Theme Toggle */}
        <View style={[styles.sectionCard, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
          <Text style={[styles.sectionHeaderText, { color: theme.textSecondary }]}>Appearance</Text>
          <View style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Feather name="moon" size={22} color={theme.primary} style={styles.icon} />
            <Text style={[styles.text, { color: theme.text }]}>Dark Mode (Recommended)</Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.border, true: theme.primaryLight }}
              thumbColor={isDarkMode ? theme.primary : theme.textTertiary}
              style={{ marginLeft: 'auto' }}
            />
          </View>
          <Text style={[styles.themeDescription, { color: theme.textSecondary }]}>
            Dark mode is the default theme for better eye comfort and modern aesthetics
          </Text>
        </View>
        <View style={[styles.sectionCard, { backgroundColor: theme.card, shadowColor: theme.shadow, borderColor: theme.error, borderWidth: 1 }] }>
          <Text style={[styles.sectionHeaderText, { color: theme.error }]}>Danger Zone</Text>
          {dangerZone.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}
              activeOpacity={0.85}
              onPress={() => {
                if (item.nav) navigation.navigate(item.nav);
              }}
            >
              <Feather name={item.icon} size={22} color={theme.error} style={styles.icon} />
              <Text style={[styles.text, { color: theme.error }]}>{item.label}</Text>
        </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <CustomPrompt
        visible={promptVisible}
        message={promptMessage}
        onClose={() => setPromptVisible(false)}
        success={promptSuccess}
      />
      {/* Confirmation Modal */}
      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: theme.overlay, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: theme.card, borderRadius: 18, padding: 28, alignItems: 'center', width: 300 }}>
            <Text style={{ fontSize: 17, fontWeight: 'bold', color: theme.primary, marginBottom: 18, textAlign: 'center' }}>
              {confirmAction === 'cache' ? 'Are you sure you want to clear cache?' : 'Are you sure you want to clear search history?'}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8 }}>
              <TouchableOpacity
                style={{ backgroundColor: theme.primary, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 28, marginRight: 12 }}
                onPress={() => {
                  setConfirmVisible(false);
                  setTimeout(() => {
                    setPromptMessage(confirmAction === 'cache' ? 'Cache cleared successfully!' : 'Search history cleared!');
                    setPromptSuccess(true);
                    setPromptVisible(true);
                  }, 200);
                }}
                activeOpacity={0.85}
              >
                <Text style={{ color: theme.textInverse, fontWeight: 'bold', fontSize: 16 }}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ backgroundColor: theme.secondary, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 28 }}
                onPress={() => setConfirmVisible(false)}
                activeOpacity={0.85}
              >
                <Text style={{ color: theme.primary, fontWeight: 'bold', fontSize: 16 }}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 0,
  },
  sectionCard: {
    borderRadius: 24,
    marginHorizontal: 16,
    marginBottom: 18,
    padding: 20,
    shadowOpacity: 0.22,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'System',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderRadius: 18,
    marginBottom: 10,
    paddingHorizontal: 10,
    shadowColor: '#003366',
    shadowOpacity: 0.22,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  icon: {
    marginRight: 14,
  },
  illustrationWrap: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  dangerIllustrationWrap: {
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 6,
  },
  scrollContent: {
    paddingBottom: 60,
    paddingTop: 10,
  },
  headerImage: {
    width: '100%',
    height: 110,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    marginBottom: 0,
  },
  settingsInfoSection: {
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 2,
    paddingHorizontal: 18,
  },
  settingsCaption: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  settingsDescription: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 2,
  },
  themeDescription: {
    fontSize: 13,
    marginTop: 8,
    marginLeft: 36,
    fontStyle: 'italic',
  },
}); 