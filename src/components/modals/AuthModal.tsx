import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  doc,
  setDoc,
  serverTimestamp,
} from '../../lib/firebase';
import { linkReferral } from '../../lib/api';
import { useApp } from '../../context/AppContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'signin',
}) => {
  const { showToast, setRole } = useApp();
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'artist' | 'producer'>('artist');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check for ?ref= URL param on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) {
        setReferralCode(ref);
        localStorage.setItem('klave_pending_ref', ref);
      } else {
        const cached = localStorage.getItem('klave_pending_ref');
        if (cached) setReferralCode(cached);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    setMode(defaultMode);
    setErrorMsg(null);
  }, [defaultMode, isOpen]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;

      // Link referral if present
      const ref = referralCode.trim() || localStorage.getItem('klave_pending_ref');
      if (ref) {
        linkReferral(ref).catch(() => {});
        localStorage.removeItem('klave_pending_ref');
      }

      showToast(`Welcome to KLAVE, ${user.displayName || 'Producer'}!`, 'success');
      onClose();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setErrorMsg(e.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        showToast('Signed in successfully', 'success');
        onClose();
      } else if (mode === 'signup') {
        if (!email || !password) {
          setErrorMsg('Please enter email and password');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg('Password must be at least 6 characters');
          setLoading(false);
          return;
        }

        const res = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const uid = res.user.uid;

        // Create base user document in Firestore
        try {
          await setDoc(doc(db, 'users', uid), {
            displayName: displayName.trim() || email.split('@')[0],
            email: email.trim(),
            role: selectedRole,
            tier: 'free',
            createdAt: serverTimestamp(),
            verified: false,
          });
        } catch {
          // If firestore write fails locally, continue
        }

        setRole(selectedRole);

        // Link ambassador referral if present
        const ref = referralCode.trim() || localStorage.getItem('klave_pending_ref');
        if (ref) {
          try {
            await linkReferral(ref);
            localStorage.removeItem('klave_pending_ref');
          } catch {
            // non-fatal
          }
        }

        showToast('Account created successfully!', 'success');
        onClose();
      } else if (mode === 'reset') {
        if (!email) {
          setErrorMsg('Please enter your email to receive a reset link');
          setLoading(false);
          return;
        }
        await sendPasswordResetEmail(auth, email.trim());
        showToast('Password reset link sent to your email', 'info');
        setMode('signin');
      }
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      if (e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
        setErrorMsg('Invalid email or password');
      } else if (e.code === 'auth/email-already-in-use') {
        setErrorMsg('An account with this email already exists');
      } else {
        setErrorMsg(e.message || 'Authentication error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
      style={{ backgroundColor: 'rgba(6, 7, 10, 0.78)' }}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-xl border p-6 shadow-2xl transition-all"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-strong)',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-md p-1.5 transition-colors cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-black tracking-[0.2em]">
              KL<span style={{ color: 'var(--accent-bright)' }}>A</span>VE
            </span>
            <span
              className="rounded px-1.5 py-0.5 font-mono-tech text-[10px] uppercase font-bold"
              style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent-ice)' }}
            >
              Auth
            </span>
          </div>
          <h2 className="mt-2 font-display text-xl font-bold">
            {mode === 'signin' && 'Sign in to your account'}
            {mode === 'signup' && 'Create your KLAVE account'}
            {mode === 'reset' && 'Reset your password'}
          </h2>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            {mode === 'signin' && 'Access purchased audio stems, saved beats, and producer dashboard.'}
            {mode === 'signup' && 'Join the human-made audio marketplace with isolated stem verification.'}
            {mode === 'reset' && 'Enter your email and we will send you a password reset link.'}
          </p>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div
            className="mb-4 flex items-center gap-2 rounded-md border p-2.5 text-xs text-red-400"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Google One-Click Button */}
        {mode !== 'reset' && (
          <div className="mb-5">
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleSignIn}
              className="flex h-10 w-full cursor-pointer items-center justify-center gap-2.5 rounded-md border text-xs font-semibold transition hover:opacity-90 disabled:opacity-50"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Continue with Google
            </button>

            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: 'var(--border-subtle)' }} />
              </div>
              <span
                className="relative px-3 font-mono-tech text-[10px] uppercase"
                style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)' }}
              >
                or email
              </span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block font-mono-tech text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
                  Display Name
                </label>
                <div className="relative mt-1">
                  <User className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Northhh or SoundBoy"
                    className="h-9 w-full rounded-md border pr-3 pl-9 text-xs outline-none transition focus:border-blue-500"
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>

              {/* Role Picker */}
              <div>
                <label className="block font-mono-tech text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
                  I want to
                </label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('artist')}
                    className="cursor-pointer rounded-md border p-2 text-left text-xs font-semibold transition"
                    style={{
                      backgroundColor: selectedRole === 'artist' ? 'var(--accent-soft)' : 'var(--bg-elevated)',
                      borderColor: selectedRole === 'artist' ? 'var(--accent-primary)' : 'var(--border-subtle)',
                      color: selectedRole === 'artist' ? 'var(--accent-ice)' : 'var(--text-secondary)',
                    }}
                  >
                    Buy Beats (Artist)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('producer')}
                    className="cursor-pointer rounded-md border p-2 text-left text-xs font-semibold transition"
                    style={{
                      backgroundColor: selectedRole === 'producer' ? 'var(--accent-soft)' : 'var(--bg-elevated)',
                      borderColor: selectedRole === 'producer' ? 'var(--accent-primary)' : 'var(--border-subtle)',
                      color: selectedRole === 'producer' ? 'var(--accent-ice)' : 'var(--text-secondary)',
                    }}
                  >
                    Sell Beats (Producer)
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block font-mono-tech text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
              Email Address
            </label>
            <div className="relative mt-1">
              <Mail className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="h-9 w-full rounded-md border pr-3 pl-9 text-xs outline-none transition focus:border-blue-500"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div>
              <div className="flex items-center justify-between">
                <label className="block font-mono-tech text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="text-[11px] transition hover:underline cursor-pointer"
                    style={{ color: 'var(--accent-ice)' }}
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative mt-1">
                <Lock className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-9 w-full rounded-md border pr-3 pl-9 text-xs outline-none transition focus:border-blue-500"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block font-mono-tech text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
                Referral Code (Optional)
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="e.g. northhh"
                className="mt-1 h-9 w-full rounded-md border px-3 text-xs outline-none transition focus:border-blue-500"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-md font-semibold text-xs text-white transition disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            {loading ? (
              <span className="animate-pulse">Processing...</span>
            ) : mode === 'signin' ? (
              <>
                Sign In
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            ) : mode === 'signup' ? (
              <>
                Create Account
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        {/* Footer switch */}
        <div className="mt-5 text-center text-xs" style={{ color: 'var(--text-secondary)' }}>
          {mode === 'signin' && (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="font-semibold transition hover:underline cursor-pointer"
                style={{ color: 'var(--accent-ice)' }}
              >
                Sign up
              </button>
            </span>
          )}
          {mode === 'signup' && (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="font-semibold transition hover:underline cursor-pointer"
                style={{ color: 'var(--accent-ice)' }}
              >
                Sign in
              </button>
            </span>
          )}
          {mode === 'reset' && (
            <button
              type="button"
              onClick={() => setMode('signin')}
              className="font-semibold transition hover:underline cursor-pointer"
              style={{ color: 'var(--accent-ice)' }}
            >
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
