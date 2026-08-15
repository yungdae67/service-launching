# Notion 스타일 워크스페이스 (Supabase + Google)

Next.js App Router + Supabase(Postgres/Auth) 기반 노션 UI입니다.  
**Google 로그인만** 지원하며, 페이지·블록은 Supabase DB에 저장됩니다.

## 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) → **Google로 계속하기**

## 환경 변수

`.env.example`을 참고해 `.env.local`을 만듭니다.

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

값은 Supabase Dashboard → **Project Settings → API** 에서 복사합니다.

---

## 초보용: Google 로그인 설정 (필수)

코드만 있으면 구글 버튼이 실패할 수 있습니다. 아래를 **한 번만** 설정하세요.

### 1) Google Cloud에서 OAuth 클라이언트 만들기

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 선택(또는 새로 만들기)
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
4. Application type: **Web application**
5. **Authorized redirect URIs**에 아래를 추가  
   `https://cahsxitnwbadxdyqfchh.supabase.co/auth/v1/callback`  
   (다른 Supabase 프로젝트면 `https://<프로젝트참조ID>.supabase.co/auth/v1/callback`)
6. 저장 후 **Client ID**, **Client Secret** 복사

처음이면 OAuth consent screen(동의 화면)도 만들어 달라는 안내가 나옵니다.  
User type은 **External**, 테스트 중이면 본인 Gmail을 Test users에 넣으면 됩니다.

### 2) Supabase에서 Google 켜기

1. [Supabase Dashboard](https://supabase.com/dashboard) → 프로젝트 선택
2. **Authentication → Providers → Google** → Enable
3. Client ID / Client Secret 붙여넣기 → Save

### 3) 앱으로 돌아올 주소 등록

1. Supabase → **Authentication → URL Configuration**
2. **Site URL**: `http://localhost:3000`
3. **Redirect URLs**에 추가: `http://localhost:3000/auth/callback`

### 4) 다시 실행

```bash
npm run dev
```

로그인 성공 시 샘플 페이지가 자동으로 만들어집니다.

---

## 구조

- Auth: [`lib/auth`](lib/auth) (`getSession`, `requireUser`, `signInWithGoogle`, `signOut`)
- Supabase 클라이언트: [`lib/supabase`](lib/supabase)
- CRUD: [`lib/services/pages.ts`](lib/services/pages.ts), [`lib/services/blocks.ts`](lib/services/blocks.ts)
- 세션 갱신/가드: [`proxy.ts`](proxy.ts)
- OAuth 콜백: [`app/auth/callback/route.ts`](app/auth/callback/route.ts)

DB 테이블 `pages`, `blocks`는 Supabase에 RLS와 함께 생성되어 있으며, 본인(`auth.uid()`) 데이터만 읽고 쓸 수 있습니다.
