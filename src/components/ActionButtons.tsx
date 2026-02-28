'use client';

interface ActionButtonsProps {
  onApprove: () => void;
  onEdit: () => void;
  onDismiss: () => void;
}

export default function ActionButtons({
  onApprove,
  onEdit,
  onDismiss,
}: ActionButtonsProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onApprove}
        className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700"
      >
        <span>&#10003;</span>
        Approve &amp; Send
      </button>
      <button
        onClick={onEdit}
        className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
      >
        <span>&#9998;</span>
        Edit
      </button>
      <button
        onClick={onDismiss}
        className="flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-medium text-red-600 ring-1 ring-gray-200 transition-colors hover:bg-red-50"
      >
        <span>&#10005;</span>
        Dismiss
      </button>
    </div>
  );
}
