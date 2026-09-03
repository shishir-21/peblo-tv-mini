import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function SeasonForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();

  const [shows, setShows] = useState<any[]>([]);
  const [showId, setShowId] = useState('');
  const [seasonNumber, setSeasonNumber] = useState(1);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const showsData = await apiClient('/shows');
        setShows(showsData);
        if (showsData.length > 0) setShowId(showsData[0].id);

        if (isEditing) {
          const season = await apiClient(`/seasons/${id}`);
          setShowId(season.show_id);
          setSeasonNumber(season.season_number);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const data = { show_id: showId, season_number: seasonNumber };

    try {
      if (isEditing) {
        await apiClient(`/seasons/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      } else {
        await apiClient('/seasons', { method: 'POST', body: JSON.stringify(data) });
      }
      navigate('/seasons');
    } catch (err: any) {
      alert(err.message || 'Error saving season');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Card style={{ maxWidth: '500px' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>{isEditing ? 'Edit Season' : 'Create Season'}</h2>
      <form onSubmit={handleSubmit}>
        {!isEditing && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>Show</label>
            <select 
              value={showId} onChange={e => setShowId(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
            >
              {shows.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>
        )}
        <Input 
          label="Season Number (0 for Trailers)" 
          type="number" 
          value={seasonNumber} 
          onChange={e => setSeasonNumber(parseInt(e.target.value, 10))} 
          required 
        />
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <Button type="button" variant="outline" onClick={() => navigate('/seasons')}>Cancel</Button>
          <Button type="submit" isLoading={saving}>Save</Button>
        </div>
      </form>
    </Card>
  );
}
