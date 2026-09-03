import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function PublishingDashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [validation, setValidation] = useState<any>(null);
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [valData, runsData] = await Promise.all([
        apiClient('/validation'),
        isAdmin ? apiClient('/publish/runs') : Promise.resolve([])
      ]);
      setValidation(valData);
      setRuns(runsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [isAdmin]);

  const handlePublish = async () => {
    if (!isAdmin) return;
    if (!window.confirm("Are you sure you want to publish the catalogue? This will update the live public site.")) return;

    try {
      setPublishing(true);
      setError('');
      await apiClient('/publish', { method: 'POST' });
      alert('Catalogue published successfully!');
      fetchDashboardData();
    } catch (err: any) {
      setError(err.message || 'Failed to publish catalogue');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) return <div>Loading publishing dashboard...</div>;

  const latestRun = runs.length > 0 ? runs[0] : null;

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Publishing Dashboard</h1>

      {error && <div style={{ color: 'var(--color-error)', marginBottom: '1rem' }}>{error}</div>}

      <div style={{ display: 'grid', gap: '2rem' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Validation Status</h2>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: validation?.valid ? 'var(--color-success)' : 'var(--color-error)', marginBottom: '1rem' }}>
                {validation?.valid ? 'Ready to Publish' : 'Blocking Errors Found'}
              </div>
              {!validation?.valid && (
                <p style={{ color: 'var(--color-text-muted)' }}>You must fix validation errors before publishing.</p>
              )}
            </div>
            {isAdmin ? (
              <Button 
                onClick={handlePublish} 
                disabled={!validation?.valid || publishing}
                isLoading={publishing}
              >
                Publish Catalogue
              </Button>
            ) : (
              <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                Admin access required to publish
              </div>
            )}
          </div>
        </Card>

        {isAdmin && (
          <Card>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Publish History</h2>
            {runs.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)' }}>No publish runs found.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                      <th style={{ padding: '1rem 0.5rem' }}>Started At</th>
                      <th style={{ padding: '1rem 0.5rem' }}>Status</th>
                      <th style={{ padding: '1rem 0.5rem' }}>Shows / Eps</th>
                      <th style={{ padding: '1rem 0.5rem' }}>Hash</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runs.map(run => (
                      <tr key={run.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '1rem 0.5rem' }}>{new Date(run.started_at).toLocaleString()}</td>
                        <td style={{ padding: '1rem 0.5rem', fontWeight: 600, color: run.status === 'completed' ? 'var(--color-success)' : 'var(--color-error)' }}>
                          {run.status.toUpperCase()}
                        </td>
                        <td style={{ padding: '1rem 0.5rem' }}>{run.shows_count} / {run.episodes_count}</td>
                        <td style={{ padding: '1rem 0.5rem', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                          {run.catalogue_hash?.substring(0, 8) || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
