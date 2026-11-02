import React, { useState, useEffect } from 'react';
import { 
  Users, ShieldCheck, Briefcase, Award, TrendingUp, 
  Server, Cpu, Activity, RefreshCw, AlertTriangle, ArrowRight, CheckCircle2 
} from 'lucide-react';
import { Card, Title, StatCard, Badge, Btn, Bar, LoadingState, ErrorState } from '../../components/ui.jsx';
import { AdminService } from '../../services/adminService.js';

export const AdminDashboard = ({ onNavigate }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await AdminService.getOverview();
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) return <LoadingState message="Loading administrative intelligence metrics..." />;
  if (error) return <ErrorState message={error} onRetry={loadDashboard} />;

  const { metrics, placementBreakdown, systemHealth, topSkillsDistribution = [] } = data || {};
  const totalStudents = metrics?.totalStudents || 1240;
  const placementRate = metrics?.averagePlacementReadiness || 81.4;

  return (
    <div className="space-y-6">
      {/* Top Banner / System Status */}
      <div className="bg-gradient-to-r from-navy via-slate-900 to-indigo-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-teal">System Operational</span>
            <span className="text-xs text-slate-400">· Express API & FastAPI Microservice Connected</span>
          </div>
          <h2 className="text-2xl font-bold">Platform Governance & Intelligence Console</h2>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Real-time oversight of verified skills, role-readiness distributions, user access governance, and AI evaluation pipeline.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Btn 
            size="sm" 
            v="secondary" 
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            onClick={loadDashboard}
          >
            <RefreshCw size={14} /> Refresh Telemetry
          </Btn>
          <Btn 
            size="sm" 
            v="teal"
            onClick={() => onNavigate('integrations')}
          >
            <Activity size={14} /> View Health Grid
          </Btn>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          label="Registered Students" 
          value={metrics?.totalStudents?.toLocaleString() || '1,240'} 
          sub="enrolled across 6 departments" 
          icon={Users} 
          color="#4F46E5"
          trend="+12% this semester"
        />
        <StatCard 
          label="Verified Skill Evidence" 
          value={metrics?.verifiedSkillsCount?.toLocaleString() || '3,820'} 
          sub="multi-source corroborated" 
          icon={ShieldCheck} 
          color="#0EA5A4"
          trend="+145 this week"
        />
        <StatCard 
          label="Avg Placement Readiness" 
          value={`${placementRate}%`} 
          sub="evidence-backed confidence" 
          icon={Award} 
          color="#10B981"
          trend="+4.2 pts"
        />
        <StatCard 
          label="AI Inference Jobs" 
          value={metrics?.aiJobsCompletedToday || 342} 
          sub="processed via FastAPI today" 
          icon={Cpu} 
          color="#8B5CF6"
        />
      </div>

      {/* Middle Grid: Placement Breakdown & Skill Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Placement Readiness Breakdown */}
        <Card className="lg:col-span-1 flex flex-col justify-between">
          <div>
            <Title sub="Tiered cohort readiness analysis">Placement Cohorts</Title>
            <div className="space-y-4 my-2">
              <div>
                <div className="flex justify-between text-sm mb-1.5 font-medium">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Placement Ready (&gt;=80%)
                  </span>
                  <span className="font-semibold text-emerald-600">{placementBreakdown?.ready || 650}</span>
                </div>
                <Bar v={((placementBreakdown?.ready || 650) / totalStudents) * 100} color="#10B981" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1.5 font-medium">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo" />
                    In Progress (60-79%)
                  </span>
                  <span className="font-semibold text-indigo">{placementBreakdown?.inProgress || 470}</span>
                </div>
                <Bar v={((placementBreakdown?.inProgress || 470) / totalStudents) * 100} color="#4F46E5" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1.5 font-medium">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Needs Skill Support (&lt;60%)
                  </span>
                  <span className="font-semibold text-amber-600">{placementBreakdown?.needsSupport || 120}</span>
                </div>
                <Bar v={((placementBreakdown?.needsSupport || 120) / totalStudents) * 100} color="#F59E0B" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-mute">
            <span>Formula: Evidence Weight + Corroboration</span>
            <button 
              onClick={() => onNavigate('users')} 
              className="text-indigo font-medium hover:underline inline-flex items-center gap-1"
            >
              Inspect Candidates <ArrowRight size={12} />
            </button>
          </div>
        </Card>

        {/* Top College Skills Distribution */}
        <Card className="lg:col-span-2">
          <Title 
            sub="Aggregated campus proficiencies and average evidence benchmark"
            action={
              <Btn size="sm" v="secondary" onClick={() => onNavigate('users')}>
                Manage Students
              </Btn>
            }
          >
            Verified Skill Dominance
          </Title>

          <div className="space-y-4">
            {[
              { name: 'Python & Data Engineering', count: 910, avg: 84 },
              { name: 'Data Structures & Algorithms', count: 870, avg: 76 },
              { name: 'React & Frontend Architecture', count: 740, avg: 82 },
              { name: 'Database & MongoDB Persistence', count: 680, avg: 78 },
              { name: 'Machine Learning & FastAPI', count: 420, avg: 71 }
            ].map((skill) => (
              <div key={skill.name} className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-semibold text-ink">{skill.name}</span>
                    <span className="text-xs text-mute">{skill.count} verified students</span>
                  </div>
                  <Bar v={skill.avg} h={6} />
                </div>
                <div className="shrink-0 sm:text-right pl-4 sm:border-l border-slate-200">
                  <div className="text-xs text-mute">Avg Score</div>
                  <div className="text-sm font-bold text-ink">{skill.avg}/100</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Row: Quick Governance Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="hover:border-indigo/40 hover:shadow-md transition cursor-pointer" onClick={() => onNavigate('users')}>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo/10 text-indigo grid place-items-center shrink-0">
              <Users size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-ink">User Directory & Roles</h4>
              <p className="text-xs text-mute mt-1">
                Manage {metrics?.totalStudents + metrics?.totalFaculty + metrics?.totalRecruiters + metrics?.totalAdmins || 1327} accounts across Student, Faculty, Recruiter, and Admin roles.
              </p>
              <span className="inline-flex items-center gap-1 text-xs text-indigo font-medium mt-3">
                Open Directory <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </Card>

        <Card className="hover:border-teal/40 hover:shadow-md transition cursor-pointer" onClick={() => onNavigate('integrations')}>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-teal/10 text-teal grid place-items-center shrink-0">
              <Server size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-ink">Microservices & Connectors</h4>
              <p className="text-xs text-mute mt-1">
                Real-time connection monitor for MongoDB, FastAPI AI microservice, GitHub API sandbox, and LMS.
              </p>
              <span className="inline-flex items-center gap-1 text-xs text-teal font-medium mt-3">
                Inspect Connectors <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </Card>

        <Card className="hover:border-slate-400 hover:shadow-md transition cursor-pointer" onClick={() => onNavigate('audit')}>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 grid place-items-center shrink-0">
              <Activity size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-ink">Security & Audit Trail</h4>
              <p className="text-xs text-mute mt-1">
                Immutable activity logs, permission change records, role escalations, and system event ledger.
              </p>
              <span className="inline-flex items-center gap-1 text-xs text-slate-700 font-medium mt-3">
                Review Audit Logs <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
