import React, { useState } from 'react';
import { AppLayout } from './layouts/AppLayout.jsx';
import { AdminDashboard } from './pages/admin/AdminDashboard.jsx';
import { UserManagement } from './pages/admin/UserManagement.jsx';
import { IntegrationMonitor } from './pages/admin/IntegrationMonitor.jsx';
import { AuditTrail } from './pages/admin/AuditTrail.jsx';
import { AdminSettings } from './pages/admin/AdminSettings.jsx';

import { StudentPlaceholder } from './pages/student/StudentPlaceholder.jsx';
import { FacultyPlaceholder } from './pages/faculty/FacultyPlaceholder.jsx';
import { RecruiterPlaceholder } from './pages/recruiter/RecruiterPlaceholder.jsx';

export default function App() {
  const [activeRole, setActiveRole] = useState('admin');
  const [currentAdminTab, setCurrentAdminTab] = useState('dashboard');

  const renderContent = () => {
    if (activeRole === 'student') {
      return <StudentPlaceholder onSwitchToAdmin={() => setActiveRole('admin')} />;
    }
    if (activeRole === 'faculty') {
      return <FacultyPlaceholder onSwitchToAdmin={() => setActiveRole('admin')} />;
    }
    if (activeRole === 'recruiter') {
      return <RecruiterPlaceholder onSwitchToAdmin={() => setActiveRole('admin')} />;
    }

    // Default: Admin Console (Person 5 Ownership)
    switch (currentAdminTab) {
      case 'dashboard':
        return <AdminDashboard onNavigate={(tab) => setCurrentAdminTab(tab)} />;
      case 'users':
        return <UserManagement />;
      case 'integrations':
        return <IntegrationMonitor />;
      case 'audit':
        return <AuditTrail />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminDashboard onNavigate={(tab) => setCurrentAdminTab(tab)} />;
    }
  };

  return (
    <AppLayout
      currentTab={currentAdminTab}
      setCurrentTab={setCurrentAdminTab}
      activeRole={activeRole}
      setActiveRole={setActiveRole}
    >
      {renderContent()}
    </AppLayout>
  );
}
