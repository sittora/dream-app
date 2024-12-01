import { BookOpen, Brain, Share2, Sparkles, Book, User, Settings } from 'lucide-react';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import RecordDreams from '../pages/RecordDreams';
import JungianAnalysis from '../pages/JungianAnalysis';
import DreamWeb from '../pages/DreamWeb';
import Oracle from '../pages/Oracle';
import Resources from '../pages/Resources';
import UserAccount from '../pages/UserAccount';
import AccountSettings from '../pages/AccountSettings';
import NotFound from '../pages/NotFound';

export const routes = {
  public: [
    {
      path: '/',
      element: Home,
      name: 'Home'
    },
    {
      path: '/login',
      element: Login,
      name: 'Login'
    },
    {
      path: '/register',
      element: Register,
      name: 'Register'
    },
  ],
  protected: [
    {
      path: '/record',
      element: RecordDreams,
      name: 'Record Dreams',
      icon: BookOpen
    },
    {
      path: '/analysis',
      element: JungianAnalysis,
      name: 'Jungian Analysis',
      icon: Brain
    },
    {
      path: '/dreamweb',
      element: DreamWeb,
      name: 'Dream Web',
      icon: Share2
    },
    {
      path: '/oracle',
      element: Oracle,
      name: 'The Oracle',
      icon: Sparkles
    },
    {
      path: '/resources',
      element: Resources,
      name: 'Resources',
      icon: Book
    },
    {
      path: '/account',
      element: UserAccount,
      name: 'Account',
      icon: User,
      children: [
        {
          path: '/account/settings',
          element: AccountSettings,
          name: 'Settings',
          icon: Settings
        }
      ]
    }
  ]
};

// Flatten all routes for easier access
export const allRoutes = [
  ...routes.public,
  ...routes.protected,
  ...routes.protected
    .filter(route => route.children)
    .flatMap(route => route.children || [])
];

// Helper function to get route by path
export const getRouteByPath = (path: string) => {
  return allRoutes.find(route => route.path === path);
};
