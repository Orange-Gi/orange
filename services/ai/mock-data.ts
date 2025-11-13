import { MODE_METADATA } from '@/types/time-collab';

import type {
  AssistantRequestPayload,
  AssistantResponse,
  RagContext,
  RagQueryPayload,
  RagQueryResult,
} from './types';

const MOCK_CONTEXTS: RagContext[] = [
  {
    id: 'context-1',
    heading: '昨日复盘',
    content: '昨天在 16:00-18:00 的深度工作阶段成功完成了初稿，建议今天继续推进迭代。',
    relevance: 0.9,
  },
  {
    id: 'context-2',
    heading: '疲劳阈值',
    content: '用户在 21:00 后注意力会显著下降，建议提前安排收尾与放松。',
    relevance: 0.82,
  },
];

const MOCK_PROMPT_HINTS = [
  '偏好分段列出行动建议，每条建议不超过两句话。',
  '当能量状态低时，先给出恢复建议再给出任务安排。',
];

export async function mockRagQuery(_payload: RagQueryPayload): Promise<RagQueryResult> {
  await delay(220);
  return {
    contexts: MOCK_CONTEXTS,
    promptHints: MOCK_PROMPT_HINTS,
  };
}

const MOCK_RESPONSES: Record<AssistantRequestPayload['mode'], AssistantResponse> = {
  think: {
    summary: '我们聚焦于将大目标拆解成清晰的三步行动。',
    suggestions: [
      {
        title: '明确当日突破口',
        detail: '复盘昨天的迭代成果，圈出「尚未解决的核心问题」。',
      },
      {
        title: '画出阻碍地图',
        detail: '用 5 分钟列出当前卡点，给每一个标记优先级与影响度。',
      },
      {
        title: '安排试验窗口',
        detail: '在剩余高能时段预留 30 分钟用于快速验证假设。',
      },
    ],
    actions: [
      { id: 'journal', label: '记录三条洞见', durationMinutes: 10 },
      { id: 'canvas', label: '产出阻碍地图', durationMinutes: 15 },
      { id: 'sync', label: '安排一次同步', durationMinutes: 5 },
    ],
    encouragement: '抽丝剥茧的过程也在训练洞察力，我们一起保持好奇心。',
  },
  fast: {
    summary: '现在进入执行隧道，保持轻量反馈与专注分段。',
    suggestions: [
      {
        title: '设定倒计时',
        detail: '开启 30 分钟计时器，告知我每个阶段的状态，避免超时拖延。',
      },
      {
        title: '屏蔽干扰',
        detail: '关闭通知并把手机放到够不到的地方，离开座位需要按「暂停」键。',
      },
      {
        title: '定义完成标准',
        detail: '写下这段时间完成的最小可交付成果，具体且可衡量。',
      },
    ],
    actions: [
      { id: 'timer', label: '开启 30 分钟专注', durationMinutes: 30 },
      { id: 'checkpoint', label: '中场状态汇报', durationMinutes: 2 },
      { id: 'wrap', label: '完成后打卡', durationMinutes: 3 },
    ],
    encouragement: '你已经准备好了，让我们一起守住这段黄金专注力。',
  },
  rest: {
    summary: '先稳住身心，保持节奏，再为下一段专注蓄力。',
    suggestions: [
      {
        title: '觉察身体感受',
        detail: '闭上眼睛扫描身体，从头顶到脚尖感受紧绷与放松。',
      },
      {
        title: '补给能量',
        detail: '喝一杯温水或者做一组轻松拉伸，唤醒身体循环。',
      },
      {
        title: '做下一步承诺',
        detail: '休息结束后要做的第一件事写下来，降低起步阻力。',
      },
    ],
    actions: [
      { id: 'breath', label: '3 分钟呼吸练习', durationMinutes: 3 },
      { id: 'stretch', label: '肩颈拉伸', durationMinutes: 5 },
      { id: 'note', label: '写下下个起点', durationMinutes: 2 },
    ],
    encouragement: '允许自己慢下来也是一种勇气，回来时我们照样步稳心定。',
  },
};

export async function mockAssist(payload: AssistantRequestPayload): Promise<AssistantResponse> {
  await delay(420);
  const base = MOCK_RESPONSES[payload.mode];

  return {
    ...base,
    rawText: [
      `【${MODE_METADATA[payload.mode].title}模式】`,
      base.summary,
      ...base.suggestions.map((item, index) => `${index + 1}. ${item.title}：${item.detail}`),
      base.encouragement ?? '',
    ]
      .filter(Boolean)
      .join('\n'),
  };
}

function delay(duration: number) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

