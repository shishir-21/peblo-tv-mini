import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function ArtworkUpload() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [artworkType, setArtworkType] = useState('poster');
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      await apiClient(`/episodes/${id}/artwork?artwork_type=${artworkType}`, {
        method: 'POST',
        body: formData,
      });
      alert('Artwork uploaded successfully!');
      navigate(`/episodes`);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card style={{ maxWidth: '600px' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Upload Artwork</h2>
      {error && <div style={{ color: 'var(--color-error)', marginBottom: '1rem' }}>{error}</div>}
      
      <form onSubmit={handleUpload}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>Artwork Type</label>
          <select 
            value={artworkType} 
            onChange={(e) => setArtworkType(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
          >
            <option value="poster">Poster (600x900, max 200KB)</option>
            <option value="banner">Banner (1280x720, max 200KB)</option>
            <option value="thumbnail">Thumbnail (640x360, max 200KB)</option>
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>File</label>
          <input 
            type="file" 
            accept="image/jpeg, image/png, image/webp" 
            onChange={handleFileChange} 
            required 
            style={{ display: 'block', width: '100%', padding: '0.5rem 0' }}
          />
        </div>

        {preview && (
          <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Preview</p>
            <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: 'var(--radius-sm)' }} />
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={uploading}>Cancel</Button>
          <Button type="submit" isLoading={uploading} disabled={!file}>Upload</Button>
        </div>
      </form>
    </Card>
  );
}
