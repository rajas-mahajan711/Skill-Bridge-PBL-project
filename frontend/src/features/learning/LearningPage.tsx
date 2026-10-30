import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { learningService } from '../../services/learningService';
import { LearningResource } from '../../types/learning';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import {
  GraduationCap,
  ExternalLink,
  Play,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  BookOpen,
  Target,
  Trophy,
  Code2,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
  FileCode2,
  Check,
} from 'lucide-react';

export const LearningPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSkillFilter = searchParams.get('skill') || 'all';

  const [resources, setResources] = useState<LearningResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFocusArea, setSelectedFocusArea] = useState(initialSkillFilter);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedResourceModal, setSelectedResourceModal] = useState<LearningResource | null>(null);

  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await learningService.getResources({
        skill: selectedFocusArea !== 'all' ? selectedFocusArea : undefined,
        difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
        search: searchQuery.trim() || undefined,
      });
      setResources(res.resources || []);
    } catch (err: any) {
      console.error('[LearningPage] Fetch error:', err);
      setError('Failed to load learning resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [selectedFocusArea, selectedDifficulty]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResources();
  };

  const handleEnrollOrStart = async (resource: LearningResource) => {
    setUpdatingId(resource._id);
    try {
      await learningService.startOrUpdate(resource._id, 'in_progress', 20);
      await fetchResources();
    } catch (err) {
      console.error('Error starting course:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleProgressChange = async (resourceId: string, percentage: number) => {
    setUpdatingId(resourceId);
    try {
      await learningService.startOrUpdate(resourceId, percentage >= 100 ? 'completed' : 'in_progress', percentage);
      await fetchResources();
    } catch (err) {
      console.error('Error updating progress:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getProviderBadge = (provider?: string) => {
    const p = provider || 'SkillBridge';
    return (
      <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
        {p}
      </span>
    );
  };

  const getSkillIcon = (title: string, tags?: string[]) => {
    const text = (title + ' ' + (tags?.join(' ') || '')).toLowerCase();
    if (text.includes('dsa') || text.includes('algorithm') || text.includes('leetcode')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center font-mono font-bold text-sm flex-shrink-0">
          &lt;/&gt;
        </div>
      );
    }
    if (text.includes('react')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
          ⚛
        </div>
      );
    }
    if (text.includes('node') || text.includes('express')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 font-mono">
          JS
        </div>
      );
    }
    if (text.includes('mongodb') || text.includes('database')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center text-sm flex-shrink-0">
          🍃
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-sm flex-shrink-0">
        💻
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Focus Area & Search (matching skill_courses.png) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Skill Courses & Learning Resources
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Explore curated courses, tutorials and resources to improve your skills and close the gaps.
              </p>
            </div>
          </div>
        </div>

        {/* Focus Area Dropdown & Search Form */}
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">Focus Area:</span>
            <select
              value={selectedFocusArea}
              onChange={(e) => setSelectedFocusArea(e.target.value)}
              className="text-xs bg-[#F8FAFC] border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              <option value="all">All Skills</option>
              <option value="Data Structures & Algorithms (DSA)">Data Structures & Algorithms</option>
              <option value="Web Development">Web Development</option>
              <option value="System Design">System Design</option>
              <option value="Database Management Systems (DBMS)">DBMS</option>
              <option value="React">React</option>
            </select>
          </div>

          <div className="relative w-full sm:w-48">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <Button type="submit" variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs">
            Search
          </Button>
        </form>
      </div>

      {/* 2. Top Metric Stats Row (matching skill_courses.png) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500">Skill Gaps Identified</span>
            <p className="text-2xl font-bold text-slate-900">5</p>
            <span className="text-[11px] text-slate-400">areas need improvement</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500">Recommended Courses</span>
            <p className="text-2xl font-bold text-slate-900">12</p>
            <span className="text-[11px] text-slate-400">personalized for you</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500">Learning Hours (Est.)</span>
            <p className="text-2xl font-bold text-slate-900">48 hrs</p>
            <span className="text-[11px] text-slate-400">to reach target level</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500">Progress</span>
            <p className="text-2xl font-bold text-slate-900">60%</p>
            <span className="text-[11px] text-slate-400">overall skill development</span>
          </div>
        </div>
      </div>

      {/* 3. Main Split Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recommended Courses List (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header & Sort dropdown */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Recommended Courses</h2>
              <p className="text-[11px] text-slate-500">
                Based on your skill gaps and target job role (Software Development Engineer).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs bg-[#F8FAFC] border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-semibold focus:outline-none"
              >
                <option value="relevance">Relevance</option>
                <option value="duration">Duration</option>
                <option value="difficulty">Difficulty</option>
              </select>
            </div>
          </div>

          {/* Course Cards List */}
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 rounded-2xl" />
              <Skeleton className="h-32 rounded-2xl" />
              <Skeleton className="h-32 rounded-2xl" />
            </div>
          ) : resources.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No matching learning resources found</p>
              <p className="text-xs text-slate-400 mt-1">Try resetting the focus area or search term.</p>
            </div>
          ) : (
            resources.map((res) => {
              const progressPct = res.progressPercentage || res.studentProgress?.progressPercentage || 0;
              const tags = res.tags || (res.targetSkills ? [...res.targetSkills] : ['Skill Development']);

              return (
                <div
                  key={res._id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      {getSkillIcon(res.title, tags)}

                      <div>
                        <h3 className="text-sm font-bold text-slate-900 tracking-tight">{res.title}</h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{res.description}</p>

                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                          {tags.map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/50"
                            >
                              {t}
                            </span>
                          ))}
                        </div>

                        {/* Metadata row */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-slate-400">
                          {getProviderBadge(res.provider || res.sourceName)}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {res.estimatedDuration || `${res.estimatedHours} hrs`}
                          </span>
                          <span className="capitalize">{res.difficulty}</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Indicator & Actions */}
                    <div className="flex flex-col sm:items-end justify-between gap-3 flex-shrink-0 sm:border-l sm:border-slate-100 sm:pl-5">
                      <div className="w-full sm:w-28 text-right">
                        <span className="text-xs font-bold text-slate-700">{progressPct}%</span>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              progressPct >= 100 ? 'bg-emerald-600' : 'bg-blue-600'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedResourceModal(res)}
                          className="text-xs"
                        >
                          View Details
                        </Button>

                        {res.url || res.sourceUrl ? (
                          <a
                            href={res.url || res.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                              if (progressPct === 0) handleEnrollOrStart(res);
                            }}
                          >
                            <Button
                              variant="primary"
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-xs"
                            >
                              {progressPct > 0 ? 'Continue' : 'Enroll'}
                            </Button>
                          </a>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleEnrollOrStart(res)}
                            className="bg-blue-600 hover:bg-blue-700 text-xs"
                          >
                            {progressPct > 0 ? 'Continue' : 'Enroll'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Your Skill Gaps & Quick Learning Paths (1/3) */}
        <div className="space-y-4">
          {/* Your Skill Gaps Card */}
          <Card className="bg-white border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4 text-blue-600" />
                Your Skill Gaps
              </h3>
              <Link to="/student/skill-gap">
                <span className="text-xs font-semibold text-blue-600 hover:underline">View All</span>
              </Link>
            </div>

            <div className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    Data Structures & Algorithms (DSA)
                  </span>
                  <span className="text-rose-600 font-bold text-[11px]">Gap: 25%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Web Development
                  </span>
                  <span className="text-amber-600 font-bold text-[11px]">Gap: 20%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '80%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    System Design
                  </span>
                  <span className="text-amber-600 font-bold text-[11px]">Gap: 20%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '80%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Database Management Systems (DBMS)
                  </span>
                  <span className="text-emerald-600 font-bold text-[11px]">Gap: 15%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Communication Skills
                  </span>
                  <span className="text-emerald-600 font-bold text-[11px]">Gap: 10%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '90%' }} />
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Learning Paths Card */}
          <Card className="bg-white border border-slate-200/90 shadow-sm">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Quick Learning Paths
            </h3>

            <div className="space-y-2">
              <Link
                to="/student/recommendations?skill=Data%20Structures"
                className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 transition-all flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                    DSA Learning Path
                  </h4>
                  <p className="text-[11px] text-slate-500">Arrays, Linked Lists, Trees and more</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </Link>

              <Link
                to="/student/recommendations?skill=Web%20Development"
                className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 transition-all flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                    MERN Stack Path
                  </h4>
                  <p className="text-[11px] text-slate-500">MongoDB, Express, React, Node.js</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </Link>

              <Link
                to="/student/recommendations?skill=System%20Design"
                className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 transition-all flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                    System Design Path
                  </h4>
                  <p className="text-[11px] text-slate-500">Scalability, Microservices, Architecture</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </Link>

              <Link
                to="/student/recommendations?skill=Interview"
                className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 transition-all flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                    Interview Preparation
                  </h4>
                  <p className="text-[11px] text-slate-500">Mock Interviews & Practice Questions</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </Link>
            </div>
          </Card>

          {/* Keep Learning, Keep Growing Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 shadow-xs flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-emerald-950">Keep Learning, Keep Growing!</h4>
              <p className="text-[11px] text-emerald-800 mt-1 leading-relaxed">
                Small steps every day lead to big results. You're closer to your dream job than you think!
              </p>
            </div>
            <span className="text-2xl flex-shrink-0 ml-2">🌱</span>
          </div>
        </div>
      </div>

      {/* Course Detail & Progress Modal */}
      {selectedResourceModal && (
        <Modal
          isOpen={!!selectedResourceModal}
          onClose={() => setSelectedResourceModal(null)}
          title={selectedResourceModal.title}
          subtitle={`Provider: ${selectedResourceModal.provider || selectedResourceModal.sourceName || 'Curated'}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              {selectedResourceModal.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Difficulty</span>
                <span className="font-bold text-slate-800">{selectedResourceModal.difficulty}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Duration</span>
                <span className="font-bold text-slate-800">{selectedResourceModal.estimatedDuration || `${selectedResourceModal.estimatedHours} hrs`}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Target Skill</span>
                <span className="font-bold text-slate-800">{selectedResourceModal.targetSkill || 'General'}</span>
              </div>
            </div>

            {/* Interactive Progress Slider */}
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200">
              <label className="text-xs font-bold text-blue-950 block mb-2">
                Update Course Progress ({selectedResourceModal.progressPercentage || 0}%)
              </label>
              <div className="flex items-center gap-2">
                {[0, 25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => handleProgressChange(selectedResourceModal._id, pct)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      (selectedResourceModal.progressPercentage || 0) === pct
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-blue-100 border border-blue-200'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Button variant="secondary" size="sm" onClick={() => setSelectedResourceModal(null)}>
                Close
              </Button>
              {selectedResourceModal.url || selectedResourceModal.sourceUrl ? (
                <a
                  href={selectedResourceModal.url || selectedResourceModal.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="primary" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                    Open Course Website
                  </Button>
                </a>
              ) : null}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
