import type { CollaborationMode, EnergyLevel, GrowthEntry } from '@/types/time-collab';

export type RagContext = {
  id: string;
  heading: string;
  content: string;
  relevance: number;
};

export type RagQueryPayload = {
  userId: string;
  dateISO: string;
  mode: CollaborationMode;
  intentionSummary: string;
  recentEntries: GrowthEntry[];
};

export type RagQueryResult = {
  contexts: RagContext[];
  promptHints: string[];
};

export type AssistantRequestPayload = {
  userId: string;
  dateISO: string;
  mode: CollaborationMode;
  intention: string;
  energyLevel: EnergyLevel;
  contexts: RagContext[];
  growthEntries: GrowthEntry[];
};

export type AssistantSuggestion = {
  title: string;
  detail: string;
};

export type AssistantAction = {
  id: string;
  label: string;
  durationMinutes?: number;
};

export type AssistantResponse = {
  summary: string;
  suggestions: AssistantSuggestion[];
  actions: AssistantAction[];
  encouragement?: string;
  rawText?: string;
};

