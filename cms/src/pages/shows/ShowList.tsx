import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface Show {
  id: string;
  title: string;
  slug: string;
  section: string;
  status: string;
}

export function ShowList() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchShows = async () => {
    try {
      setLoading(true);
      const data = await apiClient('/shows');
      setShows(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load shows');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShows();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    
    try {
      await apiClient(`/shows/${id}`, { method: 'DELETE' });
      fetchShows();
    } catch (err: any) {
      alert(err.message || 'Failed to delete show');
    }
  };

  if (loading) return <div>Loading shows...</div>;
  if (error) return <div style={{ color: 'var(--color-error)' }}>{error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Shows</h1>
        <Link to="/shows/new">
          <Button>Create Show</Button>
        </Link>
      </div>

      {shows.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--color-text-muted)' }}>
            No shows found. Create your first show!
          </div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {shows.map(show => (
            <Card key={show.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 0.25rem 0' }}>{show.title}</h3>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  Slug: {show.slug} | Section: {show.section || 'None'} | Status: {show.status}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link to={`/shows/${show.id}/edit`}>
                  <Button variant="outline">Edit</Button>
                </Link>
                <Button variant="danger" onClick={() => handleDelete(show.id, show.title)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
