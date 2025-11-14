import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LayoutChangeEvent,
  PanResponder,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
  type DimensionValue,
  type StyleProp,
  type TextStyle,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useFocusMode } from '@/contexts/focus-mode-context';

const TOTAL_BLOCKS = 144;
const MINUTES_PER_BLOCK = 10;
const BLOCKS_PER_ROW = 12;
const TOTAL_MINUTES = TOTAL_BLOCKS * MINUTES_PER_BLOCK;
const TOTAL_ROWS = Math.ceil(TOTAL_BLOCKS / BLOCKS_PER_ROW);
const GRID_PADDING = 24;
const GRID_GAP = 6;
const GRID_HEIGHT_RATIO = 0.5;
const FATIGUE_WIDTH_RATIO = 0.382;
const FATIGUE_THUMB_SIZE = 16;

type ProgressSnapshot = {
  passedBlocks: number;
  leftBlocks: number;
  currentBlockIndex: number | null;
  secondsIntoCurrentBlock: number;
  currentBlockProgress: number;
};

const computeProgress = (): ProgressSnapshot => {
  const now = new Date();
  const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
  const passedBlocks = Math.min(TOTAL_BLOCKS, Math.floor(minutesSinceMidnight / MINUTES_PER_BLOCK));
  const leftBlocks = TOTAL_BLOCKS - passedBlocks;
  const seconds = now.getSeconds();
  const withinDay = minutesSinceMidnight < TOTAL_MINUTES;
  const currentBlockIndex = withinDay ? Math.min(TOTAL_BLOCKS - 1, passedBlocks) : null;
  const secondsIntoCurrentBlock = withinDay
    ? (minutesSinceMidnight % MINUTES_PER_BLOCK) * 60 + seconds
    : 0;
  const currentBlockProgress = withinDay
    ? Math.min(1, secondsIntoCurrentBlock / (MINUTES_PER_BLOCK * 60))
    : 1;

  return {
    passedBlocks,
    leftBlocks,
    currentBlockIndex,
    secondsIntoCurrentBlock,
    currentBlockProgress,
  };
};

