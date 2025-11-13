import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

type GridTileState = 'past' | 'current' | 'future';

type GridTileProps = {
  size: number;
  state: GridTileState;
  fillRatio?: number;
  onPress?: () => void;
  style?: ViewStyle;
};

export const GridTile: React.FC<GridTileProps> = ({ size, state, fillRatio = 0, onPress, style }) => {
  const normalizedFill = useMemo(() => Math.max(0, Math.min(fillRatio, 1)), [fillRatio]);
  const borderColor = state === 'past' ? '#98B38F' : state === 'current' ? '#FFC107' : '#DAD7D0';
  const containerBackground =
    state === 'future' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.12)';
  const fillColor = state === 'past' ? '#AEC9A7' : state === 'current' ? '#FFE066' : 'transparent';

  const content = (
    <View
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          borderColor,
          backgroundColor: containerBackground,
        },
        style,
      ]}>
      <View
        pointerEvents="none"
        style={[
          styles.fill,
          {
            backgroundColor: fillColor,
            width: size * normalizedFill,
          },
        ]}
      />
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  tile: {
    borderRadius: 6,
    borderWidth: 1,
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
  },
});

