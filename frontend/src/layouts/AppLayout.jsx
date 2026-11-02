import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, Server, Activity, Settings, 
  Menu, X, Bell, Search, ShieldCheck, ChevronDown, 
  GraduationCap, Briefcase, School, LogOut, ArrowRight 
} from 'lucide-react';
import { Logo, Badge, Btn } from '../components/ui.jsx';

export const AppLayout = ({ 
  currentTab, 
  setCurrentTab, 
  activeRole = 'admin', 
  setActiveRole, 
  children 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const adminNav = [
    { key: 'dashboard', label: 'Platform Overview', icon: LayoutDashboard },
    { key: 'users', label: 'User Directory', icon: Users },
    { key: 'integrations', label: 'Microservices & Health', icon: Server },
    { key: 'audit', label: 'Audit Trail', icon: Activity },
    { key: 'settings', label: 'System Policies', icon: Settings }
  ];

  const roleConfigs = {
    admin: { label: 'Admin Console', badge: 'Admin', icon: ShieldCheck, color: '#0B1F3A' },
    student: { label: 'Student Workspace', badge: 'Student', icon: GraduationCap, color: '#4F46E5' },
    faculty: { label: 'Faculty / T&P Portal', badge: 'Faculty', icon: School, color: '#0EA5A4' },
    recruiter: { label: 'Recruiter Hub', badge: 'Recruiter', icon: Briefcase, color: '#D97706' }
  };

  const currentRoleConfig = roleConfigs[activeRole] || roleConfigs.admin;

  const sidebarContent = (
    <div className="h-full bg-navy text-white flex flex-col p-5">
      {/* Brand Logo */}
      <div className="mb-6 flex items-center justify-between">
        <Logo dark size={34} />
      </div>

      {/* Role Pill */}
      <div className="mb-6 p-3 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <currentRoleConfig.icon size={18} className="text-teal" />
          <div className="leading-tight">
            <div className="text-xs font-semibold text-white">{currentRoleConfig.label}</div>
            <div className="text-[10px] text-slate-300">Person 5 Integration Lead</div>
          </div>
        </div>
        <span className="text-[10px] bg-teal/20 text-teal border border-teal/40 px-2 py-0.5 rounded font-mono font-semibold">
          v1.0
        </span>
      </div>

      {/* Navigation */}
      <nav className="space-y-1.5 flex-1">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2">
          Administration
        </div>
        {adminNav.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                setCurrentTab(item.key);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive
                  ? 'bg-teal text-white shadow-sm'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="pt-4 border-t border-white/10 text-xs text-slate-400 space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> API Gateway
          </span>
          <span className="font-mono text-[11px] text-slate-300">Port 5000</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> FastAPI
          </span>
          <span className="font-mono text-[11px] text-slate-300">Port 8000</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 w-64 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 relative z-10 shadow-2xl">
            {sidebarContent}
          </div>
          <div 
            className="flex-1 bg-navy/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-100"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-ink">
                {adminNav.find(n => n.key === currentTab)?.label || 'Console'}
              </h1>
              <Badge variant="live">Sprint Integrated</Badge>
            </div>
          </div>

          {/* Right Topbar Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Role Switcher (for QA / Demonstration) */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-ink transition"
              >
                <currentRoleConfig.icon size={14} className="text-teal" />
                <span className="hidden sm:inline">Role:</span>
                <span className="font-semibold">{currentRoleConfig.badge}</span>
                <ChevronDown size={14} className="text-mute" />
              </button>

              {roleDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs"
                  onClick={() => setRoleDropdownOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-mute">
                    Switch Workspace View
                  </div>
                  {Object.entries(roleConfigs).map(([key, cfg]) => {
                    const RoleIcon = cfg.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          setActiveRole && setActiveRole(key);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-50 transition ${
                          activeRole === key ? 'bg-indigo/5 text-indigo font-bold' : 'text-slate-700'
                        }`}
                      >
                        <RoleIcon size={16} />
                        <span className="flex-1">{cfg.label}</span>
                        {key === 'admin' ? (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 rounded">Person 5</span>
                        ) : (
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 rounded">P1-4</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <button className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal rounded-full" />
            </button>

            {/* Admin Profile Pill */}
            <div className="flex items-center gap-2.5 pl-2 sm:border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-navy text-white grid place-items-center text-xs font-bold">
                NV
              </div>
              <div className="hidden sm:block leading-tight text-left">
                <div className="text-xs font-bold text-ink">Dr. Neha Verma</div>
                <div className="text-[10px] text-mute">Admin Lead · QA Eng</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
