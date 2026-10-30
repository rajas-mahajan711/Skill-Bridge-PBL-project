import { User } from './user';

export interface AcademicInfo {
  college: string;
  department: string;
  degree: string;
  currentYear: number;
  graduationYear: number;
  cgpa: number | null;
}

export interface SocialLinks {
  github: string;
  linkedin: string;
  leetcode: string;
  codeforces?: string;
  portfolio: string;
  otherLinks?: string[];
}

export interface StudentProfile {
  _id?: string;
  user?: User | {
    id: string;
    _id?: string;
    name: string;
    email: string;
    role?: string;
  };
  headline: string;
  bio: string;
  contactNumber: string;
  technicalInterests: string[];
  academic: AcademicInfo;
  socialLinks: SocialLinks;
  targetRoleId?: any;
  completionPercentage?: number;
  profileCompletionPercentage?: number;
  verifiedStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}
