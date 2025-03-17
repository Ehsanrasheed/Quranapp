import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import QuranList from './index.jsx'; // This imports from your index.jsx file

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <QuranList />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});