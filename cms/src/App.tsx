import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ShowList } from './pages/shows/ShowList';
import { ShowForm } from './pages/shows/ShowForm';
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
            <Route path="seasons" element={<div>Seasons Placeholder</div>} />
            <Route path="categories" element={<div>Categories Placeholder</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
