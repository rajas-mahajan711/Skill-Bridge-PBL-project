import api from './api';
import { StudentProfile } from '../types/profile';
import { EvaluatedSkill } from '../types/skill';
import { mockDashboardResponse, mockStudentProfile, mockSkills } from './mockData';

export interface DashboardResponse {
  success: boolean;
  profileSummary: {
    name: string;
    email: string;
    college: string;
    department: string;
    currentYear: number;
    graduationYear: number;
    completionPercentage: number;
  };
  skillsOverview: {
    totalEvaluated: number;
    topSkills: EvaluatedSkill[];
    insufficientEvidenceCount: number;
  };
  roleReadiness: {
    roleId: string;
    roleTitle: string;
    readinessScore: number;
    readinessBand: string;
    meetingSkills: string[];
    weakSkills: string[];
    missingSkills: string[];
    calculationSummary: string;
    disclaimer: string;
  } | null;
  recommendedRoles: {
    role_id: string;
    role_title: string;
    match_percentage: number;
    readiness_score: number;
    matching_skills: string[];
    missing_skills: string[];
    weak_skills: string[];
    reasons: string[];
  }[];
  recentActivity: {
    id: string;
    type: string;
    title: string;
    date: string;
    status: string;
  }[];
  learningSummary: {
    activeCount: number;
    completedCount: number;
    totalEnrolled: number;
    progressPercentage: number;
    suggestedNextAction: string;
  };
  isDemo?: boolean;
}

export const studentService = {
  getProfile: async (): Promise<{ success: boolean; profile: StudentProfile; isDemo?: boolean }> => {
    try {
      const res = await api.get('/students/me');
      return res.data;
    } catch (err) {
      console.warn('[studentService] Backend unavailable, using local student profile.');
      const local = localStorage.getItem('skillbridge_demo_profile');
      const profile = local ? JSON.parse(local) : mockStudentProfile;
      return { success: true, profile, isDemo: true };
    }
  },

  updateProfile: async (data: Partial<StudentProfile>): Promise<{ success: boolean; message: string; profile: StudentProfile }> => {
    try {
      const res = await api.put('/students/me', data);
      return res.data;
    } catch (err) {
      console.warn('[studentService] Backend unavailable, persisting profile in local storage.');
      const local = localStorage.getItem('skillbridge_demo_profile');
      const current = local ? JSON.parse(local) : mockStudentProfile;
      const updated = {
        ...current,
        ...data,
        academic: { ...current.academic, ...data.academic },
        socialLinks: { ...current.socialLinks, ...data.socialLinks },
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('skillbridge_demo_profile', JSON.stringify(updated));
      return { success: true, message: 'Profile updated successfully (Demo Mode persisted)', profile: updated };
    }
  },

  getDashboard: async (): Promise<DashboardResponse> => {
    try {
      const res = await api.get('/students/me/dashboard');
      return res.data;
    } catch (err) {
      console.warn('[studentService] Backend unavailable, using rich mock dashboard intelligence.');
      const localProfile = localStorage.getItem('skillbridge_demo_profile');
      const profile = localProfile ? JSON.parse(localProfile) : mockStudentProfile;
      
      return {
        ...mockDashboardResponse,
        profileSummary: {
          ...mockDashboardResponse.profileSummary,
          name: profile.user?.name || profile.headline ? profile.user?.name || 'Aamrapali More' : 'Aamrapali More',
          email: profile.user?.email || 'student@skillbridge.edu',
          college: profile.academic?.college || 'Government College of Engineering & Technology',
          department: profile.academic?.department || 'Computer Science and Engineering',
          currentYear: profile.academic?.currentYear || 3,
          graduationYear: profile.academic?.graduationYear || 2026,
          completionPercentage: profile.profileCompletionPercentage || 88,
        },
        isDemo: true,
      };
    }
  },

  getSkills: async (): Promise<{ success: boolean; skills: EvaluatedSkill[]; version: string; methodology: string; isDemo?: boolean }> => {
    try {
      const res = await api.get('/students/me/skills');
      return res.data;
    } catch (err) {
      console.warn('[studentService] Backend unavailable, using mock skill taxonomy and scores.');
      return {
        success: true,
        skills: mockSkills,
        version: '1.0-explainable',
        methodology: 'Multi-source verified rubric with confidence weighting',
        isDemo: true,
      };
    }
  },
};
