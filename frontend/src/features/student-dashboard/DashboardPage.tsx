import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { studentService, DashboardResponse } from '../../services/studentService';
import { useAuth } from '../../hooks/useAuth';
import { ProfileCard } from './components/ProfileCard';
import { RoleReadinessWidget } from './components/RoleReadinessWidget';
import { RecommendedRolesWidget } from './components/RecommendedRolesWidget';
import { RecentActivityFeed } from './components/RecentActivityFeed';
import { LearningSummaryWidget } from './components/LearningSummaryWidget';
import { Skeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import {
  Sparkles,
  RefreshCw,
  Award,
  FileCheck,
  Target,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  Github,
  BookOpen,
  ChevronRight,
  Info,
} from 'lucide-react';
import { mockRoles } from '../../services/mockData';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedExplorerRoleId, setSelectedExplorerRoleId] = useState<string>('role-sde');

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await studentService.getDashboard();
      setData(res);
    } catch (err: any) {
      console.error('[Dashboard] Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-36 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  const studentName = user?.name || data.profileSummary.name || 'Student';
  const skillsList = data.skillsOverview.topSkills || [];

  const categories = [
    'All',
    'Programming Languages',
    'Frontend Development',
    'Backend Development',
    'Database Management',
    'Computer Science Fundamentals',
    'Soft Skills',
  ];

  const filteredSkills = selectedCategory === 'All'
    ? skillsList
    : skillsList.filter((s) => s.category?.toLowerCase() === selectedCategory.toLowerCase());

  const currentRole = mockRoles.find((r) => r._id === selectedExplorerRoleId) || mockRoles[0];

  return (
    <div className="space-y-6">
      {/* 1. Welcome Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back, <span className="text-blue-600">{studentName}</span>
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Verified Student
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1.5 font-medium">
            Track your skills, close your skill gaps, and prepare for your target role.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {data.isDemo && (
            <span className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg font-medium">
              Demo Preview Mode
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboard}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            className="text-xs text-slate-600"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* 2. Four Key Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Skills Identified */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Skills Identified</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{data.skillsOverview.totalEvaluated}</span>
            <span className="text-xs text-slate-400">Technical & Soft Skills</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Backed by projects, tests & code reviews
          </p>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link to="/student/skills" className="text-blue-600 font-medium hover:underline flex items-center gap-1">
              View Competency <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 2: Evidence Items */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Evidence Items</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">7</span>
            <span className="text-xs text-slate-400">Audited Artifacts</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Certificates, GitHub repos & assessments
          </p>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link to="/student/evidence" className="text-blue-600 font-medium hover:underline flex items-center gap-1">
              Manage Evidence <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 3: Target Role Readiness */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Target Role Readiness</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{data.roleReadiness?.readinessScore || 72}%</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Good Progress
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 truncate">
            Target: {data.roleReadiness?.roleTitle || 'SDE'}
          </p>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link to="/student/progress" className="text-blue-600 font-medium hover:underline flex items-center gap-1">
              Readiness Report <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 4: Learning Progress */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Learning Progress</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{data.learningSummary.progressPercentage}%</span>
            <span className="text-xs text-slate-400">Curriculum Completed</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            {data.learningSummary.activeCount} in progress • {data.learningSummary.completedCount} completed
          </p>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link to="/student/recommendations" className="text-blue-600 font-medium hover:underline flex items-center gap-1">
              Course Catalog <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Academic Profile Overview */}
      <ProfileCard summary={data.profileSummary} />

      {/* 4. Skills Overview with Category Filtering */}
      <Card className="bg-white border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Skill Competency Overview</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Evidence-supported scores, independent verification indicators, and artifact counts.
            </p>
          </div>
          <Link to="/student/skills">
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5 text-blue-600" />}>
              Open Full Skill Manager
            </Button>
          </Link>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Skill Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredSkills.map((skill) => (
            <div
              key={skill.skillName || skill.skill_name}
              className="p-3.5 rounded-xl border border-slate-200 bg-[#F8FAFC] hover:border-blue-300 hover:bg-white transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                    {skill.skillName || skill.skill_name}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {skill.category || 'General'}
                  </span>
                </div>
                <Badge
                  variant={
                    skill.level === 'advanced'
                      ? 'success'
                      : skill.level === 'intermediate'
                      ? 'blue'
                      : 'warning'
                  }
                  size="sm"
                >
                  {skill.level || 'Intermediate'}
                </Badge>
              </div>

              {/* Score Bar */}
              <div className="mt-3">
                <div className="flex justify-between items-center text-[11px] mb-1">
                  <span className="text-slate-500">Proficiency Score</span>
                  <span className="font-bold text-blue-700">{skill.score || 0}/100</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${skill.score || 0}%` }}
                  />
                </div>
              </div>

              {/* Evidence count & verification badge */}
              <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  {skill.evidenceCount || skill.supporting_evidence_count || 1} evidence item(s)
                </span>
                <span className="text-[10px] text-slate-400 capitalize">
                  {skill.verificationType === 'verified'
                    ? 'Verified'
                    : skill.verificationType === 'evidence_supported'
                    ? 'Evidence-Backed'
                    : 'Self-Reported'}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-xl bg-blue-50/60 border border-blue-200/60 text-[11px] text-blue-900 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Verification Standard:</strong> Self-reported skills remain provisional until corroborated by uploaded certificates, GitHub repository commits, or proctored assessments.
          </span>
        </div>
      </Card>

      {/* 5. Target Career Alignment & Learning Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RoleReadinessWidget roleReadiness={data.roleReadiness} />
        <LearningSummaryWidget summary={data.learningSummary} />
      </div>

      {/* 6. Target Role Explorer Section */}
      <Card className="bg-white border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Explore Career Role Requirements</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select an industry job profile to inspect required proficiencies and your current alignment.
            </p>
          </div>
          <select
            value={selectedExplorerRoleId}
            onChange={(e) => setSelectedExplorerRoleId(e.target.value)}
            className="text-xs bg-[#F8FAFC] border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          >
            {mockRoles.map((r) => (
              <option key={r._id} value={r._id}>
                {r.title}
              </option>
            ))}
          </select>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-slate-900">{currentRole.title}</h4>
            <Link
              to={`/student/skill-gap?role=${encodeURIComponent(currentRole.title)}`}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Full Gap Breakdown <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <p className="text-xs text-slate-600 mb-4">{currentRole.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {currentRole.requiredSkills.map((req) => (
              <div key={req.skillName} className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-800">{req.skillName}</p>
                  <span className="text-[10px] text-slate-400 capitalize">{req.importance} • Min Level {req.minLevel}</span>
                </div>
                <Badge variant={req.importance === 'required' ? 'blue' : 'neutral'} size="sm">
                  {req.importance}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 7. Recommended Next Actions */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-blue-300">Action Plan</span>
            <h3 className="text-lg font-bold mt-1">Recommended Next Steps for Software Engineering Placement</h3>
            <p className="text-xs text-blue-100 mt-1 max-w-2xl leading-relaxed">
              Based on your target role gap analysis, complete these recommended actions to maximize your placement readiness score.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link to="/student/evidence">
              <Button size="sm" className="bg-white text-blue-900 hover:bg-blue-50 text-xs font-bold" leftIcon={<UploadCloud className="w-3.5 h-3.5" />}>
                Upload Resume / Project
              </Button>
            </Link>
            <Link to="/student/recommendations">
              <Button size="sm" className="bg-blue-700 hover:bg-blue-600 text-white border border-blue-500 text-xs font-bold" leftIcon={<BookOpen className="w-3.5 h-3.5" />}>
                Start DSA Course
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 8. Recommended Roles & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecommendedRolesWidget roles={data.recommendedRoles} />
        </div>
        <div>
          <RecentActivityFeed activities={data.recentActivity} />
        </div>
      </div>
    </div>
  );
};
