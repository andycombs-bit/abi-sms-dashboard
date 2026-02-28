import { Draft } from '@/lib/types';
import { mockDrafts } from '@/lib/mockData';

const WEBHOOK_URL = process.env.NEXT_PUBLIC_WEBHOOK_URL || '';
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

  const res = await fetch(`${WEBHOOK_URL}/sms-drafts`, { cache: 'no-store' });
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
