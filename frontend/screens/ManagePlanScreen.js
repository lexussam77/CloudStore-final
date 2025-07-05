import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';

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

  const handleTabPress = (idx) => {
    setSelectedTab(idx);
    flatListRef.current.scrollToIndex({ index: idx });
  };

  const handleScroll = (event) => {
    const idx = Math.round(event.nativeEvent.contentOffset.x / (width * 0.85));
    setSelectedTab(idx);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backArrow, { color: theme.text }]}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={[styles.header, { color: theme.text }]}>Upgrade Plan</Text>
      </View>
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
            <TouchableOpacity style={[styles.ctaButton, { backgroundColor: theme.primary, shadowColor: theme.shadow }]} onPress={() => navigation.navigate('CreditCard', { plan: item })}>
              <Text style={[styles.ctaButtonText, { color: theme.textInverse }]}>Try free for 30 days</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      />
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