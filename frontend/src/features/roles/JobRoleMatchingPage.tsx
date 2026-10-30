import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Briefcase,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { mockRoles } from '../../services/mockData';

interface MatchRow {
  skill: string;
  yourScore: number;
  requiredScore: number;
  status: 'Matched' | 'Partial' | 'Gap';
  gap: number;
}

export const JobRoleMatchingPage: React.FC = () => {
  const [selectedRoleTitle, setSelectedRoleTitle] = useState('Software Development Engineer (SDE)');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const matchData: MatchRow[] = [
    { skill: 'Data Structures & Algorithms (DSA)', yourScore: 70, requiredScore: 80, status: 'Partial', gap: 10 },
    { skill: 'C++ Programming', yourScore: 75, requiredScore: 70, status: 'Matched', gap: 0 },
    { skill: 'Object Oriented Programming (OOP)', yourScore: 70, requiredScore: 75, status: 'Gap', gap: 5 },
    { skill: 'Database Management Systems (DBMS)', yourScore: 60, requiredScore: 75, status: 'Gap', gap: 15 },
    { skill: 'Problem Solving', yourScore: 65, requiredScore: 80, status: 'Partial', gap: 15 },
    { skill: 'Web Development', yourScore: 75, requiredScore: 70, status: 'Matched', gap: 0 },
    { skill: 'System Design', yourScore: 50, requiredScore: 70, status: 'Gap', gap: 20 },
    { skill: 'Communication Skills', yourScore: 70, requiredScore: 70, status: 'Matched', gap: 0 },
    { skill: 'Team Collaboration', yourScore: 80, requiredScore: 70, status: 'Matched', gap: 0 },
  ];

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 500);
  };

  const otherRoles = [
    { title: 'Software Development Engineer (SDE)', match: 78 },
    { title: 'Frontend Developer', match: 72 },
    { title: 'Backend Developer', match: 68 },
    { title: 'Full Stack Developer', match: 65 },
    { title: 'Data Analyst', match: 58 },
  ];

  const getStatusBadge = (status: 'Matched' | 'Partial' | 'Gap') => {
    switch (status) {
      case 'Matched':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">Matched</span>;
      case 'Partial':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-200">Partial</span>;
      case 'Gap':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-rose-50 text-rose-700 border border-rose-200">Gap</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Row (matching job_roll_matching.png) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Job Role Matching</h1>
            <p className="text-xs text-slate-500 font-medium">
              Find out how well your skills match with your target job roles and discover relevant opportunities.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">Target Job Role:</span>
            <select
              value={selectedRoleTitle}
              onChange={(e) => setSelectedRoleTitle(e.target.value)}
              className="text-xs bg-[#F8FAFC] border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              {mockRoles.map((r) => (
                <option key={r._id} value={r.title}>
                  {r.title}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleAnalyze}
            isLoading={isAnalyzing}
            leftIcon={<Search className="w-3.5 h-3.5" />}
            className="bg-blue-600 hover:bg-blue-700 text-xs"
          >
            Analyze
          </Button>
        </div>
      </div>

      {/* 2. Top Match Gauge & Role Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Match Score Card (2/3) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center gap-6">
          {/* Circular 78% Gauge */}
          <div className="relative w-32 h-32 flex items-center justify-center flex-shrink-0">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="#E2E8F0" strokeWidth="10" fill="none" />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#10B981"
                strokeWidth="10"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 * (1 - 0.78)}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-extrabold text-slate-900">78%</span>
              <span className="text-[10px] text-slate-500 font-semibold">Match Score</span>
            </div>
          </div>

          <div className="space-y-4 flex-1">
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Good Match!</strong>
                <p className="mt-0.5 text-emerald-900">
                  Your skills are <strong>78% aligned</strong> with the requirements for <strong>{selectedRoleTitle}</strong>.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block">Matching Skills</span>
                  <span className="text-lg font-bold text-slate-900">7 / 9</span>
                </div>
                <span className="text-blue-600 text-xl font-bold">✓</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block">Gaps Identified</span>
                  <span className="text-lg font-bold text-rose-700">2</span>
                </div>
                <span className="text-rose-600 text-xl font-bold">!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Role Details Card (1/3) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-blue-600" /> Job Role Details
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Role:</span>
                <span className="font-semibold text-slate-900 text-right">{selectedRoleTitle}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Experience Level:</span>
                <span className="font-semibold text-slate-900">Entry Level (0–2 years)</span>
              </div>
              <div className="pb-2 border-b border-slate-100">
                <span className="text-slate-500 block mb-1">Key Skills:</span>
                <p className="font-semibold text-slate-800 leading-relaxed text-[11px]">
                  DSA, C++, OOP, DBMS, System Design, Problem Solving, Web Development
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3">
            <Link to="/student/skill-gap" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              View Detailed Requirement Rubric <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Skill Match Analysis & Other Roles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skill Match Analysis Table (2/3) */}
        <div className="lg:col-span-2">
          <Card className="bg-white border border-slate-200/90 shadow-sm overflow-hidden p-0">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Skill Match Analysis</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluation breakdown against requirements for {selectedRoleTitle}.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4 font-bold">Skill</th>
                    <th className="py-3 px-4 font-bold">Your Score</th>
                    <th className="py-3 px-4 font-bold">Required Score</th>
                    <th className="py-3 px-4 font-bold text-center">Match Status</th>
                    <th className="py-3 px-4 font-bold text-center">Gap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {matchData.map((row) => (
                    <tr key={row.skill} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {row.skill}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 w-6">{row.yourScore}</span>
                          <div className="w-20 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${row.yourScore}%` }} />
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-500 w-6">{row.requiredScore}</span>
                          <div className="w-20 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-slate-400 h-1.5 rounded-full" style={{ width: `${row.requiredScore}%` }} />
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {getStatusBadge(row.status)}
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap font-bold">
                        {row.gap > 0 ? (
                          <span className="text-rose-600">+{row.gap}</span>
                        ) : (
                          <span className="text-emerald-600">0</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Matching with Other Job Roles List (1/3) */}
        <div>
          <Card className="bg-white border border-slate-200/90 shadow-sm p-5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" /> Matching with Other Job Roles
            </h3>

            <div className="space-y-3">
              {otherRoles.map((role) => (
                <div
                  key={role.title}
                  onClick={() => setSelectedRoleTitle(role.title)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedRoleTitle === role.title
                      ? 'border-blue-400 bg-blue-50/50'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-900">{role.title}</span>
                    <span className="font-bold text-blue-700">{role.match}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${role.match}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* 4. Bottom Row: Top Missing Skills, Recommended Actions & CTA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Missing Skills */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" /> Top Missing Skills
          </h3>

          <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200/80">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-slate-900">System Design</span>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">Gap: 20</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Learn system design concepts and practice scalable architecture.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200/80">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-slate-900">Database Management Systems (DBMS)</span>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">Gap: 15</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Practice SQL, normalization and database concepts.
            </p>
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-blue-600" /> Recommended Actions
          </h3>

          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0">1</span>
              <span>Complete DSA practice (arrays, linked lists, trees)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0">2</span>
              <span>Learn system design basics (scalability, microservices)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0">3</span>
              <span>Take DBMS course and solve SQL problems</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0">4</span>
              <span>Build real-world projects (e.g., full-stack web app)</span>
            </div>
          </div>
        </div>

        {/* CTA Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md mb-3">
              🚀
            </div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Get Closer to Your Dream Job</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Complete the recommended learning resources and improve your skill score to get a higher match with your target role.
            </p>
          </div>

          <Link to="/student/recommendations" className="mt-4">
            <Button variant="primary" size="sm" className="w-full text-xs bg-blue-600 hover:bg-blue-700">
              View Recommended Resources
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
