import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useUserCollabContext } from '@/contexts/user-collab-context';
import { ModeChip } from '@/components/ui/mode-chip';
import type { CollaborationMode, EnergyLevel } from '@/types/time-collab';

const MODES: CollaborationMode[] = ['think', 'fast', 'rest'];
const ENERGY_LEVELS: EnergyLevel[] = ['high', 'medium', 'low'];

type ModeSelectorProps = {
  contentWidth?: number;
};

const ENERGY_LABEL: Record<EnergyLevel, string> = {
  high: '高能',
  medium: '平稳',
  low: '疲惫',
};

export const ModeSelector: React.FC<ModeSelectorProps> = ({ contentWidth }) => {
  const { state, setMode, setEnergyLevel } = useUserCollabContext();

  return (
    <View
      style={[
        styles.container,
        contentWidth ? { width: contentWidth, alignSelf: 'center', marginHorizontal: 0 } : undefined,
      ]}>
      <Text style={styles.label}>协同模式</Text>
      <Text style={styles.hint}>根据当前状态选择模式，助手会匹配不同节奏和语气</Text>

      <View style={styles.energyRow}>
        {ENERGY_LEVELS.map((level) => {
          const active = state.energyLevel === level;
          return (
            <TouchableOpacity
              key={level}
              onPress={() => setEnergyLevel(level)}
              style={[
                styles.energyTag,
                active && { backgroundColor: '#3F3D56' },
              ]}>
              <Text style={[styles.energyLabel, active && { color: '#FFFFFF' }]}>
                {ENERGY_LABEL[level]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.modes}>
        {MODES.map((mode) => (
          <ModeChip
            key={mode}
            mode={mode}
            active={state.mode === mode}
            energyLevel={state.energyLevel}
            onPress={setMode}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3F3D56',
  },
  hint: {
    fontSize: 13,
    color: '#72738A',
    marginTop: 6,
  },
  energyRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
    marginBottom: 12,
  },
  energyTag: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  energyLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3F3D56',
  },
  modes: {
    marginTop: 8,
  },
});

