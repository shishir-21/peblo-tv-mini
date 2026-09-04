import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const ARTWORK_TYPES = [
  { id: 'poster', label: 'Poster', specs: '600x900, max 200KB, 2:3' },
  { id: 'banner', label: 'Banner', specs: '1280x720, max 200KB, 16:9' },
  { id: 'thumbnail', label: 'Thumbnail', specs: '640x360, max 200KB, 16:9' },
];

function ArtworkSlot({ type, label, specs, episodeId, existingUrl, onUploadSuccess }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(existingUrl || '');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (existingUrl) setPreview(existingUrl);
  }, [existingUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      await apiClient(`/episodes/${episodeId}/artwork?artwork_type=${type}`, {
        method: 'POST',
        body: formData,
      });
      alert(`${label} uploaded successfully!`);
      onUploadSuccess();
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, marginRight: '1rem' }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>{label}</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Required dimensions: {specs}
          </p>

          <input 
            type="file" 
            accept="image/jpeg, image/png, image/webp" 
            onChange={handleFileChange} 
            style={{ display: 'block', width: '100%', marginBottom: '1rem' }}
          />

          {error && <div style={{ color: 'var(--color-error)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

          <Button type="button" isLoading={uploading} disabled={!file} onClick={handleUpload}>
            Upload {label}
          </Button>
        </div>
        
        <div style={{ width: '200px', flexShrink: 0, textAlign: 'center' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, fontSize: '0.875rem' }}>Preview</p>
          {preview ? (
            <img 
              src={preview} 
              alt={`${label} Preview`} 
              style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: 'var(--radius-sm)', objectFit: 'contain' }} 
            />
          ) : (
            <div style={{ width: '100%', height: '150px', backgroundColor: 'var(--color-border)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              No image
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export function ArtworkUpload() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [existingArtworks, setExistingArtworks] = useState<any>({});
  
  const fetchEpisode = async () => {
    try {
      const data = await apiClient(`/episodes/${id}`);
      if (data.artworks) {
        const mapping: any = {};
        for (const aw of data.artworks) {
          // Fallback to storage_key if url isn't returned by backend
          mapping[aw.artwork_type] = aw.url || aw.storage_key; 
        }
        setExistingArtworks(mapping);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEpisode();
  }, [id]);

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>Upload Artwork</h2>
        <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
      </div>
      
      {ARTWORK_TYPES.map(type => (
        <ArtworkSlot 
          key={type.id}
          type={type.id}
          label={type.label}
          specs={type.specs}
          episodeId={id}
          existingUrl={existingArtworks[type.id]}
          onUploadSuccess={fetchEpisode}
        />
      ))}
    </div>
  );
}
