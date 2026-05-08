# Lightsail 공동 배포 가이드

이 문서는 `3.34.255.172` Ubuntu Lightsail 인스턴스 한 대에 두 개의 웹앱을 함께 운영하기 위한 표준 배포 가이드입니다.

- 외부 진입: 도메인/서브도메인 기준 분기
- 내부 런타임: PM2 + 로컬 포트 분리
- 프록시: Nginx 단일 프로세스
- HTTPS: DNS 연결 후 Certbot 발급

기본 전제는 아래와 같습니다.

- 내 앱 경로: `/srv/mb-site`
- 동료 앱 경로: `/srv/colleague-site`
- 내 앱 포트: `3001`
- 동료 앱 포트: `3002`
- SSH 사용자: `ubuntu`

## 1. PEM 키 처리

`lightsail-mbweb.pem`은 SSH 개인 키입니다. 저장소에 커밋하지 말고, 내 로컬 머신에만 보관합니다.

권장 위치:

```bash
mkdir -p ~/.ssh
mv /path/to/lightsail-mbweb.pem ~/.ssh/lightsail-mbweb.pem
chmod 400 ~/.ssh/lightsail-mbweb.pem
```

직접 접속:

```bash
ssh -i ~/.ssh/lightsail-mbweb.pem ubuntu@3.34.255.172
```

반복 접속이 많다면 [`deploy/lightsail/ssh-config.example`](../deploy/lightsail/ssh-config.example)을 `~/.ssh/config`에 반영합니다.

## 2. 첫 점검

서버 상태를 덮어쓰기 전에 먼저 읽습니다.

로컬에서 실행:

```bash
./scripts/lightsail/check-server.sh ~/.ssh/lightsail-mbweb.pem
```

점검 대상:

- `nginx -t`
- `pm2 ls`
- `sudo ss -tulpn`
- `/etc/nginx/sites-enabled`
- `certbot certificates`

기존 동료 앱이 이미 살아 있으면 해당 설정을 유지한 채 내 앱만 추가합니다.

## 3. 서버 디렉터리 준비

서버에서 앱별 경로를 분리합니다.

```bash
sudo mkdir -p /srv/mb-site /srv/colleague-site
sudo chown -R ubuntu:ubuntu /srv/mb-site /srv/colleague-site
```

이 저장소는 `/srv/mb-site`에 배치합니다. 동료 앱은 동료 저장소를 `/srv/colleague-site`에 배치합니다.

## 4. 런타임 준비

이 가이드는 `node`, `npm`, `pm2`, `nginx`가 이미 설치되어 있다는 전제에서 작성했습니다. 두 앱 모두 같은 Node LTS 계열을 사용하고, `node -v` 결과를 맞춰서 운영합니다.

필수 확인:

```bash
node -v
npm -v
pm2 -v
nginx -v
```

PM2 설정 파일은 [`deploy/lightsail/pm2/mb-site.ecosystem.config.cjs`](../deploy/lightsail/pm2/mb-site.ecosystem.config.cjs)를 사용합니다.

## 5. 애플리케이션 배치

### 내 앱

서버에서 저장소를 `/srv/mb-site`에 준비한 뒤:

```bash
cd /srv/mb-site
npm ci
npm run build
pm2 startOrReload deploy/lightsail/pm2/mb-site.ecosystem.config.cjs --update-env
pm2 save
```

PM2 프로세스 이름은 기본값 `mb-site`, 포트는 `3001`입니다.

### 동료 앱

동료 앱도 동일한 방식으로 `/srv/colleague-site`에서 운영하되, PM2 이름은 `colleague-site`, 포트는 `3002`로 분리합니다.

## 6. 환경 변수

운영 환경에서는 `.env.production`을 서버 경로에 직접 두고 관리합니다.

이 프로젝트에서 특히 중요한 항목:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_CONTENT`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_ID`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `GITHUB_TOKEN`
- `GITHUB_OWNER`
- `GITHUB_REPO`
- `GITHUB_BRANCH`

admin에서 콘텐츠 저장을 운영에 연결할 예정이면 GitHub 연동 환경 변수를 넣는 것을 기본값으로 사용합니다. 이 값이 없으면 서버 로컬 파일을 직접 수정하는 방식으로 동작합니다.

## 7. Nginx 연결

Nginx는 하나만 사용하고, `server_name`으로 두 앱을 나눕니다.

예시 파일:

- [`deploy/lightsail/nginx/site-a.example.com.conf.example`](../deploy/lightsail/nginx/site-a.example.com.conf.example)
- [`deploy/lightsail/nginx/site-b.example.com.conf.example`](../deploy/lightsail/nginx/site-b.example.com.conf.example)

배치 절차:

```bash
sudo cp /srv/mb-site/deploy/lightsail/nginx/site-a.example.com.conf.example /etc/nginx/sites-available/site-a.example.com.conf
sudo cp /srv/mb-site/deploy/lightsail/nginx/site-b.example.com.conf.example /etc/nginx/sites-available/site-b.example.com.conf
sudo ln -s /etc/nginx/sites-available/site-a.example.com.conf /etc/nginx/sites-enabled/site-a.example.com.conf
sudo ln -s /etc/nginx/sites-available/site-b.example.com.conf /etc/nginx/sites-enabled/site-b.example.com.conf
sudo nginx -t
sudo systemctl reload nginx
```

실제 적용 전 아래를 수정합니다.

- `site-a.example.com`
- `site-b.example.com`
- 업스트림 경로/포트

## 8. DNS와 HTTPS

도메인이 아직 없으면 이 단계는 보류합니다.

DNS가 준비되면 각 서브도메인이 `3.34.255.172`를 가리키도록 설정한 뒤 아래 순서로 진행합니다.

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d site-a.example.com -d site-b.example.com
```

중요:

- 브라우저용 Let’s Encrypt 인증서는 일반적으로 IP 주소 단독 대상이 아닙니다.
- HTTPS 발급 전에 DNS가 먼저 붙어 있어야 합니다.

## 9. 검증

### 서버 내부 검증

```bash
pm2 ls
curl -H 'Host: site-a.example.com' http://127.0.0.1
curl -H 'Host: site-b.example.com' http://127.0.0.1
sudo nginx -t
```

### 브라우저 검증

- `https://<내-서브도메인>`이 내 앱으로 연결되는지 확인
- `https://<동료-서브도메인>`이 동료 앱으로 연결되는지 확인
- admin 로그인/저장이 정상 동작하는지 확인

### 재부팅 검증

```bash
pm2 save
pm2 startup
```

출력되는 명령을 `sudo`로 한 번 더 실행해 startup을 등록한 뒤 서버 재부팅 후에도 앱이 살아 있는지 확인합니다.

## 10. 반복 배포

내 앱이 서버에 이미 올라가 있다면 로컬에서 아래 스크립트를 사용해 재배포할 수 있습니다.

```bash
./scripts/lightsail/redeploy-mb-site.sh ~/.ssh/lightsail-mbweb.pem
```

전제 조건:

- 서버 `/srv/mb-site`에 이 저장소가 이미 clone 되어 있음
- `origin` remote 인증이 서버에서 정상 동작함
- `node`, `npm`, `pm2`가 설치되어 있음
