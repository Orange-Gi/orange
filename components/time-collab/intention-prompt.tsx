import React, { useCallback } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useUserCollabContext } from '@/contexts/user-collab-context';

export const IntentionPrompt: React.FC = () => {
  const { state, setIntention } = useUserCollabContext();

  const handleChange = useCallback(
    (value: string) => {
      setIntention(value);
    },
    [setIntention],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>今日愿望 / 意图</Text>
      <Text style={styles.hint}>用一句话描述你想把剩余时间投入到哪里</Text>
      <TextInput
        style={styles.input}
        placeholder="例如：迭代协同文档初稿，重点补充案例"
        placeholderTextColor="#A0AEC0"
        multiline
        value={state.intention}
        onChangeText={handleChange}
        maxLength={200}
      />
      <Text style={styles.counter}>{state.intention.length}/200</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 18,
    marginHorizontal: 20,
    marginTop: 20,
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
    marginBottom: 12,
  },
  input: {
    minHeight: 72,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    lineHeight: 20,
    color: '#1F2933',
  },
  counter: {
    fontSize: 12,
    color: '#8F8C9F',
    marginTop: 8,
    textAlign: 'right',
  },
});

