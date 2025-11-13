import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import { TimeGrid } from '@/components/time-collab/time-grid';
import { useDailyGrid } from '@/hooks/useDailyGrid';

export default function TimeCollabScreen() {
  const { snapshot } = useDailyGrid(4_000);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <TimeGrid snapshot={snapshot} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2E9D8',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
});

