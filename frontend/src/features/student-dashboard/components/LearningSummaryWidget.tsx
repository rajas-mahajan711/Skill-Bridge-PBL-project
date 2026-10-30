import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader } from '../../../components/ui/Card';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { Button } from '../../../components/ui/Button';
import { GraduationCap, ArrowRight, Lightbulb, CheckCircle2 } from 'lucide-react';

interface LearningSummaryWidgetProps {
  summary: {
    activeCount: number;
    completedCount: number;
    totalEnrolled: number;
    progressPercentage: number;
    suggestedNextAction: string;
  };
}

export const LearningSummaryWidget: React.FC<LearningSummaryWidgetProps> = ({ summary }) => {
  return (
    <Card className="bg-white border border-slate-200/90 shadow-sm">
      <CardHeader
        title="Learning & Skill Bridging"
        subtitle="Targeted modules addressing identified skill gaps"
        action={
          <Link to="/student/recommendations">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5 text-blue-600" />}>
              Open Courses
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">{summary.activeCount}</div>
            <div className="text-[11px] text-slate-500 font-medium">In Progress</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">{summary.completedCount}</div>
            <div className="text-[11px] text-slate-500 font-medium">Completed</div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <ProgressBar
          value={summary.progressPercentage}
          label="Learning Curriculum Completion"
          color="blue"
        />
      </div>

      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/60 flex items-start gap-2.5">
        <Lightbulb className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="text-xs font-semibold text-blue-950 block">Suggested Next Step</span>
          <p className="text-xs text-blue-900 mt-0.5 leading-relaxed">
            {summary.suggestedNextAction}
          </p>
        </div>
      </div>
    </Card>
  );
};
