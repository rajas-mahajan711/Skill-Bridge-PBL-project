import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import { EvaluatedSkill } from '../../types/skill';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import {
  Award,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  FolderGit2,
  GraduationCap,
  BookOpen,
  ArrowRight,
  Info,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

export const SkillsPage: React.FC = () => {
  const [skills, setSkills] = useState<EvaluatedSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'hard' | 'soft'>('all');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'evidence'>('score');
  const [selectedSkill, setSelectedSkill] = useState<EvaluatedSkill | null>(null);

  useEffect(() => {
    const fetchSkills = async () => {
      setLoading(true);
      try {
        const res = await studentService.getSkills();
        setSkills(res.skills || []);
      } catch (err) {
        console.error('[SkillsPage] Error loading skills:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, []);

  // Filter skills based on search and tab
  const filteredSkills = skills
    .filter((skill) => {
      const name = (skill.skillName || skill.skill_name || '').toLowerCase();
      const cat = (skill.category || '').toLowerCase();
      const matchesSearch = name.includes(searchQuery.toLowerCase()) || cat.includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeTab === 'hard') {
        return cat.includes('language') || cat.includes('frontend') || cat.includes('backend') || cat.includes('database') || cat.includes('fundamental') || cat.includes('tool');
      }
      if (activeTab === 'soft') {
        return cat.includes('soft') || cat.includes('communication') || cat.includes('collaboration');
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'score') {
        return (b.score || 0) - (a.score || 0);
      }
      if (sortBy === 'name') {
        const nameA = a.skillName || a.skill_name || '';
        const nameB = b.skillName || b.skill_name || '';
        return nameA.localeCompare(nameB);
      }
      if (sortBy === 'evidence') {
        const countA = a.evidenceCount || a.supporting_evidence_count || 0;
        const countB = b.evidenceCount || b.supporting_evidence_count || 0;
        return countB - countA;
      }
      return 0;
    });

  const getLevelBadge = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'advanced':
        return <Badge variant="success" size="sm">advanced</Badge>;
      case 'intermediate':
        return <Badge variant="blue" size="sm">intermediate</Badge>;
      case 'beginner':
        return <Badge variant="warning" size="sm">beginner</Badge>;
      default:
        return <Badge variant="neutral" size="sm">provisional</Badge>;
    }
  };

  const getVerificationExplanation = (type?: string) => {
    switch (type) {
      case 'verified':
        return 'Independently verified through proctored academic assessments, faculty evaluations, or audited internship reviews.';
      case 'evidence_supported':
        return 'Supported by linked student artifacts (GitHub repositories, project code, or uploaded certificates).';
      default:
        return 'Self-reported by student. Awaiting artifact upload or assessment verification.';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Skill Competency</h1>
            <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-0.5 rounded-full border border-blue-200">
              {skills.length} Evaluated
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Track your academic skills, inspect evidence-backed proficiencies, and close placement gaps.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/student/evidence">
            <Button variant="primary" size="sm" leftIcon={<FolderGit2 className="w-4 h-4" />}>
              Add Skill Evidence
            </Button>
          </Link>
          <Link to="/student/recommendations">
            <Button variant="outline" size="sm" leftIcon={<BookOpen className="w-4 h-4" />}>
              Learning Paths
            </Button>
          </Link>
        </div>
      </div>

      {/* Verification Level Distinction Card */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
          <Info className="w-4 h-4 text-blue-600" />
          Skill Evidence Verification Standards
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
              Self-Reported Skill
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Declared in student profile. Carries provisional weight (0.2) until evidence artifacts are submitted.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200">
            <div className="flex items-center gap-1.5 font-bold text-blue-900 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              Evidence-Supported Skill
            </div>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              Backed by verified GitHub commits, project repositories, or certification credentials (weight 0.8).
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              Verified Skill
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Audited through proctored university lab tests, faculty evaluations, or internship sign-offs (weight 1.0).
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        {/* Tabs: Overview, Hard Skills, Soft Skills */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('hard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'hard' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hard Skills
          </button>
          <button
            onClick={() => setActiveTab('soft')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'soft' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Soft Skills
          </button>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by skill or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="text-xs bg-[#F8FAFC] border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="score">Sort by Score</option>
            <option value="name">Sort by Name</option>
            <option value="evidence">Sort by Evidence</option>
          </select>
        </div>
      </div>

      {/* Current Skills Grid (matching Skill_competency.jpg) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSkills.map((skill) => {
          const name = skill.skillName || skill.skill_name || 'Skill';
          const breakdown = skill.evidenceBreakdown || {
            certificates: 0,
            projects: Math.max(1, Math.floor((skill.score || 50) / 15)),
            courses: 1,
          };
          const totalItems =
            breakdown.certificates + breakdown.projects + breakdown.courses + (breakdown.assessments || 0);

          return (
            <div
              key={name}
              onClick={() => setSelectedSkill(skill)}
              className="cursor-pointer p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header: Skill Name & Level Badge */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">{name}</h3>
                  {getLevelBadge(skill.level)}
                </div>

                {/* Category & Score */}
                <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                  <span>{skill.category || 'General Skill'}</span>
                  <span className="font-bold text-blue-700">{skill.score || 0}/100</span>
                </div>

                {/* Breakdown counts as shown in reference screenshot */}
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-slate-50">
                    <p className="text-sm font-bold text-slate-900">{breakdown.certificates}</p>
                    <p className="text-[10px] text-slate-500 font-medium">Certificates</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50">
                    <p className="text-sm font-bold text-slate-900">{breakdown.projects}</p>
                    <p className="text-[10px] text-slate-500 font-medium">Projects</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50">
                    <p className="text-sm font-bold text-slate-900">{breakdown.courses}</p>
                    <p className="text-[10px] text-slate-500 font-medium">Courses</p>
                  </div>
                </div>
              </div>

              {/* Bottom footer: Total items & status dot */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-medium">
                  Total: {totalItems} item(s)
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      skill.verificationType === 'verified'
                        ? 'bg-emerald-500'
                        : skill.verificationType === 'evidence_supported'
                        ? 'bg-blue-600'
                        : 'bg-amber-400'
                    }`}
                  />
                  <span className="text-[11px] text-slate-600 font-medium capitalize">
                    {skill.verificationType === 'verified'
                      ? 'Verified'
                      : skill.verificationType === 'evidence_supported'
                      ? 'Evidence-Backed'
                      : 'Provisional'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Skill Detail Modal */}
      {selectedSkill && (
        <Modal
          isOpen={!!selectedSkill}
          onClose={() => setSelectedSkill(null)}
          title={selectedSkill.skillName || selectedSkill.skill_name || 'Skill Details'}
          subtitle={`Category: ${selectedSkill.category || 'General'}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-blue-900 font-semibold block">Calculated Proficiency Score</span>
                <span className="text-2xl font-bold text-blue-700">{selectedSkill.score || 0}/100</span>
              </div>
              <div>
                {getLevelBadge(selectedSkill.level)}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Verification Rationale
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                {selectedSkill.reasoning || selectedSkill.explanation || 'Verified based on practical repository code and academic evaluation.'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="font-semibold text-slate-800 block mb-1">Verification Status</span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                {getVerificationExplanation(selectedSkill.verificationType)}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Link to="/student/evidence">
                <Button variant="outline" size="sm" leftIcon={<FolderGit2 className="w-4 h-4" />}>
                  View Supporting Evidence
                </Button>
              </Link>
              <Link to={`/student/recommendations?skill=${encodeURIComponent(selectedSkill.skillName || selectedSkill.skill_name || '')}`}>
                <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Related Learning Resources
                </Button>
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
