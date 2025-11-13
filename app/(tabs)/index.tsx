import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  PanResponder,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

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
  currentBlockIndex: number | null;
  secondsIntoCurrentBlock: number;
  currentBlockElapsedLabel: string;
};

const computeProgress = (): ProgressSnapshot => {
  const now = new Date();
  const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
  const passedBlocks = Math.min(TOTAL_BLOCKS, Math.floor(minutesSinceMidnight / MINUTES_PER_BLOCK));
  const leftBlocks = TOTAL_BLOCKS - passedBlocks;
  const elapsedMinutes = Math.min(minutesSinceMidnight, TOTAL_MINUTES);
  const remainingMinutes = Math.max(0, TOTAL_MINUTES - minutesSinceMidnight);
  const seconds = now.getSeconds();
  const withinDay = minutesSinceMidnight < TOTAL_MINUTES;
  const currentBlockIndex = withinDay ? Math.min(TOTAL_BLOCKS - 1, passedBlocks) : null;
  const secondsIntoCurrentBlock = withinDay
    ? (minutesSinceMidnight % MINUTES_PER_BLOCK) * 60 + seconds
    : 0;
  const elapsedMinutesWithinBlock = Math.floor(secondsIntoCurrentBlock / 60);
  const elapsedSecondsWithinBlock = secondsIntoCurrentBlock % 60;

  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');

  return {
    passedBlocks,
    leftBlocks,
    elapsedMinutes,
    remainingMinutes,
    currentTimeLabel: `${hours}:${minutes}`,
    currentBlockIndex,
    secondsIntoCurrentBlock,
    currentBlockElapsedLabel: withinDay
      ? `${elapsedMinutesWithinBlock}分${elapsedSecondsWithinBlock.toString().padStart(2, '0')}秒`
      : '已完成',
  };
};

