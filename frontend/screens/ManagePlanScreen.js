import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Dimensions, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import { usePremium } from './PremiumContext';

const plans = [
  {
    key: 'plus',
    name: 'Plus',
    price: 'GH₵60.00 per month',
    storage: '2TB',
    features: [
      'Use 2,000 GB of encrypted cloud storage',
      'Send big files with Dropbox Transfer',
      'Automatically back up your files',
    ],
  },
  {
    key: 'family',
    name: 'Family',
    price: 'Up to 6 accounts, GH₵120.00 per month',
    storage: '2,000 GB',
    features: [
      '2,000 GB of encrypted cloud storage',
      'Up to 6 individual accounts',
      'No matter whose files, everything is private',
    ],
  },
  {
    key: 'professional',
    name: 'Professional',
    price: '3TB, GH₵130.00 per month',
    storage: '3,000 GB',
    features: [
      'Use 3,000 GB of encrypted cloud storage',
      'Access all Plus plan benefits and features',
      'Send big files with Dropbox Transfer',
    ],
  },
];

const { width } = Dimensions.get('window');

export default function ManagePlanScreen() {
  const { theme } = useTheme();
  const [selectedTab, setSelectedTab] = useState(0);
  const flatListRef = useRef();
  const navigation = useNavigation();
  const { isPremium, premiumPlan, upgradeToPremium } = usePremium();

  // Simulated payment modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [network, setNetwork] = useState('MTN');
  const [phone, setPhone] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleTabPress = (idx) => {
    setSelectedTab(idx);
    flatListRef.current.scrollToIndex({ index: idx });
  };

  const handleScroll = (event) => {
    const idx = Math.round(event.nativeEvent.contentOffset.x / (width * 0.85));
    setSelectedTab(idx);
  };

  const handleTryPlan = (plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
    setNetwork('MTN');
    setPhone('');
  };

  const handleSimulatePayment = async () => {
    if (!phone.match(/^\d{10}$/)) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit phone number.');
      return;
    }
    setProcessing(true);
    setTimeout(async () => {
      await upgradeToPremium(selectedPlan, network, phone);
      setProcessing(false);
      setShowModal(false);
      Alert.alert('Success', 'You are now a premium user!');
    }, 1500);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header removed as requested */}
      <Text style={[styles.pageTitle, { color: theme.primary }]}>Choose Your CloudStore Plan</Text>
      <View style={styles.tabsRow}>
        {plans.map((plan, idx) => (
          <TouchableOpacity
            key={plan.key}
            style={[styles.tab, { borderBottomColor: 'transparent' }, selectedTab === idx && [styles.tabSelected, { borderBottomColor: theme.primary }]]}
            onPress={() => handleTabPress(idx)}
          >
            <Text style={[styles.tabText, { color: theme.textSecondary }, selectedTab === idx && [styles.tabTextSelected, { color: theme.primary }]]}>{plan.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        ref={flatListRef}
        data={plans}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={item => item.key}
        contentContainerStyle={styles.cardsScroll}
        renderItem={({ item }) => (
          <Animated.View entering={FadeIn.duration(400)} style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow, width: width * 0.85 }]}> 
            <Text style={[styles.planName, { color: theme.text }]}>{item.name}</Text>
            <Text style={[styles.planPrice, { color: theme.text }]}>{item.storage}, {item.price}</Text>
            <View style={styles.featuresList}>
              {item.features.map((f, idx) => (
                <View key={idx} style={styles.featureRow}>
                  <Text style={[styles.check, { color: '#009900' }]}>✔</Text>
                  <Text style={[styles.featureText, { color: theme.text }]}>{f}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.reminderRow}>
              <Text style={[styles.bell, { color: theme.primary }]}>🔔</Text>
              <Text style={[styles.reminderText, { color: theme.primary }]}>Get a reminder before your trial ends</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.ctaButton, { backgroundColor: theme.primary, shadowColor: theme.shadow }]} onPress={() => handleTryPlan(item)}>
              <Text style={[styles.ctaButtonText, { color: theme.textInverse }]}>Try free for 30 days</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      />
      {/* Simulated Payment Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={{ flex:1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent:'center', alignItems:'center' }}>
          <View style={{ backgroundColor: theme.card, padding: 28, borderRadius: 22, width: 340, alignItems:'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 16, elevation: 8 }}>
            <View style={{ alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ fontSize: 32, marginBottom: 2 }}>💳</Text>
              <Text style={{ fontSize: 22, fontWeight: 'bold', color: theme.primary, marginBottom: 2 }}>Payment</Text>
            </View>
            <Text style={{ marginBottom: 8, color: theme.text, fontWeight: 'bold', fontSize: 15 }}>Select Mobile Money Network:</Text>
            <View style={{ flexDirection: 'row', marginBottom: 16 }}>
              {['MTN', 'Telecel'].map(nw => (
                <TouchableOpacity key={nw} style={{ marginHorizontal: 10, paddingVertical: 10, paddingHorizontal: 18, borderRadius: 12, backgroundColor: network === nw ? theme.primary : theme.input, flexDirection: 'row', alignItems: 'center', borderWidth: network === nw ? 2 : 1, borderColor: network === nw ? theme.primary : theme.border }} onPress={() => setNetwork(nw)}>
                  <Text style={{ fontSize: 18, marginRight: 6 }}>{nw === 'MTN' ? '📱' : '📶'}</Text>
                  <Text style={{ color: network === nw ? theme.textInverse : theme.text, fontWeight: 'bold' }}>{nw}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={{ width: '100%', borderWidth: 1.5, borderColor: theme.primary, borderRadius: 10, padding: 14, marginBottom: 18, color: theme.text, backgroundColor: theme.input, fontSize: 16, fontWeight: '500', letterSpacing: 1 }}
              placeholder="Phone Number (e.g. 0551234567)"
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={10}
            />
            <TouchableOpacity style={{ backgroundColor: theme.primary, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 40, marginBottom: 10, width: '100%', alignItems:'center', shadowColor: theme.shadow, shadowOpacity: 0.12, shadowRadius: 8, elevation: 2 }} onPress={handleSimulatePayment} disabled={processing}>
              {processing ? <ActivityIndicator color={theme.textInverse} /> : <Text style={{ color: theme.textInverse, fontWeight: 'bold', fontSize: 16, letterSpacing: 0.5 }}>Pay Now</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowModal(false)} disabled={processing}>
              <Text style={{ color: theme.primary, marginTop: 8, fontWeight: 'bold', fontSize: 15 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <TouchableOpacity style={[styles.freePlanButton, { backgroundColor: theme.secondary, borderColor: theme.border }]} onPress={() => navigation.goBack()}>
        <Text style={[styles.freePlanText, { color: theme.primary }]}>Continue with Free Plan</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginTop: 10,
    marginBottom: 16,
    paddingVertical: 8,
  },
  backArrow: {
    fontSize: 28,
    marginRight: 16,
    fontWeight: 'bold',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginRight: 44, // Compensate for back arrow width to center the title
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 32,
    letterSpacing: 0.2,
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderBottomWidth: 2,
    marginHorizontal: 6,
  },
  tabSelected: {
    borderBottomColor: '#0061FF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabTextSelected: {
    color: '#0061FF',
  },
  cardsScroll: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    minHeight: 300,
  },
  card: {
    borderRadius: 22,
    marginHorizontal: 10,
    padding: 22,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 15,
    marginBottom: 14,
  },
  featuresList: {
    marginBottom: 14,
    width: '100%',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  check: {
    fontSize: 16,
    marginRight: 8,
  },
  featureText: {
    fontSize: 15,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bell: {
    fontSize: 18,
    marginRight: 6,
  },
  reminderText: {
    fontSize: 15,
    fontWeight: '500',
  },
  ctaButton: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 10,
    alignItems: 'center',
    width: '100%',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  ctaButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  freePlanButton: {
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 18,
    width: '80%',
    borderWidth: 1,
  },
  freePlanText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 