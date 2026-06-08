import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { PhotoProvider } from './context/PhotoContext';
import Gallery from './pages/Gallery';
import Albums from './pages/Albums';
import IntelligenceIA from './pages/IntelligenceIA';
import Search from './pages/Search';
import Sharing from './pages/Sharing';

const App: React.FC = () => {
  return (
    <PhotoProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Gallery />} />
            <Route path="/albums" element={<Albums />} />
            <Route path="/ia" element={<IntelligenceIA />} />
            <Route path="/search" element={<Search />} />
            <Route path="/sharing" element={<Sharing />} />
          </Routes>
        </Layout>
      </Router>
    </PhotoProvider>
  );
};

export default App;
