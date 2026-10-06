"use client";
/* eslint-disable @next/next/no-img-element -- Real local review media, without remote image transformations. */
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { accentTokens, capabilities, colorTokens, purpleTokens, typeTokens, type SystemProject } from "@/lib/design-system";
import { ActionLink, Arrow, BrandMark, Button, ContactBlock, Eyebrow, Field, ProjectFacts, ProjectFigure, ProjectRow, SectionHeading, ServiceRow, StatusMessage } from "./primitives";
import { ProjectIndex } from "./ProjectIndex";

const sections = [
  { id: "overview", title: "방향" }, { id: "type", title: "서체" }, { id: "color", title: "색상·간격" },
  { id: "components", title: "구성 요소" }, { id: "index", title: "프로젝트 색인" }, { id: "pages", title: "페이지 조합" },
] as const;
type Section = typeof sections[number]["id"];

function ColorChip({ token, label, use }: { token: string; label: string; use?: string }) {
  const [value, setValue] = useState("");
  const [copied, setCopied] = useState(false);
  const [failure, setFailure] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (ref.current) setValue(getComputedStyle(ref.current).getPropertyValue(token).trim().toUpperCase()); }, [token]);
  return <div className="mb-color-chip"><button ref={ref} type="button" aria-label={`${label} 색상 값 복사`} style={{ background: `var(${token})` }} onClick={async () => {
    try { await navigator.clipboard.writeText(value); setCopied(true); setFailure(false); } catch { setFailure(true); }
  }}><span className="mb-color-copy"><Arrow /></span></button><div><strong>{label}</strong><code>{value || token}</code></div>{use && <p className="mb-caption mb-muted">{use}</p>}<p className="mb-copy-result" role="status">{failure ? "아래 색상 값을 직접 선택해 복사하세요." : copied ? "색상 값 복사됨" : ""}</p></div>;
}

function InquiryExample({ compact = false }: { compact?: boolean }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [valid, setValid] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  function check(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next: Record<string, string> = {};
    if (!String(data.get("name") || "").trim()) next.name = "성함을 입력해 주세요.";
    const email = event.currentTarget.elements.namedItem("email") as HTMLInputElement;
    if (!email.value.trim() || !email.validity.valid) next.email = "회신받을 이메일 주소를 확인해 주세요.";
    if (!String(data.get("message") || "").trim()) next.message = "계획 중인 행사를 간단히 알려주세요.";
    setErrors(next); setValid(Object.keys(next).length === 0);
    const first = Object.keys(next)[0];
    if (first) (event.currentTarget.elements.namedItem(first) as HTMLElement)?.focus();
  }
  const prefix = compact ? "pattern" : "component";
  return <form ref={form} className="mb-inquiry-example" noValidate onSubmit={check} onChange={() => { if (valid) setValid(false); }}>
    <div className="mb-form-pair"><Field id={`${prefix}-name`} name="name" label="성함" autoComplete="off" required error={errors.name} placeholder="홍길동" /><Field id={`${prefix}-email`} name="email" type="email" label="이메일" autoComplete="off" required error={errors.email} placeholder="hello@example.com" /></div>
    {!compact && <div className="mb-form-pair"><Field id={`${prefix}-organization`} name="organization" label="회사·기관" placeholder="회사 또는 기관명" /><div className="mb-field"><label htmlFor={`${prefix}-type`}>행사 유형<span>선택</span></label><select id={`${prefix}-type`} name="eventType" defaultValue=""><option value="">아직 정해지지 않았어요</option><option>라이브 공연</option><option>브랜드 행사</option><option>컨퍼런스</option></select></div></div>}
    <div className={`mb-field${errors.message ? " mb-field-error" : ""}`}><label htmlFor={`${prefix}-message`}>어떤 행사를 계획 중이신가요?<span>필수</span></label><textarea id={`${prefix}-message`} name="message" rows={4} required placeholder="일정, 장소, 예상 규모 또는 필요한 업무를 알려주세요." aria-invalid={errors.message ? true : undefined} aria-describedby={errors.message ? `${prefix}-message-error` : undefined} />{errors.message && <p id={`${prefix}-message-error`} className="mb-field-description">! {errors.message}</p>}</div>
    <div className="mb-form-foot"><Button type="submit">입력 상태 확인</Button><p className="mb-caption mb-muted">디자인 검토용 폼입니다.<br />입력한 내용은 저장하거나 전송하지 않습니다.</p></div>
    {valid && <StatusMessage tone="success">입력 확인 완료. 이 화면에서는 실제 문의가 전송되지 않습니다.</StatusMessage>}
  </form>;
}

