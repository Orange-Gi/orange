import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { AssistantPanel } from '@/components/time-collab/assistant-panel';
import { IntentionPrompt } from '@/components/time-collab/intention-prompt';
import { ModeSelector } from '@/components/time-collab/mode-selector';
import { TimeGrid } from '@/components/time-collab/time-grid';
import { useUserCollabContext } from '@/contexts/user-collab-context';
import { useDailyGrid } from '@/hooks/useDailyGrid';

export default function TimeCollabScreen() {
  const { width } = useWindowDimensions();
  const GRID_MIN_WIDTH = 12 * 12 + 6 * 11 + 20 * 2;
  const MAX_CONTENT_WIDTH = 720;
  const HORIZONTAL_GUTTER = 40;
  const estimatedWidth = Math.max(width - HORIZONTAL_GUTTER, GRID_MIN_WIDTH);
  const contentWidth = Math.min(estimatedWidth, MAX_CONTENT_WIDTH, width);

  const { snapshot } = useDailyGrid(4_000);
  const { entries, state } = useUserCollabContext();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>144 个方块，与你协同</Text>
          <Text style={styles.heroSubtitle}>
            感知剩余时间，选择当前节奏，让 AI 以你的语言辅助下一步
          </Text>
        </View>

        <TimeGrid snapshot={snapshot} contentWidth={contentWidth} />
        <IntentionPrompt contentWidth={contentWidth} />
        <ModeSelector contentWidth={contentWidth} />
        <AssistantPanel contentWidth={contentWidth} />

        <View style={styles.archive}>
          <View style={styles.archiveHeader}>
            <Text style={styles.archiveTitle}>今日成长档案</Text>
            <Text style={styles.archiveSubtitle}>记录与助手的共创片段 · 自动沉淀</Text>
          </View>
          {entries.length === 0 ? (
            <Text style={styles.archivePlaceholder}>等待第一条互动写入...</Text>
          ) : (
            entries.map((entry, index) => (
              <View key={`${entry.date}-${index}`} style={styles.archiveCard}>
                <Text style={styles.archiveMode}>{entry.mode.toUpperCase()}</Text>
                <Text style={styles.archiveIntention}>{entry.intention || state.intention}</Text>
                <Text numberOfLines={3} style={styles.archiveContent}>
                  {entry.aiResponse}
                </Text>
                {entry.feedback && (
                  <Text style={styles.archiveFeedback}>
                    反馈 · {entry.feedback.rating} 分 {entry.feedback.note ?? ''}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2E9D8',
  },
  container: {
    paddingBottom: 48,
  },
  hero: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#3F3D56',
  },
  heroSubtitle: {
    marginTop: 10,
    fontSize: 14,
    color: '#6C6A7C',
    lineHeight: 20,
  },
  archive: {
    marginHorizontal: 20,
    marginBottom: 32,
    padding: 20,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  archiveHeader: {
    marginBottom: 14,
  },
  archiveTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3F3D56',
  },
  archiveSubtitle: {
    fontSize: 13,
    color: '#72738A',
    marginTop: 4,
  },
  archivePlaceholder: {
    fontSize: 14,
    color: '#8F8C9F',
  },
  archiveCard: {
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#1E1E2F',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  archiveMode: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3F3D56',
  },
  archiveIntention: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3F3D56',
    marginTop: 4,
  },
  archiveContent: {
    fontSize: 13,
    color: '#6C6A7C',
    marginTop: 8,
    lineHeight: 18,
  },
  archiveFeedback: {
    marginTop: 10,
    fontSize: 12,
    color: '#2563EB',
  },
});

