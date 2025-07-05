import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import NotificationsSVG from '../assets/images/undraw_my-notifications_fy5v.svg';

const notifications = [
  { id: '1', text: 'Fill out forms, sign docs, adjust pages, and more.', action: 'Edit your PDFs' },
  { id: '2', text: 'Save, organize, edit and rename your images without leaving Dropbox.', action: 'Edit an image' },
  { id: '3', text: 'Use your phone to scan and save any document, receipt, or note to Dropbox.', action: 'Start scanning' },
  { id: '4', text: "You haven't added anything to your Dropbox yet.", action: 'Tap to get started' },
  { id: '5', text: 'Get ready to do more with Dropbox.', action: null },
];

export default function NotificationsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80' }} style={styles.headerImage} resizeMode="cover" />
        <View style={styles.notificationsInfoSection}>
          <Text style={styles.notificationsCaption}>Stay Informed</Text>
          <Text style={styles.notificationsDescription}>Get the latest updates, tips, and important alerts about your CloudStore account—all in one place.</Text>
        </View>
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>Notifications</Text>
        </View>
        <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: 32 }}>
          <Text style={styles.subHeader}>CloudStore Notifications</Text>
          <Text style={styles.unreadLabel}>Unread</Text>
          {notifications.map(n => (
            <View key={n.id} style={styles.notificationCard}>
              <View style={styles.row}>
                <Image source={require('../assets/images/CloudStore.png')} style={styles.icon} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.notificationText}>{n.text}</Text>
                  {n.action && (
                    <TouchableOpacity style={styles.actionButton} activeOpacity={0.85}>
                      <Text style={styles.actionButtonText}>{n.action}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))}
          {notifications.length === 0 && (
            <View style={styles.emptyState}>
              <NotificationsSVG width={120} height={90} style={{ marginBottom: 12 }} />
              <Text style={styles.emptyText}>No notifications yet.</Text>
            </View>
          )}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    marginTop: 10,
    marginBottom: 8,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  subHeader: {
    fontSize: 18,
    color: '#2563eb',
    marginBottom: 8,
    letterSpacing: 0.5,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  unreadLabel: {
    fontSize: 15,
    color: '#888',
    marginBottom: 12,
    textAlign: 'left',
    fontWeight: '600',
  },
  notificationCard: {
    backgroundColor: '#faf9f7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#003366',
    shadowOpacity: 0.22,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  icon: {
    width: 36,
    height: 36,
    marginRight: 14,
    borderRadius: 8,
    backgroundColor: '#fff',
    resizeMode: 'contain',
    borderWidth: 1,
    borderColor: '#e0e7ef',
  },
  notificationText: {
    fontSize: 15,
    color: '#222',
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
    marginTop: 2,
    shadowColor: '#2563eb',
    shadowOpacity: 0.10,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  illustrationWrap: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
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
  notificationsInfoSection: {
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 2,
    paddingHorizontal: 18,
  },
  notificationsCaption: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0061FF',
    marginBottom: 6,
    textAlign: 'center',
  },
  notificationsDescription: {
    fontSize: 15,
    color: '#444',
    textAlign: 'center',
    marginBottom: 2,
  },
}); 