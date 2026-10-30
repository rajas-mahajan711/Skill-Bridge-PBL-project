import api from './api';
import { EvidenceItem } from '../types/evidence';
import { mockEvidence } from './mockData';

const getStoredEvidence = (): EvidenceItem[] => {
  const stored = localStorage.getItem('skillbridge_demo_evidence');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  localStorage.setItem('skillbridge_demo_evidence', JSON.stringify(mockEvidence));
  return mockEvidence;
};

const saveStoredEvidence = (items: EvidenceItem[]) => {
  localStorage.setItem('skillbridge_demo_evidence', JSON.stringify(items));
};

export const evidenceService = {
  getEvidence: async (params?: { type?: string; verificationStatus?: string; search?: string }): Promise<{ success: boolean; count: number; evidence: EvidenceItem[]; isDemo?: boolean }> => {
    try {
      const res = await api.get('/evidence', { params });
      return res.data;
    } catch (err) {
      console.warn('[evidenceService] Backend unavailable, returning mock evidence items.');
      let list = getStoredEvidence();

      if (params?.type && params.type !== 'all') {
        list = list.filter((item) => (item.type || item.evidenceType || '').toLowerCase() === params.type?.toLowerCase());
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        list = list.filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            item.relatedSkills.some((s) => s.toLowerCase().includes(q))
        );
      }
      return { success: true, count: list.length, evidence: list, isDemo: true };
    }
  },

  getEvidenceById: async (id: string): Promise<{ success: boolean; evidence: EvidenceItem }> => {
    try {
      const res = await api.get(`/evidence/${id}`);
      return res.data;
    } catch (err) {
      const list = getStoredEvidence();
      const item = list.find((e) => e._id === id) || list[0];
      return { success: true, evidence: item };
    }
  },

  createEvidence: async (data: Partial<EvidenceItem>): Promise<{ success: boolean; message: string; evidence: EvidenceItem }> => {
    try {
      const res = await api.post('/evidence', data);
      return res.data;
    } catch (err) {
      console.warn('[evidenceService] Backend offline, saving evidence to local storage in demo mode.');
      const list = getStoredEvidence();
      const itemType = (data.type || data.evidenceType || 'project') as any;
      const newEvidence: EvidenceItem = {
        _id: 'ev-demo-' + Date.now(),
        student: 'usr-student-001',
        title: data.title || 'Untitled Evidence',
        type: itemType,
        evidenceType: itemType,
        relatedSkills: data.relatedSkills || ['General'],
        description: data.description || '',
        source: data.source || 'upload',
        sourceUrl: data.sourceUrl || data.url || '',
        url: data.url || data.sourceUrl || '',
        verificationStatus: 'verified',
        connectionStatus: 'connected_verified',
        issuer: data.issuer || 'Student Self-Submission',
        date: data.date || data.evidenceDate || new Date().toISOString(),
        evidenceDate: data.evidenceDate || data.date || new Date().toISOString(),
        fileRef: data.fileRef,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = [newEvidence, ...list];
      saveStoredEvidence(updated);
      return {
        success: true,
        message: 'Evidence submitted successfully (Demo Mode persisted locally)',
        evidence: newEvidence,
      };
    }
  },

  updateEvidence: async (id: string, data: Partial<EvidenceItem>): Promise<{ success: boolean; message: string; evidence: EvidenceItem }> => {
    try {
      const res = await api.patch(`/evidence/${id}`, data);
      return res.data;
    } catch (err) {
      const list = getStoredEvidence();
      const updated = list.map((item) => (item._id === id ? { ...item, ...data, updatedAt: new Date().toISOString() } : item));
      saveStoredEvidence(updated);
      const found = updated.find((i) => i._id === id)!;
      return { success: true, message: 'Evidence updated (Demo Mode)', evidence: found };
    }
  },

  deleteEvidence: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.delete(`/evidence/${id}`);
      return res.data;
    } catch (err) {
      const list = getStoredEvidence();
      const filtered = list.filter((i) => i._id !== id);
      saveStoredEvidence(filtered);
      return { success: true, message: 'Evidence deleted successfully (Demo Mode)' };
    }
  },

  uploadFile: async (file: File, evidenceId?: string): Promise<{ success: boolean; message: string; fileRef: any }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (evidenceId) {
        formData.append('evidenceId', evidenceId);
      }
      const res = await api.post('/evidence/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    } catch (err) {
      console.warn('[evidenceService] Upload API unreachable, staging file reference locally.');
      return {
        success: true,
        message: 'File staged in Demo Mode (simulated secure storage)',
        fileRef: {
          originalName: file.name,
          sizeBytes: file.size,
          mimeType: file.type || 'application/pdf',
          uploadedAt: new Date().toISOString(),
        },
      };
    }
  },

  downloadFile: async (evidenceId: string, originalName: string): Promise<void> => {
    try {
      const res = await api.get(`/evidence/${evidenceId}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // In demo mode, generate a mock sample text file to download
      const demoBlob = new Blob([
        `SkillBridge Verified Evidence Document\n\nFile: ${originalName}\nStudent: Aamrapali More\nVerification: Audit Trail Confirmed\nTimestamp: ${new Date().toISOString()}`,
      ], { type: 'text/plain' });
      const url = window.URL.createObjectURL(demoBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalName.endsWith('.pdf') ? originalName.replace('.pdf', '.txt') : originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }
  },
};
