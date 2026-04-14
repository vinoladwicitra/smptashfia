import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconLoader2 } from '@tabler/icons-react';
import { useToast } from '../context/ToastContext';

export default function GoogleSheetsCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');

    if (error) {
      toast({ type: 'error', title: 'Gagal', description: `OAuth cancelled: ${error}` });
      navigate('/staff/google-sheets', { replace: true });
      return;
    }

    if (!code) {
      toast({ type: 'error', title: 'Gagal', description: 'No authorization code' });
      navigate('/staff/google-sheets', { replace: true });
      return;
    }

    // Send code to API via POST
    fetch('/api/google-sheets/oauth/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          toast({ type: 'success', title: 'Berhasil', description: 'Google Sheets berhasil terhubung!' });
          navigate('/staff/google-sheets?oauth=success', { replace: true });
        } else {
          toast({ type: 'error', title: 'Gagal', description: data.error || 'Gagal memproses OAuth' });
          navigate('/staff/google-sheets', { replace: true });
        }
      })
      .catch(() => {
        toast({ type: 'error', title: 'Gagal', description: 'Terjadi kesalahan koneksi' });
        navigate('/staff/google-sheets', { replace: true });
      });
  }, [navigate, toast]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <IconLoader2 size={32} className="animate-spin mx-auto text-primary mb-4" />
        <p className="text-text-light">Menghubungkan ke Google Sheets...</p>
      </div>
    </div>
  );
}
