import React from 'react';
import { School, ArrowRight, BarChart3, Users } from 'lucide-react';
import { Card, Btn, Badge } from '../../components/ui.jsx';

export const FacultyPlaceholder = ({ onSwitchToAdmin }) => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="p-6 bg-gradient-to-r from-teal-900 to-navy text-white rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="faculty">Workstream: Person 4 Ownership</Badge>
          <span className="text-xs text-slate-300">Faculty / Training & Placement</span>
        </div>
        <h2 className="text-2xl font-bold">Faculty & T&P Analytics Portal</h2>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
          This portal belongs to Person 4. It provides department-level skill distribution, cohort placement readiness, missing curriculum competencies, and training progress.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="w-10 h-10 rounded-xl bg-teal/10 text-teal grid place-items-center mb-3">
            <BarChart3 size={20} />
          </div>
          <h4 className="font-semibold text-ink">Agreed Contract Interfaces</h4>
          <ul className="text-xs text-mute mt-2 space-y-1.5 list-disc list-inside">
            <li><code className="text-teal">GET /api/v1/faculty/analytics</code></li>
            <li><code className="text-teal">GET /api/v1/faculty/students</code></li>
            <li><code className="text-teal">POST /api/v1/faculty/endorsements</code></li>
          </ul>
        </Card>

        <Card className="p-5">
          <div className="w-10 h-10 rounded-xl bg-navy text-white grid place-items-center mb-3">
            <Users size={20} />
          </div>
          <h4 className="font-semibold text-ink">Role Separation Verification</h4>
          <p className="text-xs text-mute mt-2 leading-relaxed">
            Backend RBAC verifies that Faculty accounts cannot perform administrative actions or view recruiter private shortlists.
          </p>
        </Card>
      </div>

      <Btn size="md" v="teal" onClick={onSwitchToAdmin}>
        Return to Admin Console (Person 5) <ArrowRight size={16} />
      </Btn>
    </div>
  );
};
