# Mighty Blessing Website

예배/집회가 잘 열리도록 만드는 행정·기획·운영 중심 기독교 플랫폼 팀 **마이티 블레싱**의 공식 웹사이트입니다.

- **PRD**: `docs/prd.md`
- **브랜드**: PDF 가이드 기반 (슬로건 "We Move, God Does", 컬러 #6A00FF, #FF5421 등)
- **콘텐츠**: Notion 기존 비전·활동·연락처 반영

## 스택

- Next.js 16 (App Router), TypeScript, Tailwind CSS 4
- 콘텐츠: `content/portfolio/*.md`, `content/blog/*.md` (gray-matter + react-markdown)

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
| `/blog/[slug]` | 블로그 글 상세 |
| `/products` | 서비스·패키지 소개, FAQ, 프로젝트 링크 |
| `/inquiry` | 문의 (MVP: 외부 폼 링크) |
| `/privacy`, `/terms` | 개인정보처리방침, 이용약관 (플레이스홀더) |

## 문의 폼

`/inquiry`는 MVP에서 외부 링크(Google Form/Typeform)로 연결됩니다.  
`app/inquiry/page.tsx`의 `INQUIRY_FORM_URL`을 실제 폼 URL로 바꾸면 됩니다.

## SEO

- 메타·OG: `app/layout.tsx` 및 각 페이지 `generateMetadata`
- `app/sitemap.ts`, `app/robots.ts` 사용
- 배포 시 `NEXT_PUBLIC_SITE_URL` 환경 변수로 사이트 URL 지정 권장

## Vercel 배포

1. **저장소 푸시**  
   프로젝트를 GitHub 저장소에 푸시합니다.
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/mightyblessing-site.git
   git push -u origin main
   ```

2. **Vercel 연결**  
   - [vercel.com](https://vercel.com) 로그인 후 **Add New → Project**
   - GitHub에서 `mightyblessing-site` 저장소 선택
   - **Framework Preset**: Next.js (자동 감지)
   - **Build Command**: `npm run build` (기본값)
   - **Output Directory**: 비워 두기 (Next.js 기본값)
   - **Install Command**: `npm install` (기본값)

3. **환경 변수 (선택)**  
   프로젝트 설정 → **Environment Variables**에서 추가:
   - `NEXT_PUBLIC_SITE_URL` = 배포된 사이트 URL  
     (예: `https://mightyblessing-site.vercel.app` 또는 커스텀 도메인)  
   → sitemap·robots에 사용됩니다.

4. **Deploy**  
   **Deploy** 클릭 후 빌드가 끝나면 배포 URL로 접속할 수 있습니다.  
   이후 `main` 브랜치에 push할 때마다 자동 재배포됩니다.

## 콘텐츠 추가

- **포트폴리오**: `content/portfolio/` 에 `slug.md` 추가 (frontmatter: title, slug, date, summary, roles, categories 등)
- **블로그**: `content/blog/` 에 `slug.md` 추가 (frontmatter: title, slug, date, category, tags, summary)
