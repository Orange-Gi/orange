import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useUserCollabContext } from '@/contexts/user-collab-context';
import { useAssistant } from '@/hooks/useAssistant';
import { MODE_METADATA } from '@/types/time-collab';

const FEEDBACK_OPTIONS = [
  { rating: 5, label: '很受用' },
  { rating: 3, label: '一般' },
  { rating: 1, label: '需改进' },
];

export const AssistantPanel: React.FC = () => {
  const {
    state,
    assistant,
    setAssistantSnapshot,
    markActionComplete,
    clearCompletedActions,
    entries,
    recordFeedback,
    userId,
  } = useUserCollabContext();

  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const hasIntention = state.intention.trim().length > 0;

  const { response, rag, loading, error, lastUpdated, run } = useAssistant({
    userId,
    dateISO: state.dateISO,
    mode: state.mode,
    intention: state.intention,
    energyLevel: state.energyLevel,
    growthEntries: entries,
    auto: hasIntention,
  });

  useEffect(() => {
    if (response) {
      setAssistantSnapshot({
        response,
        rag,
        lastUpdated,
      });
      setFeedbackSubmitted(false);
    }
  }, [lastUpdated, rag, response, setAssistantSnapshot]);

  const snapshot = useMemo(() => assistant, [assistant]);

  const modeMetadata = MODE_METADATA[state.mode];

  const handleFeedback = (rating: number, label: string) => {
    recordFeedback(rating, label);
    setFeedbackSubmitted(true);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderColor: modeMetadata.color }]}>
        <Text style={[styles.title, { color: modeMetadata.color }]}>
          {modeMetadata.title}助手
        </Text>
        <TouchableOpacity onPress={() => run(true)}>
          <Text style={styles.refresh}>重新生成</Text>
        </TouchableOpacity>
      </View>

      {!hasIntention && (
        <Text style={styles.placeholder}>先写下今日意图，助手就能给出定制建议</Text>
      )}

      {hasIntention && loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color={modeMetadata.color} />
          <Text style={styles.loadingText}>助手思考中...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>助手暂时离线：{error}</Text>
          <TouchableOpacity onPress={() => run(true)}>
            <Text style={styles.retry}>点此重试</Text>
          </TouchableOpacity>
        </View>
      )}

      {snapshot.response && !loading && (
        <>
          <Text style={styles.summary}>{snapshot.response.summary}</Text>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>建议清单</Text>
            {snapshot.response.suggestions.map((item, index) => (
              <View key={item.title} style={styles.suggestionCard}>
                <View style={styles.suggestionBadge}>
                  <Text style={styles.suggestionIndex}>{index + 1}</Text>
                </View>
                <View style={styles.suggestionContent}>
                  <Text style={styles.suggestionTitle}>{item.title}</Text>
                  <Text style={styles.suggestionDetail}>{item.detail}</Text>
                </View>
              </View>
            ))}
          </View>

          {snapshot.response.actions.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>行动步骤</Text>
                {state.completedActions.length > 0 && (
                  <TouchableOpacity onPress={clearCompletedActions}>
                    <Text style={styles.resetActions}>重置</Text>
                  </TouchableOpacity>
                )}
              </View>
              {snapshot.response.actions.map((action) => {
                const completed = state.completedActions.includes(action.id);
                return (
                  <TouchableOpacity
                    key={action.id}
                    style={[
                      styles.actionItem,
                      completed && { backgroundColor: 'rgba(63, 61, 86, 0.12)' },
                    ]}
                    onPress={() => markActionComplete(action.id)}>
                    <View
                      style={[
                        styles.actionMarker,
                        completed && { backgroundColor: modeMetadata.color },
                      ]}
                    />
                    <View style={styles.actionTextContainer}>
                      <Text style={styles.actionLabel}>{action.label}</Text>
                      {action.durationMinutes && (
                        <Text style={styles.actionDuration}>
                          预计 {action.durationMinutes} 分
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>反馈给助手</Text>
            <View style={styles.feedbackRow}>
              {FEEDBACK_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.rating}
                  style={[
                    styles.feedbackChip,
                    feedbackSubmitted && { opacity: 0.4 },
                  ]}
                  disabled={feedbackSubmitted}
                  onPress={() => handleFeedback(option.rating, option.label)}>
                  <Text style={styles.feedbackText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {snapshot.response.rawText && (
              <TouchableOpacity
                onPress={() => {
                  const encoded = encodeURIComponent(snapshot.response.rawText ?? '');
                  void Linking.openURL(`mailto:?subject=${modeMetadata.title}助手建议&body=${encoded}`);
                }}>
                <Text style={styles.link}>发送到邮箱</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 24,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#1E1E2F',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  refresh: {
    fontSize: 14,
    color: '#3F3D56',
  },
  placeholder: {
    marginTop: 18,
    fontSize: 14,
    color: '#838091',
  },
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#6C6A7C',
  },
  errorBox: {
    marginTop: 16,
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#991B1B',
  },
  retry: {
    marginTop: 8,
    fontSize: 14,
    color: '#B91C1C',
  },
  summary: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#3F3D56',
    lineHeight: 22,
  },
  section: {
    marginTop: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3F3D56',
  },
  suggestionCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#F7F9FC',
    marginBottom: 10,
  },
  suggestionBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  suggestionIndex: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3F3D56',
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3F3D56',
    marginBottom: 4,
  },
  suggestionDetail: {
    fontSize: 14,
    color: '#6C6A7C',
    lineHeight: 20,
  },
  resetActions: {
    fontSize: 13,
    color: '#6C6A7C',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#F4F4F6',
    marginBottom: 10,
  },
  actionMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 12,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 15,
    color: '#1F2933',
  },
  actionDuration: {
    fontSize: 12,
    color: '#6C6A7C',
    marginTop: 4,
  },
  feedbackRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  feedbackChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
  },
  feedbackText: {
    fontSize: 13,
    color: '#4338CA',
  },
  link: {
    marginTop: 12,
    fontSize: 13,
    color: '#2563EB',
    textDecorationLine: 'underline',
  },
});

