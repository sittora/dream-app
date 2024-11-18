import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Settings, LogOut, Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = React.useState<'light' | 'dark' | 'system'>(
    user?.preferences?.theme || 'system'
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    // TODO: Update user preferences
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link
                to="/"
                className="flex items-center px-2 py-2 text-burgundy hover:text-burgundy/80"
              >
                <span className="font-cinzel text-xl">Anima Insights</span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 hover:text-burgundy dark:text-gray-300 dark:hover:text-burgundy rounded-lg transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              <Link
                to="/settings"
                className="p-2 text-gray-600 hover:text-burgundy dark:text-gray-300 dark:hover:text-burgundy rounded-lg transition-colors"
                aria-label="Account settings"
              >
                <Settings className="w-5 h-5" />
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-burgundy dark:text-gray-300 dark:hover:text-burgundy rounded-lg transition-colors"
                aria-label="Log out"
              >
                <LogOut className="w-5 h-5" />
              </button>

              <div className="relative">
                <button
                  className="flex items-center gap-2 p-2 text-gray-600 hover:text-burgundy dark:text-gray-300 dark:hover:text-burgundy rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-burgundy/10 flex items-center justify-center">
                    {user?.profile?.avatarUrl ? (
                      <img
                        src={user.profile.avatarUrl}
                        alt={user.profile.displayName || user.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-burgundy font-medium">
                        {user?.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:block">
                    {user?.profile?.displayName || user?.username}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
