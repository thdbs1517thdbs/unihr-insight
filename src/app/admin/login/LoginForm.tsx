"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-medium text-navy-900"
        >
          이메일
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-navy-900 outline-none ring-accent/20 placeholder:text-muted focus:border-accent focus:ring-2"
          placeholder="관리자 이메일"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-medium text-navy-900"
        >
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-navy-900 outline-none ring-accent/20 placeholder:text-muted focus:border-accent focus:ring-2"
          placeholder="비밀번호"
        />
      </div>

      {state.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "로그인 중..." : "로그인"}
      </button>
    </form>
  );
}
