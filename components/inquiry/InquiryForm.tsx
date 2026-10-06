"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";

const CONTACT_EMAIL = "contact@mightyblessing.com";
const REQUEST_TIMEOUT_MS = 20_000;
const UNCONFIRMED_DELIVERY = `전송 결과를 확인하지 못했습니다. 입력한 내용은 유지했습니다. 이미 전달되었을 수 있으니, 다시 보내기 전에 ${CONTACT_EMAIL}으로 접수 여부를 확인해 주세요.`;

type InquiryResult =
  | { delivery: "email" }
  | { delivery: "mailto"; to: string; subject: string }
  | { delivery: "error"; message: string };

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

const subscribeToHydration = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

type FieldErrors = Partial<Record<"email" | "message", string>>;

function buildMailBody(value: InquiryFormState) {
  return [
    "새 프로젝트 문의가 도착했습니다.",
    "",
    `회신받을 이메일: ${value.email}`,
    "",
    "[문의 내용]",
    value.message,
  ].join("\n");
}

export function InquiryForm({ reference }: { reference?: { title: string; path: string } } = {}) {
  const fieldId = useId();
  const isHydrated = useSyncExternalStore(subscribeToHydration, getClientSnapshot, getServerSnapshot);
  const emailInput = useRef<HTMLInputElement>(null);
  const messageInput = useRef<HTMLTextAreaElement>(null);
  const activeRequest = useRef<AbortController | null>(null);
  const [value, setValue] = useState(initialState);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mailtoHref, setMailtoHref] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [includeReference, setIncludeReference] = useState(true);

  useEffect(() => () => {
    const request = activeRequest.current;
    activeRequest.current = null;
    request?.abort();
  }, []);

  function updateField<Key extends keyof InquiryFormState>(key: Key, nextValue: InquiryFormState[Key]) {
    setValue((prev) => ({ ...prev, [key]: nextValue }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    setError("");
    setSuccess("");
    setMailtoHref("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isHydrated || activeRequest.current) return;
    setError("");
    setSuccess("");
    setMailtoHref("");

    const nextErrors: FieldErrors = {};
    if (!value.email.trim()) nextErrors.email = "회신받을 이메일을 입력해 주세요.";
    else if (emailInput.current?.validity.typeMismatch) nextErrors.email = "올바른 이메일 형식을 입력해 주세요.";
    if (!value.message.trim()) nextErrors.message = "문의 내용을 입력해 주세요.";
    setFieldErrors(nextErrors);

    if (nextErrors.email || nextErrors.message) {
      if (nextErrors.email) emailInput.current?.focus();
      else messageInput.current?.focus();
      return;
    }

    const submittedValue = { ...value, message: value.message + (reference && includeReference ? `\n\n참고 프로젝트: ${reference.title}\n${reference.path}` : "") };

    const controller = new AbortController();
    activeRequest.current = controller;
    setIsSubmitting(true);

    let timedOut = false;
    let rejectAborted: () => void = () => {};
    // Race the entire response, including its body. Aborting alone cannot bound
    // a stalled transport, and a late response must never clear newer input.
    const aborted = new Promise<never>((_resolve, reject) => {
      rejectAborted = () => reject(new Error("Inquiry request stopped"));
      controller.signal.addEventListener("abort", rejectAborted, { once: true });
    });
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    try {
      const result = await Promise.race([
        (async (): Promise<InquiryResult> => {
          const response = await fetch("/api/inquiry", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(submittedValue),
            signal: controller.signal,
          });

          // Proxy and provider failures may contain HTML or internal details.
          // Only successful, recognized delivery results are trusted here.
          if (!response.ok) {
            return {
              delivery: "error",
              message: response.status === 400
                ? "이메일 형식과 문의 내용을 확인해 주세요. 입력한 내용은 유지했습니다."
                : UNCONFIRMED_DELIVERY,
            };
          }
          const data: unknown = await response.json();
          if (typeof data !== "object" || data === null || !("ok" in data) || data.ok !== true || !("delivery" in data)) {
            return { delivery: "error", message: UNCONFIRMED_DELIVERY };
          }
          if (data.delivery === "email") return { delivery: "email" };
          if (data.delivery === "mailto") {
            return {
              delivery: "mailto",
              to: "to" in data && typeof data.to === "string" ? data.to : CONTACT_EMAIL,
              subject: "subject" in data && typeof data.subject === "string" ? data.subject : "[프로젝트 문의]",
            };
          }
          return { delivery: "error", message: UNCONFIRMED_DELIVERY };
        })(),
        aborted,
      ]);
      if (activeRequest.current !== controller) return;

      if (result.delivery === "error") {
        setError(result.message);
        return;
      }
      if (result.delivery === "mailto") {
        const href = `mailto:${result.to}?subject=${encodeURIComponent(
          result.subject,
        )}&body=${encodeURIComponent(buildMailBody(submittedValue))}`;
        setMailtoHref(href);
        setSuccess("아래 링크로 메일 작성 창을 열고, 메일 앱에서 보내기를 눌러 주세요. 아직 문의가 접수되지 않았습니다.");
        return;
      }

      setSuccess("문의가 접수되었습니다. 확인 후 회신드리겠습니다.");
      setValue(initialState);
    } catch {
      if (activeRequest.current === controller) {
        setError(`${timedOut ? "응답이 지연되어 " : ""}${UNCONFIRMED_DELIVERY}`);
      }
    } finally {
      clearTimeout(timeout);
      controller.signal.removeEventListener("abort", rejectAborted);
      if (activeRequest.current === controller) {
        activeRequest.current = null;
        setIsSubmitting(false);
      }
    }
  }

  return (
    <form method="post" action="/api/inquiry" noValidate onSubmit={handleSubmit} className="inquiry-form" aria-busy={isSubmitting}>
      <noscript><p className="inquiry-status">문의는 <a href={`mailto:${CONTACT_EMAIL}`} className="underline">이메일로 보내 주세요.</a></p></noscript>
      {reference && includeReference && <div className="inquiry-reference"><div><span>참고 프로젝트</span><a href={reference.path}>{reference.title} ↗</a><p>문의에 이 사례를 함께 전달합니다.</p></div><button type="button" disabled={!isHydrated || isSubmitting} onClick={() => { setIncludeReference(false); setMailtoHref(""); setSuccess(""); }}>해제</button></div>}
      <input
        type="text"
        name="company"
        value={value.company}
        onChange={(event) => updateField("company", event.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      <label>회신받을 이메일<input
        ref={emailInput}
        type="email"
        name="email"
        aria-label="회신받을 이메일"
        value={value.email}
        onChange={(event) => updateField("email", event.target.value)}
        placeholder="이메일"
        className="inquiry-field"
        autoComplete="email"
        readOnly={!isHydrated || isSubmitting}
        aria-invalid={Boolean(fieldErrors.email)}
        aria-describedby={fieldErrors.email ? `${fieldId}-email-error` : undefined}
        required
      />{fieldErrors.email && <span id={`${fieldId}-email-error`} className="inquiry-status" data-error="true">{fieldErrors.email}</span>}</label>

      <label>문의 내용<textarea
        ref={messageInput}
        name="message"
        aria-label="문의 내용"
        value={value.message}
        onChange={(event) => updateField("message", event.target.value)}
        placeholder="행사의 목적, 예상 일정과 장소, 필요한 도움을 적어 주세요."
        rows={6}
        className="inquiry-field"
        readOnly={!isHydrated || isSubmitting}
        aria-invalid={Boolean(fieldErrors.message)}
        aria-describedby={fieldErrors.message ? `${fieldId}-message-error` : undefined}
        required
      />{fieldErrors.message && <span id={`${fieldId}-message-error`} className="inquiry-status" data-error="true">{fieldErrors.message}</span>}</label>

      {(error || success) && (
        <p
          role={error ? "alert" : "status"}
          aria-atomic="true"
          className="inquiry-status"
          data-error={Boolean(error)}
        >
          {error || success}
          {mailtoHref && <> <a href={mailtoHref} className="underline">메일 작성 창 열기 ↗</a></>}
        </p>
      )}

      <button
        type="submit"
        disabled={!isHydrated || isSubmitting}
        className="inquiry-submit"
      >
        {isSubmitting ? "전송 중..." : "문의 보내기"}
      </button>
    </form>
  );
}
