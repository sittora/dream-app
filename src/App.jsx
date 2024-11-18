import React from 'react';
import { useRoutes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { routes } from './router';

function App() {
  const element = useRoutes(routes);

  return (
    <ThemeProvider>
      <AuthProvider>
        {element}
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
