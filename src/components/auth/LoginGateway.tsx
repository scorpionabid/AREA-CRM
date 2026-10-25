import React, { useState } from 'react';
import {
  ShieldAlert,
  LogIn,
  User,
  Key,
  Sparkles
} from 'lucide-react';
import { useCrm, isDirectorEmail } from '../../context/CrmContext';

interface LoginGatewayProps {
  onOpenPublicPortal?: () => void;
}

export const LoginGateway: React.FC<LoginGatewayProps> = ({ onOpenPublicPortal }) => {
  const {
    loginWithGoogle,
    loginWithEmailOrUsername,
    authLoading,
    accessDeniedEmail,
    dismissAccessDenied
  } = useCrm();

  const [loginMethod, setLoginMethod] = useState<'direct' | 'google'>('direct');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrUsername.trim()) return;
    await loginWithEmailOrUsername(emailOrUsername, password);
  };

  return (
    <div className="min-h-screen w-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Access Denied Modal */}
      {accessDeniedEmail && !isDirectorEmail(accessDeniedEmail) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl max-w-sm w-full p-6 text-white shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                Giriş İcazəniz Yoxdur və ya Hesab Tapılmadı
              </h3>
              <p className="text-xs text-rose-400 font-mono-nums break-all">
                {accessDeniedEmail}
              </p>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Bu hesab AREA-CRM bazasında qeydiyyatdan keçməyib və ya daxil edilən ad/e-poçt düzgün deyil.
              Zəhmət olmasa daxil etdiyiniz məlumatları yoxlayın və ya mərkəz rəhbərliyi ilə əlaqə saxlayın.
            </p>

            <button
              onClick={dismissAccessDenied}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Yenidən Cəhd Et
            </button>
          </div>
        </div>
      )}

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-2xl relative z-10 space-y-5">
        {/* Brand Logo & Name */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-md mx-auto">
            A
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center justify-center gap-1.5">
              <span>AREA-CRM</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-normal">
                v2.6
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Tədris Mərkəzi İdarəetmə Sistemi
            </p>
          </div>
        </div>

        {/* Method Selector Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-medium">
          <button
            type="button"
            onClick={() => setLoginMethod('direct')}
            className={`py-2 px-3 rounded-lg transition-all cursor-pointer text-center font-semibold ${
              loginMethod === 'direct'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Hesabla Giriş
          </button>
          <button
            type="button"
            onClick={() => setLoginMethod('google')}
            className={`py-2 px-3 rounded-lg transition-all cursor-pointer text-center font-semibold ${
              loginMethod === 'google'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Google ilə Giriş
          </button>
        </div>

        {/* METHOD 1: Direct Email / Username Login */}
        {loginMethod === 'direct' && (
          <form onSubmit={handleDirectSubmit} className="space-y-4 pt-1">
            <div className="space-y-1 text-left">
              <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                <span>E-poçt və ya İstifadəçi Adı</span>
                <span className="text-[10px] text-slate-500">Məs: leyla@area.edu.az</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={emailOrUsername}
                  onChange={e => setEmailOrUsername(e.target.value)}
                  placeholder="İstifadəçi adı və ya e-poçt..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                <span>Şifrə</span>
                <span className="text-[10px] text-slate-500">Hesab şifrəniz</span>
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Şifrə daxil edin..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{authLoading ? 'Yoxlanılır...' : 'Sistemə Daxil Ol'}</span>
            </button>
          </form>
        )}

        {/* METHOD 2: Official Google OAuth Sign-In */}
        {loginMethod === 'google' && (
          <div className="space-y-4 pt-1">
            <button
              type="button"
              onClick={loginWithGoogle}
              disabled={authLoading}
              className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.29 21.44 7.37 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.98 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.29 2.56 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{authLoading ? 'Əlaqə qurulur...' : 'Google ilə Daxil Ol'}</span>
            </button>

            {/* Whitelist Info Notice */}
            <div className="text-left bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
              <div className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Qeydiyyatlı Direktorlar & Whitelist:</span>
              </div>
              <div className="font-mono text-[10px] text-slate-300 space-y-0.5">
                <div>• scorpionabid82@gmail.com</div>
                <div>• texnobabasatis@gmail.com</div>
                <div>• roboticsarea@gmail.com</div>
                <div>• mentor.rasulzada@gmail.com</div>
              </div>
              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
                Bazada əlavə edilmiş tələbə və müəllimlər də öz e-poçtları ilə daxil ola bilirlər.
              </div>
            </div>
          </div>
        )}

        {/* Public Parent Registration Link */}
        {onOpenPublicPortal && (
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={onOpenPublicPortal}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-800/60 hover:border-indigo-600 text-indigo-300 hover:text-indigo-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm group"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 group-hover:rotate-12 transition-transform" />
              <span>Övladınızı kursa yazdırmaq istəyirsiniz? Onlayn Qeydiyyat Portalı →</span>
            </button>
          </div>
        )}

        {/* Footer Info */}
        <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
          <span>AREA CRM Sistemi</span>
          <span>Bütün hüquqlar qorunur © 2026</span>
        </div>
      </div>
    </div>
  );
};
