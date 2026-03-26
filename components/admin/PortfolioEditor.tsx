"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import type { PortfolioEditorPayload } from "@/lib/admin/portfolio-admin";
import type { PortfolioStatus } from "@/lib/content";

type RelatedCaseOption = {
  slug: string;
  title: string;
  status: PortfolioStatus;
};

type Props = {
  mode: "create" | "edit";
  initialValue: PortfolioEditorPayload;
  relatedCaseOptions: RelatedCaseOption[];
  roleSuggestions: string[];
  categorySuggestions: string[];
};

type GalleryItem = PortfolioEditorPayload["gallery"][number];

function createGalleryItem(): GalleryItem {
  return {
    id: `gallery-${Math.random().toString(36).slice(2, 10)}`,
    type: "image",
    alt: "",
    caption: "",
  };
}

function createMetric() {
  return { label: "", value: "" };
}

function createObjectUrl(file?: File | null) {
  return file ? URL.createObjectURL(file) : "";
}

function MediaPreview({
  type,
  currentUrl,
  currentPoster,
  file,
  label,
}: {
  type: "image" | "video";
  currentUrl?: string;
  currentPoster?: string;
  file?: File | null;
  label: string;
}) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = createObjectUrl(file);
    setPreviewUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const displayUrl = previewUrl || currentUrl || "";
  if (!displayUrl) {
    return (
      <div className="rounded-[1rem] border border-dashed border-white/10 bg-black/20 px-4 py-5 text-[0.86rem] text-white/35">
        {label} 미리보기가 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[1rem] border border-white/10 bg-black/20">
      {type === "video" ? (
        <video className="aspect-[16/10] w-full object-cover" controls poster={currentPoster || undefined}>
          <source src={displayUrl} type="video/mp4" />
        </video>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={displayUrl} alt={label} className="aspect-[16/10] w-full object-cover" />
      )}
      <div className="border-t border-white/10 px-4 py-2.5 text-[0.78rem] text-white/52">
        {file ? `${label} 새 파일 선택됨: ${file.name}` : `${label} 현재 공개 중`}
      </div>
    </div>
  );
}

