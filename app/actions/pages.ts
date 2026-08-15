"use server"

import { revalidatePath } from "next/cache"
import { requireUser } from "@/lib/auth"
import { createPage, deletePage, updatePage, type PageSummary } from "@/lib/services/pages"

export async function createPageAction(input?: {
  title?: string
  icon?: string
  parentId?: string | null
  favorite?: boolean
}) {
  const user = await requireUser()
  const page = await createPage(user.id, input)
  revalidatePath("/")
  return page
}

export async function updatePageAction(
  pageId: string,
  input: Partial<Pick<PageSummary, "title" | "icon" | "cover" | "meta" | "parentId" | "favorite" | "position">>,
) {
  const user = await requireUser()
  const page = await updatePage(pageId, user.id, input)
  revalidatePath("/")
  return page
}

export async function deletePageAction(pageId: string) {
  const user = await requireUser()
  await deletePage(pageId, user.id)
  revalidatePath("/")
}
