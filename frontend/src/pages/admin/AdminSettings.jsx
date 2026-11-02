import React, { useState } from 'react';
import { Settings, Shield, Sliders, Database, CheckCircle2, Lock } from 'lucide-react';
import { Card, Title, Btn, Badge } from '../../components/ui.jsx';

export const AdminSettings = () => {
  const [consentStrict, setConsentStrict] = useState(true);
  const [minMatchThreshold, setMinMatchThreshold] = useState(70);
  const [evidenceWeights, setEvidenceWeights] = useState({
    github: 35,
    leetcode: 25,
    assessment: 25,
    certificate: 15
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-ink">System Governance & Policy Settings</h2>
        <p className="text-xs text-mute mt-0.5">
          Configure security constraints, AI match thresholds, and evidence weighting models across the institution.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 text-sm font-medium">
          <CheckCircle2 size={16} />
          Platform governance settings saved successfully.
        </div>
      )}

      {/* Privacy and Consent Card */}
      <Card className="p-6">
        <Title sub="Enforce strict student privacy and recruiter visibility controls">
          Student Data Privacy & Consent Rules
        </Title>
        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consentStrict}
              onChange={(e) => setConsentStrict(e.target.checked)}
              className="mt-1 h-4 w-4 rounded text-indigo focus:ring-indigo/20 border-slate-300"
            />
            <div>
              <span className="text-sm font-semibold text-ink block">
                Strict Consent Requirement for Recruiter Shortlists
              </span>
              <p className="text-xs text-mute mt-0.5">
                When enabled, student candidate profiles without explicit opt-in consent will be masked from recruiter candidate searches.
              </p>
            </div>
          </label>
        </div>
      </Card>

      {/* AI Intelligence Weights */}
      <Card className="p-6">
        <Title sub="Weights applied by the Python FastAPI scoring pipeline for candidate ranking">
          Evidence Scoring Weights (%)
        </Title>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-ink block mb-1">
              GitHub Repositories & Code Commits ({evidenceWeights.github}%)
            </label>
            <input
              type="range"
              min="10"
              max="60"
              value={evidenceWeights.github}
              onChange={(e) => setEvidenceWeights({ ...evidenceWeights, github: Number(e.target.value) })}
              className="w-full accent-indigo"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-ink block mb-1">
              Coding Platforms / LeetCode ({evidenceWeights.leetcode}%)
            </label>
            <input
              type="range"
              min="10"
              max="60"
              value={evidenceWeights.leetcode}
              onChange={(e) => setEvidenceWeights({ ...evidenceWeights, leetcode: Number(e.target.value) })}
              className="w-full accent-teal"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-ink block mb-1">
              College Assessments / Lab Tests ({evidenceWeights.assessment}%)
            </label>
            <input
              type="range"
              min="10"
              max="60"
              value={evidenceWeights.assessment}
              onChange={(e) => setEvidenceWeights({ ...evidenceWeights, assessment: Number(e.target.value) })}
              className="w-full accent-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-ink block mb-1">
              Verified Certifications ({evidenceWeights.certificate}%)
            </label>
            <input
              type="range"
              min="5"
              max="40"
              value={evidenceWeights.certificate}
              onChange={(e) => setEvidenceWeights({ ...evidenceWeights, certificate: Number(e.target.value) })}
              className="w-full accent-amber-500"
            />
          </div>
        </div>
      </Card>

      {/* Role Match Cutoff */}
      <Card className="p-6">
        <Title sub="Minimum fit score required to mark a candidate as recommended">
          Role Fit Cutoff Threshold
        </Title>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="50"
            max="90"
            value={minMatchThreshold}
            onChange={(e) => setMinMatchThreshold(Number(e.target.value))}
            className="flex-1 accent-indigo"
          />
          <span className="text-lg font-bold text-ink w-14 text-right">
            {minMatchThreshold}%
          </span>
        </div>
      </Card>

      <div className="flex justify-end gap-3 pt-2">
        <Btn size="md" v="primary" onClick={handleSave}>
          Save Governance Policies
        </Btn>
      </div>
    </div>
  );
};
