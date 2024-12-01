import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { routes } from './config/routes';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-black text-gray-200 flex flex-col">
        <div className="mystical-blur" />
        <Navbar />
        
        <main className="container mx-auto px-4 py-8 flex-1">
          <Routes>
            {/* Public Routes */}
            {routes.public.map(({ path, element: Element }) => (
              <Route key={path} path={path} element={<Element />} />
            ))}

            {/* Protected Routes */}
            {routes.protected.map(({ path, element: Element, children }) => (
              <React.Fragment key={path}>
                <Route
                  path={path}
                  element={
                    <ProtectedRoute>
                      <Element />
                    </ProtectedRoute>
                  }
                />
                {children?.map(({ path: childPath, element: ChildElement }) => (
                  <Route
                    key={childPath}
                    path={childPath}
                    element={
                      <ProtectedRoute>
                        <ChildElement />
                      </ProtectedRoute>
                    }
                  />
                ))}
              </React.Fragment>
            ))}

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
};

export default App;