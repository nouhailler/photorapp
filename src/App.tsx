import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { PhotoProvider } from './context/PhotoContext';
import { HelpProvider } from './context/HelpContext';
import LandingPage from './pages/LandingPage';
import Gallery from './pages/Gallery';
import Albums from './pages/Albums';
import IntelligenceIA from './pages/IntelligenceIA';
import Search from './pages/Search';
import Sharing from './pages/Sharing';
import AlbumDetail from './pages/AlbumDetail';
import SystemSettings from './pages/SystemSettings';

const App: React.FC = () => {
  return (
    <PhotoProvider>
      <HelpProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/gallery"
              element={
                <Layout>
                  <Gallery />
                </Layout>
              }
            />
            <Route
              path="/app"
              element={
                <Layout>
                  <Gallery />
                </Layout>
              }
            />
            <Route
              path="/albums"
              element={
                <Layout>
                  <Albums />
                </Layout>
              }
            />
            <Route
              path="/albums/:id"
              element={
                <Layout>
                  <AlbumDetail />
                </Layout>
              }
            />
            <Route
              path="/ia"
              element={
                <Layout>
                  <IntelligenceIA />
                </Layout>
              }
            />
            <Route
              path="/search"
              element={
                <Layout>
                  <Search />
                </Layout>
              }
            />
            <Route
              path="/sharing"
              element={
                <Layout>
                  <Sharing />
                </Layout>
              }
            />
            <Route
              path="/settings"
              element={
                <Layout>
                  <SystemSettings />
                </Layout>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </HelpProvider>
    </PhotoProvider>
  );
};

export default App;
