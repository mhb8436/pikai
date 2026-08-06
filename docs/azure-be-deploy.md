# Azure App Service — API (`be.yml`) 배포 가이드

Nest.js API를 GitHub Actions(`be.yml`)로 Azure App Service에 배포하는 절차입니다.

---

## 1. Azure 준비

### 1-1. App Service 생성


| 항목      | 값                                              |
| ------- | ---------------------------------------------- |
| Publish | Code                                           |
| Runtime | **Node 24 LTS**                                |
| OS      | Linux                                          |
| Name    | `be.yml`의 `app-name`과 **동일**해야 함 (예: `pikai3`) |


### 1-2. PostgreSQL (Flexible Server)

DB를 만든 뒤 `DATABASE_URL`을 구성합니다.  
비밀번호에 `$`가 있으면 URL에서 `%24`로 인코딩합니다.

```text
postgresql://유저:비밀번호@서버.postgres.database.azure.com:5432/DB이름?sslmode=require
```

예:

```text
postgresql://omipyzjqvj:Vcv6a%24UWbKfxSi6f@pi-server.postgres.database.azure.com:5432/pi-database?sslmode=require
```



### 1-3. Application settings (환경 변수)

App Service → **Settings** → **Environment variables** (또는 Configuration)


| Name                                  | Value    | 설명               |
| ------------------------------------- | -------- | ---------------- |
| `DATABASE_URL`                        | 위 연결 문자열 | Prisma / Nest DB |
| `JWT_SECRET`                          | 긴 랜덤 문자열 | JWT 서명           |
| `FRONT_URL`                           | 프론트 URL  | CORS 등           |
| `ROUND`                               | `10`     | bcrypt rounds    |
| `SCM_DO_BUILD_DURING_DEPLOYMENT`      | `false`  | Azure에서 재빌드 금지   |
| `ENABLE_ORYX_BUILD`                   | `false`  | Oryx 빌드 끄기       |
| `WEBSITES_CONTAINER_START_TIME_LIMIT` | `600`    | 기동 대기 시간(초)      |
| `AZURE_OPENAI_ENDPOINT`               | (선택)     | 추천 기능 사용 시       |
| `AZURE_OPENAI_KEY`                    | (선택)     | 추천 기능 사용 시       |


**넣지 마세요**

- `WEBSITE_RUN_FROM_PACKAGE` — 없어도 됩니다. 있으면 wwwroot 쓰기/rsync 문제가 나기 쉽습니다.

`AZURE_POSTGRESQL_*` 같은 자동 생성 값은 Prisma가 쓰지 않습니다. `DATABASE_URL`**만** 있으면 됩니다.

### 1-4. Startup Command (필수)

App Service → **Configuration** → **General settings** → **Startup Command**:

```bash
sh /home/site/wwwroot/start.sh
```

이 스크립트가 하는 일:

1. `node_modules_app` → `node_modules` 링크
2. `prisma migrate deploy` (테이블 생성/갱신)
3. `node dist/src/main.js` (Nest 기동)

> `npm start`도 동작하지만, 수업/실습에서는 위 경로를 **그대로** 넣는 것을 권장합니다.



### 1-5. Publish Profile

1. App Service 개요 → **Download publish profile**
2. 다운로드된 `.PublishSettings` **파일 전체 내용** 복사



### 1-6. DB Networking

App Service가 PostgreSQL에 접속할 수 있도록:

- Azure 서비스 접근 허용, 또는
- 방화벽에 필요한 규칙 추가

---



## 2. GitHub Secrets

레포 → **Settings** → **Secrets and variables** → **Actions**


| Secret 이름            | 넣을 값                                        |
| -------------------- | ------------------------------------------- |
| `BE_PUBLISH_PROFILE` | Publish Profile XML **전체**                  |
| `DATABASE_URL`       | Azure와 동일한 DB URL (CI에서 `prisma generate`용) |


Secret은 등록만 해서는 쓰이지 않습니다. `be.yml`에 `${{ secrets.이름 }}`으로 연결되어 있어야 합니다.

---



## 3. 코드에서 맞출 것



### 3-1. `be.yml`의 `app-name`

```yaml
app-name: "pikai3"   # ← 본인 App Service 이름으로 변경
```



### 3-2. 관련 파일 역할


| 파일                             | 역할                                  |
| ------------------------------ | ----------------------------------- |
| `.github/workflows/be.yml`     | 빌드 + Azure zip 배포                   |
| `apps/api/package.deploy.json` | 배포용 package.json (`workspace:*` 제거) |
| `apps/api/start.sh`            | Azure 기동 스크립트                       |
| 루트 `package.json`              | `build:api`, `prisma:generate`      |




### 3-3. 배포 설계 (왜 이렇게 하나)

- 모노레포 전체를 올리지 않고 **API 실행에 필요한 것만** zip
- Azure OneDeploy가 `node_modules`를 tar로 망가뜨리지 않게 → 폴더명을 `node_modules_app` 으로 배포
- Prisma CLI는 `.bin/prisma` 대신  
`node node_modules_app/prisma/build/index.js migrate deploy`  
(wasm 경로 깨짐 방지)

---



## 4. Deployment Center

- Azure **Deployment Center에서 GitHub을 연결하지 마세요**
- Azure가 자동 생성한 `main_*.yml` 워크플로는 **삭제**
- `be.yml` **+ Publish Profile** 방식만 사용

---



## 5. 배포 실행

1. 위 Azure / GitHub 설정 저장
2. `main`에 push
  - 또는 Actions → **Deploy API to Azure** → **Run workflow**
3. Actions가 성공하는지 확인
4. 브라우저에서 확인


| URL                                     | 설명                     |
| --------------------------------------- | ---------------------- |
| `https://<앱이름>.azurewebsites.net/pikai` | API 루트 (global prefix) |
| `https://<앱이름>.azurewebsites.net/docs`  | Swagger                |


---



## 6. 자주 나는 오류


| 증상                                        | 원인 / 조치                                                      |
| ----------------------------------------- | ------------------------------------------------------------ |
| `Cannot find module .../dist/main`        | 실행 파일은 `dist/src/main.js`                                    |
| `The table public.Product does not exist` | migrate 미적용 → Startup이 `start.sh`인지 확인                       |
| `prisma_schema_build_bg.wasm` ENOENT      | `.bin/prisma` 호출됨 → `start.sh` / Startup Command 확인          |
| `Zipping node_modules` / rsync 실패         | `node_modules_app` 배포 방식 유지                                  |
| Oryx / tar.gz가 계속 생김                      | `SCM_DO_BUILD_DURING_DEPLOYMENT=false`, Deployment Center 해제 |
| Container startup timeout                 | `WEBSITES_CONTAINER_START_TIME_LIMIT=600`                    |
| GitHub Actions에서 DB `P1001`               | CI에서 migrate 하지 않음. **앱 기동 시** migrate                       |


---



## 7. 체크리스트

- [ ] App Service (Node 24) 생성
- [ ] PostgreSQL + `DATABASE_URL`
- [ ] Application settings 등록
- [ ] **Startup Command =** `sh /home/site/wwwroot/start.sh`
- [ ] Publish Profile → GitHub Secret `BE_PUBLISH_PROFILE`
- [ ] GitHub Secret `DATABASE_URL`
- [ ] `be.yml`의 `app-name`을 본인 앱 이름으로 수정
- [ ] Deployment Center GitHub 연동 끔
- [ ] Actions 배포 성공
- [ ] `/pikai` 또는 `/docs` 응답 확인

---

