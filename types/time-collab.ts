export type CollaborationMode = 'think' | 'fast' | 'rest';

export type EnergyLevel = 'high' | 'medium' | 'low';

export type GrowthEntry = {
  date: string;
  mode: CollaborationMode;
  intention: string;
  energyLevel: EnergyLevel;
  aiResponse: string;
  userAction?: string;
  feedback?: { rating: number; note?: string };
};

export const MODE_METADATA: Record<
  CollaborationMode,
  { title: string; subtitle: string; tone: 'focus' | 'discipline' | 'rest'; color: string }
> = {
  think: {
    title: '思考',
    subtitle: '拆解目标、识别阻碍',
    tone: 'focus',
    color: '#3B5BDB',
  },
  fast: {
    title: '斋戒',
    subtitle: '屏蔽干扰、执行到底',
    tone: 'discipline',
    color: '#E8590C',
  },
  rest: {
    title: '等待',
    subtitle: '适度休息、恢复能量',
    tone: 'rest',
    color: '#2F9E44',
  },
};

