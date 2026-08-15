import { createClient } from "@/lib/supabase/server"
import { pages, privateTree, favorites } from "@/lib/notion-data"
import { seedBlockToRow } from "@/lib/blocks"

export async function seedWorkspace(ownerId: string, displayName?: string | null) {
  const supabase = await createClient()
  const name = displayName?.trim() || "나"
  const idMap = new Map<string, string>()
  const favoriteIds = new Set(favorites.map((item) => item.id))
  const parentById = new Map<string, string>()

  for (const item of privateTree) {
    for (const child of item.children ?? []) {
      parentById.set(child.id, item.id)
    }
  }

  const createdPages: { seedId: string; id: string; blocks: (typeof pages)[number]["blocks"] }[] = []

  for (const [index, page] of pages.entries()) {
    const { data: created, error } = await supabase
      .from("pages")
      .insert({
        title: page.title,
        icon: page.icon,
        cover: page.cover ?? null,
        meta: page.meta?.replace(/홍길동/g, name) ?? null,
        owner_id: ownerId,
        favorite: favoriteIds.has(page.id),
        position: index,
      })
      .select("id")
      .single()

    if (error || !created) {
      throw new Error(error?.message ?? "워크스페이스를 초기화할 수 없습니다.")
    }

    idMap.set(page.id, created.id)
    createdPages.push({ seedId: page.id, id: created.id, blocks: page.blocks })
  }

  for (const page of createdPages) {
    const parentSeedId = parentById.get(page.seedId)
    if (!parentSeedId) continue
    const parentId = idMap.get(parentSeedId)
    if (!parentId) continue

    const { error } = await supabase.from("pages").update({ parent_id: parentId }).eq("id", page.id)
    if (error) throw new Error(error.message)
  }

  for (const page of createdPages) {
    if (page.blocks.length === 0) continue

    const rows = page.blocks.map((block, position) => {
      const row = seedBlockToRow(block, position)
      return {
        page_id: page.id,
        type: row.type,
        content: row.content,
        checked: row.checked ?? null,
        emoji: row.emoji ?? null,
        position: row.position,
      }
    })

    const { error } = await supabase.from("blocks").insert(rows)
    if (error) throw new Error(error.message)
  }
}
