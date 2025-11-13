import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { fetchAssistant, runAssistantWithRag } from '@/services/ai/assist';
import { queryRag } from '@/services/ai/rag-client';
import type {
  AssistantResponse,
  RagQueryPayload,
  RagQueryResult,
} from '@/services/ai/types';
import type { CollaborationMode, EnergyLevel, GrowthEntry } from '@/types/time-collab';

type AssistantHookParams = {
  userId: string;
  dateISO: string;
  mode: CollaborationMode;
  intention: string;
  energyLevel: EnergyLevel;
  growthEntries: GrowthEntry[];
  auto?: boolean;
};

type AssistantHookState = {
  rag?: RagQueryResult;
  response?: AssistantResponse;
  loading: boolean;
  error?: string;
  lastUpdated?: number;
};

const buildRagPayload = (params: AssistantHookParams): RagQueryPayload => ({
  userId: params.userId,
  dateISO: params.dateISO,
  mode: params.mode,
  intentionSummary: params.intention,
  recentEntries: params.growthEntries.slice(-10),
});

export function useAssistant(params: AssistantHookParams) {
  const [state, setState] = useState<AssistantHookState>({ loading: false });
  const latestParams = useRef(params);
  latestParams.current = params;

  const key = useMemo(
    () => `${params.dateISO}:${params.mode}:${params.energyLevel}:${params.intention}`,
    [params.dateISO, params.mode, params.energyLevel, params.intention],
  );

  const lastRunKey = useRef<string>();

  const run = useCallback(
    async (force = false) => {
      if (!latestParams.current.intention.trim()) {
        setState((prev) => ({ ...prev, loading: false, error: undefined }));
        return;
      }

      if (!force && lastRunKey.current === key) {
        return;
      }

      setState((prev) => ({ ...prev, loading: true, error: undefined }));

      const ragPayload = buildRagPayload(latestParams.current);

      try {
        const rag = await queryRag(ragPayload);
        const response = await fetchAssistant({
          userId: latestParams.current.userId,
          dateISO: latestParams.current.dateISO,
          mode: latestParams.current.mode,
          intention: latestParams.current.intention,
          energyLevel: latestParams.current.energyLevel,
          contexts: rag.contexts,
          growthEntries: latestParams.current.growthEntries.slice(-10),
        });

        lastRunKey.current = key;
        setState({
          rag,
          response,
          loading: false,
          error: undefined,
          lastUpdated: Date.now(),
        });
      } catch (error) {
        console.warn('[useAssistant] request failed', error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : '请求助手失败',
        }));
      }
    },
    [key],
  );

  useEffect(() => {
    if (params.auto) {
      void run();
    }
  }, [params.auto, run]);

  const refreshWithRag = useCallback(async () => {
    const ragPayload = buildRagPayload(latestParams.current);
    setState((prev) => ({ ...prev, loading: true, error: undefined }));

    try {
      const { rag, assistant } = await runAssistantWithRag(ragPayload, (ragResult) => ({
        userId: latestParams.current.userId,
        dateISO: latestParams.current.dateISO,
        mode: latestParams.current.mode,
        intention: latestParams.current.intention,
        energyLevel: latestParams.current.energyLevel,
        contexts: ragResult.contexts,
        growthEntries: latestParams.current.growthEntries.slice(-10),
      }));

      lastRunKey.current = key;
      setState({
        rag,
        response: assistant,
        loading: false,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '请求助手失败',
      }));
    }
  }, [key]);

  return {
    ...state,
    run,
    refreshWithRag,
  };
}

