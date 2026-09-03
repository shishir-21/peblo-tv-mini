import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Film, ListVideo, LayoutGrid, CheckCircle } from 'lucide-react';

export function MainLayout() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const layoutStyle = {
    display: 'flex',
    minHeight: '100vh',
  };

  const sidebarStyle = {
    width: '250px',
    backgroundColor: 'var(--color-surface)',
    borderRight: '1px solid var(--color-border)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
  };

  const mainStyle = {
    flex: 1,
    padding: '2rem',
    overflowY: 'auto' as const,
  };

  const navItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-text-main)',
    fontWeight: 600,
    marginBottom: '0.5rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  };

  return (
    <div style={layoutStyle}>
      <div style={sidebarStyle}>
        <div style={{ marginBottom: '2rem', fontWeight: 800, fontSize: '1.5rem', color: 'var(--color-primary)' }}>
          Peblo TV CMS
        </div>
        
        <nav style={{ flex: 1 }}>
          <Link to="/" style={navItemStyle}><LayoutDashboard size={20} /> Dashboard</Link>
          <Link to="/shows" style={navItemStyle}><Film size={20} /> Shows</Link>
          <Link to="/seasons" style={navItemStyle}><ListVideo size={20} /> Seasons</Link>
          <Link to="/categories" style={navItemStyle}><LayoutGrid size={20} /> Categories</Link>
          <Link to="/validation" style={navItemStyle}><CheckCircle size={20} /> Validation</Link>
        </nav>
        
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
          <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            {user.email} ({user.role})
          </div>
          <button 
            onClick={logout}
            style={{ ...navItemStyle, width: '100%', border: 'none', backgroundColor: 'transparent', color: 'var(--color-error)' }}
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>
      
      <main style={mainStyle}>
        <Outlet />
      </main>
    </div>
  );
}
