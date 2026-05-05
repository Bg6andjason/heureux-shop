"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "";

  async function handleSubmit(formData: FormData) {
    setError(null);
    if (from) formData.set("from", from);
    const result = await loginAction(formData);
    if (result && !result.ok) {
      setError(result.message ?? "Login failed");
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg px-4 py-2">
          {error}
        </p>
      )}
      <div className="space-y-2">
        <label
          htmlFor="login-email"
          className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
        >
          Email Address
        </label>
        <div className="relative group">
          <input
            id="login-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full h-14 bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/20 rounded px-4 pr-12 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
            placeholder="demo@example.com"
          />
          <span className="material-symbols-outlined absolute right-4 top-4 text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none">
            mail
          </span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label
            htmlFor="login-password"
            className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
          >
            Password
          </label>
          <Link
            className="text-xs font-bold text-primary hover:underline"
            href="#"
          >
            Forgot?
          </Link>
        </div>
        <div className="relative flex">
          <input
            id="login-password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            className="w-full h-14 bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/20 rounded px-4 pr-12 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
            placeholder="demo123"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-4 text-slate-400 hover:text-primary transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <span className="material-symbols-outlined">
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
        </div>
      </div>
      <button
        type="submit"
        className="w-full h-14 bg-primary text-white font-display text-2xl rounded shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 tracking-widest"
      >
        Sign In
        <span className="material-symbols-outlined">arrow_forward</span>
      </button>
      {/* <div className="relative flex items-center py-4">
        <div className="flex-grow border-t border-slate-200 dark:border-white/10" />
        <span className="flex-shrink mx-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Or continue with</span>
        <div className="flex-grow border-t border-slate-200 dark:border-white/10" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          className="h-12 flex items-center justify-center border border-slate-200 dark:border-white/20 rounded hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span className="text-xs font-bold uppercase tracking-wider">Google</span>
        </button>
        <button
          type="button"
          className="h-12 flex items-center justify-center border border-slate-200 dark:border-white/20 rounded hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
        >
          <span className="material-symbols-outlined mr-2 text-slate-900 dark:text-white">ios</span>
          <span className="text-xs font-bold uppercase tracking-wider">Apple</span>
        </button>
      </div> */}
      <p className="text-center text-sm text-slate-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-primary hover:underline font-bold"
        >
          Register
        </Link>
      </p>
    </form>
  );
}
