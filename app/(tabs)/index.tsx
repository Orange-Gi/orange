import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

const TOTAL_BLOCKS = 144;
const MINUTES_PER_BLOCK = 10;
const BLOCKS_PER_ROW = 12;
const TOTAL_MINUTES = TOTAL_BLOCKS * MINUTES_PER_BLOCK;
const TOTAL_ROWS = Math.ceil(TOTAL_BLOCKS / BLOCKS_PER_ROW);
const GRID_PADDING = 24;
const GRID_GAP = 6;
const GRID_HEIGHT_RATIO = 0.5;

type ProgressSnapshot = {
  passedBlocks: number;
  leftBlocks: number;
  elapsedMinutes: number;
  remainingMinutes: number;
  currentTimeLabel: string;
};

const computeProgress = (): ProgressSnapshot => {
  const now = new Date();
  const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
  const passedBlocks = Math.min(TOTAL_BLOCKS, Math.floor(minutesSinceMidnight / MINUTES_PER_BLOCK));
  const leftBlocks = TOTAL_BLOCKS - passedBlocks;
  const elapsedMinutes = Math.min(minutesSinceMidnight, TOTAL_MINUTES);
  const remainingMinutes = Math.max(0, TOTAL_MINUTES - minutesSinceMidnight);

  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');

  return {
    passedBlocks,
    leftBlocks,
    elapsedMinutes,
    remainingMinutes,
    currentTimeLabel: `${hours}:${minutes}`,
  };
};

export default function HomeScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [progress, setProgress] = useState<ProgressSnapshot>(() => computeProgress());

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(computeProgress());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const blockSize = useMemo(() => {
    const availableWidth =
      width - GRID_PADDING * 2 - GRID_GAP * (BLOCKS_PER_ROW - 1);
    const sizeByWidth = availableWidth / BLOCKS_PER_ROW;

    const maxGridHeight = height * GRID_HEIGHT_RATIO;
    const availableHeightForBlocks = maxGridHeight - GRID_GAP * (TOTAL_ROWS - 1);
    const sizeByHeight =
      availableHeightForBlocks > 0 ? availableHeightForBlocks / TOTAL_ROWS : sizeByWidth;

    return Math.max(Math.min(sizeByWidth, sizeByHeight), 0);
  }, [width, height]);

  const rows = useMemo(() => {
    const blocks = Array.from({ length: TOTAL_BLOCKS }, (_, index) => index < progress.passedBlocks);
    return Array.from({ length: TOTAL_ROWS }, (_, rowIndex) =>
      blocks.slice(rowIndex * BLOCKS_PER_ROW, rowIndex * BLOCKS_PER_ROW + BLOCKS_PER_ROW),
    );
  }, [progress.passedBlocks]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>同行</Text>
        <Text style={styles.subtitle}>把一天分成 144 个 10 分钟方块</Text>
      </View>

        <TouchableOpacity
          style={styles.promoCard}
          activeOpacity={0.9}
          onPress={() => router.push('/(tabs)/time-collab')}>
          <View>
            <Text style={styles.promoTitle}>与 AI 协同安排余下时间</Text>
            <Text style={styles.promoDescription}>
              查看 12×12 时间网格，记录今日意图，选择思考/斋戒/等待模式，获得专属助手建议。
            </Text>
          </View>
          <Text style={styles.promoCta}>立即体验 →</Text>
        </TouchableOpacity>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statCardFirst]}>
          <Text style={styles.statLabel}>已过去</Text>
          <Text style={styles.statValue}>{progress.passedBlocks}</Text>
          <Text style={styles.statDetail}>{progress.elapsedMinutes} 分钟</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>剩余</Text>
          <Text style={styles.statValue}>{progress.leftBlocks}</Text>
          <Text style={styles.statDetail}>{progress.remainingMinutes} 分钟</Text>
        </View>
      </View>

      <Text style={styles.timestamp}>当前时间 · {progress.currentTimeLabel}</Text>

      <View style={[styles.gridContainer, { maxHeight: height * GRID_HEIGHT_RATIO }]}>
        {rows.map((row, rowIndex) => (
          <View
            key={`row-${rowIndex}`}
            style={[
              styles.gridRow,
              { marginBottom: rowIndex === TOTAL_ROWS - 1 ? 0 : GRID_GAP },
            ]}>
            {row.map((isPassed, columnIndex) => {
              const isLastInRow = columnIndex === BLOCKS_PER_ROW - 1;
          return (
            <View
                  key={`block-${rowIndex}-${columnIndex}`}
                  style={[
                    styles.gridBlock,
                    {
                      width: blockSize,
                      height: blockSize,
                      marginRight: isLastInRow ? 0 : GRID_GAP,
                    },
                    isPassed ? styles.gridBlockPassed : styles.gridBlockLeft,
                  ]}
                />
              );
            })}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2E9D8',
  },
  header: {
    paddingHorizontal: GRID_PADDING,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4A5D53',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6E7F76',
  },
  promoCard: {
    marginHorizontal: GRID_PADDING,
    marginBottom: 20,
    backgroundColor: '#4A5D53',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  promoDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },
  promoCta: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFE066',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: GRID_PADDING,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#EADFCC',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  statCardFirst: {
    marginRight: 16,
  },
  statLabel: {
    fontSize: 14,
    color: '#6E7F76',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4A5D53',
  },
  statDetail: {
    fontSize: 14,
    color: '#91A596',
    marginTop: 4,
  },
  timestamp: {
    paddingHorizontal: GRID_PADDING,
    marginTop: 16,
    marginBottom: 8,
    fontSize: 14,
    color: '#6E7F76',
  },
  gridContainer: {
    paddingHorizontal: GRID_PADDING,
  },
  gridRow: {
    flexDirection: 'row',
  },
  gridBlock: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#B9C6BB',
  },
  gridBlockPassed: {
    backgroundColor: '#AEC9A7',
  },
  gridBlockLeft: {
    backgroundColor: '#F5F0E4',
  },
});
