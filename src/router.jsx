import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AuthLayout } from './components/AuthLayout';
import { useAuth } from './contexts/AuthContext';

// Lazy load pages for better performance
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Dreams = React.lazy(() => import('./pages/Dreams'));
const DreamDetail = React.lazy(() => import('./pages/DreamDetail'));
const DreamJournal = React.lazy(() => import('./pages/DreamJournal'));
const DreamAnalysis = React.lazy(() => import('./pages/DreamAnalysis'));
const Profile = React.lazy(() => import('./pages/Profile'));
const ProfileEdit = React.lazy(() => import('./pages/ProfileEdit'));
const Settings = React.lazy(() => import('./pages/Settings'));
const SettingsNotifications = React.lazy(() => import('./pages/Settings/Notifications'));
const SettingsPrivacy = React.lazy(() => import('./pages/Settings/Privacy'));
const SettingsAccount = React.lazy(() => import('./pages/Settings/Account'));
const Community = React.lazy(() => import('./pages/Community'));
const CommunityDiscussions = React.lazy(() => import('./pages/Community/Discussions'));
const CommunityMembers = React.lazy(() => import('./pages/Community/Members'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export const routes = [
  {
    element: <Layout />,
    children: [
      // Public routes
      { 
        path: '/', 
        element: <Home />,
        index: true
      },
      
      // Authentication routes
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <Login /> },
          { path: '/register', element: <Register /> },
          { path: '/auth/*', element: <Navigate to="/login" replace /> },
        ],
      },

      // Protected routes
      {
        path: '/dreams',
        children: [
          { 
            index: true, 
            element: <ProtectedRoute><Dreams /></ProtectedRoute> 
          },
          { 
            path: ':id', 
            element: <ProtectedRoute><DreamDetail /></ProtectedRoute> 
          },
          { 
            path: 'journal', 
            element: <ProtectedRoute><DreamJournal /></ProtectedRoute> 
          },
          { 
            path: 'analysis', 
            element: <ProtectedRoute><DreamAnalysis /></ProtectedRoute> 
          },
        ],
      },

      // Profile routes
      {
        path: '/profile',
        children: [
          { 
            index: true, 
            element: <ProtectedRoute><Profile /></ProtectedRoute> 
          },
          { 
            path: 'edit', 
            element: <ProtectedRoute><ProfileEdit /></ProtectedRoute> 
          },
        ],
      },

      // Settings routes
      {
        path: '/settings',
        children: [
          { 
            index: true, 
            element: <ProtectedRoute><Settings /></ProtectedRoute> 
          },
          { 
            path: 'notifications', 
            element: <ProtectedRoute><SettingsNotifications /></ProtectedRoute> 
          },
          { 
            path: 'privacy', 
            element: <ProtectedRoute><SettingsPrivacy /></ProtectedRoute> 
          },
          { 
            path: 'account', 
            element: <ProtectedRoute><SettingsAccount /></ProtectedRoute> 
          },
        ],
      },

      // Community routes
      {
        path: '/community',
        children: [
          { 
            index: true, 
            element: <ProtectedRoute><Community /></ProtectedRoute> 
          },
          { 
            path: 'discussions', 
            element: <ProtectedRoute><CommunityDiscussions /></ProtectedRoute> 
          },
          { 
            path: 'members', 
            element: <ProtectedRoute><CommunityMembers /></ProtectedRoute> 
          },
        ],
      },

      // 404 route
      { path: '*', element: <NotFound /> },
    ],
  },
];
