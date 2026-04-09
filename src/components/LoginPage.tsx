import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IconSchool, IconMail, IconLock, IconEye, IconEyeOff, IconArrowLeft } from '@tabler/icons-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

const roleLabels: Record<string, string> = {
  teacher: 'Guru',
  student: 'Siswa',
  parent: 'Orang Tua',
  staff: 'Staf',
};

interface LocationState {
  from?: { pathname: string };
}

export default function LoginPage({ role }: { role: keyof typeof roleLabels }) {
  const navigate = useNavigate();
  const location = useLocation() as { state?: LocationState };
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        toast({ type: 'error', title: 'Gagal Masuk', description: authError.message });
        return;
      }

      if (data.user) {
        toast({ type: 'success', title: 'Login Berhasil', description: 'Mengalihkan ke dashboard...' });
        const from = location.state?.from?.pathname;
        const dashboardPath = role === 'teacher' ? '/teacher'
          : role === 'student' ? '/student'
          : role === 'parent' ? '/parents'
          : '/staff';
        setTimeout(() => navigate(from || dashboardPath), 1000);
      }
    } catch {
      toast({ type: 'error', title: 'Terjadi Kesalahan', description: 'Silakan coba lagi.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center px-5">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <IconSchool size={32} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text">Login {roleLabels[role]}</h1>
          <p className="text-text-light mt-2">Masuk ke portal SMP Tashfia</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-text mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light">
                <IconMail size={20} />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@smptashfia.sch.id"
                className="w-full pl-10 pr-4 py-3 border border-border rounded-xl outline-none focus:border-primary transition-colors text-text placeholder:text-text-light"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-text mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light">
                <IconLock size={20} />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full pl-10 pr-12 py-3 border border-border rounded-xl outline-none focus:border-primary transition-colors text-text placeholder:text-text-light"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-text transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Logging in...
              </>
            ) : (
              'Masuk'
            )}
          </button>
        </form>

        {/* Back to Home */}
        <p className="text-center mt-6">
          <button 
            onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/'); }}
            className="inline-flex items-center gap-1 text-sm text-text-light hover:text-primary transition-colors cursor-pointer"
          >
            <IconArrowLeft size={16} />
            Kembali ke Beranda
          </button>
        </p>
      </div>
    </div>
  );
}
