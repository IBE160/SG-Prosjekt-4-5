import React from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard } from 'lucide-react';
import backgroundImage from '../assets/learning-background.jpg';

function Layout() {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <div className="min-h-screen font-sans text-white bg-black">
      {/* Background Image and Overlay */}
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center z-0" 
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="fixed inset-0 w-full h-full bg-black/80 z-0" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="bg-black/30 backdrop-blur-sm sticky top-0 z-50 border-b border-white/20">
          <nav className="container mx-auto flex justify-between items-center p-4">
            <Link to="/" className="text-2xl font-bold text-white">
              Study Buddy
            </Link>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <span className="hidden sm:inline">Welcome, {user?.email || 'User'}</span>
                  <NavLink to="/dashboard" className={({ isActive }) => `flex items-center gap-2 p-2 rounded-md transition-colors ${isActive ? 'bg-white/20' : 'hover:bg-white/10'}`}>
                    <LayoutDashboard className="h-5 w-5" />
                    <span className="hidden md:inline">Dashboard</span>
                  </NavLink>
                  <button onClick={logout} className="flex items-center gap-2 p-2 rounded-md bg-red-600/80 text-white hover:bg-red-700/80 transition-colors">
                    <LogOut className="h-5 w-5" />
                    <span className="hidden md:inline">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className={({ isActive }) => `p-2 rounded-md transition-colors ${isActive ? 'bg-white/20' : 'hover:bg-white/10'}`}>Login</NavLink>
                  <NavLink to="/signup" className={({ isActive }) => `p-2 rounded-md transition-colors ${isActive ? 'bg-white/20' : 'hover:bg-white/10'}`}>Signup</NavLink>
                </>
              )}
            </div>
          </nav>
        </header>

        <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
          <Outlet />
        </main>

        <footer className="bg-black/30 backdrop-blur-sm p-4 text-center text-white/60 mt-8 border-t border-white/20">
          <p>&copy; 2025 Study Buddy. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default Layout;