import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { telemetry } from '@/services/telemetry';
import type { GrowthEntry } from '@/types/time-collab';
import { getJSON, setJSONThrottled } from '@/utils/storage';

const STORAGE_KEY = 'growth-log';

type GrowthLogState = Record<string, GrowthEntry[]>;

export function useGrowthLog(dateISO: string) {
  const [log, setLog] = useState<GrowthLogState>({});
  const loadingRef = useRef(false);

  useEffect(() => {
    if (loadingRef.current) {
      return;
    }

    loadingRef.current = true;
    void load();
  }, []);

  const load = async () => {
    const stored = await getJSON<GrowthLogState>(STORAGE_KEY);
    if (stored) {
      setLog(stored);
    }
  };

  const entries = useMemo(() => log[dateISO] ?? [], [dateISO, log]);

  const commit = useCallback(
    (next: GrowthLogState) => {
      setLog(next);
      setJSONThrottled(STORAGE_KEY, next, 1500);
    },
    [setLog],
  );

  const append = useCallback(
    (entry: GrowthEntry) => {
      const next: GrowthLogState = { ...log, [entry.date]: [...(log[entry.date] ?? []), entry] };
      commit(next);
    },
    [commit, log],
  );

  const updateLast = useCallback(
    (updater: (entry: GrowthEntry) => GrowthEntry) => {
      const current = log[dateISO] ?? [];
      if (current.length === 0) {
        return;
      }

      const updatedEntry = updater(current[current.length - 1]);
      const nextEntries = [...current.slice(0, -1), updatedEntry];

      const next: GrowthLogState = {
        ...log,
        [dateISO]: nextEntries,
      };
      commit(next);
    },
    [commit, dateISO, log],
  );

  const recordAssistantResponse = useCallback(
    (mode: GrowthEntry['mode'], intention: string, energyLevel: GrowthEntry['energyLevel'], aiResponse: string) => {
      const entry: GrowthEntry = {
        date: dateISO,
        mode,
        intention,
        energyLevel,
        aiResponse,
      };
      append(entry);
    },
    [append, dateISO],
  );

  const recordAction = useCallback(
    (action: string) => {
      updateLast((entry) => ({
        ...entry,
        userAction: action,
      }));
      telemetry.track('assistant.action', { action });
    },
    [updateLast],
  );

  const recordFeedback = useCallback(
    (rating: number, note?: string) => {
      updateLast((entry) => ({
        ...entry,
        feedback: { rating, note },
      }));
      telemetry.track('feedback.submit', { rating, note });
    },
    [updateLast],
  );

  return {
    entries,
    recordAssistantResponse,
    recordAction,
    recordFeedback,
    reload: load,
  };
}

