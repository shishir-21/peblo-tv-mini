import React, { useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Catalogue, getArtworkUrl } from '../api';
import { Play } from 'lucide-react';

export function ShowDetails({ catalogue }: { catalogue: Catalogue }) {
  const { slug } = useParams();
  
  const show = useMemo(() => {
    return catalogue.shows.find(s => s.slug === slug);
  }, [catalogue, slug]);

  if (!show) {
    return <Navigate to="/search" replace />;
  }

  const firstEp = show.seasons[0]?.episodes[0];
  const banner = firstEp?.artwork?.banner || firstEp?.artwork?.poster;
  const bgUrl = banner ? getArtworkUrl(banner) : 'https://placehold.co/1280x720/1a1a1a/FFF?text=Banner';

  return (
    <div>
      {/* Hero Banner */}
      <div style={{ 
        position: 'relative', 
        height: '50vh', 
        backgroundImage: `linear-gradient(to top, var(--color-background) 0%, rgba(17,17,17,0) 100%), url(${bgUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '4rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end'
      }}>
        <div style={{ maxWidth: '800px' }}>
          <h1 style={{ fontSize: '3rem', margin: '0 0 1rem 0', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{show.title}</h1>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
            <span>{show.categories.join(' • ')}</span>
          </div>
          <p style={{ fontSize: '1.125rem', marginBottom: '2rem', color: 'rgba(255,255,255,0.9)', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
            {show.synopsis}
          </p>
          
          {firstEp && (
            <Link to={`/watch/${firstEp.episode_id}`}>
              <button style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1rem 2rem', 
                backgroundColor: 'var(--color-primary)', 
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}>
                <Play size={20} fill="currentColor" /> Watch Episode 1
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Seasons & Episodes */}
      <div style={{ padding: '2rem' }}>
        {show.seasons.map(season => (
          <div key={season.season_id} style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
              {season.season_number === 0 ? 'Trailers & Extras' : `Season ${season.season_number}`}
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {season.episodes.map(ep => {
                const thumb = ep.artwork?.thumbnail || ep.artwork?.poster;
                const thumbUrl = thumb ? getArtworkUrl(thumb) : 'https://placehold.co/640x360/1e1e1e/FFF?text=Thumbnail';

                return (
                  <Link key={ep.episode_id} to={`/watch/${ep.episode_id}`} style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={{ 
                      aspectRatio: '16/9',
                      backgroundImage: `url(${thumbUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute',
                        bottom: '0.5rem',
                        right: '0.5rem',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}>
                        {ep.duration_seconds ? `${Math.floor(ep.duration_seconds / 60)}m` : ''}
                      </div>
                    </div>
                    <div style={{ padding: '1rem' }}>
                      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>
                        {ep.episode_number}. {ep.title}
                      </h3>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                        {ep.language.toUpperCase()} • {ep.content_group}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {ep.synopsis}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