export default function HomeScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [progress, setProgress] = useState<ProgressSnapshot>(() => computeProgress());
  const [fatigueValue, setFatigueValue] = useState(0.4);
  const [userInput, setUserInput] = useState('');
  const [sliderWidth, setSliderWidth] = useState(0);
  const trackWidthRef = useRef(1);

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

  const updateFatigueFromPosition = useCallback(
    (positionX: number) => {
      if (trackWidthRef.current <= 0) {
        return;
      }
      const ratio = Math.min(1, Math.max(0, positionX / trackWidthRef.current));
      setFatigueValue(ratio);
    },
    [setFatigueValue],
  );

  const sliderPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          updateFatigueFromPosition(event.nativeEvent.locationX);
        },
        onPanResponderMove: (event) => {
          updateFatigueFromPosition(event.nativeEvent.locationX);
        },
      }),
    [updateFatigueFromPosition],
  );

  const rows = useMemo(() => {
    const blocks = Array.from({ length: TOTAL_BLOCKS }, (_, index) => {
      if (progress.currentBlockIndex !== null && index === progress.currentBlockIndex) {
        return 'current';
      }
      return index < progress.passedBlocks ? 'passed' : 'left';
    });
    return Array.from({ length: TOTAL_ROWS }, (_, rowIndex) =>
      blocks.slice(rowIndex * BLOCKS_PER_ROW, rowIndex * BLOCKS_PER_ROW + BLOCKS_PER_ROW),
    );
  }, [progress.currentBlockIndex, progress.passedBlocks]);

  const fatiguePercent = Math.round(fatigueValue * 100);

  const handleSend = useCallback(() => {
    router.push({
      pathname: '/guidance',
      params: {
        query: userInput.trim(),
        fatigue: fatigueValue.toFixed(2),
      },
    });
    setUserInput('');
  }, [fatigueValue, router, userInput]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.avatarButton}
          activeOpacity={0.8}
          onPress={() => router.push('/modal?intent=login')}>
          <Ionicons name="person-circle-outline" size={36} color="#4A5D53" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.timeInfoRow}>
          <Text style={styles.timeLabel}>当前时间 · {progress.currentTimeLabel}</Text>
          {progress.currentBlockIndex !== null && (
            <Text style={styles.blockElapsed}>当前格已过去 {progress.currentBlockElapsedLabel}</Text>
          )}
        </View>

        <View style={[styles.gridContainer, { maxHeight: height * GRID_HEIGHT_RATIO }]}>
          {rows.map((row, rowIndex) => (
            <View
              key={`row-${rowIndex}`}
              style={[
                styles.gridRow,
                { marginBottom: rowIndex === TOTAL_ROWS - 1 ? 0 : GRID_GAP },
              ]}>
              {row.map((status, columnIndex) => {
                const isLastInRow = columnIndex === BLOCKS_PER_ROW - 1;
                const isCurrent = status === 'current';
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
                      status === 'passed' && styles.gridBlockPassed,
                      status === 'left' && styles.gridBlockLeft,
                      isCurrent && styles.gridBlockCurrent,
                    ]}>
                    {isCurrent && (
                      <Text style={styles.gridBlockCurrentText}>
                        {progress.currentBlockElapsedLabel}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, styles.legendSwatchPassed]} />
            <Text style={styles.legendLabel}>passed</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, styles.legendSwatchCurrent]} />
            <Text style={styles.legendLabel}>current</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, styles.legendSwatchLeft]} />
            <Text style={styles.legendLabel}>left</Text>
          </View>
        </View>
      </View>

      <View style={styles.dialog}>
        <Text style={styles.dialogTitle}>思考？斋戒？还是等待。</Text>
        <TextInput
          style={styles.dialogInput}
          placeholder="告诉我你此刻的意图..."
          placeholderTextColor="rgba(74, 93, 83, 0.4)"
          value={userInput}
          onChangeText={setUserInput}
          multiline
        />

        <View style={styles.dialogFooter}>
          <View style={styles.energySection}>
            <Text style={styles.energyLabel}>疲惫度 {fatiguePercent}%</Text>
            <View
              style={styles.sliderTrack}
              onLayout={(event) => {
                const widthValue = event.nativeEvent.layout.width;
                trackWidthRef.current = widthValue;
                setSliderWidth(widthValue);
              }}
              {...sliderPanResponder.panHandlers}>
              <View style={[styles.sliderFill, { width: sliderWidth * fatigueValue }]} />
              <View
                style={[
                  styles.sliderThumb,
                  { transform: [{ translateY: -10 }, { translateX: sliderWidth * fatigueValue - 10 }] },
                ]}
              />
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
              <Ionicons name="mic-outline" size={22} color="#4A5D53" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconButton, styles.sendButton]}
              activeOpacity={0.9}
              onPress={handleSend}>
              <Ionicons name="arrow-up-circle" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2E9D8',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: GRID_PADDING,
    paddingTop: 12,
  },
  avatarButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: GRID_PADDING,
    paddingTop: 12,
  },
  timeInfoRow: {
    marginBottom: 12,
  },
  timeLabel: {
    fontSize: 14,
    color: '#4A5D53',
    marginBottom: 6,
  },
  blockElapsed: {
    fontSize: 13,
    color: '#6E7F76',
  },
  gridContainer: {
    justifyContent: 'center',
  },
  gridRow: {
    flexDirection: 'row',
  },
  gridBlock: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#B9C6BB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridBlockPassed: {
    backgroundColor: '#AEC9A7',
  },
  gridBlockLeft: {
    backgroundColor: '#F5F0E4',
  },
  gridBlockCurrent: {
    backgroundColor: '#FFE3B3',
    borderColor: '#F0A500',
    shadowColor: '#F0A500',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  gridBlockCurrentText: {
    fontSize: 10,
    color: '#4A5D53',
    fontWeight: '600',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendSwatch: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#B9C6BB',
  },
  legendSwatchPassed: {
    backgroundColor: '#AEC9A7',
  },
  legendSwatchCurrent: {
    backgroundColor: '#FFE3B3',
    borderColor: '#F0A500',
  },
  legendSwatchLeft: {
    backgroundColor: '#F5F0E4',
  },
  legendLabel: {
    fontSize: 12,
    color: '#4A5D53',
    textTransform: 'lowercase',
  },
  dialog: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A5D53',
    marginBottom: 12,
  },
  dialogInput: {
    minHeight: 60,
    maxHeight: 120,
    borderRadius: 14,
    backgroundColor: '#F6F1E6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#4A5D53',
    textAlignVertical: 'top',
  },
  dialogFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 16,
  },
  energySection: {
    flex: 1,
    marginRight: 12,
  },
  energyLabel: {
    fontSize: 13,
    color: '#4A5D53',
    marginBottom: 6,
  },
  sliderTrack: {
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E6DDD0',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#D2B48C',
  },
  sliderThumb: {
    position: 'absolute',
    top: 16,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4A5D53',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6DDD0',
    marginLeft: 8,
  },
  sendButton: {
    backgroundColor: '#4A5D53',
  },
});
