import React from 'react';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Clock, FileCheck, CheckCircle2, Award, FolderGit2, BookOpen, Target } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  date: string;
  status: string;
}

interface RecentActivityFeedProps {
  activities: ActivityItem[];
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ activities }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'evidence':
      case 'evidence_submission':
        return <FolderGit2 className="w-4 h-4 text-blue-600" />;
      case 'assessment':
      case 'assessment_result':
        return <Award className="w-4 h-4 text-indigo-600" />;
      case 'learning':
        return <BookOpen className="w-4 h-4 text-emerald-600" />;
      case 'role':
        return <Target className="w-4 h-4 text-amber-600" />;
      default:
        return <FileCheck className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="success" size="sm">Verified</Badge>;
      case 'in_progress':
        return <Badge variant="blue" size="sm">In Progress</Badge>;
      case 'pending':
        return <Badge variant="warning" size="sm">Pending</Badge>;
      default:
        return <Badge variant="neutral" size="sm">Logged</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className="bg-white border border-slate-200/90 shadow-sm">
      <CardHeader title="Recent Evidence Activity" subtitle="Audit trail of student submissions and verifications" />

      {activities.length === 0 ? (
        <div className="text-center py-6 text-slate-400 text-xs">
          No recent activity recorded yet.
        </div>
      ) : (
        <div className="flow-root">
          <ul className="-mb-4 divide-y divide-slate-100">
            {activities.map((act) => (
              <li key={act.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
                    {getActivityIcon(act.type)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 line-clamp-1">{act.title}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {formatDate(act.date)}
                    </p>
                  </div>
                </div>
                <div>{getStatusBadge(act.status)}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};
