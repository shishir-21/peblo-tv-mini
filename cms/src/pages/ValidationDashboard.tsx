import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface ValidationError {
  code: string;
  message: string;
  show_id?: string;
  episode_id?: string;
  content_group?: string;
}

export function ValidationDashboard() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const data = await apiClient('/validation');
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading) return <div>Loading validation report...</div>;
  if (!report) return <div>Failed to load validation report.</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Content Validation Dashboard</h1>
        <Button onClick={fetchReport} variant="outline">Refresh</Button>
      </div>

      <Card style={{ marginBottom: '2rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Overall Status</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            This report checks if all published content is ready to go live.
          </p>
        </div>
        <div style={{ 
          fontSize: '1.25rem', fontWeight: 'bold', 
          color: report.valid ? 'var(--color-success)' : 'var(--color-error)' 
        }}>
          {report.valid ? 'Ready to Publish' : 'Blocking Errors Found'}
        </div>
      </Card>

      {report.errors?.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-error)' }}>
            Blocking Errors ({report.errors.length})
          </h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {report.errors.map((err: ValidationError, idx: number) => (
              <Card key={idx} style={{ borderLeft: '4px solid var(--color-error)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{err.message}</h3>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                      <strong>Code:</strong> {err.code}
                      {err.show_id && <span style={{ marginLeft: '1rem' }}><strong>Show ID:</strong> {err.show_id}</span>}
                      {err.episode_id && <span style={{ marginLeft: '1rem' }}><strong>Episode ID:</strong> {err.episode_id}</span>}
                      {err.content_group && <span style={{ marginLeft: '1rem' }}><strong>Content Group:</strong> {err.content_group}</span>}
                    </div>
                  </div>
                  {err.episode_id && (
                    <Link to={`/episodes/${err.episode_id}/edit`}>
                      <Button variant="secondary">Fix Episode</Button>
                    </Link>
                  )}
                  {err.show_id && !err.episode_id && (
                    <Link to={`/shows/${err.show_id}/edit`}>
                      <Button variant="secondary">Fix Show</Button>
                    </Link>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {report.warnings?.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-accent)' }}>
            Warnings ({report.warnings.length})
          </h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {report.warnings.map((warn: ValidationError, idx: number) => (
              <Card key={idx} style={{ borderLeft: '4px solid var(--color-accent)' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{warn.message}</h3>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  <strong>Code:</strong> {warn.code}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {report.errors?.length === 0 && report.warnings?.length === 0 && (
        <Card style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-success)' }}>
          <h3>All content looks perfect!</h3>
        </Card>
      )}
    </div>
  );
}
