import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  LogOut,
  User,
  ChevronDown,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface TopNavbarProps {
  onToggleSidebar: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onToggleSidebar }) => {
  const { user, profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/student/recommendations?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const studentName = user?.name || profile?.user?.name || 'Aamrapali More';
  const studentInitials = studentName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'AM';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Mobile toggle & Search Input */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg lg:hidden"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md hidden sm:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search skills, roles, or resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-slate-200 rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
          </div>
        </form>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notifications Button with Red Badge */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
              3
            </span>
          </button>

          {/* Notifications Dropdown Panel */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-3 z-50 text-left">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Notifications</span>
                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  3 unread
                </span>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                <div className="p-3 hover:bg-slate-50 transition-colors">
                  <p className="font-semibold text-slate-800">Skill Evidence Verified</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Your capstone project evidence has been approved by the department audit.
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">10 mins ago</span>
                </div>
                <div className="p-3 hover:bg-slate-50 transition-colors">
                  <p className="font-semibold text-slate-800">New Learning Recommendation</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    DSA Practice — Arrays & Linked Lists matches your target SDE gap.
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">1 hour ago</span>
                </div>
                <div className="p-3 hover:bg-slate-50 transition-colors">
                  <p className="font-semibold text-slate-800">Target Role Readiness</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Overall readiness improved to 72% for Software Development Engineer.
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">Yesterday</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile menu dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {studentInitials}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-slate-800 leading-tight">{studentName}</p>
              <p className="text-[11px] text-slate-500 leading-tight">Student</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-1.5 z-50">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{studentName}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email || 'student@skillbridge.edu'}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded-md">
                  Student Member
                </span>
              </div>

              <div className="py-1">
                <Link
                  to="/student/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  My Profile
                </Link>
                <Link
                  to="/student/skills"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-400" />
                  My Skills
                </Link>
                <Link
                  to="/student/progress"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  Overall Readiness
                </Link>
              </div>

              <div className="border-t border-slate-100 py-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
