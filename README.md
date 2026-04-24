# ClassPage Client

## Vercel 배포 (다른 사람도 접속)

이 저장소는 **프론트만** Vercel에 올립니다. **API(NestJS)와 DB(PostgreSQL 등)**는 Vercel 밖(Render, Oracle VM Docker 스택 등)에 띄운 뒤, 아래 환경변수로 연결합니다.

### 1) 백엔드 준비

- `ClassPage_Server`를 인터넷에서 접근 가능한 URL로 배포합니다. (예: `https://api.example.com`)
- 서버 `.env`의 **`CORS_ORIGIN`**에 Vercel 주소를 넣습니다. (여러 개면 쉼표로 구분)
  - 예: `https://your-app.vercel.app`
- DB는 배포 환경에서 API가 접속할 수 있어야 합니다.

### 2) Vercel 프로젝트 설정

1. [Vercel](https://vercel.com)에서 GitHub 저장소 [cuzurmyhabit/ClassPage_Client](https://github.com/cuzurmyhabit/ClassPage_Client)를 Import
2. **Root Directory**: 저장소 루트(이 클라이언트가 루트인 경우 그대로)
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Environment Variables (Production)**  
   - **`CLASSPAGE_API_ORIGIN`** = 백엔드 공개 URL (끝 `/` 없이), 예: `https://classpage-api.onrender.com`  
     → 브라우저는 같은 사이트의 `/api/classpage/...` 로만 요청하고, Vercel 서버리스가 여기로 프록시합니다. (**`Failed to fetch`(localhost) 방지**)
   - (선택) 빌드 시 API 주소를 직접 박을 때만 **`VITE_API_URL`** 을 넣으면 프록시 대신 그 주소로 요청합니다.

`CLASSPAGE_API_ORIGIN`만 바꾸면 **클라이언트 재빌드 없이** Redeploy 로 반영됩니다.

`vercel.json`에 SPA용 rewrite가 있어서 새로고침해도 라우팅이 유지됩니다.

---

# React + Vite (템플릿 원문)

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
