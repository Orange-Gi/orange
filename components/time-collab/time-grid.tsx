import React, { useMemo } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { GridTile } from '@/components/ui/grid-tile';
import type { DailyGridSnapshot } from '@/hooks/useDailyGrid';

type TimeGridProps = {
  snapshot: DailyGridSnapshot;
  contentWidth?: number;
};

const GRID_PADDING = 20;
const GRID_GAP = 6;
const GRID_WRAPPER_PADDING = 12;
const STATS_BG = 'rgba(255, 255, 255, 0.5)';
const MIN_CONTAINER_WIDTH = GRID_PADDING * 2 + GRID_GAP * 11 + 12 * 12;
const LEGEND_ITEMS = [
  { key: 'past', label: '已完成', color: '#AEC9A7', borderColor: '#98B38F' },
  { key: 'current', label: '进行中', color: '#FFE066', borderColor: '#FFC107' },
  { key: 'future', label: '待开始', color: 'transparent', borderColor: '#DAD7D0' },
] as const;

export const TimeGrid: React.FC<TimeGridProps> = ({ snapshot, contentWidth }) => {
  const { width } = useWindowDimensions();

  const containerWidth = useMemo(() => {
    const baseWidth = contentWidth ? Math.min(contentWidth, width) : width;
    const desiredWidth = Math.max(baseWidth, MIN_CONTAINER_WIDTH);
    return Math.min(desiredWidth, width);
  }, [contentWidth, width]);

  const tileSize = useMemo(() => {
    const availableWidth = Math.max(containerWidth - GRID_PADDING * 2 - GRID_GAP * 11, 0);
    return Math.max(availableWidth / 12, 8);
  }, [containerWidth]);

  const gridWidth = useMemo(() => tileSize * 12 + GRID_GAP * 11, [tileSize]);
  const wrapperWidth = gridWidth + GRID_WRAPPER_PADDING * 2;

  const totalBlocks = snapshot.blocks.length;

  return (
    <View style={[styles.container, { width: containerWidth, alignSelf: 'center' }]}>
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

      <View style={[styles.gridWrapper, { width: wrapperWidth, alignSelf: 'center' }]}>
        {snapshot.rows.map((row, rowIndex) => (
          <View
            key={`row-${rowIndex}`}
            style={[styles.row, { marginBottom: rowIndex === snapshot.rows.length - 1 ? 0 : GRID_GAP }]}>
            {row.map((block) => {
              const state = block.isPast ? 'past' : block.isCurrent ? 'current' : 'future';
              return (
                <GridTile
                  key={`block-${block.index}`}
                  size={tileSize}
                  state={state}
                  fillRatio={block.fillRatio}
                  style={{ marginRight: block.column === 11 ? 0 : GRID_GAP }}
                />
              );
            })}
          </View>
        ))}
      </View>

      <View style={[styles.legend, { width: gridWidth }]}>
        {LEGEND_ITEMS.map((item) => (
          <View key={item.key} style={styles.legendItem}>
            <View
              style={[
                styles.legendSwatch,
                {
                  backgroundColor: item.color,
                  borderColor: item.borderColor,
                },
              ]}
            />
            <Text style={styles.legendLabel}>{item.label}</Text>
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
    padding: GRID_WRAPPER_PADDING,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  legend: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendSwatch: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
  },
  legendLabel: {
    fontSize: 12,
    color: '#6C6A7C',
  },
});

