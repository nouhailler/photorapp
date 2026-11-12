import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { PhotoProvider } from './context/PhotoContext';
import { HelpProvider } from './context/HelpContext';
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
          <Layout>
            <Routes>
              <Route path="/" element={<Gallery />} />
              <Route path="/albums" element={<Albums />} />
              <Route path="/albums/:id" element={<AlbumDetail />} />
              <Route path="/ia" element={<IntelligenceIA />} />
              <Route path="/search" element={<Search />} />
              <Route path="/sharing" element={<Sharing />} />
              <Route path="/settings" element={<SystemSettings />} />
            </Routes>
          </Layout>
        </Router>
      </HelpProvider>
    </PhotoProvider>
  );
};

export default App;
