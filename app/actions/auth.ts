"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { AuthError, signInWithGoogle, signOut } from "@/lib/auth"

export async function signInWithGoogleAction() {
  const headerStore = await headers()
  const origin = headerStore.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

  let url: string
  try {
    url = await signInWithGoogle(origin)
  } catch (error) {
    const message = error instanceof AuthError ? error.message : "Google 로그인을 시작할 수 없습니다."
    redirect(`/login?error=${encodeURIComponent(message)}`)
  }

  redirect(url)
}

export async function signOutAction() {
  await signOut()
  redirect("/login")
}
