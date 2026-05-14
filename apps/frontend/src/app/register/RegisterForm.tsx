"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerAction } from "@/app/actions/auth";

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const isSuccessModalOpen = success !== null;

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);

    const result = await registerAction(formData);
    if (result && !result.ok) {
      setError(result.message ?? "Registration failed");
      return;
    }

    setSuccess(result?.message ?? "Registration succeeded");
  }

  function handleSuccessConfirm() {
    router.replace("/");
  }

  return (
    <>
      <form action={handleSubmit} className="space-y-6">
        {error && (
          <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg px-4 py-2">
            {error}
          </p>
        )}
        <div className="space-y-2">
          <label
            htmlFor="reg-email"
            className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
          >
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
          <label
            htmlFor="reg-password"
            className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
          >
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
            placeholder="Password"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="reg-name"
            className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
          >
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
          <Link
            href="/login"
            className="text-primary hover:underline font-bold"
          >
            Sign In
          </Link>
        </p>
      </form>

      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 transition-opacity ${
          isSuccessModalOpen
            ? "opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-success-title"
        aria-hidden={!isSuccessModalOpen}
      >
        <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 text-center shadow-2xl dark:border-white/10 dark:bg-[#121212]">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <span className="material-symbols-outlined">check</span>
          </div>
          <h2
            id="register-success-title"
            className="text-2xl font-display font-bold text-slate-900 dark:text-white"
          >
            Registration Complete
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {success ?? "Registration succeeded"}
          </p>
          <button
            type="button"
            onClick={handleSuccessConfirm}
            className="mt-6 h-12 w-full rounded bg-primary px-4 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            OK
          </button>
        </div>
      </div>
    </>
  );
}
