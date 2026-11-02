import React from 'react';
import { Briefcase, ArrowRight, UserCheck, Search, ShieldAlert } from 'lucide-react';
import { Card, Btn, Badge } from '../../components/ui.jsx';

export const RecruiterPlaceholder = ({ onSwitchToAdmin }) => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="p-6 bg-gradient-to-r from-amber-900 to-navy text-white rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="recruiter">Workstream: Person 4 Ownership</Badge>
          <span className="text-xs text-slate-300">Recruiter / Corporate Hiring Partner</span>
        </div>
        <h2 className="text-2xl font-bold">Recruiter Intelligence & Shortlist Hub</h2>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
          This portal belongs to Person 4. It enables job description ingestion, AI candidate ranking with explainable match metrics, and candidate shortlisting.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 grid place-items-center mb-3">
            <Search size={20} />
          </div>
          <h4 className="font-semibold text-ink">Agreed Contract Interfaces</h4>
          <ul className="text-xs text-mute mt-2 space-y-1.5 list-disc list-inside">
            <li><code className="text-amber-700">POST /api/v1/recruiter/jobs</code></li>
            <li><code className="text-amber-700">GET /api/v1/recruiter/jobs/:id/candidates</code></li>
            <li><code className="text-amber-700">POST /api/v1/recruiter/shortlist</code></li>
          </ul>
        </Card>

        <Card className="p-5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 grid place-items-center mb-3">
            <ShieldAlert size={20} />
          </div>
          <h4 className="font-semibold text-ink">Strict Privacy Compliance</h4>
          <p className="text-xs text-mute mt-2 leading-relaxed">
            Per the Person 5 Integration Contract, recruiters can only view candidates who have granted consent (`consentGiven: true`). Rankings exclude sensitive personal attributes.
          </p>
        </Card>
      </div>

      <Btn size="md" v="secondary" onClick={onSwitchToAdmin}>
        Return to Admin Console (Person 5) <ArrowRight size={16} />
      </Btn>
    </div>
  );
};
