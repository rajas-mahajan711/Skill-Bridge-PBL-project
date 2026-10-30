import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EvaluatedSkill } from '../../../types/skill';
import { Award, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface TopSkillsWidgetProps {
  skills: EvaluatedSkill[];
  totalEvaluated: number;
}

export const TopSkillsWidget: React.FC<TopSkillsWidgetProps> = ({ skills, totalEvaluated }) => {
  const getConfidenceBadge = (level?: string) => {
    switch (level) {
      case 'High':
        return <Badge variant="success" size="sm">High Confidence</Badge>;
      case 'Medium':
        return <Badge variant="blue" size="sm">Medium Confidence</Badge>;
      default:
        return <Badge variant="warning" size="sm">Low Confidence</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader
        title="Evidence-Backed Skill Profile"
        subtitle={`${totalEvaluated} skills evaluated with multi-source evidence`}
        action={
          <Link to="/student/evidence">
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View All Evidence
            </Button>
          </Link>
        }
      />

      {skills.length === 0 ? (
        <div className="text-center py-8 px-4 bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
          <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-700">No Skill Evidence Recorded</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
            SkillBridge calculates proficiency based on verified projects, certificates, and coding assessments.
          </p>
          <Link to="/student/evidence">
            <Button variant="primary" size="sm">
              Add Your First Evidence Record
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3.5">
          {skills.map((skill) => (
            <div
              key={skill.skill_name}
              className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">{skill.skill_name}</span>
                  {getConfidenceBadge(skill.confidence_level)}
                </div>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{skill.explanation}</p>
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-blue-600" />
                    {skill.supporting_evidence_count} evidence source(s)
                  </span>
                  {skill.evidence_sources && skill.evidence_sources.length > 0 && (
                    <span>Sources: {skill.evidence_sources.join(', ')}</span>
                  )}
                </div>
              </div>

              {/* Proficiency Score */}
              <div className="flex items-baseline sm:flex-col sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-teal-700">{skill.score || 0}</span>
                  <span className="text-xs text-slate-400 font-medium">/100</span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Proficiency Score
                </span>
              </div>
            </div>
          ))}

          <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>
              Skill scores are calculated through multi-source evidence weighting. Confidence indicates independent verification.
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};
