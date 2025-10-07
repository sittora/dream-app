import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import ErrorBoundary from './components/ErrorBoundary';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import { AuthProvider } from './contexts/AuthContext';
import DreamWeb from './pages/DreamWeb';
import Home from './pages/Home';
import JungianAnalysis from './pages/JungianAnalysis';
import Login from './pages/Login';
import Oracle from './pages/Oracle';
import RecordDreams from './pages/RecordDreams';
import Register from './pages/Register';
import Resources from './pages/Resources';
import UserAccount from './pages/UserAccount';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <div className="min-h-screen bg-mystic-900 text-slate-100">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/record" element={<RecordDreams />} />
                <Route path="/record-dreams" element={<RecordDreams />} />
                <Route path="/analysis" element={<JungianAnalysis />} />
                <Route path="/jungian-analysis" element={<JungianAnalysis />} />
                <Route path="/dreamweb" element={<DreamWeb />} />
                <Route path="/oracle" element={<Oracle />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/account" element={<UserAccount />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<Home />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </ErrorBoundary>
    </AuthProvider>
  );
};

export default App;