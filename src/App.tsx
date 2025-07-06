import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RecordDreams from './pages/RecordDreams';
import JungianAnalysis from './pages/JungianAnalysis';
import DreamWeb from './pages/DreamWeb';
import Oracle from './pages/Oracle';
import Resources from './pages/Resources';
import UserAccount from './pages/UserAccount';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-black text-gray-200 flex flex-col">
        <div className="mystical-blur" />
        <Navbar />
        
        <main className="container mx-auto px-4 py-8 flex-1">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Home />} />
            <Route path="/resources" element={<Resources />} />
            <Route
              path="/record"
              element={
                <ProtectedRoute>
                  <RecordDreams />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analysis"
              element={
                <ProtectedRoute>
                  <JungianAnalysis />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dreamweb"
              element={
                <ProtectedRoute>
                  <DreamWeb />
                </ProtectedRoute>
              }
            />
            <Route
              path="/oracle"
              element={
                <ProtectedRoute>
                  <Oracle />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <UserAccount />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
};

export default App;