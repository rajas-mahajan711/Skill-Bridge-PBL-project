import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { Button } from '../../../components/ui/Button';
import { Target, CheckCircle2, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';

interface RoleReadinessWidgetProps {
  roleReadiness: {
    roleId: string;
    roleTitle: string;
    readinessScore: number;
    readinessBand: string;
    meetingSkills: string[];
    weakSkills: string[];
    missingSkills: string[];
    calculationSummary: string;
    disclaimer: string;
  } | null;
}

export const RoleReadinessWidget: React.FC<RoleReadinessWidgetProps> = ({ roleReadiness }) => {
  if (!roleReadiness) {
    return (
      <Card>
        <CardHeader title="Target Role Readiness" subtitle="Select a career role to measure alignment" />
        <div className="text-center py-6 px-4">
          <Target className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500 mb-3">No target career role selected yet.</p>
          <Link to="/student/skill-gap">
            <Button variant="primary" size="sm">
              Select Target Career Role
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  const getBandBadge = (band: string) => {
    switch (band) {
      case 'High Readiness':
        return <Badge variant="success">{band}</Badge>;
      case 'Moderate Readiness':
        return <Badge variant="teal">{band}</Badge>;
      case 'Developing':
        return <Badge variant="warning">{band}</Badge>;
      default:
        return <Badge variant="neutral">{band}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader
        title="Target Career Alignment"
        subtitle={`Target Role: ${roleReadiness.roleTitle}`}
        action={
          <Link to="/student/skill-gap">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Deep Analysis
            </Button>
          </Link>
        }
      />

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-4 rounded-xl bg-slate-50/70 border border-slate-100">
        {/* Score Ring / Number */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full border-4 border-teal-500 bg-white flex flex-col items-center justify-center shadow-xs flex-shrink-0">
            <span className="text-2xl font-bold text-slate-900 leading-none">
              {roleReadiness.readinessScore}%
            </span>
            <span className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5">Readiness</span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-bold text-slate-900">{roleReadiness.roleTitle}</h3>
              {getBandBadge(roleReadiness.readinessBand)}
            </div>
            <p className="text-xs text-slate-500 max-w-md leading-relaxed">
              {roleReadiness.calculationSummary}
            </p>
          </div>
        </div>

        {/* Breakdown Badges */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{roleReadiness.meetingSkills.length} Meeting</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 text-xs font-medium border border-amber-200/60">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>{roleReadiness.weakSkills.length} Weak</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-800 text-xs font-medium border border-rose-200/60">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>{roleReadiness.missingSkills.length} Missing</span>
          </div>
        </div>
      </div>

      {/* Missing Skills Warning */}
      {roleReadiness.missingSkills.length > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-amber-50/60 border border-amber-200/60 flex items-start gap-2.5 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Priority Gaps to Address: </span>
            <span>
              {roleReadiness.missingSkills.slice(0, 4).join(', ')}
              {roleReadiness.missingSkills.length > 4 ? ` and ${roleReadiness.missingSkills.length - 4} more` : ''}.
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};
