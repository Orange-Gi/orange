import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { MODE_METADATA, type CollaborationMode } from '@/types/time-collab';

type ModeChipProps = {
  mode: CollaborationMode;
  active?: boolean;
  energyLevel?: 'high' | 'medium' | 'low';
  onPress?: (mode: CollaborationMode) => void;
};

const ENERGY_HINT: Record<'high' | 'medium' | 'low', string> = {
  high: '能量高涨',
  medium: '稳态前行',
  low: '需要补给',
};

export const ModeChip: React.FC<ModeChipProps> = ({ mode, active, onPress, energyLevel }) => {
  const metadata = MODE_METADATA[mode];
  const backgroundColor = active ? metadata.color : '#F3F4F6';
  const textColor = active ? '#FFFFFF' : '#374151';

  return (
    <TouchableOpacity
      onPress={() => onPress?.(mode)}
      activeOpacity={0.85}
      style={[styles.container, { backgroundColor }]}>
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: textColor }]}>{metadata.title}</Text>
        {energyLevel && (
          <Text style={[styles.energy, { color: textColor }]}>{ENERGY_HINT[energyLevel]}</Text>
        )}
      </View>
      <Text style={[styles.subtitle, { color: active ? 'rgba(255,255,255,0.9)' : '#6B7280' }]}>
        {metadata.subtitle}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  energy: {
    fontSize: 12,
    fontWeight: '600',
  },
});

