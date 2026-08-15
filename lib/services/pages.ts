import { createClient } from "@/lib/supabase/server"
import { dbBlockToView, type ViewBlock } from "@/lib/blocks"

export type PageSummary = {
  id: string
  title: string
  icon: string
  cover: string | null
  meta: string | null
  parentId: string | null
  favorite: boolean
  position: number
}

export type PageDetail = PageSummary & {
  blocks: ViewBlock[]
}

type PageRow = {
  id: string
  title: string
  icon: string
  cover: string | null
  meta: string | null
  parent_id: string | null
  favorite: boolean
  position: number
}

type BlockRow = {
  id: string
  type: string
  content: string
  checked: boolean | null
  emoji: string | null
  position: number
}

function toSummary(page: PageRow): PageSummary {
  return {
    id: page.id,
    title: page.title,
    icon: page.icon,
    cover: page.cover,
    meta: page.meta,
    parentId: page.parent_id,
    favorite: page.favorite,
    position: page.position,
  }
}

async function assertOwned(pageId: string, ownerId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("pages")
    .select("id")
    .eq("id", pageId)
    .eq("owner_id", ownerId)
    .maybeSingle()

  if (error || !data) {
    throw new Error("페이지를 찾을 수 없습니다.")
  }
  return data
}

export async function listPages(ownerId: string): Promise<PageDetail[]> {
  const supabase = await createClient()
  const { data: pages, error } = await supabase
    .from("pages")
    .select("id, title, icon, cover, meta, parent_id, favorite, position")
    .eq("owner_id", ownerId)
    .order("position", { ascending: true })

  if (error) throw new Error(error.message)
  if (!pages?.length) return []

  const pageIds = pages.map((page) => page.id)
  const { data: blocks, error: blockError } = await supabase
    .from("blocks")
    .select("id, page_id, type, content, checked, emoji, position")
    .in("page_id", pageIds)
    .order("position", { ascending: true })

  if (blockError) throw new Error(blockError.message)

  const blocksByPage = new Map<string, BlockRow[]>()
  for (const block of blocks ?? []) {
    const list = blocksByPage.get(block.page_id) ?? []
    list.push(block)
    blocksByPage.set(block.page_id, list)
  }

  return pages.map((page) => ({
    ...toSummary(page),
    blocks: (blocksByPage.get(page.id) ?? []).map(dbBlockToView),
  }))
}

export async function getPage(pageId: string, ownerId: string): Promise<PageDetail> {
  const supabase = await createClient()
  const { data: page, error } = await supabase
    .from("pages")
    .select("id, title, icon, cover, meta, parent_id, favorite, position")
    .eq("id", pageId)
    .eq("owner_id", ownerId)
    .maybeSingle()

  if (error || !page) {
    throw new Error("페이지를 찾을 수 없습니다.")
  }

  const { data: blocks, error: blockError } = await supabase
    .from("blocks")
    .select("id, type, content, checked, emoji, position")
    .eq("page_id", pageId)
    .order("position", { ascending: true })

  if (blockError) throw new Error(blockError.message)

  return {
    ...toSummary(page),
    blocks: (blocks ?? []).map(dbBlockToView),
  }
}

export async function createPage(
  ownerId: string,
  input?: { title?: string; icon?: string; parentId?: string | null; favorite?: boolean },
): Promise<PageDetail> {
  if (input?.parentId) {
    await assertOwned(input.parentId, ownerId)
  }

  const supabase = await createClient()
  const { data: siblings } = await supabase
    .from("pages")
    .select("position")
    .eq("owner_id", ownerId)
    .is("parent_id", input?.parentId ?? null)
    .order("position", { ascending: false })
    .limit(1)

  const nextPosition = (siblings?.[0]?.position ?? -1) + 1

  const { data: page, error } = await supabase
    .from("pages")
    .insert({
      owner_id: ownerId,
      title: input?.title?.trim() || "제목 없음",
      icon: input?.icon || "📄",
      parent_id: input?.parentId ?? null,
      favorite: input?.favorite ?? false,
      position: nextPosition,
    })
    .select("id, title, icon, cover, meta, parent_id, favorite, position")
    .single()

  if (error || !page) {
    throw new Error(error?.message ?? "페이지를 만들 수 없습니다.")
  }

  return {
    ...toSummary(page),
    blocks: [],
  }
}

export async function updatePage(
  pageId: string,
  ownerId: string,
  input: Partial<Pick<PageSummary, "title" | "icon" | "cover" | "meta" | "parentId" | "favorite" | "position">>,
): Promise<PageDetail> {
  await assertOwned(pageId, ownerId)

  if (input.parentId) {
    await assertOwned(input.parentId, ownerId)
  }

  const supabase = await createClient()
  const patch: Record<string, unknown> = {}
  if (input.title !== undefined) patch.title = input.title
  if (input.icon !== undefined) patch.icon = input.icon
  if (input.cover !== undefined) patch.cover = input.cover
  if (input.meta !== undefined) patch.meta = input.meta
  if (input.parentId !== undefined) patch.parent_id = input.parentId
  if (input.favorite !== undefined) patch.favorite = input.favorite
  if (input.position !== undefined) patch.position = input.position

  const { data: page, error } = await supabase
    .from("pages")
    .update(patch)
    .eq("id", pageId)
    .eq("owner_id", ownerId)
    .select("id, title, icon, cover, meta, parent_id, favorite, position")
    .single()

  if (error || !page) {
    throw new Error(error?.message ?? "페이지를 수정할 수 없습니다.")
  }

  const { data: blocks, error: blockError } = await supabase
    .from("blocks")
    .select("id, type, content, checked, emoji, position")
    .eq("page_id", pageId)
    .order("position", { ascending: true })

  if (blockError) throw new Error(blockError.message)

  return {
    ...toSummary(page),
    blocks: (blocks ?? []).map(dbBlockToView),
  }
}

export async function deletePage(pageId: string, ownerId: string) {
  await assertOwned(pageId, ownerId)
  const supabase = await createClient()
  const { error } = await supabase.from("pages").delete().eq("id", pageId).eq("owner_id", ownerId)
  if (error) throw new Error(error.message)
}
