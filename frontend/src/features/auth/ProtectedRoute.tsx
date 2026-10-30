import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Skeleton } from '../../components/ui/Skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = ['student'],
}) => {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-10 h-10 rounded-xl bg-teal-600 animate-spin flex items-center justify-center text-white" />
        <Skeleton className="h-6 w-48" />
        <p className="text-xs text-slate-500 font-medium">Verifying SkillBridge session...</p>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-8 max-w-md text-center">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Access Restricted</h2>
          <p className="text-sm text-slate-600 mb-4">
            Your current account role ({user.role}) is not authorized to access the student module.
          </p>
          <Navigate to="/login" replace />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
