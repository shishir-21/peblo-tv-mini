import React from 'react';
import { Card } from '../components/ui/Card';

export function Dashboard() {
  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <Card>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Welcome to Peblo TV CMS</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Manage shows, episodes, and publish catalogues.</p>
        </Card>
      </div>
    </div>
  );
}
