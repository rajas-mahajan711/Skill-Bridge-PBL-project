import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { GraduationCap, User, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await register(name, email, password);
      navigate('/student/dashboard', { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white shadow-md mb-4">
          <GraduationCap className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Join Skill<span className="text-blue-600">Bridge</span>
        </h2>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          Create your Student Intelligence Portfolio
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="shadow-lg border-slate-200/90 py-8 px-6 sm:px-10 bg-white">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Student Registration</h3>
            <p className="text-xs text-slate-500 mt-1">
              Set up your profile to begin auditing your skills and tracking placement readiness.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200/80 flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. Aamrapali More"
              required
              leftIcon={<User className="w-4 h-4" />}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              label="College Email Address"
              type="email"
              placeholder="student@college.edu"
              required
              leftIcon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              required
              helperText="Minimum 6 characters"
              leftIcon={<Lock className="w-4 h-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              required
              leftIcon={<Lock className="w-4 h-4" />}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create Student Account
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 underline">
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
