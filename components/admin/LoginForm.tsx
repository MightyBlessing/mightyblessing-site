"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  next?: string;
};

export function LoginForm({ next = "/admin" }: Props) {
  const router = useRouter();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, password }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "로그인에 실패했습니다.");
      }

      router.push(next);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "로그인 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-6 sm:p-7">
      <div className="space-y-4">
        <div>
          <label className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/46">ID</label>
          <input
            value={id}
            onChange={(event) => setId(event.target.value)}
            placeholder="admin"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-[0.98rem] text-white outline-none placeholder:text-white/28 focus:border-[#a9bcff]"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/46">Password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-[0.98rem] text-white outline-none placeholder:text-white/28 focus:border-[#a9bcff]"
          />
        </div>
      </div>

      {error && <p className="mt-4 text-[0.92rem] leading-[1.7] text-[#ffb1b1]">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#a9bcff] px-5 py-3 text-[0.95rem] font-semibold text-[#162349] transition-colors hover:bg-[#bfd0ff] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "로그인 중..." : "관리자 로그인"}
      </button>
    </form>
  );
}

