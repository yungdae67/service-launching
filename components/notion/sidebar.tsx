"use client"

import { useState } from "react"
import {
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  Search,
  Home,
  Inbox,
  Settings,
  Plus,
  FileText,
  MoreHorizontal,
  Trash2,
  Import,
  LayoutTemplate,
  Star,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { PageSummary } from "@/lib/services/pages"

type TreeItem = {
  id: string
  icon: string
  title: string
  children: TreeItem[]
}

function buildTree(pages: PageSummary[]): TreeItem[] {
  const nodes = new Map<string, TreeItem>()
  for (const page of pages) {
    nodes.set(page.id, { id: page.id, icon: page.icon, title: page.title, children: [] })
  }

  const roots: TreeItem[] = []
  for (const page of pages) {
    const node = nodes.get(page.id)
    if (!node) continue
    if (page.parentId && nodes.has(page.parentId)) {
      nodes.get(page.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }
  return roots
}

function TreeRow({
  item,
  activeId,
  onSelect,
  onCreate,
  onDelete,
  depth = 0,
}: {
  item: TreeItem
  activeId: string
  onSelect: (id: string) => void
  onCreate: (parentId?: string | null) => void
  onDelete: (id: string) => void
  depth?: number
}) {
  const [open, setOpen] = useState(depth === 0)
  const hasChildren = item.children.length > 0
  const isActive = activeId === item.id

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(item.id)}
        onKeyDown={(e) => e.key === "Enter" && onSelect(item.id)}
        className={cn(
          "group flex items-center gap-1 rounded-md px-2 py-1 text-sm cursor-pointer transition-colors",
          "text-sidebar-foreground hover:bg-sidebar-accent",
          isActive && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
        )}
        style={{ paddingLeft: 8 + depth * 16 }}
      >
        <button
          aria-label={open ? "접기" : "펼치기"}
          onClick={(e) => {
            e.stopPropagation()
            setOpen((v) => !v)
          }}
          className="flex h-4 w-4 shrink-0 items-center justify-center rounded hover:bg-black/10"
        >
          {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>
        <span className="text-[15px] leading-none">{item.icon}</span>
        <span className="truncate">{item.title}</span>
        <span className="ml-auto flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
          <button
            aria-label="페이지 삭제"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(item.id)
            }}
            className="flex h-5 w-5 items-center justify-center rounded hover:bg-black/10"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
          <button
            aria-label="하위 페이지 추가"
            onClick={(e) => {
              e.stopPropagation()
              onCreate(item.id)
              setOpen(true)
            }}
            className="flex h-5 w-5 items-center justify-center rounded hover:bg-black/10"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </span>
      </div>
      {open &&
        (hasChildren
          ? item.children.map((child) => (
              <TreeRow
                key={child.id}
                item={child}
                activeId={activeId}
                onSelect={onSelect}
                onCreate={onCreate}
                onDelete={onDelete}
                depth={depth + 1}
              />
            ))
          : null)}
    </div>
  )
}

function NavItem({
  icon,
  label,
  onClick,
  active,
}: {
  icon: React.ReactNode
  label: string
  onClick?: () => void
  active?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent",
        active && "bg-sidebar-accent font-medium",
      )}
    >
      <span className="flex h-4 w-4 items-center justify-center text-muted-foreground">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="px-2 pb-1 pt-4 text-xs font-medium text-muted-foreground">{children}</div>
}

export function Sidebar({
  userName,
  pages,
  activeId,
  onSelect,
  onCollapse,
  onCreate,
  onDelete,
}: {
  userName: string
  pages: PageSummary[]
  activeId: string
  onSelect: (id: string) => void
  onCollapse: () => void
  onCreate: (parentId?: string | null) => void
  onDelete: (id: string) => void
}) {
  const tree = buildTree(pages)
  const favoritePages = pages.filter((page) => page.favorite)
  const homePage = pages.find((page) => page.favorite) ?? pages[0]

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-[#37352f] text-xs font-semibold text-white">
          {userName.slice(0, 1).toUpperCase()}
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-1">
          <span className="truncate text-sm font-medium text-sidebar-foreground">{userName}의 Notion</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <button
          onClick={onCollapse}
          aria-label="사이드바 접기"
          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-sidebar-accent"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        <div className="flex flex-col gap-0.5">
          <NavItem icon={<Search className="h-4 w-4" />} label="검색" />
          <NavItem
            icon={<Home className="h-4 w-4" />}
            label="홈"
            onClick={() => homePage && onSelect(homePage.id)}
            active={homePage?.id === activeId}
          />
          <NavItem icon={<Inbox className="h-4 w-4" />} label="수신함" />
          <NavItem icon={<Settings className="h-4 w-4" />} label="설정" />
        </div>

        <SectionLabel>즐겨찾기</SectionLabel>
        <div className="flex flex-col gap-0.5">
          {favoritePages.map((item) => (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(item.id)}
              onKeyDown={(e) => e.key === "Enter" && onSelect(item.id)}
              className={cn(
                "flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-sm text-sidebar-foreground hover:bg-sidebar-accent",
                activeId === item.id && "bg-sidebar-accent font-medium",
              )}
            >
              <Star className="h-3.5 w-3.5 fill-[#e9a23b] text-[#e9a23b]" />
              <span className="text-[15px] leading-none">{item.icon}</span>
              <span className="truncate">{item.title}</span>
            </div>
          ))}
        </div>

        <SectionLabel>개인 페이지</SectionLabel>
        <div className="flex flex-col gap-0.5">
          {tree.map((item) => (
            <TreeRow
              key={item.id}
              item={item}
              activeId={activeId}
              onSelect={onSelect}
              onCreate={onCreate}
              onDelete={onDelete}
            />
          ))}
        </div>

        <button
          onClick={() => onCreate(null)}
          className="mt-1 flex w-full items-center gap-2 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent"
        >
          <Plus className="h-4 w-4" />
          <span>새 페이지</span>
        </button>
      </div>

      <div className="border-t border-sidebar-border px-2 py-2">
        <div className="flex flex-col gap-0.5">
          <NavItem icon={<LayoutTemplate className="h-4 w-4" />} label="템플릿" />
          <NavItem icon={<Import className="h-4 w-4" />} label="가져오기" />
          <NavItem icon={<Trash2 className="h-4 w-4" />} label="휴지통" />
        </div>
        <button
          onClick={() => onCreate(null)}
          className="mt-1 flex w-full items-center gap-2 rounded-md bg-[#2383e2] px-2 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <FileText className="h-4 w-4" />
          <span>새 페이지 만들기</span>
        </button>
      </div>
    </aside>
  )
}
