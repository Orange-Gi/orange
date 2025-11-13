import { getJSON, setJSONThrottled } from '@/utils/storage';

const API_BASE = process.env.EXPO_PUBLIC_API_URL;
const USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS !== 'false';
const STORAGE_KEY = 'telemetry-queue';

type RetryPolicy = {
  attempts: number;
  nextDelay: number;
};

export type TelemetryEventName = 'mode.switch' | 'assistant.action' | 'feedback.submit';

export type TelemetryEvent<TPayload = Record<string, unknown>> = {
  id: string;
  name: TelemetryEventName;
  payload: TPayload;
  timestamp: number;
};

class TelemetryClient {
  private queue: TelemetryEvent[] = [];
  private flushing = false;
  private retry: RetryPolicy = { attempts: 0, nextDelay: 1000 };

  constructor() {
    void this.restore();
  }

  track<TPayload extends Record<string, unknown>>(name: TelemetryEventName, payload: TPayload) {
    const event: TelemetryEvent<TPayload> = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      name,
      payload,
      timestamp: Date.now(),
    };

    this.queue.push(event);
    setJSONThrottled(STORAGE_KEY, this.queue);

    if (API_BASE && USE_MOCKS === false) {
      void this.flush();
    }
  }

  async flush() {
    if (this.flushing || this.queue.length === 0) {
      return;
    }

    if (!API_BASE || USE_MOCKS) {
      // mock 情况下直接清空队列。
      this.queue = [];
      setJSONThrottled(STORAGE_KEY, this.queue);
      return;
    }

    this.flushing = true;

    try {
      const response = await fetch(`${API_BASE}/telemetry/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events: this.queue }),
      });

      if (!response.ok) {
        throw new Error(`Telemetry flush failed with status ${response.status}`);
      }

      this.queue = [];
      setJSONThrottled(STORAGE_KEY, this.queue);
      this.retry = { attempts: 0, nextDelay: 1000 };
    } catch (error) {
      console.warn('[telemetry] flush failed, scheduling retry', error);
      this.retry.attempts += 1;
      this.retry.nextDelay = Math.min(this.retry.nextDelay * 2, 60_000);

      setTimeout(() => {
        this.flushing = false;
        void this.flush();
      }, this.retry.nextDelay);

      return;
    }

    this.flushing = false;
  }

  private async restore() {
    const stored = await getJSON<TelemetryEvent[]>(STORAGE_KEY);
    if (stored?.length) {
      this.queue = stored;
      if (API_BASE && USE_MOCKS === false) {
        void this.flush();
      }
    }
  }
}

export const telemetry = new TelemetryClient();

