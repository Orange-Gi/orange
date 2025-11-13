import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function GuidanceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const rawQuery = params.query;
  const rawFatigue = params.fatigue;

  const query =
    typeof rawQuery === 'string'
      ? rawQuery
      : Array.isArray(rawQuery)
        ? rawQuery[0] ?? ''
        : '';

  const fatigue =
    typeof rawFatigue === 'string'
      ? rawFatigue
      : Array.isArray(rawFatigue)
        ? rawFatigue[0] ?? '0.5'
        : '0.5';

  const fatigueScore = Math.min(1, Math.max(0, Number.parseFloat(fatigue) || 0));
  const fatiguePercent = Math.round(fatigueScore * 100);

  const recommendation = useMemo(() => {
    if (fatigueScore >= 0.75) {
      return '先让身体和神经都缓一缓。闭上眼睛 5 分钟，补水，允许自己暂时按下暂停键。';
    }
    if (fatigueScore >= 0.45) {
      return '把当下任务拆成一两个最小动作，先启动。完成后再回顾疲惫感是否下降。';
    }
    return '你状态尚可，可以尝试进入深度专注，设定 20 分钟的专注周期，完成后检查身体反馈。';
  }, [fatigueScore]);

  const suggestedMode = useMemo(() => {
    if (fatigueScore >= 0.75) {
      return '等待 · 保护能量';
    }
    if (fatigueScore >= 0.45) {
      return '斋戒 · 精简输入';
    }
    return '思考 · 推进核心问题';
  }, [fatigueScore]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>下一步指引</Text>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>疲惫度</Text>
            <Text style={styles.badgeValue}>{fatiguePercent}%</Text>
          </View>
          <View style={[styles.badge, styles.modeBadge]}>
            <Text style={styles.badgeLabel}>建议模式</Text>
            <Text style={styles.badgeValue}>{suggestedMode}</Text>
          </View>
        </View>

        {query.trim().length > 0 ? (
          <Text style={styles.userIntent}>你提到想要「{query.trim()}」。</Text>
        ) : (
          <Text style={styles.userIntent}>你未给出具体计划，我们先从身体状态出发。</Text>
        )}

        <Text style={styles.recommendation}>{recommendation}</Text>

        <TouchableOpacity style={styles.backButton} activeOpacity={0.9} onPress={() => router.replace('/')}>
          <Text style={styles.backButtonText}>返回时间格</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2E9D8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4A5D53',
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  badge: {
    flex: 1,
    backgroundColor: '#F6F1E6',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  modeBadge: {
    marginRight: 0,
    backgroundColor: '#FFE3B3',
  },
  badgeLabel: {
    fontSize: 12,
    color: '#6E7F76',
    marginBottom: 4,
  },
  badgeValue: {
    fontSize: 16,
    color: '#4A5D53',
    fontWeight: '600',
  },
  userIntent: {
    fontSize: 14,
    color: '#4A5D53',
    marginBottom: 12,
    lineHeight: 20,
  },
  recommendation: {
    fontSize: 16,
    color: '#4A5D53',
    lineHeight: 24,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#4A5D53',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
