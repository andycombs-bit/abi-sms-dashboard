'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Draft } from '@/lib/types';
import { fetchDrafts, approveDraft, dismissDraft } from '@/services/api';
import ConversationList from '@/components/ConversationList';
import ThreadView from '@/components/ThreadView';

const POLL_INTERVAL = 10_000;

export default function Home() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const prevDraftIdsRef = useRef<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const loadDrafts = useCallback(async () => {
    try {
      const data = await fetchDrafts();
      const sorted = data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Check for new drafts and play sound
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
  useEffect(() => {
    if (drafts.length > 0) {
      if (!selectedId || !drafts.find((d) => d.id === selectedId)) {
        setSelectedId(drafts[0].id);
      }
    } else {
      setSelectedId(null);
    }
  }, [drafts, selectedId]);

  const handleApprove = async (draftId: string, finalText: string) => {
    try {
      await approveDraft(draftId, finalText);
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

  const selectedDraft = drafts.find((d) => d.id === selectedId) || null;

  return (
    <div className="flex h-screen bg-white">
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />

      {/* Left sidebar */}
      <div className="flex w-96 flex-shrink-0 flex-col border-r border-gray-200">
        <div className="border-b border-gray-200 px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Abi SMS Drafts</h1>
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

      {/* Right panel */}
      <div className="flex flex-1 flex-col">
        {selectedDraft ? (
          <ThreadView
            draft={selectedDraft}
            onApprove={handleApprove}
            onDismiss={handleDismiss}
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
    </div>
  );
}
