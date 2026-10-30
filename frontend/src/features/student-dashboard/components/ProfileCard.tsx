import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { Button } from '../../../components/ui/Button';
import { UserCheck, GraduationCap, Building2, Calendar, ArrowUpRight } from 'lucide-react';

interface ProfileCardProps {
  summary: {
    name: string;
    email: string;
    college: string;
    department: string;
    currentYear: number;
    graduationYear: number;
    completionPercentage: number;
  };
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ summary }) => {
  const initials = summary.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'AM';

  return (
    <Card className="relative overflow-hidden bg-white border border-slate-200/90 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Avatar & Basic Info */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-bold text-xl flex items-center justify-center shadow-md flex-shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{summary.name}</h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                <UserCheck className="w-3 h-3" />
                Student
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{summary.email}</p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {summary.college}
              </span>
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                {summary.department}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Year {summary.currentYear} • Class of {summary.graduationYear}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Profile Completion & Edit Action */}
        <div className="flex flex-col sm:items-end justify-between gap-3 sm:border-l sm:border-slate-100 sm:pl-6">
          <div className="w-full sm:w-44">
            <ProgressBar
              value={summary.completionPercentage}
              label="Profile Completion"
              color="blue"
              size="sm"
            />
          </div>
          <Link to="/student/profile">
            <Button
              variant="outline"
              size="sm"
              rightIcon={<ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />}
              className="text-xs hover:border-blue-400 hover:text-blue-600"
            >
              Update Profile
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};
