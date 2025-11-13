import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

type GridTileState = 'past' | 'current' | 'future';

type GridTileProps = {
  size: number;
  state: GridTileState;
  onPress?: () => void;
  style?: ViewStyle;
};

export const GridTile: React.FC<GridTileProps> = ({ size, state, onPress, style }) => {
  const animatedScale = useRef(new Animated.Value(state === 'current' ? 1 : 0)).current;

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

  const backgroundColor =
    state === 'past' ? '#AEC9A7' : state === 'current' ? '#FFE066' : 'rgba(255,255,255,0.3)';

  const borderColor = state === 'past' ? '#98B38F' : state === 'current' ? '#FFC107' : '#DAD7D0';

  const content = (
    <Animated.View
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          backgroundColor,
          borderColor,
          transform: state === 'current' ? [{ scale: animatedScale.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.1],
          }) }] : undefined,
        },
        style,
      ]}
    />
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
  },
});

