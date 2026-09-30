import axios from 'axios';
import { apiClient } from './client';
import type { ContactErrors, ContactPayload } from '../types/contact';

export type ContactResult =
  | { ok: true }
  | {
      ok: false;
      kind: 'validation' | 'rate_limit' | 'network' | 'server';
      fieldErrors?: ContactErrors;
      message: string;
    };

export async function sendContact(payload: ContactPayload): Promise<ContactResult> {
  try {
    await apiClient.post('/api/public/contact', payload, { timeout: 30_000 });
    return { ok: true };
  } catch (error) {
    if (!axios.isAxiosError(error)) {
      return { ok: false, kind: 'network', message: 'Unable to reach the server.' };
    }

    const status = error.response?.status;
    const responseData = error.response?.data as { message?: string; errors?: Record<string, string> } | undefined;

    if (status === 400) {
      const fieldErrors: ContactErrors = {};
      for (const field of ['name', 'email', 'subject', 'message'] as const) {
        if (responseData?.errors?.[field]) fieldErrors[field] = responseData.errors[field];
      }
      return {
        ok: false,
        kind: 'validation',
        fieldErrors,
        message: responseData?.message || 'Please check the fields and try again.',
      };
    }

    if (status === 429) {
      return { ok: false, kind: 'rate_limit', message: responseData?.message || 'Too many messages. Please try again later.' };
    }

    if (status) {
      return { ok: false, kind: 'server', message: responseData?.message || 'The server could not send your message.' };
    }

    return { ok: false, kind: 'network', message: 'Unable to reach the server.' };
  }
}

export function warmUpServer(): void {
  void apiClient.get('/api/health', { timeout: 30_000 }).catch(() => undefined);
}