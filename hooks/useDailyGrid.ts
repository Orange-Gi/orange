import { useEffect, useMemo, useState } from 'react';

const TOTAL_BLOCKS = 144;
const MINUTES_PER_BLOCK = 10;
const BLOCKS_PER_ROW = 12;

export type GridBlock = {
  index: number;
  row: number;
  column: number;
  isPast: boolean;
  isCurrent: boolean;
  isFuture: boolean;
  startMinuteOfDay: number;
};

export type DailyGridSnapshot = {
  blocks: GridBlock[];
  pastBlocks: number;
  futureBlocks: number;
  currentBlockIndex: number;
  elapsedMinutes: number;
  remainingMinutes: number;
  currentTimeLabel: string;
  rows: GridBlock[][];
};

const getMinutesSinceMidnight = (date: Date) => date.getHours() * 60 + date.getMinutes();

const buildSnapshot = (date: Date): DailyGridSnapshot => {
  const minutesSinceMidnight = getMinutesSinceMidnight(date);
  const pastBlocks = Math.min(TOTAL_BLOCKS, Math.floor(minutesSinceMidnight / MINUTES_PER_BLOCK));
  const currentBlockIndex = Math.min(TOTAL_BLOCKS - 1, pastBlocks);
  const futureBlocks = Math.max(0, TOTAL_BLOCKS - pastBlocks);
  const elapsedMinutes = Math.min(minutesSinceMidnight, TOTAL_BLOCKS * MINUTES_PER_BLOCK);
  const remainingMinutes = Math.max(0, TOTAL_BLOCKS * MINUTES_PER_BLOCK - minutesSinceMidnight);

  const blocks: GridBlock[] = Array.from({ length: TOTAL_BLOCKS }, (_, index) => {
    const startMinuteOfDay = index * MINUTES_PER_BLOCK;
    const isPast = index < pastBlocks;
    const isCurrent = index === currentBlockIndex;
    const isFuture = index > pastBlocks;

    return {
      index,
      row: Math.floor(index / BLOCKS_PER_ROW),
      column: index % BLOCKS_PER_ROW,
      isPast,
      isCurrent,
      isFuture,
      startMinuteOfDay,
    };
  });

  const rows = Array.from({ length: Math.ceil(TOTAL_BLOCKS / BLOCKS_PER_ROW) }, (_, row) =>
    blocks.slice(row * BLOCKS_PER_ROW, row * BLOCKS_PER_ROW + BLOCKS_PER_ROW),
  );

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return {
    blocks,
    rows,
    pastBlocks,
    futureBlocks,
    currentBlockIndex,
    elapsedMinutes,
    remainingMinutes,
    currentTimeLabel: `${hours}:${minutes}`,
  };
};

export function useDailyGrid(updateInterval = 30_000) {
  const [snapshot, setSnapshot] = useState<DailyGridSnapshot>(() => buildSnapshot(new Date()));

  useEffect(() => {
    const tick = () => setSnapshot(buildSnapshot(new Date()));
    const interval = setInterval(tick, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  const progress = useMemo(
    () => ({
      elapsedMinutes: snapshot.elapsedMinutes,
      remainingMinutes: snapshot.remainingMinutes,
      pastBlocks: snapshot.pastBlocks,
      futureBlocks: snapshot.futureBlocks,
      currentTimeLabel: snapshot.currentTimeLabel,
    }),
    [snapshot],
  );

  return {
    snapshot,
    progress,
  };
}

