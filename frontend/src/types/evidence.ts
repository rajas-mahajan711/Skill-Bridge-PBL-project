export type EvidenceType =
  | 'assessment'
  | 'project'
  | 'certificate'
  | 'internship'
  | 'coding_profile'
  | 'achievement'
  | 'resume';

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export type ConnectionStatus =
  | 'not_connected'
  | 'url_added'
  | 'connection_pending'
  | 'connected_verified'
  | 'connection_error';

export interface FileRef {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  sizeBytes?: number;
  uploadPath?: string;
}

export interface EvidenceItem {
  _id: string;
  student: string;
  title: string;
  type: EvidenceType;
  evidenceType?: EvidenceType;
  description: string;
  source: string;
  sourceUrl?: string;
  url?: string;
  issuer?: string;
  date?: string;
  fileRef?: FileRef | null;
  relatedSkills: string[];
  score?: number | null;
  verificationStatus: VerificationStatus;
  connectionStatus: ConnectionStatus;
  evidenceDate: string;
  createdAt: string;
  updatedAt: string;
}
