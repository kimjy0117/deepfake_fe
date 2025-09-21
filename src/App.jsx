import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GalleryProvider } from './contexts/GalleryContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GalleryPage from './pages/GalleryPage';
import PublicGalleryPage from './pages/PublicGalleryPage';
import FileDetailPage from './pages/FileDetailPage';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <GalleryProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route 
                path="public-gallery" 
                element={
                  <ProtectedRoute>
                    <PublicGalleryPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="file/:type/:fileId" 
                element={
                  <ProtectedRoute>
                    <FileDetailPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="gallery" 
                element={
                  <ProtectedRoute>
                    <GalleryPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Router>
      </GalleryProvider>
    </AuthProvider>
  );
}

export default App;
