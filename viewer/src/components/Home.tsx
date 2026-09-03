import React from 'react';
import { Catalogue, getArtworkUrl } from '../api';
import { Link } from 'react-router-dom';

interface HomeProps {
  catalogue: Catalogue;
}

export function Home({ catalogue }: HomeProps) {
  const sections = Array.from(new Set(catalogue.shows.map(s => s.section).filter(Boolean)));
  const heroShows = catalogue.shows.filter(s => s.section === 'hero' || s.section === 'Hero');
  const otherSections = sections.filter(s => s?.toLowerCase() !== 'hero');

  // If no sections are defined, group all shows together
  const hasSections = sections.length > 0;

  return (
    <div>
      {/* Hero Section */}
      {heroShows.length > 0 && (
        <div style={{ position: 'relative', height: '70vh', marginBottom: '3rem' }}>
          {heroShows.map((show, idx) => {
            const firstEp = show.seasons[0]?.episodes[0];
            const banner = firstEp?.artwork?.banner || firstEp?.artwork?.poster;
            const bgUrl = banner ? getArtworkUrl(banner) : 'https://placehold.co/1280x720/1a1a1a/FFF?text=Hero+Banner';
            
            return (
              <div 
                key={show.show_id}
                style={{
                  display: idx === 0 ? 'block' : 'none', // just showing first hero for simplicity
                  height: '100%',
                  backgroundImage: `linear-gradient(to top, var(--color-background) 0%, rgba(17,17,17,0) 100%), url(${bgUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  padding: '4rem 2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end'
                }}
              >
                <div style={{ maxWidth: '600px' }}>
                  <h1 style={{ fontSize: '3rem', margin: '0 0 1rem 0', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{show.title}</h1>
                  <p style={{ fontSize: '1.125rem', marginBottom: '1.5rem', color: 'rgba(255,255,255,0.9)', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                    {show.synopsis}
                  </p>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to={`/shows/${show.slug}`}>
                      <button style={{ 
                        padding: '1rem 2rem', 
                        backgroundColor: 'var(--color-primary)', 
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}>
                        Watch Now
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ padding: '0 2rem 2rem 2rem' }}>
        {/* Render By Sections */}
        {hasSections ? (
          otherSections.map(section => (
            <SectionRow key={section as string} title={section as string} shows={catalogue.shows.filter(s => s.section === section)} />
          ))
        ) : (
          <SectionRow title="All Shows" shows={catalogue.shows} />
        )}
      </div>
    </div>
  );
}

function SectionRow({ title, shows }: { title: string, shows: any[] }) {
  if (shows.length === 0) return null;

  return (
    <div style={{ marginBottom: '3rem' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', textTransform: 'capitalize' }}>{title}</h2>
      <div 
        className="hide-scrollbar"
        style={{ 
          display: 'flex', 
          gap: '1rem', 
          overflowX: 'auto',
          paddingBottom: '1rem'
        }}
      >
        {shows.map(show => {
          const firstEp = show.seasons[0]?.episodes[0];
          const poster = firstEp?.artwork?.poster || firstEp?.artwork?.thumbnail;
          const imgUrl = poster ? getArtworkUrl(poster) : 'https://placehold.co/600x900/1e1e1e/FFF?text=Poster';
          
          return (
            <Link key={show.show_id} to={`/shows/${show.slug}`} style={{ flexShrink: 0, width: '200px' }}>
              <div style={{
                width: '200px',
                height: '300px',
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
              <h3 style={{ margin: 0, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{show.title}</h3>
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
