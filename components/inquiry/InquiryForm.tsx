"use client";

import { useMemo, useState } from "react";

const CONTACT_EMAIL = "contact@mightyblessing.com";

type InquiryFormState = {
  name: string;
  email: string;
  organization: string;
  message: string;
  company: string;
};

const initialState: InquiryFormState = {
  name: "",
  email: "",
  organization: "",
  message: "",
  company: "",
};

function buildMailBody(value: InquiryFormState) {
  return [
    "안녕하세요. 프로젝트 문의드립니다.",
    "",
    `이름: ${value.name}`,
    `이메일: ${value.email}`,
    `단체명: ${value.organization || "-"}`,
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

  const subject = useMemo(() => {
    const subjectBase = value.organization || value.name || "새 프로젝트";
    return `[프로젝트 문의] ${subjectBase}`;
  }, [value.organization, value.name]);

  function updateField<Key extends keyof InquiryFormState>(key: Key, nextValue: InquiryFormState[Key]) {
    setValue((prev) => ({ ...prev, [key]: nextValue }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!value.name.trim() || !value.email.trim() || !value.message.trim()) {
      setError("이름, 이메일, 문의 내용은 꼭 입력해 주세요.");
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
          data.subject || subject,
        )}&body=${encodeURIComponent(buildMailBody(value))}`;
        window.location.href = href;
        setSuccess("입력한 내용을 바탕으로 메일 작성 창을 열었습니다.");
        return;
      }

      setSuccess("문의가 접수되었습니다. 평일 기준 24시간 내 1차 회신을 드립니다.");
      setValue(initialState);
    } catch (error) {
      setError(error instanceof Error ? error.message : "문의 전송 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-white/10">
      <input
        type="text"
        name="company"
        value={value.company}
        onChange={(event) => updateField("company", event.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      <div className="grid gap-4 border-b border-white/10 py-5 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/42">기본 정보</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={value.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="이름"
            className="w-full border-b border-white/10 bg-transparent px-0 py-2.5 text-[0.98rem] text-white outline-none placeholder:text-white/28 focus:border-[#a9bcff]"
          />
          <input
            type="email"
            value={value.email}
            onChange={(event) => updateField("email", event.target.value)}
            placeholder="이메일"
            className="w-full border-b border-white/10 bg-transparent px-0 py-2.5 text-[0.98rem] text-white outline-none placeholder:text-white/28 focus:border-[#a9bcff]"
          />
          <input
            value={value.organization}
            onChange={(event) => updateField("organization", event.target.value)}
            placeholder="교회 또는 단체명"
            className="w-full border-b border-white/10 bg-transparent px-0 py-2.5 text-[0.98rem] text-white outline-none placeholder:text-white/28 focus:border-[#a9bcff] sm:col-span-2"
          />
        </div>
      </div>

      <div className="grid gap-4 border-b border-white/10 py-5 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/42">문의 내용</p>
        <div>
          <textarea
            value={value.message}
            onChange={(event) => updateField("message", event.target.value)}
            placeholder="예: 청년 예배 집회를 준비하고 있습니다. 6월 둘째 주 토요일, 서울 지역에서 약 700명 규모로 진행 예정입니다. 현장 운영과 무대·기술 지원이 필요하고, 현재는 장소와 전체 타임라인을 함께 정리하고 싶습니다."
            rows={8}
            className="w-full resize-y border-b border-white/10 bg-transparent px-0 py-2.5 text-[0.98rem] leading-[1.9] text-white outline-none placeholder:text-white/28 focus:border-[#a9bcff]"
          />
          <p className="mt-3 text-[0.84rem] leading-[1.7] text-white/42">
            행사명, 일정, 장소, 예상 규모, 필요한 범위를 함께 적어주시면 더 빠르게 답변드릴 수 있습니다.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 pt-6">
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

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-full bg-[#a9bcff] px-5 py-3 text-[0.95rem] font-semibold text-[#162349] transition-colors hover:bg-[#bfd0ff] disabled:opacity-60"
          >
            {isSubmitting ? "전송 중..." : "문의 보내기"}
          </button>
          <p className="text-[0.86rem] leading-[1.7] text-white/48">
            메일 전송 환경이 없을 때는 입력한 내용으로 메일 작성 창이 열립니다.
          </p>
        </div>
      </div>
    </form>
  );
}
