import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Briefcase, ArrowRight, Check, AlertCircle } from 'lucide-react';

interface RecommendedRolesWidgetProps {
  roles: {
    role_id: string;
    role_title: string;
    match_percentage: number;
    readiness_score: number;
    matching_skills: string[];
    missing_skills: string[];
    weak_skills: string[];
    reasons: string[];
  }[];
}

export const RecommendedRolesWidget: React.FC<RecommendedRolesWidgetProps> = ({ roles }) => {
  return (
    <Card className="bg-white border border-slate-200/90 shadow-sm">
      <CardHeader
        title="Recommended Career Roles"
        subtitle="Ranked by alignment with your verified competencies"
        action={
          <Link to="/student/roles">
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5 text-blue-600" />}>
              Explore All Roles
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roles.slice(0, 3).map((role) => (
          <div
            key={role.role_title}
            className="p-4 rounded-xl border border-slate-200/90 hover:border-blue-300 hover:shadow-sm bg-white transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">
                    {role.role_title}
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-blue-700">
                    {role.readiness_score || role.match_percentage}%
                  </span>
                  <p className="text-[10px] text-slate-400 font-medium">Match</p>
                </div>
              </div>

              {/* Rationale Bullet */}
              <div className="mt-3 space-y-1.5">
                {role.reasons.slice(0, 2).map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-600">
                    <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                {role.matching_skills.length} matching skill(s)
              </span>
              <Link to={`/student/skill-gap?role=${encodeURIComponent(role.role_title)}`}>
                <span className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  View Gap <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
        <AlertCircle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        <span>
          Role match ratings are computed from your verified projects, code repositories, and assessments.
        </span>
      </div>
    </Card>
  );
};
