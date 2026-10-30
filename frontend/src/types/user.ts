export type UserRole = 'student' | 'faculty' | 'recruiter' | 'admin';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  accountStatus?: 'active' | 'pending' | 'suspended';
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token: string;
  user: User;
  profile?: any;
}
