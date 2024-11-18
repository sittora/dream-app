import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, ChevronDown } from 'lucide-react';
import { Menu } from '@headlessui/react';
import MobileMenu from './MobileMenu';
import ThemeToggle from './ThemeToggle';
import { navItems } from '../config';

const Navbar = () => {
  const location = useLocation();
  
  return (
    <nav className="bg-mystic-900/50 backdrop-blur-sm border-b border-burgundy/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Moon className="w-6 h-6 text-burgundy" />
            <span className="title-font text-xl hidden sm:inline">Anima Insights</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            {navItems.map(({ path, label, icon: Icon, children }) => {
              if (children) {
                return (
                  <Menu as="div" className="relative" key={path}>
                    <Menu.Button className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-gray-400 hover:text-gray-200">
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                      <ChevronDown className="w-4 h-4" />
                    </Menu.Button>
                    <Menu.Items className="absolute right-0 mt-2 w-48 bg-mystic-900 rounded-lg shadow-xl border border-burgundy/20 py-1">
                      {children.map(child => (
                        <Menu.Item key={child.path}>
                          {({ active }) => (
                            <Link
                              to={child.path}
                              className={`flex items-center gap-2 px-4 py-2 ${
                                active ? 'bg-burgundy/20 text-burgundy' : 'text-gray-400'
                              }`}
                            >
                              <child.icon className="w-4 h-4" />
                              {child.label}
                            </Link>
                          )}
                        </Menu.Item>
                      ))}
                    </Menu.Items>
                  </Menu>
                );
              }

              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    location.pathname === path
                      ? 'bg-burgundy/20 text-burgundy'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <MobileMenu />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;