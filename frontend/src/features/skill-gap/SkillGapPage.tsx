import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { skillService } from '../../services/skillService';
import { RoleDefinition } from '../../types/role';
import { SkillGapAnalysisData, SkillGapItem } from '../../types/skill';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { ProgressBar } from '../../components/ui/ProgressBar';
import {
  LineChart,
  Target,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ArrowRight,
  BookOpen,
  Info,
  RefreshCw,
  FolderGit2,
  Sparkles,
} from 'lucide-react';

export const SkillGapPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const roleQuery = searchParams.get('role');

  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [analysisData, setAnalysisData] = useState<SkillGapAnalysisData | null>(null);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceEngine, setSourceEngine] = useState<string>('FastAPI AI Service / Deterministic Rubric');

  const navigate = useNavigate();

  // Load available roles on mount
  useEffect(() => {
    const fetchRoles = async () => {
      setLoadingRoles(true);
      try {
        const res = await skillService.getRoles();
        const availableRoles = res.roles || [];
        setRoles(availableRoles);

        if (availableRoles.length > 0) {
          if (roleQuery) {
            const matched = availableRoles.find(
              (r) => r.title.toLowerCase().includes(roleQuery.toLowerCase()) || r.slug.includes(roleQuery.toLowerCase())
            );
            setSelectedRoleId(matched ? matched._id : availableRoles[0]._id);
          } else {
            setSelectedRoleId(availableRoles[0]._id);
          }
        }
      } catch (err: any) {
        console.error('[SkillGap] Roles fetch error:', err);
        setError('Failed to fetch career role definitions.');
      } finally {
        setLoadingRoles(false);
      }
    };
    fetchRoles();
  }, [roleQuery]);

  // Run analysis whenever selectedRoleId changes
  useEffect(() => {
    if (!selectedRoleId) return;

    const runAnalysis = async () => {
      setAnalyzing(true);
      setError(null);
      try {
        const res = await skillService.runAnalysis(selectedRoleId);
        setAnalysisData(res.data);
        setSourceEngine(res.source || 'Deterministic Explainable Rubric');
      } catch (err: any) {
        console.error('[SkillGap] Analysis error:', err);
        setError(err.response?.data?.message || 'Error running skill gap analysis.');
      } finally {
        setAnalyzing(false);
      }
    };

    runAnalysis();
  }, [selectedRoleId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'meeting':
      case 'met':
        return (
          <Badge variant="success" size="sm">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Meets Requirement
          </Badge>
        );
      case 'weak':
      case 'partial':
        return (
          <Badge variant="warning" size="sm">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Needs Improvement
          </Badge>
        );
      case 'insufficient_evidence':
        return (
          <Badge variant="blue" size="sm">
            <HelpCircle className="w-3.5 h-3.5 mr-1" /> Limited Evidence
          </Badge>
        );
      case 'missing':
      default:
        return (
          <Badge variant="danger" size="sm">
            <XCircle className="w-3.5 h-3.5 mr-1" /> No Evidence Available
          </Badge>
        );
    }
  };

  const currentRole = roles.find((r) => r._id === selectedRoleId);

  return (
    <div className="space-y-6">
      {/* 1. Top Section: Header & Target Role Selector */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <LineChart className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Skill Gap Analysis</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium max-w-xl">
            Compare target industry career requirements with your verified portfolio evidence to identify exactly where to focus.
          </p>
        </div>

        {/* Role Selector Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
            Target Role:
          </label>
          <select
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            disabled={loadingRoles || analyzing}
            className="text-xs bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:opacity-50"
          >
            {roles.map((r) => (
              <option key={r._id} value={r._id}>
                {r.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {analyzing ? (
        <div className="space-y-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      ) : analysisData && (
        <>
          {/* 2. Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Overall Alignment */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Readiness Alignment</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-blue-700">{analysisData.readiness_score}%</span>
                <Badge variant={analysisData.readiness_score >= 70 ? 'success' : 'warning'} size="sm">
                  {analysisData.readiness_band}
                </Badge>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Calculated across {analysisData.total_required_skills} competency rubrics
              </p>
            </div>

            {/* Skills Met */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Skills Matched</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-emerald-700">
                  {analysisData.skills_meeting_count}
                </span>
                <span className="text-xs text-slate-400">/ {analysisData.total_required_skills} requirements</span>
              </div>
              <p className="mt-1 text-[11px] text-emerald-600 font-medium">
                Meets or exceeds minimum placement threshold
              </p>
            </div>

            {/* Skills Developing */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Skills Requiring Improvement</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-amber-700">
                  {analysisData.skills_weak_count}
                </span>
                <span className="text-xs text-slate-400">skills developing</span>
              </div>
              <p className="mt-1 text-[11px] text-amber-600 font-medium">
                Partial evidence available; score below target
              </p>
            </div>

            {/* Missing Evidence */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Missing Evidence</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-rose-700">
                  {analysisData.skills_missing_count + analysisData.skills_insufficient_count}
                </span>
                <span className="text-xs text-slate-400">unevidenced</span>
              </div>
              <p className="mt-1 text-[11px] text-rose-600 font-medium">
                No verified artifacts linked in portfolio
              </p>
            </div>
          </div>

          {/* 3. Main Comparison Table */}
          <Card className="bg-white border border-slate-200/90 shadow-sm overflow-hidden p-0">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Skill-by-Skill Requirement Comparison
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Benchmarks for <strong>{analysisData.role_title}</strong> with suggested bridging actions.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Engine: {sourceEngine}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4 font-bold">Skill</th>
                    <th className="py-3 px-4 font-bold">Role Requirement</th>
                    <th className="py-3 px-4 font-bold">Current Evidence Level</th>
                    <th className="py-3 px-4 font-bold">Gap Status</th>
                    <th className="py-3 px-4 font-bold">Recommended Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analysisData.gaps.map((gap) => (
                    <tr key={gap.skill_name} className="hover:bg-slate-50/70 transition-colors">
                      {/* Skill Name & Category */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        <div>
                          <span>{gap.skill_name}</span>
                          <span className="text-[10px] text-slate-400 font-normal block">
                            {gap.category}
                          </span>
                        </div>
                      </td>

                      {/* Role Requirement */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-700">{gap.required_level}/100</span>
                          <span className="text-[10px] text-slate-400 capitalize">
                            ({gap.importance})
                          </span>
                        </div>
                      </td>

                      {/* Current Evidence / Level */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {gap.current_level !== null ? (
                          <div>
                            <span className="font-bold text-blue-700">{gap.current_level}/100</span>
                            <span className="text-[10px] text-slate-400 block">
                              {gap.evidence_count} artifact(s) linked
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No evidence available</span>
                        )}
                      </td>

                      {/* Gap Status Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(gap.status)}
                      </td>

                      {/* Recommended Action & Direct Links */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <p className="text-slate-700 text-xs leading-relaxed">
                          {gap.suggested_action}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {gap.status !== 'meeting' && (
                            <Link
                              to={`/student/recommendations?skill=${encodeURIComponent(gap.skill_name)}`}
                              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                            >
                              <BookOpen className="w-3 h-3" /> View Courses
                            </Link>
                          )}
                          <Link
                            to="/student/evidence"
                            className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-0.5"
                          >
                            <FolderGit2 className="w-3 h-3" /> Add Proof
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
                {analysisData.calculation_summary}
              </span>
              <span className="text-[11px] text-slate-400">{analysisData.disclaimer}</span>
            </div>
          </Card>

          {/* 4. Detailed Gap Explanations */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Why Each Identified Gap Matters for {analysisData.role_title}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisData.gaps
                .filter((g) => g.status !== 'meeting')
                .map((gap) => (
                  <div
                    key={gap.skill_name}
                    className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold text-slate-900">{gap.skill_name}</h4>
                        {getStatusBadge(gap.status)}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mb-3">
                        {gap.why_it_matters}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        Deficit: {gap.gap_difference} points to threshold
                      </span>
                      <Link to={`/student/recommendations?skill=${encodeURIComponent(gap.skill_name)}`}>
                        <Button variant="ghost" size="sm" className="text-xs text-blue-600 font-semibold" rightIcon={<ArrowRight className="w-3 h-3" />}>
                          Start Course
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
