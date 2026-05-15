"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ADMIN_DEMO_EMAIL,
  loginAdmin,
} from "@/lib/admin-auth";
import { setCmsAdminSession } from "@/lib/cms-session";

type FieldErrors = {
  email?: string;
  password?: string;
};

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const result = await loginAdmin(email, password);

    if (!result.ok) {
      setIsSubmitting(false);
      if (result.field) {
        setFieldErrors({ [result.field]: result.message });
      } else {
        setError(result.message);
      }
      return;
    }

    setCmsAdminSession(result.token, result.admin);
    router.replace("/");
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="auth-form" noValidate>
      {error ? (
        <p className="auth-message auth-message-error" role="alert">
          {error}
        </p>
      ) : null}

      <label htmlFor="admin-email">
        <span>Email</span>
        <input
          aria-describedby={fieldErrors.email ? "admin-email-error" : undefined}
          aria-invalid={fieldErrors.email ? "true" : "false"}
          autoComplete="email"
          defaultValue={ADMIN_DEMO_EMAIL}
          id="admin-email"
          inputMode="email"
          name="email"
          required
          type="text"
        />
        {fieldErrors.email ? (
          <small className="field-error" id="admin-email-error">
            {fieldErrors.email}
          </small>
        ) : null}
      </label>

      <label htmlFor="admin-password">
        <span>密碼</span>
        <span className="password-field">
          <input
            aria-describedby={fieldErrors.password ? "admin-password-error" : undefined}
            aria-invalid={fieldErrors.password ? "true" : "false"}
            autoComplete="current-password"
            id="admin-password"
            name="password"
            required
            type={showPassword ? "text" : "password"}
          />
          <button
            aria-label={showPassword ? "隱藏密碼" : "顯示密碼"}
            className="password-toggle"
            onClick={() => setShowPassword((value) => !value)}
            type="button"
          >
            {showPassword ? "隱藏" : "顯示"}
          </button>
        </span>
        {fieldErrors.password ? (
          <small className="field-error" id="admin-password-error">
            {fieldErrors.password}
          </small>
        ) : null}
      </label>

      <button disabled={isSubmitting} type="submit">
        {isSubmitting ? "登入中..." : "登入"}
      </button>
    </form>
  );
}
