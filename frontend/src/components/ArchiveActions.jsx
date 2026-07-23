import { useState } from 'react';
import { getCurrentUser } from '../api.js';

// Drop into any detail view: shows Archive/Unarchive, and a Delete button
// (admin-only, with a confirmation step) for permanently removing a record.
export default function ArchiveActions({ isArchived, onArchive, onUnarchive, onDelete }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const isAdmin = getCurrentUser()?.role === 'admin';

  return (
    <div className="flex items-center gap-2 mt-4">
      {isArchived ? (
        <button
          onClick={onUnarchive}
          className="text-sm font-medium px-3 py-2 rounded-sm border border-ink/20 hover:bg-ink/5"
        >
          Unarchive
        </button>
      ) : (
        <button
          onClick={onArchive}
          className="text-sm font-medium px-3 py-2 rounded-sm border border-ink/20 hover:bg-ink/5"
        >
          Archive
        </button>
      )}

      {isAdmin && !confirmingDelete && (
        <button
          onClick={() => setConfirmingDelete(true)}
          className="text-sm font-medium px-3 py-2 rounded-sm border border-status-rejected/30 text-status-rejected hover:bg-status-rejected/5"
        >
          Delete permanently
        </button>
      )}

      {isAdmin && confirmingDelete && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-status-rejected">Delete forever? This cannot be undone.</span>
          <button
            onClick={onDelete}
            className="text-sm font-medium px-3 py-2 rounded-sm bg-status-rejected text-white hover:opacity-90"
          >
            Yes, delete
          </button>
          <button
            onClick={() => setConfirmingDelete(false)}
            className="text-sm font-medium px-3 py-2 rounded-sm border border-ink/20 hover:bg-ink/5"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
