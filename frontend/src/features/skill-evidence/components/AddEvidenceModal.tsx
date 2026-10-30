import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { evidenceService } from '../../../services/evidenceService';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

interface AddEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormValues {
  title: string;
  type: string;
  description: string;
  source: string;
  sourceUrl: string;
  relatedSkills: string;
  evidenceDate: string;
}

export const AddEvidenceModal: React.FC<AddEvidenceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      type: 'project',
      evidenceDate: new Date().toISOString().split('T')[0],
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'image/png',
        'image/jpeg',
      ];
      if (!validTypes.includes(selected.type) && !selected.name.match(/\.(pdf|docx|doc|png|jpg|jpeg)$/i)) {
        setError('Invalid file format. Please upload PDF, DOCX, or PNG.');
        return;
      }
      if (selected.size > 5 * 1024 * 1024) {
        setError('Uploaded file must not exceed 5MB.');
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    setError(null);
    setUploadProgress(20);

    try {
      const skillsArray = values.relatedSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      let fileRefData = null;
      if (file) {
        setUploadProgress(50);
        const uploadRes = await evidenceService.uploadFile(file);
        fileRefData = uploadRes.fileRef;
      }

      setUploadProgress(80);

      await evidenceService.createEvidence({
        title: values.title,
        evidenceType: values.type,
        type: values.type,
        description: values.description,
        issuer: values.source,
        url: values.sourceUrl,
        relatedSkills: skillsArray,
        date: values.evidenceDate,
        fileRef: fileRefData,
      } as any);

      setUploadProgress(100);
      setTimeout(() => {
        reset();
        setFile(null);
        setUploadProgress(null);
        onSuccess();
        onClose();
      }, 300);
    } catch (err: any) {
      console.error('[AddEvidenceModal] Submit error:', err);
      setError(err.response?.data?.message || err.message || 'Error creating evidence record.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Skill Evidence"
      subtitle="Submit verifiable academic, project, or certificate proof"
      maxWidth="lg"
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center gap-2.5 text-xs text-rose-700 font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {uploadProgress !== null && (
        <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200/80 text-xs text-blue-900 font-medium">
          <div className="flex justify-between mb-1">
            <span>Uploading & Auditing Artifact...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Evidence Title *"
          placeholder="e.g. Distributed Cache Implementation in Go"
          required
          {...register('title', { required: 'Title is required' })}
          error={errors.title?.message}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Evidence Type *
            </label>
            <select
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              {...register('type', { required: true })}
            >
              <option value="project">College / Personal Project</option>
              <option value="certificate">Certification</option>
              <option value="internship">Internship Experience</option>
              <option value="assessment">Academic / Lab Assessment</option>
              <option value="coding_profile">Coding Platform Profile (LeetCode / GitHub)</option>
              <option value="resume">Resume / CV Document</option>
              <option value="other">Other Learning Evidence</option>
            </select>
          </div>

          <Input
            label="Date of Completion *"
            type="date"
            required
            {...register('evidenceDate', { required: true })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Issuing Organization / Source"
            placeholder="e.g. GitHub, Coursera, University Dept"
            {...register('source')}
          />

          <Input
            label="Verification / Repository URL"
            type="url"
            placeholder="https://github.com/..."
            {...register('sourceUrl')}
          />
        </div>

        <Input
          label="Supported Skills (Comma-separated) *"
          placeholder="e.g. React, TypeScript, Node.js, Data Structures"
          helperText="These skills will be weighted in your skill intelligence scores"
          required
          {...register('relatedSkills', { required: 'Please specify at least one skill' })}
          error={errors.relatedSkills?.message}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Description & Context
          </label>
          <textarea
            rows={2}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            placeholder="Briefly describe your technical contribution, architecture, or evaluation scope..."
            {...register('description')}
          />
        </div>

        {/* File Upload Zone */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Attach Document / Certificate (PDF, DOCX, PNG - Max 5MB)
          </label>
          <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-4 text-center cursor-pointer bg-[#F8FAFC] transition-colors">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              {file ? (
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-blue-700">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>{file.name}</span> ({(file.size / 1024).toFixed(1)} KB)
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-slate-500">
                  <UploadCloud className="w-6 h-6 text-slate-400" />
                  <span className="text-xs font-medium">Click to select private file</span>
                  <span className="text-[10px] text-slate-400">PDF, DOCX, or PNG up to 5MB</span>
                </div>
              )}
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={submitting} className="bg-blue-600 hover:bg-blue-700">
            Save Evidence Record
          </Button>
        </div>
      </form>
    </Modal>
  );
};
