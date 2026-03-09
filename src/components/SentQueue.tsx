'use client';

import { SentDraft } from '@/lib/types';
import { formatTimestamp, truncate } from '@/lib/utils';

interface SentQueueProps {
  sentDrafts: SentDraft[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function SentQueue({
  sentDrafts,
  selectedId,
  onSelect,
}: SentQueueProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 px-4 py-4">
        <h2 className="text-sm font-bold text-gray-900">Sent</h2>
        <p className="text-xs text-gray-500">
          {sentDrafts.length} approved
        </p>
      </div>
      {sentDrafts.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-4 text-gray-400">
          <p className="text-center text-xs">No sent messages yet</p>
        </div>
      ) : (
        <div className="flex flex-col overflow-y-auto">
          {sentDrafts.map((sent) => (
            <button
              key={sent.draft.id}
              onClick={() => onSelect(sent.draft.id)}
              className={`flex w-full items-start border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                selectedId === sent.draft.id
                  ? 'bg-green-50'
                  : ''
              }`}
              style={{ borderLeft: '3px solid rgb(74 222 128)' }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-gray-900">
                    {sent.draft.customerName}
                  </span>
                  <span className="flex-shrink-0 text-xs text-gray-400">
                    {formatTimestamp(sent.approvedAt)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{sent.draft.customerPhone}</p>
                <p className="mt-0.5 text-sm text-gray-600">
                  {truncate(sent.finalText, 50)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
