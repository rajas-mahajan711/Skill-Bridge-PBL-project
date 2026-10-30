import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  FolderGit2,
  Award,
  LineChart,
  BookOpen,
  Briefcase,
  Target,
  LogOut,
  GraduationCap,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      label: 'Dashboard',
      to: '/student/dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      label: 'My Profile',
      to: '/student/profile',
      icon: <User className="w-4 h-4" />,
    },
    {
      label: 'Skill Evidence',
      to: '/student/evidence',
      icon: <FolderGit2 className="w-4 h-4" />,
    },
    {
      label: 'My Skills',
      to: '/student/skills',
      icon: <Award className="w-4 h-4" />,
    },
    {
      label: 'Skill Gap Analysis',
      to: '/student/skill-gap',
      icon: <LineChart className="w-4 h-4" />,
    },
    {
      label: 'Learning Recommendations',
      to: '/student/recommendations',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      label: 'Job Role Matching',
      to: '/student/roles',
      icon: <Briefcase className="w-4 h-4" />,
    },
    {
      label: 'Overall Readiness',
      to: '/student/progress',
      icon: <Target className="w-4 h-4" />,
    },
  ];

  const studentName = user?.name || profile?.user?.name || 'Aamrapali More';
  const studentInitials = studentName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'AM';

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0F172A] border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-900/30">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight flex items-center gap-1">
                Skill<span className="text-blue-500">Bridge</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                Student Placement Portal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
          <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Menu
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`
              }
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom student profile summary & logout */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/70">
          <div className="flex items-center gap-3 px-2 py-2 mb-2 rounded-lg bg-slate-800/40 border border-slate-800">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
              {studentInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{studentName}</p>
              <p className="text-[11px] text-blue-400 truncate">Student Portal</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
