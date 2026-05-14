import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Login | HEUREUX",
  description: "Sign in to your account",
};

export default function LoginPage() {
  return (
    <main className="flex-grow flex items-center justify-center px-4 py-12 relative overflow-hidden min-h-[80vh]">
      {/* 表單兩側燈光模糊效果 */}
      <div
        className="absolute top-1/4 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
        aria-hidden
      />
      <div
        className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
        aria-hidden
      />
      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <h1 className="text-5xl lg:text-6xl font-display text-slate-900 dark:text-white font-bold tracking-tight">
            Welcome to <span className="text-primary">Heureux</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Elevate your lifestyle with joy.
          </p>
        </div>
        <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-lg shadow-2xl overflow-hidden">
          <div className="flex border-b border-slate-200 dark:border-white/10">
            <Link
              href="/login"
              className="flex-1 py-4 text-sm font-bold border-b-2 border-primary text-primary transition-all text-center"
            >
              LOGIN
            </Link>
            <Link
              href="/register"
              className="flex-1 py-4 text-sm font-bold border-b-2 border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all text-center"
            >
              REGISTER
            </Link>
          </div>
          <div className="p-8 space-y-6">
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          By signing in, you agree to our{" "}
          <Link className="text-primary hover:underline" href="#">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link className="text-primary hover:underline" href="#">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
