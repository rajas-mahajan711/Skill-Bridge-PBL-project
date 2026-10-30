import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import { StudentLayout } from '../components/layout/StudentLayout';
import { DashboardPage } from '../features/student-dashboard/DashboardPage';
import { ProfilePage } from '../features/student-profile/ProfilePage';
import { SkillsPage } from '../features/skills/SkillsPage';
import { EvidencePage } from '../features/skill-evidence/EvidencePage';
import { SkillGapPage } from '../features/skill-gap/SkillGapPage';
import { LearningPage } from '../features/learning/LearningPage';
import { JobRoleMatchingPage } from '../features/roles/JobRoleMatchingPage';
import { ProgressPage } from '../features/progress/ProgressPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/student/dashboard" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/student',
    element: (
      <ProtectedRoute allowedRoles={['student']}>
        <StudentLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/student/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'skills',
        element: <SkillsPage />,
      },
      {
        path: 'evidence',
        element: <EvidencePage />,
      },
      {
        path: 'skill-gap',
        element: <SkillGapPage />,
      },
      {
        path: 'recommendations',
        element: <LearningPage />,
      },
      {
        path: 'learning',
        element: <LearningPage />,
      },
      {
        path: 'roles',
        element: <JobRoleMatchingPage />,
      },
      {
        path: 'progress',
        element: <ProgressPage />,
      },
      {
        path: 'readiness',
        element: <ProgressPage />,
      },
    ],
  },
  {
    path: '*',
    element: (
      <div className="min-h-screen bg-[#F5F8FC] flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200/90 max-w-md">
          <h2 className="text-xl font-bold text-slate-900 mb-2">404 - Page Not Found</h2>
          <p className="text-xs text-slate-500 mb-6">
            The page you requested does not exist or has been relocated.
          </p>
          <a
            href="/student/dashboard"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
          >
            Return to Student Dashboard
          </a>
        </div>
      </div>
    ),
  },
]);
