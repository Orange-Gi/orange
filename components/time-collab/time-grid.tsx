import React, { useMemo } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { GridTile } from '@/components/ui/grid-tile';
import type { DailyGridSnapshot } from '@/hooks/useDailyGrid';

type TimeGridProps = {
  snapshot: DailyGridSnapshot;
};

const GRID_PADDING = 20;
const GRID_GAP = 6;
const STATS_BG = 'rgba(255, 255, 255, 0.5)';

export const TimeGrid: React.FC<TimeGridProps> = ({ snapshot }) => {
  const { width } = useWindowDimensions();

  const tileSize = useMemo(() => {
    const availableWidth = width - GRID_PADDING * 2 - GRID_GAP * 11;
    return Math.max(availableWidth / 12, 12);
  }, [width]);

  const totalBlocks = snapshot.blocks.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headline}>今日时间进度</Text>
        <Text style={styles.timeLabel}>当前 {snapshot.currentTimeLabel}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>已度过</Text>
          <Text style={styles.statValue}>{snapshot.pastBlocks}</Text>
          <Text style={styles.statHint}>{snapshot.elapsedMinutes} 分钟</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>剩余</Text>
          <Text style={styles.statValue}>{totalBlocks - snapshot.pastBlocks}</Text>
          <Text style={styles.statHint}>{snapshot.remainingMinutes} 分钟</Text>
        </View>
      </View>

      <View style={styles.gridWrapper}>
        {snapshot.rows.map((row, rowIndex) => (
          <View
            key={`row-${rowIndex}`}
            style={[styles.row, { marginBottom: rowIndex === snapshot.rows.length - 1 ? 0 : GRID_GAP }]}>
            {row.map((block) => {
              const state = block.isPast
                ? 'past'
                : block.isCurrent
                ? 'current'
                : 'future';
              return (
                <GridTile
                  key={`block-${block.index}`}
                  size={tileSize}
                  state={state}
                  style={{ marginRight: block.column === 11 ? 0 : GRID_GAP }}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: GRID_PADDING,
    paddingTop: 12,
  },
  header: {
    marginBottom: 12,
  },
  headline: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3F3D56',
    marginBottom: 4,
  },
  timeLabel: {
    fontSize: 14,
    color: '#6C6A7C',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: STATS_BG,
    borderRadius: 16,
    padding: 14,
  },
  statLabel: {
    fontSize: 12,
    color: '#6C6A7C',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3F3D56',
  },
  statHint: {
    fontSize: 13,
    color: '#8F8C9F',
    marginTop: 4,
  },
  gridWrapper: {
    borderRadius: 18,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  row: {
    flexDirection: 'row',
  },
});

