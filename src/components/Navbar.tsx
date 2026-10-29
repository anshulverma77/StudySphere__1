import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link, navigate, type Route } from '@/lib/router';
import { Avatar } from '@/components/Avatar';
import { useSubscription } from '@/hooks/useSubscription';
import {
  BookOpen,
  Users,
  PlusCircle,
  ListChecks,
  Video,
  UserCircle,
  Crown,
  LogOut,
  Menu,
  X,
  GraduationCap,
} from 'lucide-react';

interface NavItem {
  route: Route;
  label: string;
  icon: typeof BookOpen;
}

const navItems: NavItem[] = [
  { route: 'home', label: 'Home', icon: BookOpen },
  { route: 'community', label: 'Community', icon: Users },
  { route: 'ask', label: 'Ask Question', icon: PlusCircle },
  { route: 'my-questions', label: 'My Questions', icon: ListChecks },
  { route: 'live', label: 'Live Study', icon: Video },
  { route: 'premium', label: 'Premium', icon: Crown },
];

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const { isPremium } = useSubscription(user?.id);
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentHash = window.location.hash.replace(/^#\/?/, '').split('/')[0];

  const handleSignOut = async () => {
    await signOut();
    navigate('home');
  };

  return (
    <header className="sticky top-0 z-50 glass-light border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo with 3D animation */}
          <Link to="home" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="relative w-10 h-10 preserve-3d transition-transform duration-500 group-hover:[transform:rotateY(180deg)]">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg backface-hidden">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg backface-hidden rotate-y-180">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="text-lg font-bold text-gray-900 hidden sm:block font-display">
              Study<span className="text-gradient-blue">Sphere</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentHash === item.route;
              const Icon = item.icon;
              return (
                <Link
                  key={item.route}
                  to={item.route}
                  className={`group relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {isActive && (
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100" />
                  )}
                  <Icon className="relative w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                  <span className="relative">{item.label}</span>
                  {item.route === 'premium' && isPremium && (
                    <span className="relative ml-0.5 text-amber-500 animate-bounce-subtle">★</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User menu */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="profile"
                  className="group flex items-center gap-2 hover:bg-gray-100/80 rounded-xl p-1 pr-3 transition-all duration-300"
                >
                  <div className="transition-transform duration-300 group-hover:scale-110">
                    <Avatar name={profile?.name ?? 'User'} src={profile?.avatar} size="sm" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                    {profile?.name ?? 'User'}
                  </span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="group flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors px-2 py-1.5 rounded-xl hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  <span className="hidden lg:block">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-xl transition-all duration-300 hover:bg-gray-100/80"
                >
                  Login
                </Link>
                <Link
                  to="signup"
                  className="group relative px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/30 hover:scale-105"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <div className="transition-transform duration-300" style={{ transform: mobileOpen ? 'rotate(90deg)' : 'rotate(0)' }}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu with slide-down animation */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 glass-light animate-fade-in-up">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const isActive = currentHash === item.route;
              const Icon = item.icon;
              return (
                <Link
                  key={item.route}
                  to={item.route}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border border-blue-100'
                      : 'text-gray-600 hover:bg-gray-100/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-3 border-t border-gray-200">
              {user ? (
                <>
                  <Link
                    to="profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100/80"
                  >
                    <UserCircle className="w-4 h-4" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link
                    to="login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl"
                  >
                    Login
                  </Link>
                  <Link
                    to="signup"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
