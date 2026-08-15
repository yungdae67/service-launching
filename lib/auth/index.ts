import { redirect } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import type { SessionUser } from "@/lib/auth/types"
import { AuthError } from "@/lib/auth/types"

export type { SessionUser } from "@/lib/auth/types"
export { AuthError } from "@/lib/auth/types"

export function toSessionUser(user: User): SessionUser {
  const metadata = user.user_metadata ?? {}
  return {
    id: user.id,
    email: user.email ?? "",
    name: (metadata.full_name as string | undefined) ?? (metadata.name as string | undefined) ?? null,
    image: (metadata.avatar_url as string | undefined) ?? (metadata.picture as string | undefined) ?? null,
  }
}

export async function getSession() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user ? toSessionUser(user) : null
}

export async function requireUser() {
  const user = await getSession()
  if (!user) redirect("/login")
  return user
}

export async function signInWithGoogle(origin: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error || !data.url) {
    throw new AuthError(error?.message ?? "Google 로그인을 시작할 수 없습니다.")
  }

  return data.url
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}