function TagField({
  label,
  values,
  suggestions,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  suggestions: string[];
  onChange: (nextValue: string[]) => void;
  placeholder: string;
}) {
  const [inputValue, setInputValue] = useState("");
  const inputId = useId();

  function addValue(value: string) {
    const normalized = value.trim();
    if (!normalized || values.includes(normalized)) return;
    onChange([...values, normalized]);
    setInputValue("");
  }

  function removeValue(value: string) {
    onChange(values.filter((item) => item !== value));
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addValue(inputValue);
    }
  }

  return (
    <div>
      <label htmlFor={inputId} className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/46">
        {label}
      </label>
      <div className="mt-2 rounded-[1.4rem] border border-white/10 bg-black/20 px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {values.map((item) => (
            <button
              key={`${label}-${item}`}
              type="button"
              onClick={() => removeValue(item)}
              className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[0.82rem] font-medium text-white/78"
            >
              {item} <span className="ml-2 text-white/36">×</span>
            </button>
          ))}
        </div>
        <input
          id={inputId}
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addValue(inputValue)}
          placeholder={placeholder}
          className="mt-3 w-full bg-transparent text-[0.95rem] text-white outline-none placeholder:text-white/26"
        />
      </div>
      {suggestions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions
            .filter((item) => !values.includes(item))
            .map((item) => (
              <button
                key={`${label}-suggest-${item}`}
                type="button"
                onClick={() => addValue(item)}
                className="inline-flex items-center rounded-full border border-white/10 px-3 py-1 text-[0.78rem] font-medium text-white/52 transition-colors hover:border-white/20 hover:text-white/80"
              >
                {item}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

function InfoHint({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        className="inline-flex size-5 items-center justify-center rounded-full border border-white/14 bg-white/[0.05] text-[0.68rem] font-semibold text-white/60 transition-colors hover:text-white"
      >
        i
      </button>
      <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-[240px] -translate-x-1/2 rounded-[1rem] border border-white/10 bg-neutral-950 px-3 py-2.5 text-[0.78rem] leading-[1.6] text-white/72 shadow-[0_16px_40px_rgba(0,0,0,0.28)] group-hover:block group-focus-within:block">
        {text}
      </span>
    </span>
  );
}

function SectionHeading({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="flex items-center gap-2">
      <h2 className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/46">{label}</h2>
      {hint && <InfoHint text={hint} />}
    </div>
  );
}

function FieldLabel({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/46">{label}</span>
      {hint && <InfoHint text={hint} />}
    </div>
  );
}

export function PortfolioEditor({
  mode,
  initialValue,
  relatedCaseOptions,
  roleSuggestions,
  categorySuggestions,
}: Props) {
  const router = useRouter();
  const [value, setValue] = useState<PortfolioEditorPayload>(initialValue);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroPosterFile, setHeroPosterFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<Record<string, File | null>>({});
  const [galleryPosterFiles, setGalleryPosterFiles] = useState<Record<string, File | null>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const currentSlug = value.slug || value.previousSlug || "";

  const relatedOptions = relatedCaseOptions.filter((item) => item.slug !== currentSlug);

  function updateField<Key extends keyof PortfolioEditorPayload>(key: Key, nextValue: PortfolioEditorPayload[Key]) {
    setValue((prev) => ({ ...prev, [key]: nextValue }));
  }

  function updateGalleryItem(id: string, updater: (item: GalleryItem) => GalleryItem) {
    setValue((prev) => ({
      ...prev,
      gallery: prev.gallery.map((item) => (item.id === id ? updater(item) : item)),
    }));
  }

  function moveGalleryItem(id: string, direction: -1 | 1) {
    setValue((prev) => {
      const currentIndex = prev.gallery.findIndex((item) => item.id === id);
      if (currentIndex < 0) return prev;
      const nextIndex = currentIndex + direction;
      if (nextIndex < 0 || nextIndex >= prev.gallery.length) return prev;

      const nextGallery = [...prev.gallery];
      const [target] = nextGallery.splice(currentIndex, 1);
      nextGallery.splice(nextIndex, 0, target);

      return { ...prev, gallery: nextGallery };
    });
  }

  async function handleSave(action: "create" | "update" | "publish" | "archive") {
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("action", action);
      formData.append("payload", JSON.stringify(value));

      if (heroFile) {
        formData.append("heroFile", heroFile);
      }

      if (heroPosterFile) {
        formData.append("heroPosterFile", heroPosterFile);
      }

      Object.entries(galleryFiles).forEach(([id, file]) => {
        if (file) {
          formData.append(`galleryFile:${id}`, file);
        }
      });

      Object.entries(galleryPosterFiles).forEach(([id, file]) => {
        if (file) {
          formData.append(`galleryPosterFile:${id}`, file);
        }
      });

      const response = await fetch("/api/admin/portfolio", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as { error?: string; slug?: string };
      if (!response.ok) {
        throw new Error(data.error || "저장 중 오류가 발생했습니다.");
      }

      const nextSlug = data.slug || value.slug;
      setSuccess(action === "publish" ? "발행이 완료되었습니다." : action === "archive" ? "보관 처리되었습니다." : "저장되었습니다.");
      router.push(`/admin/portfolio/${nextSlug}`);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "저장 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/46">
            {mode === "create" ? "새 포트폴리오" : "포트폴리오 수정"}
          </p>
          <h1 className="mt-3 text-[1.7rem] leading-[1.08] font-semibold tracking-[-0.05em] text-white sm:text-[2.2rem]">
            {value.title || "제목을 입력해 주세요"}
          </h1>
          <p className="mt-2 text-[0.92rem] text-white/48">{value.slug || "slug가 아직 없습니다."}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave(mode === "create" ? "create" : "update")}
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[0.88rem] font-medium text-white/82 transition-colors hover:bg-white/[0.08] disabled:opacity-60"
          >
            초안 저장
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave("publish")}
            className="inline-flex items-center justify-center rounded-full bg-[#a9bcff] px-4 py-2.5 text-[0.88rem] font-semibold text-[#162349] transition-colors hover:bg-[#bfd0ff] disabled:opacity-60"
          >
            발행
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave("archive")}
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-black/20 px-4 py-2.5 text-[0.88rem] font-medium text-white/58 transition-colors hover:bg-white/[0.06] disabled:opacity-60"
          >
            보관
          </button>
        </div>
      </div>

      {(error || success) && (
        <div
          className={`rounded-[1.4rem] border px-4 py-3 text-[0.92rem] ${
            error
              ? "border-[#ffb1b1]/20 bg-[#ffb1b1]/8 text-[#ffb1b1]"
              : "border-[#a9bcff]/20 bg-[#a9bcff]/10 text-[#d7e0ff]"
          }`}
        >
          {error || success}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.06fr)_minmax(300px,0.94fr)]">
        <section className="space-y-6">
          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
            <SectionHeading label="기본 정보" hint="포트폴리오 목록과 상세에 직접 노출되는 핵심 정보입니다." />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FieldLabel label="제목" hint="공개 목록과 상세 상단에 그대로 노출되는 프로젝트 이름입니다." />
                <input
                  value={value.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/26 focus:border-[#a9bcff]"
                />
              </div>
              <div>
                <FieldLabel label="Slug" hint="관리 URL과 공개 상세 URL에 들어가는 고유 주소입니다. 변경하면 관련 미디어 경로도 함께 따라갑니다." />
                <input
                  value={value.slug}
                  onChange={(event) => updateField("slug", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/26 focus:border-[#a9bcff]"
                />
              </div>
              <div>
                <FieldLabel label="날짜" hint="포트폴리오 카드와 상세 상단에 표시되는 진행 시기입니다." />
                <input
                  type="date"
                  value={value.date}
                  onChange={(event) => updateField("date", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#a9bcff]"
                />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel label="Summary" hint="목록 카드와 상세 첫 문단에 들어가는 짧은 요약입니다." />
                <textarea
                  value={value.summary}
                  onChange={(event) => updateField("summary", event.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-[1.4rem] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/26 focus:border-[#a9bcff]"
                />
              </div>
              <div>
                <FieldLabel label="장소" hint="상세 페이지 상단 fact band에 들어가는 위치 정보입니다." />
                <input
                  value={value.location || ""}
                  onChange={(event) => updateField("location", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#a9bcff]"
                />
              </div>
              <div>
                <FieldLabel label="파트너" hint="협업 파트너나 주최 측이 있으면 상세 fact band에 노출됩니다." />
                <input
                  value={value.partner || ""}
                  onChange={(event) => updateField("partner", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#a9bcff]"
                />
              </div>
              <div>
                <FieldLabel label="상태" hint="draft는 관리자에서만 보이고, published만 공개 포트폴리오에 노출되며, archived는 숨김 상태로 보관됩니다." />
                <select
                  value={value.status}
                  onChange={(event) => updateField("status", event.target.value as PortfolioStatus)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#a9bcff]"
                >
                  <option value="draft">draft</option>
                  <option value="published">published</option>
                  <option value="archived">archived</option>
                </select>
              </div>
              <div className="sm:col-span-2 rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={value.featured}
                      onChange={(event) => updateField("featured", event.target.checked)}
                      className="mt-1 size-4 rounded border-white/20 bg-transparent"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-[0.94rem] font-medium text-white/82">대표 프로젝트</p>
                        <InfoHint text="체크하면 포트폴리오 상단 대표 프로젝트 영역 후보에 들어갑니다." />
                        <InfoHint text="옆 숫자는 대표 프로젝트 노출 순서입니다. 숫자가 작을수록 먼저 보입니다." />
                      </div>
                      <p className="mt-1 text-[0.82rem] leading-[1.6] text-white/46">
                        대표 영역 노출 여부와 순서를 함께 제어합니다.
                      </p>
                    </div>
                  </div>

                  <div className="sm:w-[120px]">
                    <input
                      type="number"
                      min={1}
                      placeholder="순서"
                      value={value.featured_order || ""}
                      onChange={(event) =>
                        updateField("featured_order", event.target.value ? Number(event.target.value) : undefined)
                      }
                      className="w-full rounded-2xl border border-white/10 bg-neutral-950 px-4 py-3 text-white outline-none placeholder:text-white/26 focus:border-[#a9bcff]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
            <SectionHeading label="태그 및 검색" hint="목록 필터, 검색, 상세 태그 노출에 쓰이는 값들입니다." />
            <div className="mt-5 space-y-5">
              <TagField
                label="Roles"
                values={value.roles}
                suggestions={roleSuggestions}
                onChange={(nextValue) => updateField("roles", nextValue)}
                placeholder="Enter나 쉼표로 추가"
              />
              <TagField
                label="Categories"
                values={value.categories}
                suggestions={categorySuggestions}
                onChange={(nextValue) => updateField("categories", nextValue)}
                placeholder="Enter나 쉼표로 추가"
              />
              <TagField
                label="Search Terms"
                values={value.search_terms}
                suggestions={[]}
                onChange={(nextValue) => updateField("search_terms", nextValue)}
                placeholder="영문명, 행사명 변형, 장소명 등을 추가"
              />
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
            <SectionHeading label="프로젝트 설명" hint="상세 페이지에서 프로젝트 노트와 본문 설명으로 쓰이는 영역입니다." />
            <div className="mt-5 grid gap-4">
              {[
                ["goals", "목표", value.goals || ""],
                ["our_role", "역할", value.our_role || ""],
                ["process", "운영 방식", value.process || ""],
              ].map(([key, label, fieldValue]) => (
                <div key={key}>
                  <label className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/46">{label}</label>
                  <textarea
                    rows={4}
                    value={fieldValue}
                    onChange={(event) => updateField(key as keyof PortfolioEditorPayload, event.target.value)}
                    className="mt-2 w-full rounded-[1.4rem] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/26 focus:border-[#a9bcff]"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <SectionHeading label="Metrics" hint="상세 페이지 상단 fact band에 짧게 노출되는 수치·속성 정보입니다. 예: 참여 규모, 진행 도시, 집회 유형." />
              <button
                type="button"
                onClick={() => updateField("metrics", [...value.metrics, createMetric()])}
                className="inline-flex items-center rounded-full border border-white/10 px-3 py-1 text-[0.8rem] font-medium text-white/70"
              >
                지표 추가
              </button>
            </div>
            <div className="mt-5 grid gap-3">
              {value.metrics.map((metric, index) => (
                <div key={`metric-${index}`} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                  <input
                    value={metric.label}
                    onChange={(event) =>
                      updateField(
                        "metrics",
                        value.metrics.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, label: event.target.value } : item,
                        ),
                      )
                    }
                    placeholder="label"
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/26 focus:border-[#a9bcff]"
                  />
                  <input
                    value={metric.value}
                    onChange={(event) =>
                      updateField(
                        "metrics",
                        value.metrics.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, value: event.target.value } : item,
                        ),
                      )
                    }
                    placeholder="value"
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/26 focus:border-[#a9bcff]"
                  />
                  <button
                    type="button"
                    onClick={() => updateField("metrics", value.metrics.filter((_, itemIndex) => itemIndex !== index))}
                    className="rounded-2xl border border-white/10 px-4 py-3 text-[0.86rem] text-white/52"
                  >
                    삭제
                  </button>
                </div>
              ))}
              {value.metrics.length === 0 && <p className="text-[0.9rem] text-white/36">등록된 지표가 없습니다.</p>}
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
            <SectionHeading label="본문 Markdown" hint="상세 설명 영역에 들어가는 긴 글입니다. 줄바꿈과 목록은 markdown으로 작성합니다." />
            <textarea
              rows={12}
              value={value.content}
              onChange={(event) => updateField("content", event.target.value)}
              className="mt-5 w-full rounded-[1.4rem] border border-white/10 bg-black/20 px-4 py-3 text-[0.95rem] leading-[1.75] text-white outline-none placeholder:text-white/26 focus:border-[#a9bcff]"
            />
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
            <SectionHeading label="Hero Media" hint="목록 대표 카드와 상세 상단 히어로에 공통으로 쓰이는 대표 미디어입니다." />
            <div className="mt-5 space-y-4">
              <select
                value={value.heroMedia.type}
                onChange={(event) =>
                  updateField("heroMedia", {
                    ...value.heroMedia,
                    type: event.target.value as "image" | "video",
                  })
                }
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#a9bcff]"
              >
                <option value="image">image</option>
                <option value="video">video</option>
              </select>

              <div>
                <label className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/46">Alt</label>
                <input
                  value={value.heroMedia.alt}
                  onChange={(event) =>
                    updateField("heroMedia", {
                      ...value.heroMedia,
                      alt: event.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#a9bcff]"
                />
              </div>

              <MediaPreview
                type={value.heroMedia.type}
                currentUrl={value.heroMedia.existingUrl}
                currentPoster={value.heroMedia.existingPoster}
                file={heroFile}
                label="Hero"
              />

              <div className="grid gap-3">
                <div>
                  <label className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/46">Hero 업로드</label>
                  <input
                    type="file"
                    accept={value.heroMedia.type === "video" ? "video/mp4" : "image/*"}
                    onChange={(event) => setHeroFile(event.target.files?.[0] || null)}
                    className="mt-2 block w-full text-[0.9rem] text-white/65 file:mr-4 file:rounded-full file:border-0 file:bg-[#a9bcff] file:px-4 file:py-2 file:text-[0.84rem] file:font-semibold file:text-[#162349]"
                  />
                </div>

                {value.heroMedia.type === "video" && (
                  <div>
                    <label className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/46">Poster 업로드</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => setHeroPosterFile(event.target.files?.[0] || null)}
                      className="mt-2 block w-full text-[0.9rem] text-white/65 file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-[0.84rem] file:font-semibold file:text-[#162349]"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <SectionHeading label="Gallery" hint="상세 페이지의 장면 기록 섹션에 순서대로 들어가는 이미지·영상입니다." />
              <button
                type="button"
                onClick={() => updateField("gallery", [...value.gallery, createGalleryItem()])}
                className="inline-flex items-center rounded-full border border-white/10 px-3 py-1 text-[0.8rem] font-medium text-white/70"
              >
                미디어 추가
              </button>
            </div>

            <div className="mt-5 space-y-5">
              {value.gallery.map((item, index) => (
                <div key={item.id} className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[0.9rem] font-medium text-white/78">Gallery #{index + 1}</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => moveGalleryItem(item.id, -1)}
                        className="rounded-full border border-white/10 px-3 py-1 text-[0.76rem] text-white/58"
                      >
                        위로
                      </button>
                      <button
                        type="button"
                        onClick={() => moveGalleryItem(item.id, 1)}
                        className="rounded-full border border-white/10 px-3 py-1 text-[0.76rem] text-white/58"
                      >
                        아래로
                      </button>
                      <button
                        type="button"
                        onClick={() => updateField("gallery", value.gallery.filter((galleryItem) => galleryItem.id !== item.id))}
                        className="rounded-full border border-white/10 px-3 py-1 text-[0.76rem] text-[#ffb1b1]"
                      >
                        삭제
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4">
                    <select
                      value={item.type}
                      onChange={(event) =>
                        updateGalleryItem(item.id, (current) => ({
                          ...current,
                          type: event.target.value as "image" | "video",
                        }))
                      }
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#a9bcff]"
                    >
                      <option value="image">image</option>
                      <option value="video">video</option>
                    </select>

                    <MediaPreview
                      type={item.type}
                      currentUrl={item.existingUrl}
                      currentPoster={item.existingPoster}
                      file={galleryFiles[item.id]}
                      label={`Gallery ${index + 1}`}
                    />

                    <div className="grid gap-3">
                      <input
                        value={item.alt}
                        onChange={(event) =>
                          updateGalleryItem(item.id, (current) => ({
                            ...current,
                            alt: event.target.value,
                          }))
                        }
                        placeholder="alt"
                        className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/26 focus:border-[#a9bcff]"
                      />
                      <input
                        value={item.caption || ""}
                        onChange={(event) =>
                          updateGalleryItem(item.id, (current) => ({
                            ...current,
                            caption: event.target.value,
                          }))
                        }
                        placeholder="caption"
                        className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/26 focus:border-[#a9bcff]"
                      />
                      <input
                        type="file"
                        accept={item.type === "video" ? "video/mp4" : "image/*"}
                        onChange={(event) =>
                          setGalleryFiles((prev) => ({
                            ...prev,
                            [item.id]: event.target.files?.[0] || null,
                          }))
                        }
                        className="block w-full text-[0.9rem] text-white/65 file:mr-4 file:rounded-full file:border-0 file:bg-[#a9bcff] file:px-4 file:py-2 file:text-[0.84rem] file:font-semibold file:text-[#162349]"
                      />
                      {item.type === "video" && (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) =>
                            setGalleryPosterFiles((prev) => ({
                              ...prev,
                              [item.id]: event.target.files?.[0] || null,
                            }))
                          }
                          className="block w-full text-[0.9rem] text-white/65 file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-[0.84rem] file:font-semibold file:text-[#162349]"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {value.gallery.length === 0 && <p className="text-[0.9rem] text-white/36">등록된 gallery가 없습니다.</p>}
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
            <SectionHeading label="Related Cases" hint="상세 하단의 '함께 보면 좋은 프로젝트'를 수동으로 큐레이션하는 기능입니다. 글이 많아져도 원하는 케이스를 직접 연결할 수 있습니다." />
            <div className="mt-5 grid gap-3">
              {relatedOptions.map((item) => {
                const checked = value.related_cases.includes(item.slug);
                return (
                  <label
                    key={item.slug}
                    className="flex items-start gap-3 rounded-[1.1rem] border border-white/10 bg-black/20 px-4 py-3"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => {
                        if (event.target.checked) {
                          updateField("related_cases", [...value.related_cases, item.slug]);
                        } else {
                          updateField(
                            "related_cases",
                            value.related_cases.filter((relatedSlug) => relatedSlug !== item.slug),
                          );
                        }
                      }}
                      className="mt-1 size-4 rounded border-white/20"
                    />
                    <div>
                      <p className="text-[0.92rem] font-medium text-white">{item.title}</p>
                      <p className="mt-1 text-[0.82rem] text-white/42">
                        {item.slug} · {item.status}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
