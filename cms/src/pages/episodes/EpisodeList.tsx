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

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [langFilter, setLangFilter] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

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

  const filtered = episodes.filter(e => {
    if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && e.status !== statusFilter) return false;
    if (langFilter && e.language !== langFilter) return false;
    return true;
  });

  const pageCount = Math.ceil(filtered.length / pageSize);
  const displayed = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Episodes {seasonId ? '(Filtered by Season)' : ''}</h1>
        <Link to={`/episodes/new${seasonId ? `?season_id=${seasonId}` : ''}`}>
          <Button>Create Episode</Button>
        </Link>
      </div>

      <Card style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Search by title..." 
          value={search} 
          onChange={e => {setSearch(e.target.value); setPage(1);}} 
          style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', flex: 1, minWidth: '200px' }}
        />
        <select 
          value={statusFilter} 
          onChange={e => {setStatusFilter(e.target.value); setPage(1);}}
          style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <select 
          value={langFilter} 
          onChange={e => {setLangFilter(e.target.value); setPage(1);}}
          style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
        >
          <option value="">All Languages</option>
          <option value="en">English (en)</option>
          <option value="ja">Japanese (ja)</option>
          <option value="es">Spanish (es)</option>
        </select>
      </Card>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {displayed.map(episode => (
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
        {displayed.length === 0 && <div style={{ color: 'var(--color-text-muted)' }}>No episodes found.</div>}
      </div>

      {pageCount > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
          <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span style={{ display: 'flex', alignItems: 'center' }}>Page {page} of {pageCount}</span>
          <Button variant="outline" disabled={page === pageCount} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
