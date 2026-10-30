import React, { useEffect, useState } from 'react';
import { evidenceService } from '../../services/evidenceService';
import { EvidenceItem } from '../../types/evidence';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { AddEvidenceModal } from './components/AddEvidenceModal';
import {
  FolderGit2,
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  FileText,
  Award,
  Briefcase,
  Code2,
} from 'lucide-react';

export const EvidencePage: React.FC = () => {
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchEvidence = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await evidenceService.getEvidence({
        type: selectedType !== 'all' ? selectedType : undefined,
        search: search.trim() || undefined,
      });
      setEvidenceList(res.evidence || []);
    } catch (err: any) {
      console.error('[EvidencePage] Fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load evidence records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, [selectedType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEvidence();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this evidence record?')) return;
    setDeletingId(id);
    try {
      await evidenceService.deleteEvidence(id);
      setEvidenceList((prev) => prev.filter((item) => item._id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting evidence.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (evidence: EvidenceItem) => {
    if (!evidence.fileRef) return;
    try {
      await evidenceService.downloadFile(evidence._id, evidence.fileRef.originalName);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to download secure file.');
    }
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="success" icon size="sm">Verified Evidence</Badge>;
      case 'pending':
        return <Badge variant="warning" icon size="sm">Verification Pending</Badge>;
      default:
        return <Badge variant="neutral" icon size="sm">Unverified Claim</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <FolderGit2 className="w-4 h-4 text-blue-600" />;
      case 'certificate':
        return <Award className="w-4 h-4 text-emerald-600" />;
      case 'internship':
        return <Briefcase className="w-4 h-4 text-amber-600" />;
      case 'coding_profile':
        return <Code2 className="w-4 h-4 text-indigo-600" />;
      case 'assessment':
        return <ShieldCheck className="w-4 h-4 text-purple-600" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  const typeTabs = [
    { id: 'all', label: 'All Artifacts' },
    { id: 'project', label: 'Projects' },
    { id: 'certificate', label: 'Certificates' },
    { id: 'coding_profile', label: 'Coding Tracks' },
    { id: 'assessment', label: 'Assessments' },
    { id: 'internship', label: 'Internships' },
    { id: 'resume', label: 'Resume' },
  ];

  const totalCount = evidenceList.length;
  const verifiedCount = evidenceList.filter((e) => e.verificationStatus === 'verified').length;
  const pendingCount = evidenceList.filter((e) => e.verificationStatus === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Skill Evidence Portfolio</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Manage verifiable evidence records that substantiate your placement skills and role readiness.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
          className="self-start sm:self-auto bg-blue-600 hover:bg-blue-700 shadow-sm"
        >
          Add Evidence
        </Button>
      </div>

      {/* Evidence Dashboard Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Total Artifacts</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</p>
            <span className="text-[11px] text-slate-400">Audited in portfolio</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FolderGit2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Verified Evidence</span>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{verifiedCount}</p>
            <span className="text-[11px] text-slate-400">High-confidence weighting</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Pending Review</span>
            <p className="text-2xl font-bold text-amber-700 mt-1">{pendingCount}</p>
            <span className="text-[11px] text-slate-400">Under faculty / system audit</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {typeTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedType === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search evidence or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </form>
        </div>
      </div>

      {/* Evidence List */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      ) : evidenceList.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white rounded-2xl border border-dashed border-slate-300 shadow-xs">
          <FolderGit2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Evidence Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5 leading-relaxed">
            {search ? 'No evidence items matched your search query.' : 'Submit certificates, GitHub repos, or project links to start building your placement portfolio.'}
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add Your First Evidence
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {evidenceList.map((item) => (
            <Card
              key={item._id}
              className="bg-white border border-slate-200/90 hover:border-blue-300 hover:shadow-sm transition-all p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getTypeIcon(item.type || item.evidenceType || 'project')}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 tracking-tight">{item.title}</h3>
                      {getVerificationBadge(item.verificationStatus)}
                    </div>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Metadata chips */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-xs text-slate-400">
                      {item.issuer && (
                        <span className="font-medium text-slate-600">Issuer: {item.issuer}</span>
                      )}
                      {(item.date || item.evidenceDate) && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(item.date || item.evidenceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                      {item.fileRef && (
                        <span className="flex items-center gap-1 text-blue-700 font-medium">
                          <FileText className="w-3.5 h-3.5" />
                          {item.fileRef.originalName} ({(((item.fileRef.sizeBytes || item.fileRef.size || 0) / 1024)).toFixed(0)} KB)
                        </span>
                      )}
                    </div>

                    {/* Associated Skills */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-3">
                      <span className="text-[11px] text-slate-400 font-medium mr-1">Skills:</span>
                      {item.relatedSkills.map((sk) => (
                        <span
                          key={sk}
                          className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 self-end sm:self-start flex-shrink-0">
                  {(item.url || item.sourceUrl) && (
                    <a
                      href={item.url || item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200"
                      title="Open external link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  {item.fileRef && (
                    <button
                      onClick={() => handleDownload(item)}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200"
                      title="Download attached private document"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(item._id)}
                    disabled={deletingId === item._id}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200"
                    title="Delete evidence record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Evidence Modal */}
      <AddEvidenceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchEvidence}
      />
    </div>
  );
};
