const axios = require('axios');

const AI_SERVICE_BASE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
const TIMEOUT_MS = 6000;

const apiClient = axios.create({
  baseURL: AI_SERVICE_BASE_URL,
  timeout: TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

class AIServiceClient {
  /**
   * Health check
   */
  static async checkHealth() {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      return {
        status: 'unreachable',
        error: error.message,
      };
    }
  }

  /**
   * Evaluates evidence items and computes evidence-backed skill scores & confidence
   */
  static async analyzeSkills(evidenceItems, targetSkills = []) {
    try {
      // Sanitize payload: strip any private server paths or sensitive information
      const sanitizedEvidence = evidenceItems.map((item) => ({
        id: item._id ? item._id.toString() : item.id,
        title: item.title,
        type: item.type,
        source: item.source || '',
        verification_status: item.verificationStatus || item.verification_status || 'unverified',
        evidence_date: item.evidenceDate ? new Date(item.evidenceDate).toISOString().split('T')[0] : null,
        related_skills: item.relatedSkills || item.related_skills || [],
        score: item.score || null,
        description: item.description || '',
      }));

      const response = await apiClient.post('/analyze-skills', {
        evidence_items: sanitizedEvidence,
        target_skills: targetSkills,
      });

      return {
        source: 'fastapi-ai-service',
        data: response.data,
      };
    } catch (error) {
      console.warn(`[AIServiceClient] FastAPI call failed (${error.message}). Executing deterministic baseline fallback.`);
      return {
        source: 'backend-deterministic-fallback',
        data: this._fallbackAnalyzeSkills(evidenceItems, targetSkills),
      };
    }
  }

  /**
   * Evaluates skill gaps against a role
   */
  static async analyzeSkillGaps(targetRole, evaluatedSkills) {
    try {
      const formattedSkills = evaluatedSkills.map((s) => ({
        skill_name: s.skillName || s.skill_name,
        score: s.score,
        confidence_score: s.confidenceScore || s.confidence_score || 0.0,
        confidence_level: s.confidenceLevel || s.confidence_level || 'Low',
        supporting_evidence_count: s.supportingEvidenceCount || s.supporting_evidence_count || 0,
        evidence_sources: s.evidenceSources || s.evidence_sources || [],
        explanation: s.explanation || '',
        limitations: s.limitations || '',
        status: s.status || (s.score ? 'evaluated' : 'insufficient_evidence'),
      }));

      const formattedRole = {
        role_id: targetRole._id ? targetRole._id.toString() : targetRole.id,
        title: targetRole.title,
        description: targetRole.description,
        required_skills: targetRole.requiredSkills.map((r) => ({
          skill_name: r.skillName,
          min_level: r.minLevel,
          importance: r.importance || 'required',
          category: r.category || 'General',
        })),
      };

      const response = await apiClient.post('/skill-gaps', {
        target_role: formattedRole,
        student_skills: formattedSkills,
      });

      return {
        source: 'fastapi-ai-service',
        data: response.data,
      };
    } catch (error) {
      console.warn(`[AIServiceClient] Gap analysis fallback activated: ${error.message}`);
      return {
        source: 'backend-deterministic-fallback',
        data: this._fallbackSkillGaps(targetRole, evaluatedSkills),
      };
    }
  }

  /**
   * Matches student skills against available roles
   */
  static async matchRoles(evaluatedSkills, availableRoles) {
    try {
      const formattedSkills = evaluatedSkills.map((s) => ({
        skill_name: s.skillName || s.skill_name,
        score: s.score,
        confidence_score: s.confidenceScore || s.confidence_score || 0.0,
        confidence_level: s.confidenceLevel || s.confidence_level || 'Low',
        supporting_evidence_count: s.supportingEvidenceCount || s.supporting_evidence_count || 0,
        evidence_sources: s.evidenceSources || s.evidence_sources || [],
        explanation: s.explanation || '',
        limitations: s.limitations || '',
        status: s.status || (s.score ? 'evaluated' : 'insufficient_evidence'),
      }));

      const formattedRoles = availableRoles.map((role) => ({
        role_id: role._id ? role._id.toString() : role.id,
        title: role.title,
        description: role.description,
        required_skills: (role.requiredSkills || []).map((r) => ({
          skill_name: r.skillName,
          min_level: r.minLevel,
          importance: r.importance || 'required',
          category: r.category || 'General',
        })),
      }));

      const response = await apiClient.post('/match-role', {
        student_skills: formattedSkills,
        available_roles: formattedRoles,
      });

      return {
        source: 'fastapi-ai-service',
        data: response.data,
      };
    } catch (error) {
      console.warn(`[AIServiceClient] Role matching fallback: ${error.message}`);
      return {
        source: 'backend-deterministic-fallback',
        data: {
          success: true,
          recommendations: availableRoles.map((r) => ({
            role_id: r._id,
            role_title: r.title,
            match_percentage: 50.0,
            readiness_score: 50.0,
            matching_skills: [],
            missing_skills: (r.requiredSkills || []).map((s) => s.skillName),
            weak_skills: [],
            reasons: ['Baseline fallback estimate (AI service offline).'],
          })),
        },
      };
    }
  }

  /**
   * Recommends learning resources targeted at identified gaps
   */
  static async recommendResources(gaps, resources, limit = 6) {
    try {
      const formattedGaps = gaps.map((g) => ({
        skill_name: g.skillName || g.skill_name,
        category: g.category || 'General',
        status: g.status,
        current_level: g.currentLevel !== undefined ? g.currentLevel : g.current_level,
        required_level: g.requiredLevel !== undefined ? g.requiredLevel : g.required_level,
        importance: g.importance || 'required',
        confidence_level: g.confidenceLevel || g.confidence_level || 'Low',
        evidence_count: g.evidenceCount || g.evidence_count || 0,
        gap_difference: g.gapDifference !== undefined ? g.gapDifference : g.gap_difference || 0,
        why_it_matters: g.whyItMatters || g.why_it_matters || '',
        suggested_action: g.suggestedAction || g.suggested_action || '',
      }));

      const formattedResources = resources.map((r) => ({
        id: r._id ? r._id.toString() : r.id,
        title: r.title,
        description: r.description,
        target_skills: r.targetSkills || [],
        source_name: r.sourceName,
        source_url: r.sourceUrl,
        difficulty: r.difficulty,
        estimated_hours: r.estimatedHours,
      }));

      const response = await apiClient.post('/recommendations', {
        identified_gaps: formattedGaps,
        available_resources: formattedResources,
        limit,
      });

      return {
        source: 'fastapi-ai-service',
        data: response.data,
      };
    } catch (error) {
      console.warn(`[AIServiceClient] Recommendation fallback: ${error.message}`);
      return {
        source: 'backend-deterministic-fallback',
        data: {
          success: true,
          recommended_resources: resources.slice(0, limit).map((r) => ({
            resource_id: r._id,
            title: r.title,
            description: r.description,
            target_skill: (r.targetSkills && r.targetSkills[0]) || 'General',
            source_name: r.sourceName,
            source_url: r.sourceUrl,
            difficulty: r.difficulty,
            estimated_hours: r.estimatedHours,
            relevance_reason: 'Curated resource addressing core technical fundamentals.',
            priority: 'Medium',
          })),
        },
      };
    }
  }

  /**
   * Deterministic local fallback for skill scoring when FastAPI is unreachable
   */
  static _fallbackAnalyzeSkills(evidenceItems, targetSkills) {
    const skillMap = {};
    for (const item of evidenceItems) {
      if ((item.verificationStatus || '').toLowerCase() === 'rejected') continue;
      for (const s of item.relatedSkills || []) {
        const norm = s.trim();
        if (!norm) continue;
        const key = norm.toLowerCase();
        if (!skillMap[key]) {
          skillMap[key] = { canonical: norm, count: 0, verifiedCount: 0, totalScore: 0 };
        }
        skillMap[key].count += 1;
        if (item.verificationStatus === 'verified') skillMap[key].verifiedCount += 1;
        skillMap[key].totalScore += item.score || 70;
      }
    }

    const skills = Object.keys(skillMap).map((k) => {
      const data = skillMap[k];
      const avgScore = Math.round(data.totalScore / data.count);
      const confLevel = data.verifiedCount > 0 ? 'Medium' : 'Low';
      return {
        skill_name: data.canonical,
        score: avgScore,
        confidence_score: data.verifiedCount > 0 ? 0.6 : 0.3,
        confidence_level: confLevel,
        supporting_evidence_count: data.count,
        evidence_sources: ['Local Evidence Archive'],
        last_updated: new Date().toISOString().split('T')[0],
        explanation: `Score derived via local rule-based fallback (${data.count} record(s)).`,
        limitations: 'Calculated using fallback scoring engine while AI microservice is offline.',
        status: 'evaluated',
      };
    });

    return {
      success: true,
      version: 'fallback-v1.0',
      methodology: 'Local Rule-Based Deterministic Fallback',
      skills,
      evaluated_count: skills.length,
      insufficient_evidence_count: 0,
    };
  }

  /**
   * Deterministic local fallback for skill gap analysis
   */
  static _fallbackSkillGaps(targetRole, evaluatedSkills) {
    const studentMap = {};
    for (const s of evaluatedSkills) {
      const name = (s.skillName || s.skill_name || '').toLowerCase().trim();
      studentMap[name] = s;
    }

    let meetingCount = 0;
    let weakCount = 0;
    let missingCount = 0;

    const gaps = (targetRole.requiredSkills || []).map((req) => {
      const studentEval = studentMap[req.skillName.toLowerCase().trim()];
      if (!studentEval) {
        missingCount++;
        return {
          skill_name: req.skillName,
          category: req.category || 'Technical',
          status: 'missing',
          current_level: null,
          required_level: req.minLevel,
          importance: req.importance || 'required',
          confidence_level: 'None',
          evidence_count: 0,
          gap_difference: req.minLevel,
          why_it_matters: `Core competency for ${targetRole.title}.`,
          suggested_action: `Add verified projects or assessments in ${req.skillName}.`,
        };
      }

      const score = studentEval.score || 0;
      if (score >= req.minLevel) {
        meetingCount++;
        return {
          skill_name: req.skillName,
          category: req.category || 'Technical',
          status: 'meeting',
          current_level: score,
          required_level: req.minLevel,
          importance: req.importance || 'required',
          confidence_level: studentEval.confidenceLevel || studentEval.confidence_level || 'Medium',
          evidence_count: studentEval.supportingEvidenceCount || studentEval.supporting_evidence_count || 1,
          gap_difference: 0,
          why_it_matters: `Requirement satisfied.`,
          suggested_action: 'Maintain ongoing project application.',
        };
      } else {
        weakCount++;
        return {
          skill_name: req.skillName,
          category: req.category || 'Technical',
          status: 'weak',
          current_level: score,
          required_level: req.minLevel,
          importance: req.importance || 'required',
          confidence_level: studentEval.confidenceLevel || studentEval.confidence_level || 'Medium',
          evidence_count: studentEval.supportingEvidenceCount || studentEval.supporting_evidence_count || 1,
          gap_difference: req.minLevel - score,
          why_it_matters: `Important competency for ${targetRole.title}.`,
          suggested_action: `Elevate proficiency through targeted practice modules.`,
        };
      }
    });

    const totalReqs = targetRole.requiredSkills?.length || 1;
    const readiness = Math.round((meetingCount / totalReqs) * 100);

    return {
      success: true,
      role_title: targetRole.title,
      readiness_score: readiness,
      readiness_band: readiness >= 70 ? 'High Readiness' : readiness >= 40 ? 'Developing' : 'Early Stage',
      total_required_skills: totalReqs,
      skills_meeting_count: meetingCount,
      skills_weak_count: weakCount,
      skills_insufficient_count: 0,
      skills_missing_count: missingCount,
      gaps,
      calculation_summary: `Computed via local deterministic engine. ${meetingCount} meeting, ${weakCount} weak, ${missingCount} missing.`,
      disclaimer: 'Educational baseline calculation. Does not guarantee placement outcomes.',
    };
  }
}

module.exports = AIServiceClient;
