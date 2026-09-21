'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, User } from 'firebase/auth';
import { Store, Loader2, Mail, Lock } from 'lucide-react';
import { useStore } from '@/store/useStore';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { storeSettings } = useStore();

  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        useStore.getState().resetStore();
      } else if (user && currentUser.uid !== user.uid) {
        useStore.getState().resetStore();
      }
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      console.error("Auth failed:", error);
      if (error.code === 'auth/email-already-in-use') {
        setErrorMsg('อีเมลนี้ถูกใช้งานไปแล้ว');
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setErrorMsg('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      } else if (error.code === 'auth/weak-password') {
        setErrorMsg('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMsg('รูปแบบอีเมลไม่ถูกต้อง');
      } else {
        setErrorMsg('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="p-10">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Store className="w-10 h-10 text-blue-600" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 mb-1">{storeSettings.name}</h1>
              <p className="text-slate-500 text-sm">
                {isRegistering ? 'สร้างบัญชีใหม่สำหรับพนักงาน' : 'กรุณาเข้าสู่ระบบเพื่อเปิดตู้แคชเชียร์'}
              </p>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center font-medium animate-in fade-in">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">อีเมล (Email)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all font-medium"
                    placeholder="staff@shop.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">รหัสผ่าน (Password)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl transition-all shadow-md mt-6 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span>{isRegistering ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}</span>
                )}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setErrorMsg('');
                }}
                className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                {isRegistering 
                  ? 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบที่นี่' 
                  : 'ยังไม่มีบัญชี? สมัครสมาชิก'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user is authenticated, render the children
  return <>{children}</>;
}