function TypeSpecimens() {
  return <div className="mb-panel"><SectionHeading number="02" title="서체가 맡는 역할" description="브랜드의 개성은 전용 서체로, 정확한 정보는 Pretendard로 읽힙니다." />
    <div className="mb-font-specimen"><p className="mb-display">mighty<br />blessing.</p><div><Eyebrow>THE BRAND VOICE</Eyebrow><h3>전용 서체는<br />짧고, 분명하게.</h3><p className="mb-body mb-muted">소문자의 부드러운 형태를 살립니다.<br />Regular 400 그대로 사용합니다.</p><p className="mb-caption">a b c d e f g h i j k l m<br />n o p q r s t u v w x y z<br />0 1 2 3 4 5 6 7 8 9</p></div></div>
    <div className="mb-type-scale">{typeTokens.map((type) => <div className="mb-type-row" key={type.label}><div><span>{type.label}</span><small>{type.detail}</small><code>{type.token}</code></div><p className={type.className}>{type.sample}</p></div>)}</div>
    <div className="mb-copy-specimen"><Eyebrow>READING RHYTHM</Eyebrow><div><h3 className="mb-section-title">행사 전체 제작부터<br />필요한 업무까지.</h3><p className="mb-body">프로그램과 큐시트, 화면 콘텐츠를 제작하고 리허설에서 본 행사까지 진행과 송출을 맡습니다. 내부 연출·PD·VJ와 전문 파트너가 함께 현장을 구성합니다.</p><p className="mb-caption mb-muted">본문 16px · 행간 1.7 · 읽기 폭 최대 640px</p></div></div>
  </div>;
}

function ColorAndSpace() {
  return <div className="mb-panel"><SectionHeading number="03" title="퍼플의 쓰임, 여백의 크기" description="색상은 제공된 브랜드 원본을, 레이아웃은 같은 간격 체계를 사용합니다." />
    <div className="mb-color-main">{colorTokens.map((color) => <ColorChip key={color.token} {...color} />)}</div>
    <div className="mb-subsection"><Eyebrow>PURPLE SCALE</Eyebrow><div className="mb-purple-scale">{purpleTokens.map((token, i) => <ColorChip key={token} token={token} label={String((i + 1) * 100)} />)}</div><p className="mb-body mb-muted">밝은 농도는 선택 영역에, 원본 퍼플은 브랜드와 주요 행동에 사용합니다.</p></div>
    <div className="mb-accent-section"><div><Eyebrow>ACCENTS</Eyebrow><h3 className="mb-project-title">필요한 곳에만,<br />작게 남기는 색.</h3><p className="mb-body mb-muted">보조색은 표식에 사용합니다.<br />설명과 상태는 짙은 글자로 함께 표시합니다.</p></div><div className="mb-accent-grid">{accentTokens.map((color) => <ColorChip key={color.token} {...color} />)}</div></div>
    <div className="mb-subsection"><SectionHeading number="↳" title="같은 간격, 다른 역할" /><div className="mb-space-scale">{[4, 8, 12, 16, 24, 32, 48, 64, 96, 128].map((space, i) => <div key={space}><code>--mb-space-{i + 1}</code><span style={{ width: `var(--mb-space-${i + 1})` }} /><span>{space}</span></div>)}</div><div className="mb-layout-rules"><div><strong>280</strong><p>프로젝트 색인</p></div><div><strong>640</strong><p>설명 최대 폭</p></div><div><strong>912</strong><p>선별 사진 최대 폭</p></div><div><strong>96–128</strong><p>데스크톱 구간 간격</p></div></div></div>
  </div>;
}

