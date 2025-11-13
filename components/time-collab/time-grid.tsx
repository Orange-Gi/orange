import React, { useMemo } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { GridTile } from '@/components/ui/grid-tile';
import type { DailyGridSnapshot } from '@/hooks/useDailyGrid';

type TimeGridProps = {
  snapshot: DailyGridSnapshot;
};

const GRID_PADDING = 24;
const GRID_GAP = 6;
const GRID_WRAPPER_PADDING = 12;
const MIN_TILE_SIZE = 12;

export const TimeGrid: React.FC<TimeGridProps> = ({ snapshot }) => {
  const { width, height } = useWindowDimensions();
  const rowsCount = snapshot.rows.length;
  const columns = snapshot.rows[0]?.length ?? 0;

  const tileSize = useMemo(() => {
    if (!columns || !rowsCount) {
      return MIN_TILE_SIZE;
    }

    const horizontalGaps = GRID_GAP * Math.max(columns - 1, 0);
    const verticalGaps = GRID_GAP * Math.max(rowsCount - 1, 0);

    const widthLimited =
      (width - GRID_PADDING * 2 - horizontalGaps) / columns || MIN_TILE_SIZE;
    const heightLimited =
      (height * 0.5 - GRID_WRAPPER_PADDING * 2 - verticalGaps) / rowsCount || MIN_TILE_SIZE;

    const candidate = Math.min(widthLimited, heightLimited);

    if (!Number.isFinite(candidate) || candidate <= 0) {
      return MIN_TILE_SIZE;
    }

    return Math.max(candidate, MIN_TILE_SIZE);
  }, [columns, height, rowsCount, width]);

  const totalBlocks = snapshot.blocks.length;

  return (
    <View style={styles.container}>
      <View style={[styles.gridWrapper, { maxHeight: height * 0.5 }]}>
        <View style={styles.metaRow}>
          <Text style={styles.metaPrimary}>{snapshot.currentTimeLabel}</Text>
          <Text style={styles.metaSecondary}>
            {snapshot.pastBlocks}/{totalBlocks}
          </Text>
        </View>

        {snapshot.rows.map((row, rowIndex) => (
          <View
            key={`row-${rowIndex}`}
            style={[styles.row, { marginBottom: rowIndex === rowsCount - 1 ? 0 : GRID_GAP }]}>
            {row.map((block, blockIndex) => {
              const state = block.isPast ? 'past' : block.isCurrent ? 'current' : 'future';
              const isLastInRow = blockIndex === row.length - 1;
              return (
                <GridTile
                  key={`block-${block.index}`}
                  size={tileSize}
                  state={state}
                  fillRatio={block.fillRatio}
                  style={{ marginRight: isLastInRow ? 0 : GRID_GAP }}
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
    alignSelf: 'stretch',
  },
  gridWrapper: {
    borderRadius: 18,
    padding: GRID_WRAPPER_PADDING,
    backgroundColor: 'rgba(255,255,255,0.45)',
    gap: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaPrimary: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3F3D56',
  },
  metaSecondary: {
    fontSize: 13,
    color: '#6C6A7C',
  },
  row: {
    flexDirection: 'row',
  },
});

