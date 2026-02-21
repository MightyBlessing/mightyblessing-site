# Mighty Blessing 로고·타이포 가이드

## 참고 파일

- **logo-reference.png** — 원본 로고 이미지(추출 소스)
- **logo-symbol.svg** — 보라색 심볼만 벡터(SVG)
- **logo-full.svg** — 심볼 + "mighty blessing" 텍스트 조합

---

## 로고 심볼

- **형태**: 세 개의 부드러운 곡선으로 이어진 M 형태(flowing M)
- **색상**: 브랜드 퍼플 `#6A00FF`
- **용도**: favicon, 헤더, 단색 배경 등

---

## 워드마크 "mighty blessing"

### 원본 특징 (이미지 기준)

- **표기**: 전부 **소문자**, 두 줄
  - 1줄: `mighty`
  - 2줄: `blessing`
- **폰트 느낌**: 모던 산세리프, 볼드, 기하학적
- **특이사항**: "blessing"의 두 개의 **s**가 서로 이어져 보이는 형태(ss 유사 리거처). 위쪽 곡선과 아래쪽 곡선이 자연스럽게 연결됨.

### 폰트 추출에 대해

**래스터 이미지에서는 실제 폰트 파일(.ttf/.otf)을 추출할 수 없습니다.**  
원본이 커스텀 서체일 가능성이 높고, 특히 **s** 디자인이 독특해 일반 폰트와 완전 동일하게 맞추기는 어렵습니다.

### 웹/디자인에서 비슷하게 쓰는 방법

1. **가까운 서체로 대체**
   - **Poppins** (Google Fonts): Bold, 소문자만 사용
   - **DM Sans**: Bold
   - **Outfit**: Bold  
   → 두 줄 배치 + 소문자 + 볼드로 워드마크 느낌 유사하게 구성 가능

2. **로고는 이미지/SVG로 고정**
   - `logo-reference.png` 또는 `logo-full.svg`를 그대로 사용
   - 필요하면 "mighty blessing" 부분만 디자이너가 벡터로 다시 그려서 SVG에 넣어 사용

3. **CSS로 비슷하게**
   - `font-variant-ligatures: common-ligatures;` 등으로 ss 연결감 강조
   - `text-transform: lowercase;` + `font-weight: 700` + 위 추천 폰트 중 하나 사용

---

## 권장 사용

| 용도           | 파일               |
|----------------|--------------------|
| 원본 참고      | logo-reference.png |
| 심볼만 (헤더 등) | logo-symbol.svg    |
| 풀 로고 (이미지) | logo-full.svg 또는 PNG 내보내기 |

현재 사이트 헤더에는 **logo-symbol.svg**와 텍스트 "Mighty Blessing"를 조합해 사용 중입니다. 원본과 동일한 워드마크가 필요하면 `logo-reference.png`를 기준으로 디자이너가 "mighty blessing" 부분을 벡터로 제작해 주는 방식을 권장합니다.
