import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';
import { Shield, Truck, BarChart3, Package, Train as Transfer, Users, LogOut, Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: <BarChart3 size={20} /> },
    { name: 'Purchases', path: '/purchases', icon: <Package size={20} /> },
    { name: 'Transfers', path: '/transfers', icon: <Transfer size={20} /> },
    { name: 'Assignment', path: '/assignments', icon: <Users size={20} /> },
    // Admin-only links (TODO: add RBAC logic)
    // ...(user && user.role_id === 1 ? [
    //   { name: 'Bases', path: '/bases', icon: <Shield size={20} /> },
    // ] : [])
  ];

  const isActive = (path: string) => location.pathname === path;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-navy-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Truck className="h-8 w-8 text-white" />
              <span className="ml-2 text-xl font-bold">MilAsset</span>
            </div>
          </div>

          {/* Desktop navigation links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    isActive(link.path)
                      ? 'bg-navy-900 text-white'
                      : 'text-gray-300 hover:bg-navy-700 hover:text-white'
                  } transition duration-150 ease-in-out`}
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-4 flex items-center">
              {user ? (
                <div className="flex items-center">
                  <span className="mr-4 text-sm font-medium">
                    {user.username}
                  </span>
                  <button
                    onClick={logout}
                    className="flex items-center text-gray-300 hover:bg-navy-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <LogOut size={18} className="mr-1" /> Log Out
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="text-gray-300 hover:bg-navy-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Log In
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-800 focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(link.path)
                    ? 'bg-navy-900 text-white'
                    : 'text-gray-300 hover:bg-navy-700 hover:text-white'
                } transition duration-150 ease-in-out`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="mr-2">{link.icon}</span>
                {link.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-navy-700">
            <div className="flex items-center px-5">
              {user && (
                <>
                  <div className="ml-3">
                    <div className="text-base font-medium leading-none text-white">
                      {user.username}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="mt-3 px-2 space-y-1">
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-navy-700 hover:text-white"
                >
                  <LogOut size={18} className="mr-2" /> Log Out
                </button>
              ) : (
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-navy-700 hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Log In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;