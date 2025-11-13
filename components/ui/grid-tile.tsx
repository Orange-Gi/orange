import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

type GridTileState = 'past' | 'current' | 'future';

type GridTileProps = {
  size: number;
  state: GridTileState;
  fillRatio?: number;
  onPress?: () => void;
  style?: ViewStyle;
};

export const GridTile: React.FC<GridTileProps> = ({ size, state, fillRatio = 0, onPress, style }) => {
  const animatedScale = useRef(new Animated.Value(state === 'current' ? 1 : 0)).current;
  const initialFill = state === 'past' ? 1 : state === 'current' ? fillRatio : 0;
  const animatedFill = useRef(new Animated.Value(initialFill)).current;

  useEffect(() => {
    if (state !== 'current') {
      animatedScale.stopAnimation();
      animatedScale.setValue(0);
      return;
    }

    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedScale, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(animatedScale, {
          toValue: 0.5,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [animatedScale, state]);

  useEffect(() => {
    const target = state === 'past' ? 1 : state === 'current' ? Math.max(0, Math.min(fillRatio, 1)) : 0;

    Animated.timing(animatedFill, {
      toValue: target,
      duration: state === 'current' ? 800 : 200,
      useNativeDriver: false,
    }).start();
  }, [animatedFill, fillRatio, state]);

  const borderColor = state === 'past' ? '#98B38F' : state === 'current' ? '#FFC107' : '#DAD7D0';
  const containerBackground =
    state === 'future' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.12)';
  const fillColor = state === 'past' ? '#AEC9A7' : state === 'current' ? '#FFE066' : 'transparent';

  const content = (
    <Animated.View
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          borderColor,
          backgroundColor: containerBackground,
          transform:
            state === 'current'
              ? [
                  {
                    scale: animatedScale.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.08],
                    }),
                  },
                ]
              : undefined,
        },
        style,
      ]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.fill,
          {
            backgroundColor: fillColor,
            width: animatedFill.interpolate({
              inputRange: [0, 1],
              outputRange: [0, size],
            }),
          },
        ]}
      />
    </Animated.View>
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

