import { Draft } from '@/lib/types';
import { mockDrafts } from '@/lib/mockData';

const WEBHOOK_URL = process.env.NEXT_PUBLIC_WEBHOOK_URL || '';
const REVIEW_WEBHOOK_URL = process.env.NEXT_PUBLIC_REVIEW_WEBHOOK_URL || '';
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false';

// In-memory store for mock mode so dismissals persist during session
let mockStore: Draft[] | null = null;

function getMockStore(): Draft[] {
  if (!mockStore) {
    mockStore = JSON.parse(JSON.stringify(mockDrafts)) as Draft[];
  }
  return mockStore!;
}

export async function fetchDrafts(): Promise<Draft[]> {
  if (USE_MOCK) {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 300));
    return getMockStore().filter((d) => d.status === 'pending');
  }

  // Read directly from Google Sheets via our API route (replaces n8n polling)
  const res = await fetch('/api/drafts', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch drafts');
  return res.json();
}

export async function approveDraft(
  draftId: string,
  finalText: string
): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    const store = getMockStore();
    const draft = store.find((d) => d.id === draftId);
    if (draft) draft.status = 'approved';
    return;
  }

  const res = await fetch(`${WEBHOOK_URL}/sms-approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ draftId, finalText }),
  });
  if (!res.ok) throw new Error('Failed to approve draft');
}

export async function dismissDraft(draftId: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    const store = getMockStore();
    const draft = store.find((d) => d.id === draftId);
    if (draft) draft.status = 'dismissed';
    return;
  }

  const res = await fetch(`${WEBHOOK_URL}/sms-dismiss`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ draftId }),
  });
  if (!res.ok) throw new Error('Failed to dismiss draft');
}

export async function dismissAllDrafts(draftIds: string[]): Promise<{ succeeded: number; failed: number }> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    const store = getMockStore();
    for (const id of draftIds) {
      const draft = store.find((d) => d.id === id);
      if (draft) draft.status = 'dismissed';
    }
    return { succeeded: draftIds.length, failed: 0 };
  }

  const results = await Promise.allSettled(
    draftIds.map((draftId) =>
      fetch(`${WEBHOOK_URL}/sms-dismiss`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftId }),
      }).then((res) => {
        if (!res.ok) throw new Error(`Failed for ${draftId}`);
      })
    )
  );

  const succeeded = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;
  return { succeeded, failed };
}

export interface ThreadMessage {
  direction: 'incoming' | 'outgoing';
  text: string;
  timestamp: string;
}

export async function fetchThread(phone: string): Promise<ThreadMessage[]> {
  if (USE_MOCK) {
    return [];
  }

  const res = await fetch(`/api/thread?phone=${encodeURIComponent(phone)}`, {
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json();
}

export async function submitForReview(data: {
  customerName: string;
  customerPhone: string;
  inboundMessage: string;
  draftResponse: string;
  internalNotes: {
    reasoning: string;
    actionItems: string[];
    confidenceScore: number;
  };
  reviewerNotes: string;
  timestamp: string;
}): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    console.log('Review submitted (mock):', data);
    return;
  }

  const res = await fetch(REVIEW_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to submit review');
}
