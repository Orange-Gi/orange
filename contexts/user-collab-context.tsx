import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { telemetry } from '@/services/telemetry';
import type { AssistantResponse, RagQueryResult } from '@/services/ai/types';
import type { CollaborationMode, EnergyLevel } from '@/types/time-collab';
import type { GrowthEntry } from '@/types/time-collab';
import { useGrowthLog } from '@/hooks/useGrowthLog';
import { getJSON, setJSONThrottled } from '@/utils/storage';

type CollabPersistedState = {
  dateISO: string;
  intention: string;
  mode: CollaborationMode;
  energyLevel: EnergyLevel;
  completedActions: string[];
};

type AssistantSnapshot = {
  response?: AssistantResponse;
  rag?: RagQueryResult;
  lastUpdated?: number;
};

type UserCollabContextValue = {
  initialized: boolean;
  state: CollabPersistedState;
  entries: GrowthEntry[];
  setIntention: (value: string) => void;
  setMode: (mode: CollaborationMode) => void;
  setEnergyLevel: (level: EnergyLevel) => void;
  markActionComplete: (id: string) => void;
  clearCompletedActions: () => void;
  assistant: AssistantSnapshot;
  setAssistantSnapshot: (snapshot: AssistantSnapshot) => void;
  recordActionNote: (note: string) => void;
  recordFeedback: (rating: number, note?: string) => void;
  userId: string;
};

const STORAGE_KEY = 'user-collab-state';
const DEFAULT_USER_ID = 'local-user';

const todayISO = () => new Date().toISOString().slice(0, 10);

const defaultState: CollabPersistedState = {
  dateISO: todayISO(),
  intention: '',
  mode: 'think',
  energyLevel: 'medium',
  completedActions: [],
};

const UserCollabContext = createContext<UserCollabContextValue | undefined>(undefined);

export const UserCollabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CollabPersistedState>(defaultState);
  const [assistant, setAssistant] = useState<AssistantSnapshot>({});
  const [initialized, setInitialized] = useState(false);

  const { entries, recordAssistantResponse, recordAction, recordFeedback } = useGrowthLog(
    state.dateISO,
  );

  useEffect(() => {
    const load = async () => {
      const stored = await getJSON<CollabPersistedState>(STORAGE_KEY);
      if (stored) {
        const today = todayISO();
        if (stored.dateISO === today) {
          setState(stored);
        } else {
          setState({ ...defaultState, dateISO: today });
        }
      }
      setInitialized(true);
    };

    void load();
  }, []);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    const today = todayISO();
    if (state.dateISO !== today) {
      setState({ ...defaultState, dateISO: today });
      setAssistant({});
    }
  }, [initialized, state.dateISO]);

  const persist = useCallback(
    (next: CollabPersistedState) => {
      setState(next);
      setJSONThrottled(STORAGE_KEY, next, 800);
    },
    [setState],
  );

  const setIntention = useCallback(
    (value: string) => {
      persist({ ...state, intention: value });
    },
    [persist, state],
  );

  const setMode = useCallback(
    (mode: CollaborationMode) => {
      if (mode === state.mode) {
        return;
      }
      telemetry.track('mode.switch', { from: state.mode, to: mode, energyLevel: state.energyLevel });
      persist({ ...state, mode, completedActions: [] });
      setAssistant((prev) => ({ ...prev, response: undefined }));
    },
    [persist, state],
  );

  const setEnergyLevel = useCallback(
    (level: EnergyLevel) => {
      if (level === state.energyLevel) {
        return;
      }
      persist({ ...state, energyLevel: level });
    },
    [persist, state],
  );

  const markActionComplete = useCallback(
    (id: string) => {
      if (state.completedActions.includes(id)) {
        return;
      }
      const next = { ...state, completedActions: [...state.completedActions, id] };
      persist(next);
      recordAction(id);
    },
    [persist, recordAction, state],
  );

  const clearCompletedActions = useCallback(() => {
    if (state.completedActions.length === 0) {
      return;
    }
    persist({ ...state, completedActions: [] });
  }, [persist, state]);

  const setAssistantSnapshot = useCallback(
    (snapshot: AssistantSnapshot) => {
      setAssistant(snapshot);
      if (snapshot.response) {
        recordAssistantResponse(
          state.mode,
          state.intention,
          state.energyLevel,
          snapshot.response.rawText ?? snapshot.response.summary,
        );
      }
    },
    [recordAssistantResponse, state.energyLevel, state.intention, state.mode],
  );

  const recordActionNote = useCallback(
    (note: string) => {
      recordAction(note);
    },
    [recordAction],
  );

  const value = useMemo<UserCollabContextValue>(
    () => ({
      initialized,
      state,
      entries,
      setIntention,
      setMode,
      setEnergyLevel,
      markActionComplete,
      clearCompletedActions,
      assistant,
      setAssistantSnapshot,
      recordActionNote,
      recordFeedback,
      userId: DEFAULT_USER_ID,
    }),
    [
      assistant,
      clearCompletedActions,
      entries,
      initialized,
      markActionComplete,
      recordActionNote,
      recordFeedback,
      setEnergyLevel,
      setIntention,
      setMode,
      state,
    ],
  );

  return <UserCollabContext.Provider value={value}>{children}</UserCollabContext.Provider>;
};

export function useUserCollabContext() {
  const context = useContext(UserCollabContext);
  if (!context) {
    throw new Error('useUserCollabContext must be used within UserCollabProvider');
  }
  return context;
}

