'use client';

import { useState } from 'react';
import { Draft } from '@/lib/types';
import { formatTimestamp } from '@/lib/utils';
import ActionButtons from './ActionButtons';

interface ThreadViewProps {
  draft: Draft;
  onApprove: (draftId: string, finalText: string) => void;
  onDismiss: (draftId: string) => void;
}

export default function ThreadView({
  draft,
  onApprove,
  onDismiss,
}: ThreadViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(draft.draftResponse);
  const [notesOpen, setNotesOpen] = useState(false);

  // Reset edit state when draft changes
  const [prevDraftId, setPrevDraftId] = useState(draft.id);
  if (draft.id !== prevDraftId) {
    setPrevDraftId(draft.id);
    setIsEditing(false);
    setEditText(draft.draftResponse);
    setNotesOpen(false);
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {draft.customerName}
        </h2>
        <p className="text-sm text-gray-500">{draft.customerPhone}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-4">
        <div className="mx-auto max-w-2xl space-y-4">
          {/* Customer messages */}
          {draft.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === 'customer' ? 'justify-start' : 'justify-end'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                  msg.sender === 'customer'
                    ? 'rounded-bl-md bg-white text-gray-800 shadow-sm'
                    : 'rounded-br-md bg-teal-500 text-white'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p
                  className={`mt-1 text-xs ${
                    msg.sender === 'customer'
                      ? 'text-gray-400'
                      : 'text-teal-100'
                  }`}
                >
                  {formatTimestamp(msg.timestamp)}
                </p>
              </div>
            </div>
          ))}

          {/* Abi's draft response */}
          <div className="flex justify-end">
            <div className="max-w-[80%] rounded-2xl rounded-br-md bg-teal-50 px-4 py-2.5 shadow-sm ring-1 ring-teal-200">
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded bg-teal-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Draft
                </span>
                <span className="text-xs text-teal-600">Abi</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-800">
                {draft.draftResponse}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {formatTimestamp(draft.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Internal Notes */}
        <div className="mx-auto mt-6 max-w-2xl">
          <button
            onClick={() => setNotesOpen(!notesOpen)}
            className="flex w-full items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-left text-sm font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
          >
            <svg
              className={`h-4 w-4 transition-transform ${
                notesOpen ? 'rotate-90' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            Internal Notes
            <span className="ml-auto rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
              {draft.confidenceScore}% confidence
            </span>
          </button>
          {notesOpen && (
            <div className="mt-2 rounded-lg bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-700">
                {draft.internalNotes.reasoning}
              </p>
              {draft.internalNotes.actionItems.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Action Items
                  </p>
                  <ul className="mt-1 space-y-1">
                    {draft.internalNotes.actionItems.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-600"
                      >
                        <span className="mt-0.5 text-teal-500">&#8226;</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action area */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        {!isEditing ? (
          <ActionButtons
            onApprove={() => onApprove(draft.id, draft.draftResponse)}
            onEdit={() => {
              setIsEditing(true);
              setEditText(draft.draftResponse);
            }}
            onDismiss={() => onDismiss(draft.id)}
          />
        ) : (
          <div className="space-y-3">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              rows={4}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onApprove(draft.id, editText);
                  setIsEditing(false);
                }}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700"
              >
                Send Edited
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditText(draft.draftResponse);
                }}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
