export interface RoleSkillRequirement {
  skillName: string;
  minLevel: number;
  importance: 'required' | 'preferred';
  category?: string;
}

export interface RoleDefinition {
  _id: string;
  title: string;
  slug: string;
  description: string;
  requiredSkills: RoleSkillRequirement[];
  active?: boolean;
}

export interface RoleRecommendation {
  role_id?: string;
  role_title: string;
  match_percentage: number;
  readiness_score: number;
  matching_skills: string[];
  missing_skills: string[];
  weak_skills: string[];
  reasons: string[];
}
