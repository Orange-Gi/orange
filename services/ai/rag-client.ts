import { mockRagQuery } from './mock-data';
import type { RagQueryPayload, RagQueryResult } from './types';

const API_BASE = process.env.EXPO_PUBLIC_API_URL;
const USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS !== 'false';

export async function queryRag(payload: RagQueryPayload): Promise<RagQueryResult> {
  if (!API_BASE || USE_MOCKS) {
    return mockRagQuery(payload);
  }

  try {
    const response = await fetch(`${API_BASE}/rag/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`RAG request failed with status ${response.status}`);
    }

    return (await response.json()) as RagQueryResult;
  } catch (error) {
    console.warn('[rag-client] Falling back to mock response due to error:', error);
    return mockRagQuery(payload);
  }
}

