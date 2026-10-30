import api from './api';
import { LearningResource, LearningProgressItem } from '../types/learning';
import { mockLearningResources } from './mockData';

const getStoredResources = (): LearningResource[] => {
  const stored = localStorage.getItem('skillbridge_demo_resources');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  localStorage.setItem('skillbridge_demo_resources', JSON.stringify(mockLearningResources));
  return mockLearningResources;
};

const saveStoredResources = (items: LearningResource[]) => {
  localStorage.setItem('skillbridge_demo_resources', JSON.stringify(items));
};

export const learningService = {
  getResources: async (params?: { skill?: string; difficulty?: string; search?: string }): Promise<{ success: boolean; count: number; resources: LearningResource[]; isDemo?: boolean }> => {
    try {
      const res = await api.get('/learning/resources', { params });
      return res.data;
    } catch (err) {
      console.warn('[learningService] Backend unavailable, returning mock learning resources.');
      let list = getStoredResources();

      if (params?.skill && params.skill !== 'all') {
        const s = params.skill.toLowerCase();
        list = list.filter(
          (r) =>
            r.targetSkill?.toLowerCase().includes(s) ||
            r.targetSkills?.some((ts) => ts.toLowerCase().includes(s)) ||
            r.tags?.some((t) => t.toLowerCase().includes(s))
        );
      }

      if (params?.difficulty && params.difficulty !== 'all') {
        list = list.filter((r) => r.difficulty.toLowerCase() === params.difficulty?.toLowerCase());
      }

      if (params?.search) {
        const q = params.search.toLowerCase();
        list = list.filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q) ||
            r.tags?.some((t) => t.toLowerCase().includes(q))
        );
      }

      return { success: true, count: list.length, resources: list, isDemo: true };
    }
  },

  getProgress: async (): Promise<{ success: boolean; count: number; progress: LearningProgressItem[]; isDemo?: boolean }> => {
    try {
      const res = await api.get('/learning/progress');
      return res.data;
    } catch (err) {
      const resources = getStoredResources();
      const inProgress = resources.filter((r) => (r.progressPercentage || 0) > 0 || r.status === 'in_progress' || r.status === 'completed');
      const progressItems: LearningProgressItem[] = inProgress.map((r) => ({
        _id: 'prog-' + r._id,
        student: 'user-001',
        resource: r,
        status: r.status || (r.progressPercentage === 100 ? 'completed' : 'in_progress'),
        progressPercentage: r.progressPercentage || 25,
        updatedAt: new Date().toISOString(),
      }));
      return { success: true, count: progressItems.length, progress: progressItems, isDemo: true };
    }
  },

  startOrUpdate: async (resourceId: string, status?: string, progressPercentage?: number): Promise<{ success: boolean; message: string; progress: any }> => {
    try {
      const res = await api.post('/learning/progress', { resourceId, status, progressPercentage });
      return res.data;
    } catch (err) {
      console.warn('[learningService] Backend offline, updating learning progress in Demo Mode.');
      const resources = getStoredResources();
      const newStatus = (progressPercentage || 0) >= 100 ? 'completed' : (status as any) || 'in_progress';
      const updated = resources.map((r) =>
        r._id === resourceId
          ? {
              ...r,
              status: newStatus,
              progressPercentage: progressPercentage !== undefined ? progressPercentage : 15,
              studentProgress: {
                id: 'prog-' + resourceId,
                status: newStatus,
                progressPercentage: progressPercentage !== undefined ? progressPercentage : 15,
                startDate: new Date().toISOString(),
                completedDate: newStatus === 'completed' ? new Date().toISOString() : null,
              },
            }
          : r
      );
      saveStoredResources(updated);
      return {
        success: true,
        message: 'Progress updated (Demo Mode persisted)',
        progress: { _id: 'prog-' + resourceId, status: newStatus, progressPercentage },
      };
    }
  },

  updateProgressById: async (progressId: string, data: { status?: string; progressPercentage?: number; notes?: string }): Promise<{ success: boolean; message: string; progress: any }> => {
    try {
      const res = await api.patch(`/learning/progress/${progressId}`, data);
      return res.data;
    } catch (err) {
      const resources = getStoredResources();
      const resourceId = progressId.replace('prog-', '');
      const newStatus = (data.progressPercentage || 0) >= 100 ? 'completed' : (data.status as any) || 'in_progress';
      const updated = resources.map((r) =>
        r._id === resourceId || 'prog-' + r._id === progressId
          ? {
              ...r,
              status: newStatus,
              progressPercentage: data.progressPercentage !== undefined ? data.progressPercentage : r.progressPercentage,
              studentProgress: {
                id: progressId,
                status: newStatus,
                progressPercentage: data.progressPercentage !== undefined ? data.progressPercentage : r.progressPercentage || 0,
                startDate: new Date().toISOString(),
                completedDate: newStatus === 'completed' ? new Date().toISOString() : null,
              },
            }
          : r
      );
      saveStoredResources(updated);
      return { success: true, message: 'Progress updated (Demo Mode)', progress: { status: newStatus, progressPercentage: data.progressPercentage } };
    }
  },
};
