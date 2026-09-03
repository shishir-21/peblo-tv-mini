import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ShowList } from './pages/shows/ShowList';
import { ShowForm } from './pages/shows/ShowForm';
import { SeasonList } from './pages/seasons/SeasonList';
import { SeasonForm } from './pages/seasons/SeasonForm';
import { EpisodeList } from './pages/episodes/EpisodeList';
import { EpisodeForm } from './pages/episodes/EpisodeForm';
import { ArtworkUpload } from './pages/episodes/ArtworkUpload';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            {/* Show routes */}
            <Route path="shows" element={<ShowList />} />
            <Route path="shows/new" element={<ShowForm />} />
            <Route path="shows/:id/edit" element={<ShowForm />} />
            
            {/* Season routes */}
            <Route path="seasons" element={<SeasonList />} />
            <Route path="seasons/new" element={<SeasonForm />} />
            <Route path="seasons/:id/edit" element={<SeasonForm />} />
            
            {/* Episode routes */}
            <Route path="episodes" element={<EpisodeList />} />
            <Route path="episodes/new" element={<EpisodeForm />} />
            <Route path="episodes/:id/edit" element={<EpisodeForm />} />
            <Route path="episodes/:id/artwork" element={<ArtworkUpload />} />
            
            <Route path="categories" element={<div>Categories Placeholder</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
