'use client';

import { Draft } from '@/lib/types';
import { formatTimestamp, truncate, confidenceColor } from '@/lib/utils';

interface ConversationListProps {
  drafts: Draft[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function ConversationList({
  drafts,
  selectedId,
  onSelect,
}: ConversationListProps) {
  if (drafts.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-gray-400">
        <p className="text-center text-sm">No pending drafts</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-y-auto">
      {drafts.map((draft) => (
        <button
          key={draft.id}
          onClick={() => onSelect(draft.id)}
          className={`flex w-full items-start gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
            selectedId === draft.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
          }`}
        >
          <div
            className={`mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full ${confidenceColor(
              draft.confidenceScore
            )}`}
            title={`Confidence: ${draft.confidenceScore}%`}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-sm font-semibold text-gray-900">
                {draft.customerName}
              </span>
              <span className="flex-shrink-0 text-xs text-gray-400">
                {formatTimestamp(draft.createdAt)}
              </span>
            </div>
            <p className="text-xs text-gray-500">{draft.customerPhone}</p>
            <p className="mt-0.5 text-sm text-gray-600">
              {truncate(draft.messages[draft.messages.length - 1].text, 80)}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
