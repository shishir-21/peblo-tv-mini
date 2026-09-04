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

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

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

  const filtered = shows.filter(s => {
    if (search && !s.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && s.status !== statusFilter) return false;
    if (sectionFilter && s.section !== sectionFilter) return false;
    return true;
  });

  const pageCount = Math.ceil(filtered.length / pageSize);
  const displayed = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Shows</h1>
        <Link to="/shows/new">
          <Button>Create Show</Button>
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
          value={sectionFilter} 
          onChange={e => {setSectionFilter(e.target.value); setPage(1);}}
          style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
        >
          <option value="">All Sections</option>
          <option value="hero">Hero</option>
          <option value="featured">Featured</option>
          <option value="series">Series</option>
          <option value="minisodes">Minisodes</option>
          <option value="songs">Songs</option>
        </select>
      </Card>

      {shows.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--color-text-muted)' }}>
            No shows found. Create your first show!
          </div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {displayed.map(show => (
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
          {displayed.length === 0 && <div style={{ color: 'var(--color-text-muted)' }}>No shows match your filters.</div>}
        </div>
      )}

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
