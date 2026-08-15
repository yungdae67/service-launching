import { createClient } from "@/lib/supabase/server"
import { seedWorkspace } from "@/lib/seed-workspace"
import { toSessionUser } from "@/lib/auth"
import { NextResponse } from "next/server"

function loginErrorMessage(searchParams: URLSearchParams, exchangeError?: string) {
  const oauthError = searchParams.get("error_description") ?? searchParams.get("error") ?? exchangeError ?? ""
  const normalized = oauthError.toLowerCase()

  if (normalized.includes("client secret is invalid") || normalized.includes("invalid_client")) {
    return "Google Client Secret이 잘못되었습니다. Supabase Dashboard → Authentication → Providers → Google에서 Client ID/Secret을 다시 확인해 주세요."
  }
  if (normalized.includes("unable to exchange external code")) {
    return "Google OAuth 설정이 맞지 않습니다. Google Cloud의 Client ID/Secret을 Supabase Google Provider에 정확히 다시 입력해 주세요."
  }
  if (oauthError) return oauthError
  return "로그인에 실패했습니다."
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (searchParams.get("error")) {
    const message = loginErrorMessage(searchParams)
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(message)}`)
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { count } = await supabase
          .from("pages")
          .select("id", { count: "exact", head: true })
          .eq("owner_id", user.id)

        if (!count) {
          const sessionUser = toSessionUser(user)
          await seedWorkspace(sessionUser.id, sessionUser.name)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }

    const message = loginErrorMessage(searchParams, error.message)
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(message)}`)
  }

  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("로그인에 실패했습니다.")}`)
}
