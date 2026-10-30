export type LearningStatus = 'recommended' | 'not_started' | 'in_progress' | 'completed';

export interface LearningResource {
  _id: string;
  title: string;
  description: string;
  targetSkills?: string[];
  targetSkill?: string;
  tags?: string[];
  provider?: string;
  sourceName?: string;
  sourceUrl?: string;
  url?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  estimatedHours: number;
  estimatedDuration?: string;
  resourceType?: 'course' | 'tutorial' | 'practice' | 'documentation' | 'project' | 'reference' | string;
  isDemo?: boolean;
  status?: LearningStatus;
  progressPercentage?: number;
  enrollmentCount?: number;
  studentProgress?: {
    id: string | null;
    status: LearningStatus;
    progressPercentage: number;
    startDate: string | null;
    completedDate: string | null;
  };
}

export interface LearningProgressItem {
  _id: string;
  student: string;
  resource: LearningResource;
  status: LearningStatus;
  progressPercentage: number;
  startDate?: string;
  completedDate?: string;
  notes?: string;
  updatedAt: string;
}