function ComponentSpecimens({ projects, featured }: { projects: SystemProject[]; featured: SystemProject[] }) {
  const [filter, setFilter] = useState("전체");
  const [query, setQuery] = useState("");
  const examples = projects.slice(0, 6).filter((p) => (filter === "전체" || (filter === "사진 있음" ? Boolean(p.image) : !p.image)) && `${p.title} ${p.location}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="mb-panel"><SectionHeading number="04" title="작은 요소도 같은 기준으로" description="실제 상태를 가진 구성 요소를 직접 눌러보고, 입력하고, 비교할 수 있습니다." />
    <section className="mb-component-section"><div className="mb-component-title"><Eyebrow>01 / ACTIONS</Eyebrow><h3>행동의 우선순위</h3></div><div><div className="mb-button-examples"><ActionLink href="/inquiry" variant="primary">프로젝트 문의</ActionLink><ActionLink href="/portfolio" variant="secondary">전체 프로젝트</ActionLink><ActionLink href="/portfolio">작업 살펴보기</ActionLink></div><div className="mb-button-examples mb-states"><div><span>Disabled</span><Button disabled>선택 불가</Button></div><div><span>Processing</span><Button busy arrow={false}>확인 중…</Button></div></div></div></section>
    <section className="mb-component-section"><div className="mb-component-title"><Eyebrow>02 / INPUT</Eyebrow><h3>질문은 간단하게,<br />상태는 명확하게.</h3></div><InquiryExample /></section>
    <section className="mb-component-section"><div className="mb-component-title"><Eyebrow>03 / FEEDBACK</Eyebrow><h3>문구로도<br />구별되는 상태</h3></div><div className="mb-status-stack"><StatusMessage>아직 등록된 사진이 없습니다. 수행 내용은 상세에서 확인할 수 있습니다.</StatusMessage><StatusMessage tone="success">선택한 항목이 반영되었습니다.</StatusMessage><StatusMessage tone="error">요청을 완료하지 못했습니다. 입력 내용은 유지됩니다.</StatusMessage></div></section>
    <section className="mb-component-section mb-component-full"><div className="mb-component-title"><Eyebrow>04 / PROJECT ROW</Eyebrow><h3>사진이 없어도 읽히는 이력</h3></div><div><div className="mb-filterbar"><div role="group" aria-label="예시 프로젝트 필터">{["전체", "사진 있음", "이력"].map((name) => <button key={name} type="button" aria-pressed={filter === name} onClick={() => setFilter(name)}>{name}</button>)}</div><label><span className="mb-sr-only">예시 프로젝트 검색</span><input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="프로젝트 검색" /></label></div><p className="mb-caption mb-muted mb-results" role="status">최신 6건의 행 예시 · {examples.length}건 표시</p>{examples.length ? examples.map((project) => <ProjectRow project={project} key={project.slug} />) : <div className="mb-empty"><p>일치하는 프로젝트가 없습니다.</p><Button variant="text" onClick={() => { setQuery(""); setFilter("전체"); }}>조건 초기화</Button></div>}</div></section>
    <section className="mb-component-section mb-component-full"><div className="mb-component-title"><Eyebrow>05 / IMAGE & CAPTION</Eyebrow><h3>사진 아래, 정확한 역할</h3></div>{featured[1] && <div><ProjectFigure project={featured[1]} /><ProjectFacts project={featured[1]} /></div>}</section>
    <section className="mb-component-section mb-component-full"><div className="mb-component-title"><Eyebrow>06 / CAPABILITIES</Eyebrow><h3>같은 행으로 연결하는 업무</h3></div><div>{capabilities.map((item) => <ServiceRow key={item.number} {...item} />)}</div></section>
    <ContactBlock />
  </div>;
}

const pageTypes = ["홈", "프로젝트", "상세", "하는 일", "회사소개", "제품", "문의"] as const;
type PageType = typeof pageTypes[number];
function PagePatterns({ projects, featured, standalone = false }: { projects: SystemProject[]; featured: SystemProject[]; standalone?: boolean }) {
  const Title = standalone ? "h1" : "h2";
  const desktopWidth = standalone ? 1280 : 1060;
  const [page, setPage] = useState<PageType>("홈");
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const detail = featured[1] || featured[0];
  useEffect(() => {
    const observer = new ResizeObserver(() => { if (frame.current && frame.current.clientWidth >= desktopWidth) dialog.current?.close(); });
    if (frame.current) observer.observe(frame.current);
    return () => observer.disconnect();
  }, [desktopWidth]);
  return <div className="mb-panel mb-panel-wide">{!standalone && <SectionHeading number="06" title="하나의 언어로 이어지는 페이지" description="공통 구성 요소를 조합한 정지 화면입니다. 페이지 버튼으로 구성을 비교하세요." />}
    {!standalone && <div className="mb-page-toolbar"><div className="mb-page-switch" role="group" aria-label="페이지 조합 선택">{pageTypes.map((name) => <button key={name} aria-pressed={page === name} onClick={() => { dialog.current?.close(); setPage(name); }}>{name}</button>)}</div><Link className="mb-preview-link" href="/design-system?view=home" prefetch={false}>홈 화면만 보기 <Arrow /></Link></div>}
    {page === "홈" && <iframe title="현재 홈 화면 검토" src="/design-system?view=home" loading="lazy" style={{ width: "100%", height: 900, border: "1px solid var(--mb-line)" }} />}
    <div ref={frame} hidden={page === "홈"} className={`mb-pattern-frame${page === "문의" ? " mb-pattern-contact" : ""}`}>
      <div className="mb-pattern-shell"><div className="mb-pattern-rail"><ProjectIndex projects={projects} activeSlug={page === "상세" ? detail?.slug : undefined} key={page === "상세" ? detail?.slug : "index"} /></div><div className="mb-pattern-content">
        <header className="mb-pattern-nav"><button ref={trigger} className="mb-pattern-menu" onClick={() => dialog.current?.showModal()} aria-haspopup="dialog">프로젝트 +</button>{standalone && <Link href="/design-system" prefetch={false} className="mb-preview-return" aria-label="디자인 시스템으로 돌아가기">← 가이드</Link>}<span className="mb-caption mb-muted mb-pattern-wordmark">MIGHTY BLESSING</span><nav aria-label="페이지 조합 탐색">{standalone && page !== "홈" && <button onClick={() => { setPage("홈"); window.scrollTo({ top: 0, behavior: "instant" }); }}>홈</button>}{(["하는 일", "회사소개", "문의"] as const).map((name) => <button key={name} onClick={() => setPage(name)} aria-current={page === name ? "page" : undefined}>{name}</button>)}</nav></header>
        {page === "프로젝트" && <div className="mb-pattern-inner"><Eyebrow>PROJECT ARCHIVE</Eyebrow><Title className="mb-page-title">프로젝트</Title><p className="mb-body mb-muted mb-pattern-intro">우리가 함께한 현장과 맡은 일.</p>{projects.slice(0, 8).map((p) => <ProjectRow project={p} key={p.slug} />)}<p className="mb-caption mb-muted mb-results">페이지 조합에는 최신 8건을 표시합니다. 왼쪽 색인에는 전체 {projects.length}건이 있습니다.</p><ActionLink href="/portfolio">전체 프로젝트</ActionLink></div>}
        {page === "상세" && detail && <div className="mb-pattern-inner"><Eyebrow>{detail.category} / {detail.year}</Eyebrow><Title className="mb-page-title">{detail.title}</Title><div className="mb-pattern-photo"><img src={detail.image} alt={detail.alt} width="1200" height="800" /></div><ProjectFacts project={detail} /><h3 className="mb-section-title">우리가 맡은 일</h3><p className="mb-body mb-pattern-intro">{detail.ourRole}</p><ContactBlock /></div>}
        {page === "하는 일" && <div className="mb-pattern-inner"><Eyebrow>WHAT WE DO</Eyebrow><Title className="mb-page-title">행사 전체 제작부터<br />필요한 업무까지.</Title><p className="mb-body mb-muted mb-pattern-intro">기획·연출, 프로덕션·현장 운영, 디지털 경험을 연결합니다.</p>{capabilities.map((item) => <ServiceRow key={item.number} {...item} />)}<div className="mb-partners"><Eyebrow>WITH SPECIALIST PARTNERS</Eyebrow><p className="mb-body">음향·조명·LED·무대 구조물·중계·리깅·SFX·보안은 전문 파트너와 구성합니다.</p></div><ContactBlock /></div>}
        {page === "회사소개" && <div className="mb-pattern-inner"><Eyebrow>ABOUT US</Eyebrow><Title className="mb-page-title">현장을 끝까지<br />책임지는 프로덕션.</Title><p className="mb-body mb-pattern-intro">공연과 행사의 기획, 제작, 운영을 함께합니다. 내부 연출·PD·VJ와 전문 파트너가 필요한 업무 범위에 맞춰 현장을 구성합니다.</p>{featured[0] && <ProjectFigure project={featured[0]} />}<div className="mb-pattern-intro"><Eyebrow>PRODUCTION TEAM</Eyebrow><h3 className="mb-section-title">준비한 기획이<br />현장에서 이어지도록.</h3><p className="mb-body">프로그램과 큐시트, 화면 콘텐츠를 제작하고 리허설에서 본 행사까지 진행과 송출을 맡습니다.</p></div><ContactBlock /></div>}
        {page === "제품" && <div className="mb-pattern-inner"><Eyebrow>EVENT TECHNOLOGY</Eyebrow><Title className="mb-page-title">현장에서 쓰는<br />우리의 기술.</Title><div className="mb-product-example"><Eyebrow>01 / GRAPETREE</Eyebrow><h3 className="mb-section-title">사전 등록부터 현장 체크인까지</h3><p className="mb-body">행사 등록과 QR 체크인을 연결합니다.</p><img src="/api/design-system-media/grapetree.webp" width="1200" height="1391" alt="포도나무 공개 티켓 선택 화면 예시" loading="lazy" /><p className="mb-caption mb-muted">공개 서비스 화면 예시 · 회사소개서 v10 수록 자료</p><ActionLink href="https://grapetree.kr/">포도나무 살펴보기</ActionLink></div><div className="mb-product-example"><Eyebrow>02 / LIVE TEXT</Eyebrow><h3 className="mb-section-title">관객의 메시지를 행사 화면으로</h3><p className="mb-body">QR로 받은 메시지를 운영자가 검토·승인하고, 행사 화면에 송출합니다.</p><img src="/api/design-system-media/livetext.webp" width="1200" height="995" alt="LIVE TEXT 공개 데모의 송출 화면 예시" loading="lazy" /><p className="mb-caption mb-muted">공개 데모 · 실제 행사 메시지가 아닌 예시 데이터</p><ActionLink href="https://livetext.mightyblessing.com/">LIVE TEXT 살펴보기</ActionLink></div></div>}
        {page === "문의" && <div className="mb-pattern-inner"><Eyebrow>START A PROJECT</Eyebrow><Title className="mb-page-title">함께할 현장을<br />알려주세요.</Title><p className="mb-body mb-muted mb-pattern-intro">정해진 일정과 장소, 예상 규모 또는 참고 자료부터 이야기합니다.</p><div className="mb-pattern-inquiry"><a href="mailto:contact@mightyblessing.com" className="mb-caption">contact@mightyblessing.com</a><InquiryExample compact /></div></div>}
      </div></div>
      <dialog ref={dialog} className="mb-mobile-dialog" aria-label="전체 프로젝트 목록" onClose={() => trigger.current?.focus()}><button className="mb-dialog-close" autoFocus onClick={() => dialog.current?.close()} aria-label="프로젝트 목록 닫기">닫기 ×</button><ProjectIndex projects={projects} onNavigate={() => dialog.current?.close()} /></dialog>
    </div>{!standalone && <p className="mb-caption mb-muted mb-pattern-note">페이지 구성·문구의 검토 예시입니다. 최종 홈 미디어와 각 페이지의 전체 내용은 별도로 다듬습니다.</p>}
  </div>;
}

export function DesignSystem({ projects, featured }: { projects: SystemProject[]; featured: SystemProject[] }) {
  const [section, setSection] = useState<Section>("overview");
  const [motionReduced, setMotionReduced] = useState(false);
  function goToSection(next: Section) {
    setSection(next);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  return <div className="mb-system" data-reduce={motionReduced || undefined}>
    <a href="#mb-catalogue" className="skip-link">디자인 시스템 본문으로 건너뛰기</a>
    <header className="mb-system-header"><button className="mb-system-brand" onClick={() => goToSection("overview")} aria-label="디자인 시스템 개요"><BrandMark /></button><h1>Design System <span>0.2</span></h1><span className="mb-system-status">LOCAL REVIEW · 2026.09</span></header>
    <nav className="mb-system-nav" aria-label="디자인 시스템 목차">{sections.map((item, index) => <button type="button" key={item.id} aria-pressed={section === item.id} onClick={() => goToSection(item.id)}><span>{String(index + 1).padStart(2, "0")}</span>{item.title}</button>)}</nav>
    <div id="mb-catalogue" aria-label={sections.find((s) => s.id === section)?.title}>
      {section === "overview" && <div className="mb-panel"><div className="mb-system-lead"><div><Eyebrow>MIGHTY BLESSING / BRAND & INTERFACE</Eyebrow><h2 className="mb-display">from idea<br />to live.</h2></div><div className="mb-lead-copy"><p>실제 현장을 크게.<br />우리가 맡은 일을 정확하게.</p><span className="mb-caption mb-muted">브랜드의 언어와 화면의 기준을<br />하나의 시스템으로 연결합니다.</span></div></div>{featured[0] && <ProjectFigure project={featured[0]} wide priority />}<div className="mb-principles"><article><Eyebrow>01 / IDENTITY</Eyebrow><h3>분명한 브랜드</h3><p>원본 퍼플과 전용 서체.<br />짧은 문구로 남기는 인상.</p></article><article><Eyebrow>02 / EVIDENCE</Eyebrow><h3>실제 현장의 증거</h3><p>큰 사진과 정확한 역할.<br />과정과 결과를 구분하는 캡션.</p></article><article><Eyebrow>03 / RHYTHM</Eyebrow><h3>차분한 읽기</h3><p>적은 강조와 일관된 정렬.<br />다음 내용을 위한 충분한 여백.</p></article></div><div className="mb-system-next"><p className="mb-body">서체에서 시작해, 페이지의 조합까지.</p><Button variant="text" onClick={() => goToSection("type")}>시스템 살펴보기</Button></div></div>}
      {section === "type" && <TypeSpecimens />}
      {section === "color" && <ColorAndSpace />}
      {section === "components" && <ComponentSpecimens projects={projects} featured={featured} />}
      {section === "index" && <div className="mb-panel"><SectionHeading number="05" title="이력은 차분하게, 선택은 분명하게" description="반복되는 카드 없이, 전체 프로젝트를 연도별로 읽습니다." /><div className="mb-index-specimen"><ProjectIndex projects={projects} activeSlug={featured[1]?.slug} /><div className="mb-index-notes"><Eyebrow>PROJECT INDEX</Eyebrow><h3 className="mb-section-title">한 줄의 이름에서<br />실제 현장으로.</h3><p className="mb-body mb-muted">항목에 마우스를 올리거나 키보드로 이동해보세요. 작은 프리뷰만 반응하고, 오른쪽 콘텐츠는 유지됩니다.</p><dl className="mb-index-rules"><div><dt>기본</dt><dd>여백과 연도로 묶은 텍스트 목록</dd></div><div><dt>호버·포커스</dt><dd>옅은 퍼플 면, 제목·화살표 반응</dd></div><div><dt>현재 상세</dt><dd>작은 퍼플 선으로 현재 상세 구별</dd></div><div><dt>사진 없는 이력</dt><dd>날짜·장소·실제 역할</dd></div></dl><label className="mb-motion-control"><input type="checkbox" checked={motionReduced} onChange={(e) => setMotionReduced(e.target.checked)} />움직임 없이 비교</label><p className="mb-caption mb-muted">운영체제의 모션 감소 설정도 함께 존중합니다.</p></div></div></div>}
      {section === "pages" && <PagePatterns projects={projects} featured={featured} />}
    </div><footer className="mb-system-footer"><span>MIGHTY BLESSING</span><span>DESIGN SYSTEM 0.2 · 검토 중</span><Link href="/" prefetch={false}>현재 홈 보기 <Arrow /></Link></footer>
  </div>;
}
