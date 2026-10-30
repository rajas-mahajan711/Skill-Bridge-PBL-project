export type ConfidenceLevel = 'High' | 'Medium' | 'Low' | 'None' | 'high' | 'medium' | 'low';

export interface EvaluatedSkill {
  skill_name?: string;
  skillName?: string;
  category?: string;
  score: number | null;
  confidence_score?: number;
  confidence_level?: ConfidenceLevel;
  confidence?: ConfidenceLevel;
  supporting_evidence_count?: number;
  evidenceCount?: number;
  evidence_sources?: string[];
  last_updated?: string | null;
  lastEvaluated?: string | null;
  explanation?: string;
  reasoning?: string;
  limitations?: string;
  status?: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | string;
  requiredScore?: number;
  gap?: number;
  verificationType?: 'self_reported' | 'evidence_supported' | 'verified';
  evidenceBreakdown?: {
    certificates: number;
    projects: number;
    courses: number;
    assessments?: number;
  };
}

export type GapStatus = 'meeting' | 'weak' | 'insufficient_evidence' | 'missing' | 'met' | 'partial' | 'gap';

export interface SkillGapItem {
  skill_name: string;
  category: string;
  status: GapStatus;
  current_level: number | null;
  required_level: number;
  importance: 'required' | 'preferred';
  confidence_level?: ConfidenceLevel;
  evidence_count?: number;
  gap_difference?: number;
  why_it_matters?: string;
  suggested_action?: string;
}

export interface SkillGapAnalysisData {
  role_title: string;
  readiness_score: number;
  readiness_band: string;
  total_required_skills: number;
  skills_meeting_count: number;
  skills_weak_count: number;
  skills_insufficient_count: number;
  skills_missing_count: number;
  gaps: SkillGapItem[];
  calculation_summary: string;
  disclaimer: string;
}
