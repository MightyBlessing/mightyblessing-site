"use client";
/* eslint-disable @next/next/no-img-element -- Local upload previews and content-managed screenshots. */
import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { guardEditorNavigation } from "@/lib/admin/editor-navigation";
import { productNames, type ProductEditorPayload, type ProductEditorValue } from "@/lib/product-content-types";

function toPayload(value: ProductEditorValue): ProductEditorPayload {
  return { id: value.id, revision: value.revision, description: value.description, detail: value.detail, alt: value.screen?.alt || "", caption: value.screen?.caption || "", removeScreen: value.screenHidden === true };
}

export function ProductEditor({ initialValue }: { initialValue: ProductEditorValue }) {
  const [saved, setSaved] = useState(initialValue);
  const [draft, setDraft] = useState(() => toPayload(initialValue));
  const [file, setFile] = useState<File>();
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const inFlight = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const dirty = Boolean(file) || JSON.stringify(draft) !== JSON.stringify(toPayload(saved));
  useEffect(() => {
    if (!file) { setPreview(""); return; }
    const url = URL.createObjectURL(file); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    const leave = (event: MouseEvent) => guardEditorNavigation(event, window.location.href, () => window.confirm("저장하지 않은 변경이 있습니다. 페이지를 이동할까요?"));
    document.addEventListener("click", leave, true);
    window.addEventListener("beforeunload", warn);
    return () => { document.removeEventListener("click", leave, true); window.removeEventListener("beforeunload", warn); };
  }, [dirty]);
  function change(key: keyof Pick<ProductEditorPayload, "description" | "detail" | "alt" | "caption">, value: string) {
    setDraft(current => ({ ...current, [key]: value })); setMessage("");
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (inFlight.current) return;
    inFlight.current = true; setBusy(true); setMessage(""); setError(false);
    try {
      const body = new FormData(); body.set("payload", JSON.stringify(draft)); if (file) body.set("screen", file);
      const response = await fetch("/api/admin/products", { method: "POST", body });
      let result;
      try { result = await response.json(); } catch { throw new Error("저장 응답을 확인하지 못했습니다. 입력을 보관하고 다시 확인해 주세요."); }
      if (!response.ok || !result.ok || !result.value?.revision) throw new Error(response.status === 401 ? "로그인이 만료되었습니다. 입력을 보관한 뒤 다시 로그인해 주세요." : result.error || "저장하지 못했습니다.");
      setSaved(result.value); setDraft(toPayload(result.value)); setFile(undefined); if (fileInput.current) fileInput.current.value = "";
      setMessage(result.commitSha ? `저장했습니다. 운영 반영은 빌드·배포 후 확인해 주세요. 커밋 ${result.commitSha.slice(0, 7)}` : "로컬에 저장했습니다. 홈과 제품 페이지에서 확인할 수 있습니다. 운영 반영은 배포가 필요합니다.");
    } catch (cause) { setError(true); setMessage(cause instanceof Error ? cause.message : "저장하지 못했습니다. 입력은 유지됩니다."); }
    finally { inFlight.current = false; setBusy(false); }
  }
  const screen = draft.removeScreen ? "" : preview || (saved.screen ? `/api/admin/products/${saved.id}/screen?revision=${encodeURIComponent(saved.revision)}` : "");
  const field = "mt-2 block w-full rounded border border-neutral-400 bg-white p-3 text-neutral-950 focus:outline-2 focus:outline-purple-500";
  return <div className="max-w-3xl">
    <Link href="/admin/products" className="underline underline-offset-4">← 제품 목록</Link>
    <h1 className="mt-6 text-3xl font-semibold">{productNames[saved.id]} 편집</h1>
    <p className="mt-4 text-neutral-300">화면 이미지와 소개 문구를 수정합니다. 포도나무·LIVE TEXT는 홈과 제품 페이지에, 두줄자막은 제품 페이지에 반영됩니다.</p>
    <form onSubmit={save} className="mt-8">
      <fieldset disabled={busy} className="space-y-6 disabled:opacity-70">
        <label className="block">한 줄 소개<input className={field} value={draft.description} onChange={event => change("description", event.target.value)} required maxLength={300} /></label>
        <label className="block">상세 설명<textarea className={field} value={draft.detail} onChange={event => change("detail", event.target.value)} required maxLength={3000} rows={4} /></label>
        <label className="block">화면 이미지<input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full rounded border border-neutral-500 p-3" onChange={event => {
          const selected = event.target.files?.[0];
          if (selected && (selected.size > 8 * 1024 * 1024 || !/\.(jpe?g|png|webp)$/i.test(selected.name))) {
            setMessage("JPG·PNG·WebP 이미지를 8MB 이하로 올려 주세요."); setError(true); event.target.value = ""; setFile(undefined); return;
          }
          setFile(selected); setDraft(current => ({ ...current, removeScreen: false })); setMessage("");
        }} /><span className="mt-2 block text-sm text-neutral-300">JPG·PNG·WebP, 최대 8MB. 새 파일을 선택하지 않으면 현재 이미지를 유지합니다.</span></label>
        {file && <button type="button" className="underline" onClick={() => { setFile(undefined); if (fileInput.current) fileInput.current.value = ""; }}>선택한 파일 취소</button>}
        {saved.screen && <label className="flex items-center gap-3"><input type="checkbox" checked={draft.removeScreen} onChange={event => { setDraft(current => ({ ...current, removeScreen: event.target.checked })); if (event.target.checked) { setFile(undefined); if (fileInput.current) fileInput.current.value = ""; } setMessage(""); }} />화면 이미지 숨기기</label>}
        <label className="block">대체 텍스트<input className={field} value={draft.alt} onChange={event => change("alt", event.target.value)} required={Boolean(screen)} maxLength={500} disabled={draft.removeScreen} /><span className="mt-2 block text-sm text-neutral-300">화면에서 볼 수 있는 기능을 설명해 주세요.</span></label>
        <label className="block">화면 캡션<input className={field} value={draft.caption} onChange={event => change("caption", event.target.value)} maxLength={500} disabled={draft.removeScreen} /></label>
        {screen && <figure className="rounded border border-neutral-600 p-4"><img src={screen} alt={draft.alt || "선택한 화면 미리보기"} className="max-h-[500px] w-full object-contain" /><figcaption className="mt-3 text-sm text-neutral-300">{draft.caption}</figcaption></figure>}
        <button type="submit" disabled={!dirty} className="rounded bg-[#7500FF] px-6 py-3 text-white disabled:opacity-50">{busy ? "저장 중…" : "제품 저장"}</button>
      </fieldset>
      {message && <p role={error ? "alert" : "status"} className={`mt-5 whitespace-pre-line ${error ? "text-red-300" : "text-green-300"}`}>{message}</p>}
      <a href={`/products#${saved.id}`} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block underline">제품 페이지 확인 (새 탭) ↗</a>
    </form>
  </div>;
}
