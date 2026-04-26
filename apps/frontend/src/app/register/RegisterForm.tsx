"use client";

import { useState } from "react";
import Link from "next/link";
import { registerAction } from "@/app/actions/auth";

export default function RegisterForm() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await registerAction(formData);
    if (result && !result.ok) {
      setError(result.message ?? "Registration failed");
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
        <label htmlFor="reg-email" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Email Address
        </label>
        <input
          id="reg-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full h-14 bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/20 rounded px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
          placeholder="name@example.com"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="reg-password" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Password (min 6 characters)
        </label>
        <input
          id="reg-password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="w-full h-14 bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/20 rounded px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
          placeholder="••••••••"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="reg-name" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Display Name (optional)
        </label>
        <input
          id="reg-name"
          name="name"
          type="text"
          autoComplete="name"
          className="w-full h-14 bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/20 rounded px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
          placeholder="Display name"
        />
      </div>
      <button
        type="submit"
        className="w-full h-14 bg-primary text-white font-display text-2xl rounded shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 tracking-widest"
      >
        Create Account
        <span className="material-symbols-outlined">arrow_forward</span>
      </button>
      <p className="text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline font-bold">
          Sign In
        </Link>
      </p>
    </form>
  );
}
