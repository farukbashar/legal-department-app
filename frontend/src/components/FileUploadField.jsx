import { useState } from 'react';
import { api } from '../api.js';

// Drop-in replacement for a "paste a file URL" input: picks a real file,
// uploads it to the backend, and calls onUploaded(fileName, fileUrl) once done.
export default function FileUploadField({ onUploaded, label = 'File' }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedName, setUploadedName] = useState('');

  const handleUpload = async () => {
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const { fileName, fileUrl } = await api.uploadFile(file);
      setUploadedName(fileName);
      onUploaded(fileName, fileUrl);
      setFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <span className="block text-xs font-mono uppercase tracking-wide text-ink-light/70 mb-1">{label}</span>
      <div className="flex gap-2 items-center">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="text-sm flex-1 file:mr-3 file:py-1.5 file:px-3 file:rounded-sm file:border file:border-ink/20 file:text-xs file:font-medium file:bg-white hover:file:bg-ink/5 file:cursor-pointer"
        />
        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || uploading}
          className="text-xs px-3 py-2 rounded-sm border border-ink/20 hover:bg-ink/5 whitespace-nowrap disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
      </div>
      {error && <p className="text-xs text-status-rejected mt-1">{error}</p>}
      {uploadedName && !error && <p className="text-xs text-status-active mt-1">Uploaded: {uploadedName}</p>}
    </div>
  );
}
