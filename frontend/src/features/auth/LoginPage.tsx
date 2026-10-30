import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { GraduationCap, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('student@skillbridge.edu');
  const [password, setPassword] = useState('Student@123');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/student/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check credentials.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoAccess = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await login('student@skillbridge.edu', 'Student@123');
      navigate('/student/dashboard', { replace: true });
    } catch (err: any) {
      setError('Error initializing demo access.');
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
          Skill<span className="text-blue-600">Bridge</span>
        </h2>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          Student Skill & Placement Intelligence Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="shadow-lg border-slate-200/90 py-8 px-6 sm:px-10 bg-white">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Sign in to your account</h3>
            <p className="text-xs text-slate-500 mt-1">
              Access your verified skill portfolio, role readiness, and learning recommendations.
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
              label="Email Address"
              type="email"
              placeholder="student@skillbridge.edu"
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
              leftIcon={<Lock className="w-4 h-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Student Portal
            </Button>
          </form>

          {/* Quick Demo Student Access */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="bg-blue-50/80 border border-blue-200/80 rounded-xl p-3.5 text-left">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <p className="text-xs font-semibold text-blue-950">PBL Evaluation Quick-Start</p>
                  </div>
                  <p className="text-[11px] text-blue-800 mt-1 leading-relaxed">
                    Instantly load verified portfolio of <strong>Aamrapali More</strong> (3rd Year CSE, SDE Target Role).
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full mt-3 bg-white text-xs border-blue-300 text-blue-700 hover:bg-blue-50 font-semibold"
                onClick={handleQuickDemoAccess}
                isLoading={isSubmitting}
                leftIcon={<Zap className="w-3.5 h-3.5 text-blue-600" />}
              >
                Instant Student Access (Demo Ready)
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have a student account?{' '}
            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 underline">
              Create an account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