export default function HomeScreen() {
  const router = useRouter();
  const { isFocusMode, setFocusMode, toggleFocusMode } = useFocusMode();
  const { width, height } = useWindowDimensions();
  const [progress, setProgress] = useState<ProgressSnapshot>(() => computeProgress());
  const [userInput, setUserInput] = useState('');
  const [fatigue, setFatigue] = useState(0.5);
  const [inputContentWidth, setInputContentWidth] = useState(0);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const dialogInputWebStyle = useMemo<StyleProp<TextStyle>>(() => {
    if (Platform.OS !== 'web') {
      return undefined;
    }
    return {
      outlineStyle: 'none',
      outlineWidth: 0,
      outlineColor: 'transparent',
    } as unknown as TextStyle;
  }, []);

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

  const gridWidth = useMemo(() => {
    if (blockSize <= 0) {
      return 0;
    }
    return blockSize * BLOCKS_PER_ROW + GRID_GAP * (BLOCKS_PER_ROW - 1);
  }, [blockSize]);

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

  const sliderWidth = useMemo(
    () => (inputContentWidth > 0 ? inputContentWidth * FATIGUE_WIDTH_RATIO : 0),
    [inputContentWidth],
  );

  const updateFatigueFromPosition = useCallback(
    (x: number) => {
      if (sliderWidth <= 0) {
        return;
      }
      const ratio = Math.min(1, Math.max(0, x / sliderWidth));
      setFatigue(ratio);
    },
    [sliderWidth],
  );

  const fatiguePanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => updateFatigueFromPosition(evt.nativeEvent.locationX),
        onPanResponderMove: (evt) => updateFatigueFromPosition(evt.nativeEvent.locationX),
        onPanResponderRelease: (evt) => updateFatigueFromPosition(evt.nativeEvent.locationX),
        onPanResponderTerminationRequest: () => false,
      }),
    [updateFatigueFromPosition],
  );

  const handleDialogLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = Math.max(0, event.nativeEvent.layout.width - 40);
    setInputContentWidth((prev) => {
      if (Math.abs(prev - nextWidth) < 0.5) {
        return prev;
      }
      return nextWidth;
    });
  }, []);

  const handleSend = useCallback(() => {
    router.push({
      pathname: '/guidance',
      params: {
        query: userInput.trim(),
        fatigue: fatigue.toString(),
      },
    });
    setUserInput('');
  }, [router, userInput, fatigue]);

  const fatiguePercent = useMemo(() => Math.round(fatigue * 100), [fatigue]);
  const fatigueThumbTranslateX = useMemo(() => {
    if (sliderWidth <= 0) {
      return 0;
    }
    const maxOffset = Math.max(0, sliderWidth - FATIGUE_THUMB_SIZE);
    const raw = sliderWidth * fatigue - FATIGUE_THUMB_SIZE / 2;
    return Math.min(Math.max(raw, 0), maxOffset);
  }, [sliderWidth, fatigue]);

  const currentFillPercent = useMemo<DimensionValue>(() => {
    const percent = Math.min(1, Math.max(0, progress.currentBlockProgress));
    return `${percent * 100}%`;
  }, [progress.currentBlockProgress]);

  const sharedWidthStyle = gridWidth > 0 ? { width: gridWidth } : undefined;

  useEffect(
    () => () => {
      setFocusMode(false);
    },
    [setFocusMode],
  );

  return (
    <SafeAreaView style={styles.container}>
      {!isFocusMode && (
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.avatarButton}
            activeOpacity={0.8}
            onPress={() => router.push('/modal?intent=login')}>
            <Ionicons name="person-circle-outline" size={36} color="#4A5D53" />
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.content, isFocusMode && styles.contentFocus]}>
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={toggleFocusMode}
          style={[
            styles.gridTouchable,
            sharedWidthStyle,
            { maxHeight: height * GRID_HEIGHT_RATIO },
            isFocusMode && styles.gridTouchableFocus,
          ]}>
          <View style={[styles.gridContainer, isFocusMode && styles.gridContainerFocus]}>
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
                        <View
                          style={[styles.gridBlockCurrentFill, { width: currentFillPercent }]}
                        />
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </TouchableOpacity>

        {!isFocusMode && (
          <View style={[styles.legendRow, sharedWidthStyle]}>
            <View style={styles.legendItem}>
              <View style={[styles.legendSwatch, styles.legendSwatchPassed]} />
              <Text style={styles.legendLabel}>passed</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendSwatch, styles.legendSwatchLeft]} />
              <Text style={styles.legendLabel}>left</Text>
            </View>
          </View>
        )}
      </View>

      {!isFocusMode && (
        <View style={[styles.dialog, sharedWidthStyle]} onLayout={handleDialogLayout}>
          <TextInput
            style={[
              styles.dialogInput,
              isInputFocused && styles.dialogInputFocused,
              dialogInputWebStyle,
            ]}
            placeholder="思考，斋戒，还是等待..."
            placeholderTextColor="rgba(74, 93, 83, 0.4)"
            value={userInput}
            onChangeText={setUserInput}
            multiline
            underlineColorAndroid="transparent"
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
          />
          <View
            style={[
              styles.fatigueBarWrapper,
              sliderWidth > 0 ? { width: sliderWidth } : undefined,
            ]}
            {...fatiguePanResponder.panHandlers}>
            <Text style={styles.fatigueLabel}>疲惫度 {fatiguePercent}%</Text>
            <View style={styles.fatigueTrack}>
              <View style={[styles.fatigueFill, { width: `${fatigue * 100}%` }]} />
              <View
                style={[
                  styles.fatigueThumb,
                  {
                    transform: [
                      {
                        translateX: fatigueThumbTranslateX,
                      },
                    ],
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.actionCluster}>
            <TouchableOpacity
              style={styles.voiceButton}
              activeOpacity={0.85}
              onPress={() => {}}>
              <Ionicons name="mic-outline" size={18} color="#4A5D53" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.sendButton} activeOpacity={0.9} onPress={handleSend}>
              <Ionicons name="paper-plane" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: GRID_PADDING,
    paddingVertical: 24,
  },
  contentFocus: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  gridContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  gridContainerFocus: {
    marginBottom: 0,
  },
  gridTouchable: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridTouchableFocus: {
    flex: 1,
  },
  gridRow: {
    flexDirection: 'row',
  },
  gridBlock: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#B9C6BB',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  gridBlockPassed: {
    backgroundColor: '#AEC9A7',
  },
  gridBlockLeft: {
    backgroundColor: '#F5F0E4',
  },
  gridBlockCurrent: {
    borderColor: '#AEC9A7',
    backgroundColor: '#F5F0E4',
  },
  gridBlockCurrentFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#AEC9A7',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
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
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 20,
    alignSelf: 'center',
    position: 'relative',
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  dialogInput: {
    minHeight: 96,
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 72,
    paddingRight: 96,
    fontSize: 15,
    color: '#4A5D53',
    textAlignVertical: 'top',
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  dialogInputFocused: {
    borderWidth: 0,
  },
  fatigueBarWrapper: {
    position: 'absolute',
    left: 20,
    bottom: 18,
  },
  fatigueLabel: {
    fontSize: 11,
    color: '#708178',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  fatigueTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(74, 93, 83, 0.15)',
    overflow: 'hidden',
    position: 'relative',
  },
  fatigueFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#4A5D53',
  },
  fatigueThumb: {
    position: 'absolute',
    top: -5,
    width: FATIGUE_THUMB_SIZE,
    height: FATIGUE_THUMB_SIZE,
    borderRadius: FATIGUE_THUMB_SIZE / 2,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#4A5D53',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  actionCluster: {
    position: 'absolute',
    right: 18,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F0E4',
    borderWidth: 1,
    borderColor: 'rgba(74, 93, 83, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  sendButton: {
    paddingHorizontal: 18,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A5D53',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
});
