import React from 'react';
import { Catalogue, getArtworkUrl } from '../api';
import { Link } from 'react-router-dom';

export function ShowsPage({ catalogue }: { catalogue: Catalogue }) {
  const tvShows = catalogue?.shows?.filter(show => {
    const section = (show.section || '').toLowerCase();
    return !['movies', 'movie', 'films', 'film', 'songs'].includes(section);
  }) || [];

  if (tvShows.length === 0) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--color-text-muted)' }}>No shows available in the catalogue.</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>All Shows</h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
        gap: '2rem' 
      }}>
        {tvShows.map(show => {
          const firstEp = show.seasons[0]?.episodes[0];
          const poster = firstEp?.artwork?.poster || firstEp?.artwork?.thumbnail;
          const imgUrl = poster ? getArtworkUrl(poster) : 'https://placehold.co/600x900/1e1e1e/FFF?text=Poster';
          
          return (
            <Link key={show.show_id} to={`/shows/${show.slug}`} style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{
                width: '100%',
                aspectRatio: '2/3',
                borderRadius: 'var(--radius-md)',
                backgroundImage: `url(${imgUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                marginBottom: '0.75rem',
                transition: 'transform 0.2s ease',
              }} 
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
              <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.125rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {show.title}
              </h3>
              {show.section && (
                <span style={{ 
                  fontSize: '0.75rem', 
                  backgroundColor: 'rgba(255, 90, 95, 0.1)', 
                  color: 'var(--color-primary)', 
                  padding: '0.125rem 0.5rem', 
                  borderRadius: 'var(--radius-sm)',
                  alignSelf: 'flex-start',
                  marginBottom: '0.25rem',
                  textTransform: 'uppercase',
                  fontWeight: 600
                }}>
                  {show.section}
                </span>
              )}
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {show.categories.join(' • ')}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
