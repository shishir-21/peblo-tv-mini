import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function EpisodeList() {
  const [searchParams] = useSearchParams();
  const seasonId = searchParams.get('season_id');
  
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        const url = seasonId ? `/episodes?season_id=${seasonId}` : '/episodes';
        const data = await apiClient(url);
        setEpisodes(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEpisodes();
  }, [seasonId]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await apiClient(`/episodes/${id}`, { method: 'DELETE' });
      setEpisodes(episodes.filter(e => e.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div>Loading episodes...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Episodes {seasonId ? '(Filtered by Season)' : ''}</h1>
        <Link to={`/episodes/new${seasonId ? `?season_id=${seasonId}` : ''}`}>
          <Button>Create Episode</Button>
        </Link>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {episodes.map(episode => (
          <Card key={episode.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0' }}>{episode.title} - Ep {episode.episode_number}</h3>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                {episode.language} | {episode.content_group} | {episode.status}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to={`/episodes/${episode.id}/edit`}><Button variant="outline">Edit</Button></Link>
              <Button variant="danger" onClick={() => handleDelete(episode.id)}>Delete</Button>
              <Link to={`/episodes/${episode.id}/artwork`}><Button variant="secondary">Artwork</Button></Link>
            </div>
          </Card>
        ))}
        {episodes.length === 0 && <div style={{ color: 'var(--color-text-muted)' }}>No episodes found.</div>}
      </div>
    </div>
  );
}
