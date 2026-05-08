# Mighty Blessing Website

예배/집회가 잘 열리도록 만드는 행정·기획·운영 중심 기독교 플랫폼 팀 **마이티 블레싱**의 공식 웹사이트입니다.

- **PRD**: `docs/prd.md`
- **브랜드**: PDF 가이드 기반 (슬로건 "We Move, God Does", 컬러 #6A00FF, #FF5421 등)
- **콘텐츠**: Notion 기존 비전·활동·연락처 반영

## 스택

- Next.js 16 (App Router), TypeScript, Tailwind CSS 4
- 콘텐츠: `content/portfolio/*.md` (gray-matter + react-markdown)

## 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 으로 확인하세요.

## 페이지

| 경로 | 설명 |
|------|------|
| `/` | Home (Hero, What We Do, Featured Portfolio, Proof, Blog, Products, CTA) |
| `/portfolio` | 포트폴리오 목록 |
| `/portfolio/[slug]` | 케이스 스터디 상세 |
| `/blog` | 블로그 목록 |
| `/products` | 서비스·패키지 소개, FAQ, 프로젝트 링크 |
| `/inquiry` | 문의 (MVP: 외부 폼 링크) |
| `/admin/login` | 포트폴리오 관리자 로그인 |
| `/admin` | 포트폴리오 관리자 대시보드 |
| `/privacy`, `/terms` | 개인정보처리방침, 이용약관 (플레이스홀더) |

## 문의 폼

`/inquiry`는 MVP에서 외부 링크(Google Form/Typeform)로 연결됩니다.  
`app/inquiry/page.tsx`의 `INQUIRY_FORM_URL`을 실제 폼 URL로 바꾸면 됩니다.

## SEO

- 메타·OG: `app/layout.tsx` 및 각 페이지 `generateMetadata`
- `app/sitemap.ts`, `app/robots.ts` 사용
- 배포 시 `NEXT_PUBLIC_SITE_URL` 환경 변수로 사이트 URL 지정 권장
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` 지정 시 전체 페이지에 GA4 스크립트가 삽입됩니다.
- 카카오톡/메신저 링크 미리보기는 Open Graph 메타(`og:title`, `og:description`, `og:image`) 기준으로 노출됩니다.

## Admin

- 포트폴리오 admin은 `/admin/login`에서 접근합니다.
- 기본 계정은 환경 변수 기준입니다.
  - `ADMIN_ID`
  - `ADMIN_PASSWORD`
  - `ADMIN_SESSION_SECRET`
- GitHub 연동 시 admin 저장은 저장소 커밋으로 이어지고, 다음 재배포 시 공개 사이트에 반영됩니다.
  - `GITHUB_TOKEN`
  - `GITHUB_OWNER`
  - `GITHUB_REPO`
  - `GITHUB_BRANCH`
- GitHub 환경 변수가 없으면 로컬 개발 환경에서는 현재 워크스페이스 파일을 직접 수정하는 방식으로 동작합니다.

## 배포 — Lightsail (Nginx + PM2)

운영은 Ubuntu Lightsail 한 대에서 `Nginx + PM2 + 도메인 기반 reverse proxy` 구성으로 동작합니다. 같은 인스턴스에 다른 앱을 함께 올리는 공동 운영 형태도 지원합니다.

- 운영 가이드: [`docs/lightsail-shared-deploy.md`](./docs/lightsail-shared-deploy.md)
- SSH 예시: [`deploy/lightsail/ssh-config.example`](./deploy/lightsail/ssh-config.example)
- Nginx 예시: [`deploy/lightsail/nginx/site-a.example.com.conf.example`](./deploy/lightsail/nginx/site-a.example.com.conf.example), [`deploy/lightsail/nginx/site-b.example.com.conf.example`](./deploy/lightsail/nginx/site-b.example.com.conf.example)
- PM2 예시: [`deploy/lightsail/pm2/mb-site.ecosystem.config.cjs`](./deploy/lightsail/pm2/mb-site.ecosystem.config.cjs)
- 서버 점검 스크립트: [`scripts/lightsail/check-server.sh`](./scripts/lightsail/check-server.sh)
- 재배포 스크립트: [`scripts/lightsail/redeploy-mb-site.sh`](./scripts/lightsail/redeploy-mb-site.sh)

## 콘텐츠 추가

- **포트폴리오**: `content/portfolio/` 에 `slug.md` 추가 (frontmatter: title, slug, date, summary, roles, categories 등)
