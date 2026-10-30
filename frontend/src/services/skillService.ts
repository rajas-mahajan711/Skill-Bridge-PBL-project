import api from './api';
import { RoleDefinition } from '../types/role';
import { SkillGapAnalysisData, SkillGapItem } from '../types/skill';
import { mockRoles, mockSkills } from './mockData';

export const skillService = {
  getRoles: async (): Promise<{ success: boolean; roles: RoleDefinition[]; isDemo?: boolean }> => {
    try {
      const res = await api.get('/roles');
      return res.data;
    } catch (err) {
      console.warn('[skillService] Backend unavailable, returning mock roles.');
      return { success: true, roles: mockRoles, isDemo: true };
    }
  },

  getRoleById: async (id: string): Promise<{ success: boolean; role: RoleDefinition }> => {
    try {
      const res = await api.get(`/roles/${id}`);
      return res.data;
    } catch (err) {
      const role = mockRoles.find((r) => r._id === id) || mockRoles[0];
      return { success: true, role };
    }
  },

  runAnalysis: async (roleId: string): Promise<{ success: boolean; data: SkillGapAnalysisData; source: string; analysisId: string; isDemo?: boolean }> => {
    try {
      const res = await api.post('/skill-analysis', { roleId });
      return res.data;
    } catch (err) {
      console.warn('[skillService] Backend offline, computing deterministic gap analysis in Demo Mode.');
      const role = mockRoles.find((r) => r._id === roleId) || mockRoles[0];
      
      const gaps: SkillGapItem[] = role.requiredSkills.map((req) => {
        const studentSkill = mockSkills.find(
          (s) => (s.skillName || s.skill_name)?.toLowerCase().includes(req.skillName.toLowerCase()) ||
                 req.skillName.toLowerCase().includes((s.skillName || s.skill_name || '').toLowerCase())
        );

        const currentScore = studentSkill ? studentSkill.score : null;
        let status: 'meeting' | 'weak' | 'insufficient_evidence' | 'missing' = 'missing';

        if (currentScore === null || currentScore === undefined) {
          status = 'missing';
        } else if (currentScore >= req.minLevel) {
          status = 'meeting';
        } else if (currentScore >= req.minLevel - 20) {
          status = 'weak';
        } else {
          status = 'insufficient_evidence';
        }

        const gapDiff = Math.max(0, req.minLevel - (currentScore || 0));

        let whyItMatters = `${req.skillName} is a ${req.importance} capability for the ${role.title} role in industry hiring benchmarks.`;
        let suggestedAction = `Complete targeted projects and coursework to elevate your score from ${currentScore || 0} to ${req.minLevel}.`;

        if (req.skillName.includes('Data Structures')) {
          whyItMatters = 'DSA forms the standard technical screening foundation for coding interviews at top product teams.';
          suggestedAction = 'Solve 3-5 algorithm problems weekly on LeetCode covering dynamic programming and trees.';
        } else if (req.skillName.includes('System Design')) {
          whyItMatters = 'Evaluates your ability to build scalable, fault-tolerant architectures with load balancing and caching.';
          suggestedAction = 'Study the System Design Primer and design a URL shortener or rate limiter.';
        } else if (req.skillName.includes('DBMS')) {
          whyItMatters = 'Relational schema design, normalization, indexing, and ACID transactions are critical for production services.';
          suggestedAction = 'Review SQL query optimizations and practice indexing strategies on PostgreSQL/MySQL.';
        } else if (status === 'meeting') {
          suggestedAction = 'Requirement met! Maintain proficiency through regular peer code reviews and capstone contributions.';
        }

        return {
          skill_name: req.skillName,
          category: req.category || 'Core Skill',
          status,
          current_level: currentScore,
          required_level: req.minLevel,
          importance: req.importance,
          confidence_level: studentSkill?.confidence || (currentScore ? 'Medium' : 'None'),
          evidence_count: studentSkill?.evidenceCount || 0,
          gap_difference: gapDiff,
          why_it_matters: whyItMatters,
          suggested_action: suggestedAction,
        };
      });

      const meetingCount = gaps.filter((g) => g.status === 'meeting').length;
      const weakCount = gaps.filter((g) => g.status === 'weak').length;
      const insufficientCount = gaps.filter((g) => g.status === 'insufficient_evidence').length;
      const missingCount = gaps.filter((g) => g.status === 'missing').length;

      const totalRequired = gaps.length;
      const readinessScore = Math.round(
        (gaps.reduce((acc, curr) => acc + Math.min(curr.current_level || 0, curr.required_level) / curr.required_level, 0) / totalRequired) * 100
      );

      const readinessBand = readinessScore >= 75 ? 'High Readiness' : readinessScore >= 50 ? 'Developing' : 'Foundational';

      const analysisData: SkillGapAnalysisData = {
        role_title: role.title,
        readiness_score: readinessScore,
        readiness_band: readinessBand,
        total_required_skills: totalRequired,
        skills_meeting_count: meetingCount,
        skills_weak_count: weakCount,
        skills_insufficient_count: insufficientCount,
        skills_missing_count: missingCount,
        gaps,
        calculation_summary: `Deterministic analysis against ${role.title}: ${meetingCount} met, ${weakCount} developing, ${missingCount} unevidenced.`,
        disclaimer: 'Calculated using explainable scoring model based on current student evidence.',
      };

      return {
        success: true,
        data: analysisData,
        source: 'deterministic-demo-engine',
        analysisId: 'analysis-demo-' + Date.now(),
        isDemo: true,
      };
    }
  },

  getMyAnalysis: async (): Promise<{ success: boolean; hasAnalysis: boolean; analysis?: any; message?: string }> => {
    try {
      const res = await api.get('/skill-analysis/me');
      return res.data;
    } catch (err) {
      return { success: true, hasAnalysis: true, analysis: null };
    }
  },
};
