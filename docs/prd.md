마이티블레싱 웹사이트 PRD (v1.0)

1. 프로젝트 개요

프로젝트명: Mighty Blessing Website (Marketing + Portfolio + Blog + Products)

레포/폴더명: mightyblessing-site

목적

우리가 수행한 사역(행사/예배/컨퍼런스 운영·기획)의 신뢰도 높은 포트폴리오 제시

행정/기획 중심 단체로서의 역량·철학을 블로그로 증명

우리가 제공하는 프로덕트(서비스/패키지) 소개로 문의 전환(CTA)

2. 타깃 사용자 & 핵심 유저 스토리
   Primary

교회/단체 담당자(사역자/운영 담당): “이 팀이 믿을만한가? 우리 행사 맡길 수 있나?”

파트너/협업 후보(찬양팀, 기독교 기관, 제작사): “역할 분담/협업이 가능한 팀인가?”

후원/지원 관심자(개인/기관): “어떤 임팩트를 내는 단체인가?”

User Stories (MVP)

방문자는 홈에서 10초 내에 “우리가 누구인지/무엇을 했는지/무엇을 제공하는지” 이해한다.

방문자는 포트폴리오에서 대표 사례(WELOVE 공연 운영, The Sent 운영 등)를 보고 “역할 범위/성과”를 확인한다.

방문자는 프로덕트 페이지에서 제공 패키지를 이해하고 문의하기를 누른다.

방문자는 블로그에서 운영 인사이트를 읽고 구독/문의로 이어진다.

3. 핵심 메시지(카피 방향)

포지셔닝: “찬양팀이 아니라, 예배/집회가 잘 열리도록 만드는 행정·기획·운영 중심 기독교 플랫폼 팀”

차별점(초안)

다양한 직업/전문성 멤버들이 프로젝트별로 최적 기여

대형 프로젝트 운영 경험 + 실무형 시스템/체크리스트 기반

예배/기독교 영역에서 ‘플랫폼(운영·콘텐츠·프로덕트)’ 제공 지향

4. 범위(Scope)
   포함 (MVP)

페이지 4개 이하의 상단 네비게이션

포트폴리오(케이스 스터디 리스트 + 상세)

블로그(리스트 + 상세, 카테고리/태그)

프로덕트(서비스 패키지 소개)

문의(간단 폼 또는 이메일/구글폼 연동)

SEO 기본(메타, OG, sitemap, robots)

분석(Analytics 이벤트 최소 구성)

제외 (v1에서 미포함)

회원가입/로그인

결제/티켓 판매

다국어(필요 시 v2)

복잡한 CMS(필요 시 v1.5~v2)

5. 정보구조(IA) / 메뉴

상단 메뉴(4개 이하)

Home

Portfolio

Blog

Products (또는 “Services”)

우측 CTA 버튼: Project Inquiry (문의)

Footer

Contact(이메일), SNS 링크, 개인정보 처리방침, 이용약관(간단), ©

6. 페이지별 요구사항
   6.1 Home

목표: “정체성 + 신뢰 + CTA”를 가장 빠르게 전달
섹션 구성

Hero: 한 줄 포지셔닝 + 서브카피 + CTA(문의)

What We Do: 3~5개의 역할 카드

예: 기획/행정/운영, 현장 오퍼레이션, 파트너 코디네이션, 콘텐츠/미디어, 프로세스 설계

Featured Portfolio: 대표 사례 3개 카드

Proof Strip: 숫자/지표(가능하면) + 로고/파트너(가능하면)

Featured Blog: 최신 글 3개

Products Teaser: 패키지 3티어 요약 + 문의 CTA

Final CTA: “프로젝트 상담/협업 제안” 버튼 + 짧은 문구

Acceptance Criteria

첫 화면에서 CTA(문의) 버튼이 1개 이상 명확하게 보임

모바일에서 섹션이 과밀하지 않고 스크롤 흐름 자연스러움

6.2 Portfolio (목록)

목표: 신뢰 형성(Proof) + “우리가 무엇을 맡았는지” 명확화
필터/정렬

카테고리(예: Conference / Worship Event / Tour & Live / Training / Media)

역할 태그(기획, 운영, 행정, 현장, 파트너, 기술 등)

최신순 기본

카드 필드

제목, 썸네일, 한 줄 요약, 역할 태그, 날짜(연-월)

6.3 Portfolio Detail (케이스 스터디 템플릿)

필수 섹션

Overview (1~2문단)

Goals (목표)

Our Role / Scope (역할 범위 체크리스트)

Process (운영 프로세스: 준비→현장→사후)

Output & Impact (성과/지표/후기)

Gallery (사진/영상 링크)

Next Case / CTA(문의)

필드(데이터 모델과 연결)

title, slug, date, location(옵션), partner(옵션), summary

roles[] (enum), categories[]

goals (text), scope (rich text), process (rich text)

metrics[] (label/value), testimonials[] (name/role/text)

