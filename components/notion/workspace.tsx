"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/notion/sidebar"
import { Topbar } from "@/components/notion/topbar"
import { PageView } from "@/components/notion/page-view"
import { createPageAction, deletePageAction, updatePageAction } from "@/app/actions/pages"
import { createBlockAction, updateBlockAction } from "@/app/actions/blocks"
import type { SessionUser } from "@/lib/auth"
import type { ViewBlock } from "@/lib/blocks"
import type { PageDetail } from "@/lib/services/pages"

function collectIds(id: string, pages: PageDetail[]): string[] {
  const children = pages.filter((page) => page.parentId === id)
  return [id, ...children.flatMap((child) => collectIds(child.id, pages))]
}

export function Workspace({
  user,
  initialPages,
}: {
  user: SessionUser
  initialPages: PageDetail[]
}) {
  const [pages, setPages] = useState(initialPages)
  const [activeId, setActiveId] = useState(initialPages[0]?.id ?? "")
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    setPages(initialPages)
    if (!initialPages.some((page) => page.id === activeId)) {
      setActiveId(initialPages[0]?.id ?? "")
    }
  }, [initialPages, activeId])

  const active = pages.find((page) => page.id === activeId) ?? pages[0]

  async function handleCreate(parentId?: string | null) {
    const page = await createPageAction({ parentId: parentId ?? null })
    setPages((prev) => [...prev, page])
    setActiveId(page.id)
  }

  async function handleDelete(pageId: string) {
    if (!confirm("이 페이지를 삭제할까요?")) return

    const removing = new Set(collectIds(pageId, pages))
    await deletePageAction(pageId)

    let next = pages.filter((page) => !removing.has(page.id))
    if (next.length === 0) {
      const created = await createPageAction()
      next = [created]
    }

    setPages(next)
    if (removing.has(activeId)) {
      setActiveId(next[0].id)
    }
  }

  async function handleUpdatePage(
    pageId: string,
    input: Parameters<typeof updatePageAction>[1],
  ) {
    const updated = await updatePageAction(pageId, input)
    setPages((prev) => prev.map((page) => (page.id === pageId ? { ...page, ...updated } : page)))
  }

  async function handleUpdateBlock(
    blockId: string,
    input: Partial<ViewBlock> & { content?: string; checked?: boolean | null },
  ) {
    if (!active) return
    const updated = await updateBlockAction(blockId, input)
    setPages((prev) =>
      prev.map((page) =>
        page.id === active.id
          ? { ...page, blocks: page.blocks.map((block) => (block.id === blockId ? updated : block)) }
          : page,
      ),
    )
  }

  async function handleAddBlock() {
    if (!active) return
    const block = await createBlockAction(active.id, { type: "text", content: "" })
    setPages((prev) =>
      prev.map((page) => (page.id === active.id ? { ...page, blocks: [...page.blocks, block] } : page)),
    )
  }

  if (!active) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        페이지가 없습니다. 새 페이지를 만들어 보세요.
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {!collapsed && (
        <Sidebar
          userName={user.name || user.email}
          pages={pages}
          activeId={active.id}
          onSelect={setActiveId}
          onCollapse={() => setCollapsed(true)}
          onCreate={handleCreate}
          onDelete={handleDelete}
        />
      )}

      <main className="flex min-w-0 flex-1 flex-col">
        <Topbar
          icon={active.icon}
          title={active.title}
          favorite={active.favorite}
          collapsed={collapsed}
          onExpand={() => setCollapsed(false)}
          onToggleFavorite={() => handleUpdatePage(active.id, { favorite: !active.favorite })}
        />
        <div className="min-h-0 flex-1">
          <PageView
            key={active.id}
            page={active}
            onUpdateTitle={(title) => handleUpdatePage(active.id, { title })}
            onUpdateIcon={(icon) => handleUpdatePage(active.id, { icon })}
            onUpdateCover={(cover) => handleUpdatePage(active.id, { cover })}
            onUpdateBlock={handleUpdateBlock}
            onAddBlock={handleAddBlock}
          />
        </div>
      </main>
    </div>
  )
}
