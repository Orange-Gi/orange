import { mockAssist } from './mock-data';
import { queryRag } from './rag-client';
import type {
  AssistantRequestPayload,
  AssistantResponse,
  RagQueryPayload,
  RagQueryResult,
} from './types';

const API_BASE = process.env.EXPO_PUBLIC_API_URL;
const USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS !== 'false';

export async function fetchAssistant(
  payload: AssistantRequestPayload,
): Promise<AssistantResponse> {
  if (!API_BASE || USE_MOCKS) {
    return mockAssist(payload);
  }

  try {
    const response = await fetch(`${API_BASE}/assist/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Assistant request failed with status ${response.status}`);
    }

    return (await response.json()) as AssistantResponse;
  } catch (error) {
    console.warn('[assist] Falling back to mock response due to error:', error);
    return mockAssist(payload);
  }
}

export async function runAssistantWithRag(
  ragPayload: RagQueryPayload,
  buildAssistantPayload: (rag: RagQueryResult) => AssistantRequestPayload,
): Promise<{ rag: RagQueryResult; assistant: AssistantResponse }> {
  const rag = await queryRag(ragPayload);
  const assistantPayload = buildAssistantPayload(rag);
  const assistant = await fetchAssistant(assistantPayload);

  return { rag, assistant };
}

