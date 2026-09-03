import React, { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Catalogue, getArtworkUrl } from '../api';

export function SearchPage({ catalogue }: { catalogue: Catalogue }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const categoryFilter = searchParams.get('category') || '';

  const categories = useMemo(() => {
    const cats = new Set<string>();
    catalogue.shows.forEach(s => s.categories.forEach(c => cats.add(c)));
    return Array.from(cats).sort();
  }, [catalogue]);

  const results = useMemo(() => {
    return catalogue.shows.filter(show => {
      // Filter by category
      if (categoryFilter && !show.categories.includes(categoryFilter)) {
        return false;
      }
      
      // Filter by query (title, synopsis, categories)
      if (query) {
        const q = query.toLowerCase();
        const matchesTitle = show.title.toLowerCase().includes(q);
        const matchesSynopsis = show.synopsis?.toLowerCase().includes(q);
        const matchesCategory = show.categories.some(c => c.toLowerCase().includes(q));
        
        // Also search inside episodes
        const matchesEpisode = show.seasons.some(season => 
          season.episodes.some(ep => 
            ep.title.toLowerCase().includes(q) || 
            ep.synopsis?.toLowerCase().includes(q)
          )
        );

        if (!matchesTitle && !matchesSynopsis && !matchesCategory && !matchesEpisode) {
          return false;
        }
      }
      
      return true;
    });
  }, [catalogue, query, categoryFilter]);

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <input 
          type="search"
          placeholder="Search shows, episodes, synopsis..."
          value={query}
          onChange={e => {
            const params = new URLSearchParams(searchParams);
            if (e.target.value) params.set('q', e.target.value);
            else params.delete('q');
            setSearchParams(params);
          }}
          style={{
            flex: 1,
            minWidth: '300px',
            padding: '1rem 1.5rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'white',
            fontSize: '1.125rem',
            outline: 'none'
          }}
        />

        <select 
          value={categoryFilter}
          onChange={e => {
            const params = new URLSearchParams(searchParams);
            if (e.target.value) params.set('category', e.target.value);
            else params.delete('category');
            setSearchParams(params);
          }}
          style={{
            padding: '1rem 1.5rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'white',
            fontSize: '1.125rem',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <h2 style={{ marginBottom: '2rem' }}>
        {results.length} {results.length === 1 ? 'Result' : 'Results'} 
        {query ? ` for "${query}"` : ''}
      </h2>

      {results.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-muted)' }}>
          <p style={{ fontSize: '1.25rem' }}>No shows matched your search criteria.</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {results.map(show => {
            const firstEp = show.seasons[0]?.episodes[0];
            const poster = firstEp?.artwork?.poster || firstEp?.artwork?.thumbnail;
            const imgUrl = poster ? getArtworkUrl(poster) : 'https://placehold.co/600x900/1e1e1e/FFF?text=Poster';
            
            return (
              <Link key={show.show_id} to={`/shows/${show.slug}`}>
                <div style={{
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
                <h3 style={{ margin: 0, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{show.title}</h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {show.categories.join(' • ')}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
