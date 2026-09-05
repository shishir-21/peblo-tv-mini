import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Catalogue, fetchCatalogue } from './api';
import { Home } from './components/Home';
import { SearchPage } from './components/SearchPage';
import { ShowDetails } from './components/ShowDetails';
import { WatchPage } from './components/WatchPage';
import { ShowsPage } from './components/ShowsPage';
import { Search } from 'lucide-react';
import './index.css';

function App() {
  const [catalogue, setCatalogue] = useState<Catalogue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCatalogue()
      .then(setCatalogue)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Peblo TV...</div>;
  }

  if (error || !catalogue) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
        <div>
          <h1 style={{ color: 'var(--color-primary)' }}>Oh no!</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>{error || 'Catalogue not found.'}</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{ 
          padding: '1.5rem 2rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          backgroundColor: 'rgba(17, 17, 17, 0.8)',
          backdropFilter: 'blur(10px)',
          zIndex: 100,
          borderBottom: '1px solid var(--color-border)'
        }}>
          <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            PEBLO TV
          </Link>
          <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Link to="/" style={{ fontWeight: 600 }}>Home</Link>
            <Link to="/shows" style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>Shows</Link>
            <Link to="/movies" style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>Movies</Link>
            <Link to="/search" style={{ color: 'var(--color-text-main)' }}>
              <Search size={24} />
            </Link>
          </nav>
        </header>

        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home catalogue={catalogue} />} />
            <Route path="/shows" element={<ShowsPage catalogue={catalogue} />} />
            <Route path="/search" element={<SearchPage catalogue={catalogue} />} />
            <Route path="/shows/:slug" element={<ShowDetails catalogue={catalogue} />} />
            <Route path="/watch/:id" element={<WatchPage catalogue={catalogue} />} />
          </Routes>
        </main>
        
        <footer style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)' }}>
          <p>Peblo TV Mini &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
