import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RecordDreams from './pages/RecordDreams';
import DreamWeb from './pages/DreamWeb';
import JungianAnalysis from './pages/JungianAnalysis';
import Oracle from './pages/Oracle';
import Resources from './pages/Resources';
import UserAccount from './pages/UserAccount';
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-mystic-900 text-white">
            <div className="mystical-blur" />
            <Navbar />
            
            <main className="container mx-auto px-4 py-8 flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/record-dreams" element={<RecordDreams />} />
                <Route path="/dream-web" element={<DreamWeb />} />
                <Route path="/jungian-analysis" element={<JungianAnalysis />} />
                <Route path="/oracle" element={<Oracle />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/account" element={<UserAccount />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;