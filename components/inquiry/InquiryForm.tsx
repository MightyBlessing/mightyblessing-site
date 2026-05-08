"use client";

import { useState } from "react";

const CONTACT_EMAIL = "contact@mightyblessing.com";

type InquiryFormState = {
  email: string;
  message: string;
  company: string;
};

const initialState: InquiryFormState = {
  email: "",
  message: "",
  company: "",
};

function buildMailBody(value: InquiryFormState) {
  return [
    "새 프로젝트 문의가 도착했습니다.",
    "",
    `회신 받을 이메일: ${value.email}`,
    "",
    "[문의 내용]",
    value.message,
  ].join("\n");
}

export function InquiryForm() {
  const [value, setValue] = useState(initialState);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<Key extends keyof InquiryFormState>(key: Key, nextValue: InquiryFormState[Key]) {
    setValue((prev) => ({ ...prev, [key]: nextValue }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!value.email.trim() || !value.message.trim()) {
      setError("이메일과 문의 내용을 입력해 주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(value),
      });

      const data = (await response.json()) as {
        error?: string;
        delivery?: "email" | "mailto";
        to?: string;
        subject?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "문의 전송 중 오류가 발생했습니다.");
      }

      if (data.delivery === "mailto") {
        const href = `mailto:${data.to || CONTACT_EMAIL}?subject=${encodeURIComponent(
          data.subject || "[프로젝트 문의]",
        )}&body=${encodeURIComponent(buildMailBody(value))}`;
        window.location.href = href;
        setSuccess("입력한 내용으로 메일 작성 창을 열었습니다.");
        return;
      }

      setSuccess("문의가 접수되었습니다. 평일 24시간 내 회신드립니다.");
      setValue(initialState);
    } catch (error) {
      setError(error instanceof Error ? error.message : "문의 전송 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <input
        type="text"
        name="company"
        value={value.company}
        onChange={(event) => updateField("company", event.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      <input
        type="email"
        value={value.email}
        onChange={(event) => updateField("email", event.target.value)}
        placeholder="이메일"
        className="w-full rounded-xl border border-[#a9bcff]/40 bg-[#a9bcff]/[0.12] px-4 py-3 text-[1rem] text-white outline-none transition-colors placeholder:text-white/45 focus:border-[#a9bcff]/70 focus:bg-[#a9bcff]/[0.18]"
        autoComplete="email"
        required
      />

      <textarea
        value={value.message}
        onChange={(event) => updateField("message", event.target.value)}
        placeholder="문의 내용을 자유롭게 적어주세요."
        rows={6}
        className="w-full resize-y rounded-xl border border-[#a9bcff]/40 bg-[#a9bcff]/[0.12] px-4 py-3 text-[1rem] leading-[1.8] text-white outline-none transition-colors placeholder:text-white/45 focus:border-[#a9bcff]/70 focus:bg-[#a9bcff]/[0.18]"
        required
      />

      {(error || success) && (
        <p
          aria-live="polite"
          className={`text-[0.92rem] leading-[1.7] ${
            error ? "text-[#ffb1b1]" : "text-[#d7e0ff]"
          }`}
        >
          {error || success}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center rounded-full bg-[#a9bcff] px-6 py-3 text-[0.98rem] font-semibold text-[#162349] transition-colors hover:bg-[#bfd0ff] disabled:opacity-60 sm:w-auto sm:self-start"
      >
        {isSubmitting ? "전송 중..." : "문의 보내기"}
      </button>
    </form>
  );
}
