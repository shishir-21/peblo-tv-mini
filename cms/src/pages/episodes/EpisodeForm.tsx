import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function EpisodeForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSeasonId = searchParams.get('season_id') || '';

  const [seasons, setSeasons] = useState<any[]>([]);
  const [seasonId, setSeasonId] = useState(initialSeasonId);
  const [episodeId, setEpisodeId] = useState('');
  const [episodeNumber, setEpisodeNumber] = useState(1);
  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [duration, setDuration] = useState(0);
  const [language, setLanguage] = useState('en');
  const [contentGroup, setContentGroup] = useState('');
  const [status, setStatus] = useState('draft');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const seasonsData = await apiClient('/seasons');
        setSeasons(seasonsData);
        if (seasonsData.length > 0 && !initialSeasonId) {
          setSeasonId(seasonsData[0].id);
        }

        if (isEditing) {
          const episode = await apiClient(`/episodes/${id}`);
          setSeasonId(episode.season_id);
          setEpisodeId(episode.episode_id);
          setEpisodeNumber(episode.episode_number);
          setTitle(episode.title);
          setSynopsis(episode.synopsis || '');
          setDuration(episode.duration_seconds || 0);
          setLanguage(episode.language);
          setContentGroup(episode.content_group);
          setStatus(episode.status);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, isEditing, initialSeasonId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const data = {
      season_id: seasonId,
      episode_id: episodeId,
      episode_number: episodeNumber,
      title,
      synopsis: synopsis || null,
      duration_seconds: duration || null,
      language,
      content_group: contentGroup,
      status
    };

    try {
      if (isEditing) {
        await apiClient(`/episodes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      } else {
        await apiClient('/episodes', { method: 'POST', body: JSON.stringify(data) });
      }
      navigate(initialSeasonId ? `/episodes?season_id=${initialSeasonId}` : '/episodes');
    } catch (err: any) {
      alert(err.message || 'Error saving episode');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Card style={{ maxWidth: '600px' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>{isEditing ? 'Edit Episode' : 'Create Episode'}</h2>
      <form onSubmit={handleSubmit}>
        {!isEditing && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>Season</label>
            <select 
              value={seasonId} onChange={e => setSeasonId(e.target.value)} required
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
            >
              <option value="">Select Season</option>
              {seasons.map(s => <option key={s.id} value={s.id}>Season {s.season_number}</option>)}
            </select>
          </div>
        )}
        <Input label="Episode ID (Unique String)" value={episodeId} onChange={e => setEpisodeId(e.target.value)} required />
        <Input label="Episode Number" type="number" value={episodeNumber} onChange={e => setEpisodeNumber(parseInt(e.target.value))} required />
        <Input label="Title" value={title} onChange={e => setTitle(e.target.value)} required />
        <Input label="Synopsis" value={synopsis} onChange={e => setSynopsis(e.target.value)} />
        <Input label="Duration (Seconds)" type="number" value={duration} onChange={e => setDuration(parseInt(e.target.value))} />
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>Language</label>
          <select 
            value={language} onChange={e => setLanguage(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
          >
            <option value="en">English (en)</option>
            <option value="hi">Hindi (hi)</option>
          </select>
        </div>
        <Input label="Content Group (Group Variants Together)" value={contentGroup} onChange={e => setContentGroup(e.target.value)} required />
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>Status</label>
          <select 
            value={status} onChange={e => setStatus(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" isLoading={saving}>Save</Button>
        </div>
      </form>
    </Card>
  );
}
