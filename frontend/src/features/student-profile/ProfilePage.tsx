import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  User,
  GraduationCap,
  Globe,
  Github,
  Linkedin,
  Code2,
  Save,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Building2,
  Calendar,
} from 'lucide-react';

interface ProfileFormData {
  fullName: string;
  email: string;
  headline: string;
  bio: string;
  targetJobRole: string;
  contactNumber: string;
  technicalInterests: string;
  college: string;
  department: string;
  degree: string;
  currentYear: number;
  graduationYear: number;
  cgpa: string;
  github: string;
  linkedin: string;
  leetcode: string;
  portfolio: string;
}

export const ProfilePage: React.FC = () => {
  const { user, profile, updateProfileState } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, errors },
  } = useForm<ProfileFormData>();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await studentService.getProfile();
        const p = res.profile;
        reset({
          fullName: user?.name || p.user?.name || 'Aamrapali More',
          email: user?.email || p.user?.email || 'student@skillbridge.edu',
          headline: p.headline || 'Aspiring Full-Stack Software Engineer | React, Node.js & Cloud',
          bio: p.bio || 'Third-year Computer Engineering undergraduate with practical project experience in building scalable web applications and algorithmic problem solving.',
          targetJobRole: 'Software Development Engineer (SDE)',
          contactNumber: p.contactNumber || '+91 98765 43210',
          technicalInterests: (p.technicalInterests || ['Data Structures', 'React', 'Node.js', 'System Design']).join(', '),
          college: p.academic?.college || 'Government College of Engineering & Technology',
          department: p.academic?.department || 'Computer Science and Engineering',
          degree: p.academic?.degree || 'B.Tech',
          currentYear: p.academic?.currentYear || 3,
          graduationYear: p.academic?.graduationYear || 2026,
          cgpa: p.academic?.cgpa !== null && p.academic?.cgpa !== undefined ? String(p.academic.cgpa) : '8.85',
          github: p.socialLinks?.github || 'https://github.com/aamrapali-more',
          linkedin: p.socialLinks?.linkedin || 'https://linkedin.com/in/aamrapali-more',
          leetcode: p.socialLinks?.leetcode || 'https://leetcode.com/aamrapali_m',
          portfolio: p.socialLinks?.portfolio || 'https://aamrapali.dev',
        });
      } catch (err: any) {
        console.error('[Profile] Fetch error:', err);
        setErrorMessage('Failed to load profile details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [reset, user]);

  const onSubmit = async (data: ProfileFormData) => {
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const interestsArray = data.technicalInterests
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        headline: data.headline,
        bio: data.bio,
        contactNumber: data.contactNumber,
        technicalInterests: interestsArray,
        academic: {
          college: data.college,
          department: data.department,
          degree: data.degree,
          currentYear: Number(data.currentYear),
          graduationYear: Number(data.graduationYear),
          cgpa: data.cgpa ? Number(data.cgpa) : null,
        },
        socialLinks: {
          github: data.github,
          linkedin: data.linkedin,
          leetcode: data.leetcode,
          codeforces: '',
          portfolio: data.portfolio,
        },
      };

      const res = await studentService.updateProfile(payload);
      if (res.profile) {
        updateProfileState(res.profile);
      }
      setSuccessMessage('Student profile updated successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('[Profile] Update error:', err);
      setErrorMessage(err.response?.data?.message || 'Error updating student profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const displayName = user?.name || profile?.user?.name || 'Aamrapali More';
  const displayInitials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'AM';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header Summary */}
      <Card className="bg-white border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-bold text-2xl flex items-center justify-center shadow-md">
              {displayInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{displayName}</h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                  Student Member
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{user?.email || 'student@skillbridge.edu'}</p>
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 font-medium">
                <span>Placement Portfolio Active</span>
                <span>•</span>
                <span>Government College of Engineering & Technology</span>
              </div>
            </div>
          </div>

          <div className="w-full sm:w-48">
            <ProgressBar
              value={profile?.profileCompletionPercentage || profile?.completionPercentage || 88}
              label="Profile Completion"
              color="blue"
            />
          </div>
        </div>
      </Card>

      {/* Success / Error Banners */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-3 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center gap-3 text-xs font-semibold text-rose-800">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 1. Basic & Target Role Information */}
        <Card className="bg-white border border-slate-200/90 shadow-sm">
          <CardHeader
            title="Personal & Career Direction"
            subtitle="Identification details, professional headline, and target placement role"
          />

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name (Read Only from Account)"
                disabled
                helperText="Managed by account authentication"
                {...register('fullName')}
              />

              <Input
                label="College Email Address (Read Only)"
                disabled
                helperText="Primary communication and audit identity"
                {...register('email')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Job Role <span className="text-blue-600">*</span>
                </label>
                <select
                  {...register('targetJobRole')}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                >
                  <option value="Software Development Engineer (SDE)">Software Development Engineer (SDE)</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Full-Stack Developer">Full-Stack Developer</option>
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                </select>
                <p className="mt-1 text-[11px] text-slate-500">Used as benchmark for skill gap calculation</p>
              </div>

              <Input
                label="Contact Number (Optional)"
                placeholder="+91 9876543210"
                helperText="Optional phone for campus drive notifications"
                {...register('contactNumber')}
              />
            </div>

            <Input
              label="Professional Headline"
              placeholder="e.g. Aspiring Full-Stack Software Engineer | React, Node.js & Cloud"
              helperText="Brief summary displayed to recruiters and training officers"
              {...register('headline')}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Short Professional Introduction (Bio)
              </label>
              <textarea
                rows={3}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                placeholder="Share your technical background, career objectives, and key achievements..."
                {...register('bio')}
              />
            </div>

            <Input
              label="Technical Interests (Comma Separated)"
              placeholder="React, TypeScript, MongoDB, Docker, Algorithms"
              helperText="Keywords used to align placement job roles and assessments"
              {...register('technicalInterests')}
            />
          </div>
        </Card>

        {/* 2. Academic Credentials */}
        <Card className="bg-white border border-slate-200/90 shadow-sm">
          <CardHeader
            title="Academic Credentials"
            subtitle="College department, graduation year, and degree progress"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="College / Institute Name"
              placeholder="e.g. Government College of Engineering & Technology"
              required
              {...register('college')}
            />

            <Input
              label="Department / Branch"
              placeholder="e.g. Computer Science and Engineering"
              required
              {...register('department')}
            />

            <Input
              label="Degree Program"
              placeholder="e.g. Bachelor of Technology (B.Tech)"
              required
              {...register('degree')}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Academic Year"
                type="number"
                min={1}
                max={5}
                placeholder="3"
                required
                {...register('currentYear')}
              />

              <Input
                label="Graduation Year"
                type="number"
                placeholder="2026"
                required
                {...register('graduationYear')}
              />
            </div>

            <Input
              label="Current CGPA (Optional)"
              type="number"
              step="0.01"
              min={0}
              max={10}
              placeholder="e.g. 8.85"
              helperText="Optional academic aggregate out of 10"
              {...register('cgpa')}
            />
          </div>
        </Card>

        {/* 3. External Portfolio & Coding Profiles */}
        <Card className="bg-white border border-slate-200/90 shadow-sm">
          <CardHeader
            title="External Portfolio & Coding Profiles"
            subtitle="Connect your GitHub, LinkedIn, and coding platform handles for evidence audits"
          />

          <div className="space-y-4">
            <Input
              label="GitHub Profile URL (Optional)"
              type="url"
              placeholder="https://github.com/username"
              leftIcon={<Github className="w-4 h-4 text-slate-500" />}
              helperText="Used to audit code commits and project repositories"
              {...register('github')}
            />

            <Input
              label="LinkedIn Profile URL (Optional)"
              type="url"
              placeholder="https://linkedin.com/in/username"
              leftIcon={<Linkedin className="w-4 h-4 text-slate-500" />}
              helperText="Professional network and internship references"
              {...register('linkedin')}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="LeetCode Profile URL (Optional)"
                type="url"
                placeholder="https://leetcode.com/u/username"
                leftIcon={<Code2 className="w-4 h-4 text-slate-500" />}
                helperText="Algorithmic problem-solving profile"
                {...register('leetcode')}
              />

              <Input
                label="Personal Website / Portfolio (Optional)"
                type="url"
                placeholder="https://yourportfolio.dev"
                leftIcon={<Globe className="w-4 h-4 text-slate-500" />}
                helperText="Live deployed portfolio site"
                {...register('portfolio')}
              />
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={saving}
            leftIcon={<Save className="w-4 h-4" />}
            className="bg-blue-600 hover:bg-blue-700 shadow-sm"
          >
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
