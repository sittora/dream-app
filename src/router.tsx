import { createBrowserRouter } from 'react-router-dom';
import AccountSettings from './pages/AccountSettings';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import Layout from './components/Layout';
import ForgotPassword from './pages/ForgotPassword';
import JungianAnalysis from './pages/JungianAnalysis';
import Oracle from './pages/Oracle';
import Resources from './pages/Resources';
import UserAccount from './pages/UserAccount';
import DreamWeb from './pages/DreamWeb';
import RecordDreams from './pages/RecordDreams';
import Home from './pages/Home';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/record',
        element: (
          <ProtectedRoute>
            <RecordDreams />
          </ProtectedRoute>
        ),
      },
      {
        path: '/analysis',
        element: (
          <ProtectedRoute>
            <JungianAnalysis />
          </ProtectedRoute>
        ),
      },
      {
        path: '/oracle',
        element: (
          <ProtectedRoute>
            <Oracle />
          </ProtectedRoute>
        ),
      },
      {
        path: '/dreamweb',
        element: (
          <ProtectedRoute>
            <DreamWeb />
          </ProtectedRoute>
        ),
      },
      {
        path: '/resources',
        element: <Resources />,
      },
      {
        path: '/account',
        element: (
          <ProtectedRoute>
            <UserAccount />
          </ProtectedRoute>
        ),
      },
      {
        path: '/settings',
        element: (
          <ProtectedRoute>
            <AccountSettings />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
]);
