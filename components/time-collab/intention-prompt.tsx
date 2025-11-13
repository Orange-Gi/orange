import React, { useCallback, useRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput } from 'react-native';

import { useUserCollabContext } from '@/contexts/user-collab-context';

type IntentionPromptProps = {
  contentWidth?: number;
};

export const IntentionPrompt: React.FC<IntentionPromptProps> = ({ contentWidth }) => {
  const { state, setIntention } = useUserCollabContext();
  const inputRef = useRef<TextInput>(null);

  const handleChange = useCallback(
    (value: string) => {
      setIntention(value);
    },
    [setIntention],
  );

  return (
    <Pressable
      style={[
        styles.container,
        contentWidth ? { width: contentWidth, alignSelf: 'center', marginHorizontal: 0 } : undefined,
      ]}
      onPress={() => inputRef.current?.focus()}>
      <TextInput
        ref={inputRef}
        style={styles.input}
        placeholder="今日愿望 / 意图 · 用一句话描述你想把剩余时间投入到哪里"
        placeholderTextColor="#A0AEC0"
        multiline
        value={state.intention}
        onChangeText={handleChange}
        maxLength={200}
        textAlignVertical="top"
      />
      <Text style={styles.counter}>{state.intention.length}/200</Text>
    </Pressable>
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
  input: {
    minHeight: 120,
    fontSize: 15,
    lineHeight: 22,
    color: '#1F2933',
  },
  counter: {
    fontSize: 12,
    color: '#8F8C9F',
    marginTop: 16,
    textAlign: 'right',
  },
});

