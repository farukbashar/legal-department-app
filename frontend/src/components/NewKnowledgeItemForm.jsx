import { useState } from 'react';
import FileUploadField from './FileUploadField.jsx';

const EMPTY = { type: 'policy', title: '', content: '', fileUrl: '' };

export default function NewKnowledgeItemForm({ onCancel, onCreate }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title) {
      setError('Title is required.');
      return;
    }
    setSubmitting(true);
    try {
      await onCreate(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl">
      <p className="text-xs font-mono uppercase tracking-widest text-brass mb-1">New entry</p>
      <h1 className="text-2xl font-serif font-semibold text-ink mb-6">Add a knowledge base item</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-ink/15 rounded-sm p-6">
        {error && <p className="text-sm text-status-rejected bg-status-rejected/10 border border-status-rejected/30 rounded-sm px-3 py-2">{error}</p>}

        <label className="block">
          <span className="block text-xs font-mono uppercase tracking-wide text-ink-light/70 mb-1">Type</span>
          <select value={form.type} onChange={update('type')} className="input">
            <option value="act">Act</option>
            <option value="regulation">Regulation</option>
            <option value="policy">Policy</option>
            <option value="precedent">Precedent</option>
            <option value="template">Template</option>
          </select>
        </label>

        <label className="block">
          <span className="block text-xs font-mono uppercase tracking-wide text-ink-light/70 mb-1">Title</span>
          <input value={form.title} onChange={update('title')} className="input" placeholder="Electric Power Sector Reform Act, 2023" />
        </label>

        <label className="block">
          <span className="block text-xs font-mono uppercase tracking-wide text-ink-light/70 mb-1">Content</span>
          <textarea value={form.content} onChange={update('content')} className="input min-h-[140px] font-serif" placeholder="Full text, summary, or notes" />
        </label>

        <FileUploadField
          label="Attach a file (optional)"
          onUploaded={(fileName, fileUrl) => setForm({ ...form, fileUrl })}
        />
        {form.fileUrl && <p className="text-xs text-ink-light/60">A file is attached and will be saved with this item.</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting} className="bg-ink text-paper text-sm font-medium px-4 py-2 rounded-sm hover:bg-ink-light disabled:opacity-50">
            {submitting ? 'Saving…' : 'Add item'}
          </button>
          <button type="button" onClick={onCancel} className="text-sm font-medium px-4 py-2 rounded-sm border border-ink/20 hover:bg-ink/5">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
