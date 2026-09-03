import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function SeasonList() {
  const [seasons, setSeasons] = useState<any[]>([]);
  const [shows, setShows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [showsData, seasonsData] = await Promise.all([
          apiClient('/shows'),
          apiClient('/seasons')
        ]);
        setShows(showsData);
        setSeasons(seasonsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getShowTitle = (showId: string) => {
    return shows.find(s => s.id === showId)?.title || 'Unknown Show';
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await apiClient(`/seasons/${id}`, { method: 'DELETE' });
      setSeasons(seasons.filter(s => s.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div>Loading seasons...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Seasons</h1>
        <Link to="/seasons/new">
          <Button>Create Season</Button>
        </Link>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {seasons.map(season => (
          <Card key={season.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0' }}>{getShowTitle(season.show_id)} - Season {season.season_number}</h3>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to={`/seasons/${season.id}/edit`}><Button variant="outline">Edit</Button></Link>
              <Button variant="danger" onClick={() => handleDelete(season.id)}>Delete</Button>
              <Link to={`/episodes?season_id=${season.id}`}><Button variant="secondary">View Episodes</Button></Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