gallery[] (image/video link), related_cases[]

Acceptance Criteria

케이스마다 “역할 범위”가 한눈에 보이고, 담당 영역이 오해 없이 읽힘

공유 시 OG 이미지/제목/설명이 정상 노출

6.4 Blog (목록)

목표: 전문성·철학을 콘텐츠로 증명 + 유입/리드 전환
구성

카테고리: 예) 운영 매뉴얼 / 케이스 회고 / 파트너십 / 조직·문화

검색(옵션): v1에서는 미구현 가능, 태그 필터만 구현해도 OK

최신 글 10~20개 페이지네이션

6.5 Blog Detail

제목/작성일/카테고리/태그

본문(이미지 포함)

Related posts

하단 CTA: “협업/운영 문의”

Acceptance Criteria

코드블록/이미지/리스트 등 기본 마크다운 스타일 깨지지 않음

SEO meta(타이틀/디스크립션/OG) 자동 생성 또는 프론트매터로 지정

6.6 Products (서비스/패키지)

목표: 제공 범위를 “상품화”해서 문의 전환을 쉽게 만들기
구성

Service Overview (우리가 제공하는 가치)

Packages 3-tier (가격 미공개, 문의 유도)

Basic: 운영 지원/현장 오퍼 중심

Standard: 기획+운영+운영매뉴얼/체크리스트

Extended: 기획+운영+콘텐츠/미디어+파트너 코디네이션(확장)

What’s Included (포함/미포함 명확화)

FAQ (견적/기간/협업방식/준비물)

CTA: 문의 폼

Acceptance Criteria

패키지별 “범위 차이”가 명확 (표/체크리스트 형태 권장)

문의 CTA가 상단/하단에 최소 2회 노출

6.7 Inquiry (문의)

MVP 옵션 A(가장 빠름): Google Form / Typeform 링크로 연결
옵션 B(사이트 내 폼): 필드 5개 + 이메일 전송(Resend 등)

필드: 이름, 소속, 연락처/이메일, 프로젝트 유형, 내용(자유)

Acceptance Criteria

스팸 방지(간단 reCAPTCHA 또는 honeypot)

성공/실패 메시지 표시

7. 콘텐츠 운영 방식(CMS/데이터)
   MVP 추천

MDX/Markdown 기반 (repo 내 content/portfolio, content/blog)

프론트매터로 메타 관리(title, date, tags, summary, thumbnail, etc.)

이미지: /public/images/... 또는 클라우드(선택)

v1.5~v2 확장(옵션)

Headless CMS(Sanity/Contentful/Strapi) 또는 Notion 기반(필요 시)

8. 디자인/UX 요구사항

톤: 모던, 심플, 신뢰감, “행정/기획 전문가” 느낌

레이아웃: 카드 기반, 여백 넉넉하게

타이포: 과장 없이 깔끔한 산세리프

다크모드: 옵션(시간되면 v1 포함, 아니면 v2)

9. 기술 스택(권장)

Next.js (App Router), TypeScript

Tailwind CSS

MDX 지원

SEO: sitemap/robots, OG, JSON-LD(옵션)

Analytics: GA4 또는 Plausible

Deployment: Vercel

10. 이벤트/분석(최소)

CTA 클릭(문의 버튼)

포트폴리오 상세 조회

프로덕트 패키지 클릭

블로그 구독 클릭(있다면)

11. 비기능 요구사항

성능: Lighthouse 80+ 목표(모바일)

접근성: 기본 대비(alt 텍스트, 폰트 크기)

보안: 문의 폼 스팸 방지, 환경변수 안전관리

12. 산출물(개발 완료 정의, DoD)

위 페이지 전부 동작

반응형 완료

콘텐츠 샘플: 포트폴리오 3개, 블로그 3개, 프로덕트 1개

배포 URL 공유 가능 상태

기본 SEO/OG 정상

문의 전환 경로(CTA) 정상

13. 초기 콘텐츠 템플릿(예시)
    Portfolio sample 3개(타이틀만)

WELOVE 공연 운영 케이스

The Sent 운영 케이스

기타 지역 예배/집회 운영 케이스(대표 1)

Blog 첫 시리즈 제안

“예배/집회 운영 체크리스트” 5편

“대형 집회 운영 회고(리스크/해결)” 3편

14. Cursor 작업 지시(바로 개발 시작용)

위 PRD 기반으로 Next.js 프로젝트 스캐폴딩

라우트: /, /portfolio, /portfolio/[slug], /blog, /blog/[slug], /products, /inquiry

content/portfolio/_.mdx, content/blog/_.mdx로 콘텐츠 로딩

공통 컴포넌트: Header, Footer, CTAButton, Card, Tag, PageHero

스타일 가이드: 카드형 레이아웃 + 넓은 여백 + 심플한 타이포

SEO 기본 구성(메타/OG/사이트맵)

문의는 v1에서 “외부 폼 링크”로 처리(가장 빠른 구현)
