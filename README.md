
<h1 align="center">3학년 2반 학급 관리 서비스</h1>

<p align="center">
  학급 운영 서비스의 백엔드 API (NestJS + PostgreSQL)
</p>

<p align="center">
  <a href="#-왜-만들었나요">제작 동기</a> ·
  <a href="#-설치--실행">설치/실행</a> ·
  <a href="#-어떻게-동작하나요">동작 원리</a> ·
  <a href="#-운영-옵션">운영 옵션</a>
</p>

---

## 왜 만들었나요?

이 서비스는 학급 운영 핵심 기능을  
학생/선생님/취업관리자가 **한 화면에서 직관적으로 사용**할 수 있게 만드는 것이 목표입니다.

프론트는 다음을 책임집니다:

- 인증 상태/권한 기반 화면 제어
- 일정, 급식, 공지, 패널티, 취업정보, 포트폴리오 UI
- 모바일 반응형 경험

---

## 🚀 설치 / 실행

### 로컬 개발

```bash
npm ci
npm run dev
```

기본 주소:

- `http://localhost:5173`

빌드/프리뷰:

```bash
npm run build
npm run preview
```

---

## 🔍 어떻게 동작하나요?

```text
사용자 로그인 → AuthContext 토큰 관리 → DataContext API 호출 → 페이지/컴포넌트 렌더링
```

1. `AuthContext`가 로그인/로그아웃/토큰 저장을 담당합니다.
2. 최초 로그인 계정은 비밀번호 변경 플로우를 먼저 거칩니다.
3. `DataContext`가 서버 API(`/api/...`)를 호출해 데이터 상태를 관리합니다.
4. 각 페이지(`src/pages`)가 역할별로 화면을 구성합니다.

---

## 🎛️ 운영 옵션

| 옵션 | 설명 |
|------|------|
| `VITE_API_URL` | API 베이스 URL 강제 지정 시 사용 |
| `CLASSPAGE_API_ORIGIN` | Vercel 프록시 배포 시 원본 API 주소 |

기본 API 요청 로직은 `src/config.js`, `src/api/api.js`에서 확인할 수 있습니다.

---

## 📁 프로젝트 구조

```text
ClassPage_Client/
├── src/
│   ├── api/           # API 유틸
│   ├── context/       # Auth/Data 상태 관리
│   ├── pages/         # 화면 단위 페이지
│   ├── components/    # 공통 UI/레이아웃/캘린더
│   ├── utils/         # 날짜/파일 유틸
│   ├── App.jsx
│   └── main.jsx
├── public/
└── package.json
```

---

## 자주 쓰는 명령어

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

---

## 참고 문서

- 서버 문서: `../ClassPage_Server/README.md`
# ClassPage Client

학급 운영 서비스의 프론트엔드(React + Vite)입니다.  
백엔드(`ClassPage_Server`)와 함께 사용할 때 `/api` 경로로 API를 호출합니다.

## 주요 기능

- 로그인/권한 기반 라우팅 (`student`, `teacher`, `career`, `admin`)
- 최초 로그인 시 비밀번호 변경 플로우
- 대시보드, 학사일정, 급식, 패널티, 공지, 취업정보, 포트폴리오 UI
- 모바일 반응형 레이아웃

## 기술 스택

- React
- React Router
- Vite

## 실행 방법 (로컬 개발)

### 1) 설치

```bash
npm ci
```

### 2) 개발 서버 실행

```bash
npm run dev
```

기본 접속 주소:

- `http://localhost:5173`

### 3) 빌드/미리보기

```bash
npm run build
npm run preview
```

## 환경 변수

- `VITE_API_URL` (선택): API 베이스 URL 강제 지정 시 사용
- `CLASSPAGE_API_ORIGIN` (선택): Vercel 프록시 배포 시 원본 API 주소

`src/config.js`, `src/api/api.js`에서 API 경로 처리 로직을 확인할 수 있습니다.

## Vercel 배포 요약

1. 저장소 Import
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. 필요 시 환경 변수 설정:
   - `CLASSPAGE_API_ORIGIN=https://your-api-domain`

## 프로젝트 핵심 파일

- `src/App.jsx` : 전체 라우팅/권한 게이트
- `src/context/AuthContext.jsx` : 로그인/세션 상태
- `src/context/DataContext.jsx` : 데이터 조회/변경 API 연동
- `src/pages/` : 화면 단위 페이지
- `src/components/` : 공통 UI, 레이아웃, 캘린더 컴포넌트

## 참고 문서

- 서버 문서: `../ClassPage_Server/README.md`
