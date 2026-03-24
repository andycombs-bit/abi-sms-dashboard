'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Draft, SentDraft } from '@/lib/types';
import { fetchDrafts, approveDraft, dismissDraft, dismissAllDrafts, submitForReview } from '@/services/api';
import ConversationList from '@/components/ConversationList';
import ThreadView from '@/components/ThreadView';
import SentQueue from '@/components/SentQueue';

const POLL_INTERVAL = 10_000;

export default function Home() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sentDrafts, setSentDrafts] = useState<SentDraft[]>([]);
  const [dismissingAll, setDismissingAll] = useState(false);
  const prevDraftIdsRef = useRef<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const loadDrafts = useCallback(async () => {
    try {
      const data = await fetchDrafts();
      const sorted = data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const newIds = new Set(sorted.map((d) => d.id));
      if (prevDraftIdsRef.current.size > 0) {
        const hasNew = sorted.some(
          (d) => !prevDraftIdsRef.current.has(d.id)
        );
        if (hasNew && audioRef.current) {
          audioRef.current.play().catch(() => {});
        }
      }
      prevDraftIdsRef.current = newIds;

      setDrafts(sorted);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch drafts:', err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDrafts();
    const interval = setInterval(loadDrafts, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [loadDrafts]);

  // Auto-select first draft if none selected or selected was removed
  // (but not if viewing a sent draft)
  useEffect(() => {
    const viewingSent = sentDrafts.some((s) => s.draft.id === selectedId);
    if (viewingSent) return;

    if (drafts.length > 0) {
      if (!selectedId || !drafts.find((d) => d.id === selectedId)) {
        setSelectedId(drafts[0].id);
      }
    } else {
      setSelectedId(null);
    }
  }, [drafts, selectedId, sentDrafts]);

  const handleApprove = async (draftId: string, finalText: string) => {
    const draft = drafts.find((d) => d.id === draftId);
    try {
      await approveDraft(draftId, finalText);
      if (draft) {
        setSentDrafts((prev) => [
          { draft: { ...draft }, approvedAt: new Date().toISOString(), finalText },
          ...prev,
        ]);
      }
      // Move to next pending draft
      const nextDraft = drafts.find((d) => d.id !== draftId);
      setSelectedId(nextDraft?.id || null);
      await loadDrafts();
    } catch (err) {
      console.error('Failed to approve:', err);
    }
  };

  const handleDismiss = async (draftId: string) => {
    try {
      await dismissDraft(draftId);
      await loadDrafts();
    } catch (err) {
      console.error('Failed to dismiss:', err);
    }
  };

  const handleDismissAll = async () => {
    if (drafts.length === 0) return;
    setDismissingAll(true);
    try {
      const ids = drafts.map((d) => d.id);
      const { failed } = await dismissAllDrafts(ids);
      if (failed > 0) {
        console.error(`Failed to dismiss ${failed} of ${ids.length} drafts`);
      }
      setSelectedId(null);
      await loadDrafts();
    } catch (err) {
      console.error('Failed to dismiss all:', err);
    } finally {
      setDismissingAll(false);
    }
  };

  const handleFlagForReview = async (draftId: string, reviewerNotes: string) => {
    const draft = drafts.find((d) => d.id === draftId);
    if (!draft) throw new Error('Draft not found');

    const inboundMessage =
      draft.messages.filter((m) => m.sender === 'customer').pop()?.text || '';

    await submitForReview({
      customerName: draft.customerName,
      customerPhone: draft.customerPhone,
      inboundMessage,
      draftResponse: draft.draftResponse,
      internalNotes: {
        reasoning: draft.internalNotes.reasoning,
        actionItems: draft.internalNotes.actionItems,
        confidenceScore: draft.confidenceScore,
      },
      reviewerNotes,
      timestamp: new Date().toISOString(),
    });
  };

  // Determine what to show in the center panel
  const selectedPendingDraft = drafts.find((d) => d.id === selectedId) || null;
  const selectedSentEntry = sentDrafts.find((s) => s.draft.id === selectedId) || null;

  let viewDraft: Draft | null = null;
  let readOnly = false;

  if (selectedSentEntry) {
    viewDraft = { ...selectedSentEntry.draft, draftResponse: selectedSentEntry.finalText };
    readOnly = true;
  } else {
    viewDraft = selectedPendingDraft;
  }

  return (
    <div className="flex h-screen bg-white">
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />

      {/* Left sidebar - Pending */}
      <div className="flex w-96 flex-shrink-0 flex-col border-r border-gray-200">
        <div className="border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Abi SMS Drafts</h1>
            {drafts.length > 1 && (
              <button
                onClick={() => {
                  if (window.confirm(`Dismiss all ${drafts.length} pending drafts?`)) {
                    handleDismissAll();
                  }
                }}
                disabled={dismissingAll}
                className="rounded-md px-2.5 py-1 text-xs font-medium text-red-600 ring-1 ring-red-200 transition-colors hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {dismissingAll ? 'Dismissing...' : 'Dismiss All'}
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500">
            {drafts.length} pending review{drafts.length !== 1 ? 's' : ''}
          </p>
        </div>
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-teal-600" />
          </div>
        ) : (
          <ConversationList
            drafts={drafts}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        )}
      </div>

      {/* Center panel - Thread View */}
      <div className="flex flex-1 flex-col">
        {viewDraft ? (
          <ThreadView
            draft={viewDraft}
            onApprove={handleApprove}
            onDismiss={handleDismiss}
            onFlagForReview={handleFlagForReview}
            readOnly={readOnly}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center text-gray-400">
            <div className="text-center">
              <svg
                className="mx-auto mb-3 h-12 w-12 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              <p className="text-sm">
                {loading
                  ? 'Loading drafts...'
                  : 'No drafts to review — nice work!'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right sidebar - Sent Queue */}
      <div className="flex w-64 flex-shrink-0 flex-col border-l border-gray-200">
        <SentQueue
          sentDrafts={sentDrafts}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>
    </div>
  );
}
