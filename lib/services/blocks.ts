import { createClient } from "@/lib/supabase/server"
import { dbBlockToView, viewBlockToUpdate, type ViewBlock } from "@/lib/blocks"

async function assertPageOwned(pageId: string, ownerId: string) {
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

async function assertBlockOwned(blockId: string, ownerId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("blocks")
    .select("id, type, content, checked, emoji, page_id, pages!inner(owner_id)")
    .eq("id", blockId)
    .eq("pages.owner_id", ownerId)
    .maybeSingle()

  if (error || !data) {
    throw new Error("블록을 찾을 수 없습니다.")
  }

  return {
    id: data.id,
    type: data.type,
    content: data.content,
    checked: data.checked,
    emoji: data.emoji,
  }
}

export async function createBlock(
  pageId: string,
  ownerId: string,
  input?: { type?: string; content?: string; checked?: boolean | null; emoji?: string | null },
): Promise<ViewBlock> {
  await assertPageOwned(pageId, ownerId)
  const supabase = await createClient()

  const { data: last } = await supabase
    .from("blocks")
    .select("position")
    .eq("page_id", pageId)
    .order("position", { ascending: false })
    .limit(1)

  const { data: block, error } = await supabase
    .from("blocks")
    .insert({
      page_id: pageId,
      type: input?.type || "text",
      content: input?.content ?? "",
      checked: input?.checked ?? null,
      emoji: input?.emoji ?? null,
      position: (last?.[0]?.position ?? -1) + 1,
    })
    .select("id, type, content, checked, emoji, position")
    .single()

  if (error || !block) {
    throw new Error(error?.message ?? "블록을 만들 수 없습니다.")
  }

  return dbBlockToView(block)
}

export async function updateBlock(
  blockId: string,
  ownerId: string,
  input: Partial<ViewBlock> & { content?: string; checked?: boolean | null; emoji?: string | null; type?: string },
): Promise<ViewBlock> {
  const existing = await assertBlockOwned(blockId, ownerId)

  let data: {
    type?: string
    content?: string
    checked?: boolean | null
    emoji?: string | null
  } = {}

  if (input.type || "text" in input || "children" in input || "src" in input) {
    const next = {
      ...dbBlockToView(existing),
      ...input,
    } as ViewBlock
    data = viewBlockToUpdate(next)
  } else {
    if (input.content !== undefined) data.content = input.content
    if (input.checked !== undefined) data.checked = input.checked
    if (input.emoji !== undefined) data.emoji = input.emoji
    if (input.type !== undefined) data.type = input.type
  }

  const supabase = await createClient()
  const { data: block, error } = await supabase
    .from("blocks")
    .update(data)
    .eq("id", blockId)
    .select("id, type, content, checked, emoji, position")
    .single()

  if (error || !block) {
    throw new Error(error?.message ?? "블록을 수정할 수 없습니다.")
  }

  return dbBlockToView(block)
}

export async function deleteBlock(blockId: string, ownerId: string) {
  await assertBlockOwned(blockId, ownerId)
  const supabase = await createClient()
  const { error } = await supabase.from("blocks").delete().eq("id", blockId)
  if (error) throw new Error(error.message)
}

export async function reorderBlocks(pageId: string, ownerId: string, orderedIds: string[]) {
  await assertPageOwned(pageId, ownerId)
  const supabase = await createClient()

  for (const [position, id] of orderedIds.entries()) {
    const { error } = await supabase.from("blocks").update({ position }).eq("id", id).eq("page_id", pageId)
    if (error) throw new Error(error.message)
  }
}
