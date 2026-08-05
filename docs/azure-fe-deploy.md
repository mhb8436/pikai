# Azure App Service — Web (`fe.yml`) 배포 가이드

Next.js 프론트를 GitHub Actions(`fe.yml`)로 Azure App Service에 배포하는 절차입니다.  
Next **`standalone`** 빌드를 쓰므로 API(`be.yml`)보다 단순합니다.

관련 파일:

| 파일 | 역할 |
|------|------|
| `.github/workflows/fe.yml` | 빌드 + Azure zip 배포 |
| `apps/web/start.sh` | Azure 기동 (`node apps/web/server.js`) |
| `apps/web/next.config.js` | `output: "standalone"`, `basePath: "/pikai"` |
| 루트 `package.json` | `build:web` |

---

## 1. Azure 준비

### 1-1. App Service 생성

| 항목 | 값 |
|------|-----|
| Publish | Code |
| Runtime | **Node 24 LTS** |
| OS | Linux |
| Name | `fe.yml`의 `app-name`과 **동일** (예: `pikai3-web`) |

API 앱(`pikai3`)과 **다른** App Service를 쓰는 것을 권장합니다.

### 1-2. Startup Command (필수)

App Service → **Configuration** → **General settings** → **Startup Command**:

```bash
sh /home/site/wwwroot/start.sh
```

이 스크립트가 하는 일:

1. `PORT` / `HOSTNAME=0.0.0.0` 설정 (Azure 포트 바인딩)
2. `node apps/web/server.js` 실행 (Next standalone 서버)

### 1-3. Application settings

App Service → **Settings** → **Environment variables**

| Name | Value | 설명 |
|------|--------|------|
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `false` | Azure에서 재빌드 금지 |
| `ENABLE_ORYX_BUILD` | `false` | Oryx 빌드 끄기 |

프론트용 `NEXT_PUBLIC_*`는 **Azure App Settings가 아니라 GitHub Secrets**에 둡니다.  
(Next는 빌드 시점에 번들에 넣기 때문입니다.)

**넣지 마세요**

- `WEBSITE_RUN_FROM_PACKAGE` — 없어도 됩니다.

### 1-4. Publish Profile

1. 프론트 App Service 개요 → **Download publish profile**
2. `.PublishSettings` **파일 전체 내용** 복사

### 1-5. Deployment Center

- Azure **Deployment Center에서 GitHub 연결하지 마세요**
- Azure가 만든 `main_*.yml`이 있으면 삭제
- **`fe.yml` + Publish Profile**만 사용

---

## 2. GitHub Secrets

레포 → **Settings** → **Secrets and variables** → **Actions**

| Secret 이름 | 넣을 값 |
|-------------|---------|
| `FE_PUBLISH_PROFILE` | 프론트 Publish Profile XML **전체** |
| `NEXT_PUBLIC_BACK_URL` | API 주소 (예: `https://pikai3-....azurewebsites.net/pikai`) |
| `NEXT_PUBLIC_IMAGE_URL` | 이미지 베이스 URL (`https://...`) |
| `NEXT_PUBLIC_FRONT_URL` | 프론트 URL (선택, 쓰는 경우) |

Secret은 등록만으로 쓰이지 않습니다. `fe.yml`에 `${{ secrets.이름 }}`으로 연결되어 있어야 합니다.

`NEXT_PUBLIC_BACK_URL`에는 API의 **global prefix `/pikai`까지** 포함하는 것이 일반적입니다.

---

## 3. 코드에서 맞출 것

### 3-1. `fe.yml`의 `app-name`

```yaml
app-name: "pikai3-web"   # ← 본인 프론트 App Service 이름
```

### 3-2. standalone이란

`next.config.js`에 `output: "standalone"`이 있으면, Next가 실행에 필요한 파일만 모읍니다.

배포 zip에 들어가는 것:

- `.next/standalone/` (서버 + 최소 의존성)
- `.next/static/`
- `public/`
- `start.sh`

그래서 API처럼 큰 `node_modules` zip / tar 문제가 거의 없습니다.

### 3-3. packages와의 관계

`pnpm build:web` (`turbo --filter=web`)는 web이 쓰는 `packages`(예: `@repo/common`)를 **빌드에 포함**합니다.  
원본 `packages/` 폴더 전체가 Azure에 복사되는 것은 아니고, 번들/트레이스 결과에 필요한 만큼만 들어갑니다.

---

## 4. 배포 실행

1. 위 Azure / GitHub 설정 저장
2. `main`에 push (`apps/web/**` 등 변경 시)  
   - 또는 Actions → **Deploy Web to Azure** → **Run workflow**
3. Actions 성공 확인
4. 브라우저에서 확인

```text
https://<프론트앱이름>.azurewebsites.net/pikai
```

`basePath: "/pikai"` 때문에 루트 `/`가 아니라 **`/pikai`** 로 접속합니다.

---

## 5. API와의 연동

| 구분 | 설정 위치 | 예시 |
|------|-----------|------|
| 프론트가 API 호출 | GitHub `NEXT_PUBLIC_BACK_URL` | `https://<api앱>.azurewebsites.net/pikai` |
| API CORS | Azure API의 `FRONT_URL` | `https://<프론트앱>.azurewebsites.net` 또는 `/pikai` 포함 URL |

배포 순서 권장: **API(`be.yml`) 먼저** → 프론트 Secret에 BACK_URL 넣고 → **Web(`fe.yml`)**

---

## 6. 자주 나는 오류

| 증상 | 원인 / 조치 |
|------|-------------|
| 빌드 시 API URL이 비어 있음 | `NEXT_PUBLIC_BACK_URL` Secret 누락 / `fe.yml` env 연결 확인 |
| `/` 접속 시 404 | `basePath` 때문에 `/pikai`로 접속 |
| 이미지가 안 뜸 | `NEXT_PUBLIC_IMAGE_URL`이 `https://...` 형식인지 확인 후 **재빌드** |
| Azure가 또 빌드하려 함 | `SCM_DO_BUILD_DURING_DEPLOYMENT=false`, Deployment Center 해제 |
| `server.js` 없음 | standalone pack 단계 실패 — Actions 로그의 `test -f .../server.js` 확인 |

`NEXT_PUBLIC_*`를 바꿨으면 **반드시 다시 빌드·배포**해야 반영됩니다. (런타임 App Settings만 바꿔서는 프론트 번들이 안 바뀜)

---

## 7. 체크리스트

- [ ] 프론트용 App Service (Node 24) 생성 (API와 별도)
- [ ] **Startup Command = `sh /home/site/wwwroot/start.sh`**
- [ ] `SCM_DO_BUILD_DURING_DEPLOYMENT=false`, `ENABLE_ORYX_BUILD=false`
- [ ] Publish Profile → GitHub Secret `FE_PUBLISH_PROFILE`
- [ ] `NEXT_PUBLIC_BACK_URL`, `NEXT_PUBLIC_IMAGE_URL` Secret 등록
- [ ] `fe.yml`의 `app-name`을 본인 앱 이름으로 수정
- [ ] Deployment Center GitHub 연동 끔
- [ ] Actions 배포 성공
- [ ] `https://<앱>/pikai` 접속 확인

---

## 8. Kudu에서 빠른 확인

```bash
cd ~/site/wwwroot
ls -la
ls -la apps/web
test -f apps/web/server.js && echo OK
cat start.sh
```

수동 기동:

```bash
sh /home/site/wwwroot/start.sh
```
