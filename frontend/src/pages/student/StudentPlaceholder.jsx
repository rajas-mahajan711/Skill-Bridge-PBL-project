import React from 'react';
import { GraduationCap, ArrowRight, ShieldCheck, Sparkles, Target, BookOpen } from 'lucide-react';
import { Card, Title, Btn, Badge } from '../../components/ui.jsx';

export const StudentPlaceholder = ({ onSwitchToAdmin }) => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="p-6 bg-gradient-to-r from-indigo-900 to-navy text-white rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="student">Workstream: Person 2 Ownership</Badge>
          <span className="text-xs text-slate-300">Student Experience & Skill Intelligence</span>
        </div>
        <h2 className="text-2xl font-bold">Student Skill Development Workspace</h2>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
          This portal belongs to Person 2. It integrates profile management, evidence uploads (GitHub, LeetCode, certificates), skill-gap radar, and personalized learning pathways.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="w-10 h-10 rounded-xl bg-indigo/10 text-indigo grid place-items-center mb-3">
            <Sparkles size={20} />
          </div>
          <h4 className="font-semibold text-ink">Agreed Contract Interfaces</h4>
          <ul className="text-xs text-mute mt-2 space-y-1.5 list-disc list-inside">
            <li><code className="text-indigo">GET /api/v1/student/profile</code></li>
            <li><code className="text-indigo">POST /api/v1/student/evidence</code></li>
            <li><code className="text-indigo">GET /api/v1/student/skills</code></li>
            <li><code className="text-indigo">GET /api/v1/student/gaps</code></li>
          </ul>
        </Card>

        <Card className="p-5">
          <div className="w-10 h-10 rounded-xl bg-teal/10 text-teal grid place-items-center mb-3">
            <ShieldCheck size={20} />
          </div>
          <h4 className="font-semibold text-ink">Person 5 Integration Guarantee</h4>
          <p className="text-xs text-mute mt-2 leading-relaxed">
            As Integration Lead, Person 5 has verified backend models, shared Tailwind design tokens, and route protection. Person 2's components plug directly into this shell.
          </p>
        </Card>
      </div>

      <Btn size="md" v="primary" onClick={onSwitchToAdmin}>
        Return to Admin Console (Person 5) <ArrowRight size={16} />
      </Btn>
    </div>
  );
};
