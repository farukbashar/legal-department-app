import { useEffect, useState } from 'react';
import { api } from '../api.js';
import OpinionStatusBadge from './OpinionStatusBadge.jsx';
import ArchiveActions from './ArchiveActions.jsx';

export default function OpinionRequestDetail({ requestId, onBack, onChanged }) {
  const [request, setRequest] = useState(null);
  const [opinion, setOpinion] = useState(null);
  const [error, setError] = useState('');
  const [officerId, setOfficerId] = useState('');
  const [draftText, setDraftText] = useState('');
  const [reviewComments, setReviewComments] = useState('');

  const load = async () => {
    try {
      const r = await api.getOpinionRequest(requestId);
      setRequest(r);
      if (r.opinion) {
        const o = await api.getOpinion(r.opinion.id);
        setOpinion(o);
        setDraftText(o.content || '');
      } else {
        setOpinion(null);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  const handleAction = async (fn) => {
    setError('');
    try {
      await fn();
      await load();
      onChanged?.();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!request) {
    return error ? <p className="text-status-rejected text-sm">{error}</p> : <p className="text-ink-light/60 text-sm">Loading…</p>;
  }

  return (
    <div className="max-w-3xl">
      <button onClick={onBack} className="text-xs font-mono uppercase tracking-wide text-ink-light/70 hover:text-ink mb-4">
        ← Back to requests
      </button>

      {error && (
        <p className="text-sm text-status-rejected bg-status-rejected/10 border border-status-rejected/30 rounded-sm px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <div className="bg-white border border-ink/15 rounded-sm p-6 mb-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-brass mb-1">
              Request · #{String(request.id).padStart(4, '0')} · {request.priority}
            </p>
            <h1 className="text-2xl font-serif font-semibold text-ink">{request.subject}</h1>
          </div>
          <OpinionStatusBadge status={request.status} />
        </div>
        <p className="text-sm text-ink-light mt-2">{request.description}</p>
        <p className="text-xs text-ink-light/60 mt-3">
          Requested by {request.requester?.fullName || '—'} · Assigned to {request.assignedTo?.fullName || 'unassigned'}
        </p>

        {!request.assignedToId && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAction(() => api.assignOfficer(requestId, Number(officerId)));
            }}
            className="flex gap-2 mt-4"
          >
            <input
              value={officerId}
              onChange={(e) => setOfficerId(e.target.value)}
              placeholder="Officer user ID"
              className="input max-w-[160px]"
            />
            <button type="submit" className="text-sm font-medium px-3 py-2 rounded-sm border border-ink/20 hover:bg-ink/5 whitespace-nowrap">
              Assign officer
            </button>
          </form>
        )}

        {request.assignedToId && !request.opinion && (
          <button
            onClick={() => handleAction(() => api.startDraft(requestId))}
            className="mt-4 text-sm font-medium px-4 py-2 rounded-sm bg-ink text-paper hover:bg-ink-light"
          >
            Start drafting
          </button>
        )}

        <ArchiveActions
          isArchived={Boolean(request.archivedAt)}
          onArchive={() => handleAction(() => api.archiveOpinionRequest(requestId))}
          onUnarchive={() => handleAction(() => api.unarchiveOpinionRequest(requestId))}
          onDelete={async () => {
            await api.deleteOpinionRequest(requestId);
            onChanged?.();
            onBack();
          }}
        />
      </div>

      {opinion && (
        <div className="bg-white border border-ink/15 rounded-sm p-6">
          <p className="text-xs font-mono uppercase tracking-widest text-brass mb-4">Opinion draft</p>

          {opinion.status === 'draft' && (
            <>
              <textarea
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                className="input min-h-[220px] font-serif text-sm leading-relaxed"
                placeholder="Draft the legal opinion here…"
              />
              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => handleAction(() => api.updateDraft(opinion.id, draftText))}
                  className="text-sm font-medium px-4 py-2 rounded-sm border border-ink/20 hover:bg-ink/5"
                >
                  Save draft
                </button>
                <button
                  onClick={() => handleAction(() => api.submitForReview(opinion.id))}
                  className="text-sm font-medium px-4 py-2 rounded-sm bg-ink text-paper hover:bg-ink-light"
                >
                  Submit for review
                </button>
              </div>
              {opinion.reviewComments && (
                <p className="text-xs text-status-rejected mt-3">
                  Previous review comments: {opinion.reviewComments}
                </p>
              )}
            </>
          )}

          {opinion.status === 'submitted_for_review' && (
            <>
              <p className="text-sm font-serif leading-relaxed text-ink whitespace-pre-wrap mb-4">{opinion.content}</p>
              <textarea
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                className="input min-h-[80px]"
                placeholder="Review comments"
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleAction(() => api.decideReview(opinion.id, 'approved', reviewComments))}
                  className="text-sm font-medium px-3 py-2 rounded-sm border border-ink/20 hover:bg-ink/5"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleAction(() => api.decideReview(opinion.id, 'rejected', reviewComments))}
                  className="text-sm font-medium px-3 py-2 rounded-sm border border-ink/20 hover:bg-ink/5"
                >
                  Reject
                </button>
              </div>
            </>
          )}

          {opinion.status === 'approved' && (
            <p className="text-sm font-serif leading-relaxed text-ink whitespace-pre-wrap">{opinion.content}</p>
          )}
        </div>
      )}
    </div>
  );
}
