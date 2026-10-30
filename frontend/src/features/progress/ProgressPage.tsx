import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Award,
  BookOpen,
  Search,
  Sparkles,
  Info,
} from 'lucide-react';
import { mockRoles } from '../../services/mockData';

interface SkillRow {
  name: string;
  yourScore: number;
  requiredScore: number;
  status: 'Met' | 'Partial' | 'Gap';
}

export const ProgressPage: React.FC = () => {
  const [selectedRoleTitle, setSelectedRoleTitle] = useState('Software Development Engineer (SDE)');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const skillsData: SkillRow[] = [
    { name: 'Data Structures & Algorithms (DSA)', yourScore: 70, requiredScore: 80, status: 'Gap' },
    { name: 'C++ Programming', yourScore: 75, requiredScore: 70, status: 'Met' },
    { name: 'Object Oriented Programming (OOP)', yourScore: 70, requiredScore: 75, status: 'Partial' },
    { name: 'Database Management Systems (DBMS)', yourScore: 60, requiredScore: 75, status: 'Gap' },
    { name: 'Problem Solving', yourScore: 65, requiredScore: 80, status: 'Partial' },
    { name: 'Web Development', yourScore: 75, requiredScore: 70, status: 'Met' },
    { name: 'System Design', yourScore: 50, requiredScore: 70, status: 'Gap' },
    { name: 'Communication Skills', yourScore: 70, requiredScore: 70, status: 'Met' },
    { name: 'Team Collaboration', yourScore: 80, requiredScore: 70, status: 'Met' },
  ];

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 500);
  };

  const getStatusBadge = (status: 'Met' | 'Partial' | 'Gap') => {
    switch (status) {
      case 'Met':
        return (
          <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            Met
          </span>
        );
      case 'Partial':
        return (
          <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-200">
            Partial
          </span>
        );
      case 'Gap':
        return (
          <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-rose-50 text-rose-700 border border-rose-200">
            Gap
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Section (matching overall_readiness.png) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overall Readiness</h1>
            <p className="text-xs text-slate-500 font-medium">
              Get a complete view of your skill development and placement readiness.
            </p>
          </div>
        </div>

        {/* Target Job Role & Analyze Button */}
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

      {/* 2. Top Metric Cards Row (matching overall_readiness.png) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Readiness Circular Score Card */}
        <Card className="bg-white border border-slate-200/90 shadow-sm p-6 flex flex-col sm:flex-row items-center gap-6">
          {/* Circular Gauge */}
          <div className="relative w-32 h-32 flex items-center justify-center flex-shrink-0">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#E2E8F0"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#10B981"
                strokeWidth="10"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 * (1 - 0.72)}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-extrabold text-slate-900">72%</span>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">Overall Readiness Score</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Your current skill level compared to job role requirements.
            </p>
            <div className="mt-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Good Progress
              </span>
            </div>
          </div>
        </Card>

        {/* 4 Stat Cards Grid (2/3 of row) */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
          {/* Total Skills Assessed */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-slate-700">
              <span className="text-sm">📚</span>
              <span className="text-[11px] font-bold">Total Skills Assessed</span>
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-slate-900">10</span>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Completed
              </p>
            </div>
          </div>

          {/* Skills Met */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-emerald-700">
              <span className="text-sm">✓</span>
              <span className="text-[11px] font-bold">Skills Met</span>
            </div>
            <div className="mt-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-slate-900">7 / 10</span>
                <span className="text-[10px] text-slate-500 font-semibold">70%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '70%' }} />
              </div>
            </div>
          </div>

          {/* Skills Partial */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-amber-700">
              <span className="text-sm">⏳</span>
              <span className="text-[11px] font-bold">Skills Partial</span>
            </div>
            <div className="mt-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-slate-900">2 / 10</span>
                <span className="text-[10px] text-slate-500 font-semibold">20%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '20%' }} />
              </div>
            </div>
          </div>

          {/* Skills Gap */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-rose-700">
              <span className="text-sm">⚠</span>
              <span className="text-[11px] font-bold">Skills Gap</span>
            </div>
            <div className="mt-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-slate-900">1 / 10</span>
                <span className="text-[10px] text-slate-500 font-semibold">10%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: '10%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Skill-wise Readiness & Readiness Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Skill-wise Readiness Table */}
        <div className="lg:col-span-2">
          <Card className="bg-white border border-slate-200/90 shadow-sm overflow-hidden p-0">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Skill-wise Readiness</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparison of your verified competency scores vs minimum target threshold.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4 font-bold">Skill</th>
                    <th className="py-3 px-4 font-bold">Your Score</th>
                    <th className="py-3 px-4 font-bold">Required Score</th>
                    <th className="py-3 px-4 font-bold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {skillsData.map((sk) => (
                    <tr key={sk.name} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {sk.name}
                      </td>

                      {/* Your Score Bar */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 w-6">{sk.yourScore}</span>
                          <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${sk.yourScore}%` }} />
                          </div>
                        </div>
                      </td>

                      {/* Required Score Bar */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-500 w-6">{sk.requiredScore}</span>
                          <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div className="bg-slate-400 h-2 rounded-full" style={{ width: `${sk.requiredScore}%` }} />
                          </div>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {getStatusBadge(sk.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column (1/3): Readiness Breakdown Radar & Key Insights */}
        <div className="space-y-4">
          <Card className="bg-white border border-slate-200/90 shadow-sm p-5">
            <h3 className="text-base font-bold text-slate-900 tracking-tight mb-2">Readiness Breakdown</h3>

            {/* Simulated Radar Chart Visualization (SVG) */}
            <div className="relative w-full h-56 flex items-center justify-center my-2">
              <svg className="w-56 h-56" viewBox="0 0 200 200">
                {/* Concentric Polygons */}
                <polygon points="100,20 176,75 147,165 53,165 24,75" fill="none" stroke="#E2E8F0" strokeWidth="1" />
                <polygon points="100,40 157,81 135,148 65,148 43,81" fill="none" stroke="#E2E8F0" strokeWidth="1" />
                <polygon points="100,60 138,87 123,132 77,132 62,87" fill="none" stroke="#E2E8F0" strokeWidth="1" />

                {/* Target Level Polygon (Grey) */}
                <polygon points="100,35 153,78 133,144 67,144 47,78" fill="rgba(148, 163, 184, 0.15)" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 3" />

                {/* Your Readiness Polygon (Blue) */}
                <polygon points="100,28 160,82 140,150 60,152 40,88" fill="rgba(37, 99, 235, 0.25)" stroke="#2563EB" strokeWidth="2" />

                {/* Data Points */}
                <circle cx="100" cy="28" r="3" fill="#2563EB" />
                <circle cx="160" cy="82" r="3" fill="#2563EB" />
                <circle cx="140" cy="150" r="3" fill="#2563EB" />
                <circle cx="60" cy="152" r="3" fill="#2563EB" />
                <circle cx="40" cy="88" r="3" fill="#2563EB" />
              </svg>

              {/* Dimension Labels */}
              <span className="absolute top-0 text-[10px] font-bold text-slate-700">Technical Skills (75%)</span>
              <span className="absolute top-16 right-0 text-[10px] font-bold text-slate-700">Problem Solving (65%)</span>
              <span className="absolute bottom-2 right-4 text-[10px] font-bold text-slate-700">Communication (70%)</span>
              <span className="absolute bottom-2 left-4 text-[10px] font-bold text-slate-700">Team Collab (80%)</span>
              <span className="absolute top-16 left-0 text-[10px] font-bold text-slate-700">Projects (60%)</span>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 text-xs mt-3 pt-3 border-t border-slate-100">
              <span className="flex items-center gap-1.5 text-blue-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Your Readiness
              </span>
              <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Target Level
              </span>
            </div>
          </Card>

          {/* Key Insights Box */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2">
            <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" /> Key Insights
            </h4>
            <ul className="space-y-1.5 text-xs text-blue-900">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Strong in C++ and Web Development.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Needs improvement in DSA, DBMS and System Design.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Good communication and team collaboration skills.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Focus on core technical skills to reach 80%+ overall readiness.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: Recommended Actions & Placement Readiness Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Actions (2/3) */}
        <div className="lg:col-span-2">
          <Card className="bg-white border border-slate-200/90 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="flex-1 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="text-blue-600">📋</span> Recommended Actions
                </h3>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center flex-shrink-0">
                      1
                    </span>
                    <span>Practice DSA regularly (arrays, linked lists, trees)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center flex-shrink-0">
                      2
                    </span>
                    <span>Revise DBMS concepts (normalization, queries)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center flex-shrink-0">
                      3
                    </span>
                    <span>Learn System Design basics (scalability, microservices)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center flex-shrink-0">
                      4
                    </span>
                    <span>Take mock interviews and solve coding problems</span>
                  </div>
                </div>
              </div>

              {/* Your Next Step sub-card */}
              <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200/80 w-full sm:w-64 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-blue-600" /> Your next step
                  </h4>
                  <p className="text-[11px] text-blue-800 mt-1 leading-relaxed">
                    Complete the recommended learning resources to improve your overall readiness score.
                  </p>
                </div>
                <Link to="/student/recommendations" className="mt-3">
                  <Button variant="primary" size="sm" className="w-full text-xs bg-blue-600 hover:bg-blue-700">
                    View Learning Resources →
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Placement Readiness Status Card (1/3) */}
        <div>
          <Card className="bg-white border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-2">
                <span>🏆</span> Placement Readiness Status
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">72%</span>
                <span className="text-xs font-semibold text-slate-600">You are close to being placement ready!</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '72%' }} />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
              <span className="text-xl">🌱</span>
              <span>Keep improving! You're on the right track.</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
