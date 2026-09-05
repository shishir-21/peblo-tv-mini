import React, { useMemo, useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { Catalogue, Episode, getArtworkUrl } from '../api';
import { Play, ArrowLeft } from 'lucide-react';

export function WatchPage({ catalogue }: { catalogue: Catalogue }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [fallbackMessage, setFallbackMessage] = useState('');

  const LANGUAGE_NAMES: Record<string, string> = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    ja: 'Japanese',
    hi: 'Hindi',
    ko: 'Korean',
    de: 'German',
    it: 'Italian',
    pt: 'Portuguese',
    zh: 'Chinese',
    ru: 'Russian'
  };
  const getLangName = (code: string) => LANGUAGE_NAMES[code.toLowerCase()] || code.toUpperCase();

  // Find the episode and its siblings (variants)
  const { currentEpisode, variants, showTitle } = useMemo(() => {
    for (const show of catalogue.shows) {
      for (const season of show.seasons) {
        const ep = season.episodes.find(e => e.episode_id === id);
        if (ep) {
          // Found it! Now find all variants in the same season with the same episode_number
          const variants = season.episodes.filter(e => e.episode_number === ep.episode_number);
          return { currentEpisode: ep, variants, showTitle: show.title };
        }
      }
    }
    return { currentEpisode: null, variants: [], showTitle: '' };
  }, [catalogue, id]);

  React.useEffect(() => {
    if (currentEpisode && currentEpisode.languages && currentEpisode.languages.length > 0) {
      if (selectedLanguage && !currentEpisode.languages.includes(selectedLanguage)) {
         setFallbackMessage(`${getLangName(selectedLanguage)} version is not available for this episode.`);
         setSelectedLanguage(currentEpisode.languages[0]);
         
         const timer = setTimeout(() => setFallbackMessage(''), 5000);
         return () => clearTimeout(timer);
      } else if (!selectedLanguage) {
         setSelectedLanguage(currentEpisode.languages[0]);
      }
    }
  }, [currentEpisode, selectedLanguage]);

  if (!currentEpisode) {
    return <Navigate to="/search" replace />;
  }

  const handleVariantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    navigate(`/watch/${e.target.value}`, { replace: true });
    setIsPlaying(false);
  };

  const bgImage = currentEpisode.artwork?.banner || currentEpisode.artwork?.poster || currentEpisode.artwork?.thumbnail;
  const bgUrl = bgImage ? getArtworkUrl(bgImage) : 'https://placehold.co/1280x720/1a1a1a/FFF?text=Video+Player';

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {fallbackMessage && (
        <div style={{ 
          backgroundColor: 'rgba(255, 90, 95, 0.1)', 
          color: 'var(--color-primary)', 
          padding: '1rem', 
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1rem',
          border: '1px solid rgba(255, 90, 95, 0.2)'
        }}>
          {fallbackMessage}
        </div>
      )}
      <button 
        onClick={() => navigate(-1)}
        style={{ 
          background: 'none', 
          border: 'none', 
          color: 'var(--color-text-muted)', 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '2rem',
          fontSize: '1rem'
        }}
      >
        <ArrowLeft size={20} /> Back
      </button>

      {/* Video Player Mock */}
      <div style={{
        aspectRatio: '16/9',
        backgroundColor: '#000',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        position: 'relative',
        marginBottom: '2rem',
        backgroundImage: isPlaying ? 'none' : `url(${bgUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {isPlaying ? (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>Video playback coming soon!</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>This is a mock player for {currentEpisode.title}</p>
            {selectedLanguage && <p style={{ color: 'var(--color-text-muted)' }}>Audio Track: {getLangName(selectedLanguage)}</p>}
          </div>
        ) : (
          <div 
            style={{ 
              position: 'absolute', 
              inset: 0, 
              backgroundColor: 'rgba(0,0,0,0.4)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            onClick={() => setIsPlaying(true)}
          >
            <div style={{ 
              width: '80px', 
              height: '80px', 
              backgroundColor: 'var(--color-primary)', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(255, 90, 95, 0.4)',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Play size={40} fill="white" color="white" style={{ marginLeft: '4px' }} />
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
        <div>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '0.5rem' }}>
            {showTitle}
          </div>
          <h1 style={{ margin: '0 0 1rem 0' }}>Episode {currentEpisode.episode_number}: {currentEpisode.title}</h1>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '800px', lineHeight: 1.6 }}>
            {currentEpisode.synopsis || 'No synopsis available.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Language Selector */}
          {currentEpisode.languages && currentEpisode.languages.length > 1 && (
            <div style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-md)', minWidth: '200px' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Audio Language</h3>
              <select 
                value={selectedLanguage || currentEpisode.languages[0]}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'var(--color-background)',
                  color: 'white',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {currentEpisode.languages.map(lang => (
                  <option key={lang} value={lang}>
                    {getLangName(lang)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Variants Selector */}
          {variants.length > 1 && (
            <div style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-md)', minWidth: '200px' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Available Versions</h3>
              <select 
                value={currentEpisode.episode_id}
                onChange={handleVariantChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'var(--color-background)',
                  color: 'white',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {variants.map((v) => (
                  <option key={v.episode_id} value={v.episode_id}>
                    {v.content_group}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
