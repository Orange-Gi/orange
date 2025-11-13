import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ModalScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [code, setCode] = useState('');

  const handleLogin = () => {
    // 这里暂未接入真实鉴权，模拟登录后直接返回主页。
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>登录同行</Text>
        <Text style={styles.subtitle}>使用邮箱或手机号接收一次性验证码。</Text>

        <View style={styles.field}>
          <Text style={styles.label}>邮箱 / 手机号</Text>
          <TextInput
            style={styles.input}
            value={identifier}
            onChangeText={setIdentifier}
            placeholder="your@email.com"
            placeholderTextColor="rgba(74, 93, 83, 0.4)"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>验证码</Text>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder="输入 6 位验证码"
            placeholderTextColor="rgba(74, 93, 83, 0.4)"
            keyboardType="number-pad"
          />
        </View>

        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.9} onPress={handleLogin}>
          <Text style={styles.primaryButtonText}>登录</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.8}
          onPress={() => router.dismiss()}>
          <Text style={styles.secondaryButtonText}>取消</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2E9D8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4A5D53',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6E7F76',
    marginBottom: 24,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    color: '#4A5D53',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F6F1E6',
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#4A5D53',
  },
  primaryButton: {
    backgroundColor: '#4A5D53',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 12,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: '#6E7F76',
  },
});
