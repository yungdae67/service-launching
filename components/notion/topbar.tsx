"use client"

import { ChevronsRight, Star, MessageSquare, Clock, MoreHorizontal, ChevronRight, LogOut } from "lucide-react"
import { signOutAction } from "@/app/actions/auth"
import { cn } from "@/lib/utils"

export function Topbar({
  icon,
  title,
  favorite,
  collapsed,
  onExpand,
  onToggleFavorite,
}: {
  icon: string
  title: string
  favorite: boolean
  collapsed: boolean
  onExpand: () => void
  onToggleFavorite: () => void
}) {
  return (
    <header className="flex h-11 items-center gap-2 border-b border-border px-3">
      {collapsed && (
        <button
          onClick={onExpand}
          aria-label="사이드바 펼치기"
          className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-accent"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      )}

      <nav className="flex min-w-0 items-center gap-1 text-sm text-foreground">
        <span className="flex items-center gap-1.5 truncate rounded px-1.5 py-0.5 hover:bg-accent">
          <span className="text-[15px] leading-none">{icon}</span>
          <span className="truncate">{title}</span>
        </span>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate rounded px-1.5 py-0.5 text-muted-foreground hover:bg-accent">추가 준비 중…</span>
      </nav>

      <div className="ml-auto flex items-center gap-0.5 text-muted-foreground">
        <button className="rounded px-2 py-1 text-sm font-medium hover:bg-accent">공유</button>
        <button aria-label="댓글" className="flex h-7 w-7 items-center justify-center rounded hover:bg-accent">
          <MessageSquare className="h-4 w-4" />
        </button>
        <button aria-label="업데이트" className="flex h-7 w-7 items-center justify-center rounded hover:bg-accent">
          <Clock className="h-4 w-4" />
        </button>
        <button
          aria-label="즐겨찾기"
          onClick={onToggleFavorite}
          className={cn("flex h-7 w-7 items-center justify-center rounded hover:bg-accent", favorite && "text-[#e9a23b]")}
        >
          <Star className={cn("h-4 w-4", favorite && "fill-[#e9a23b]")} />
        </button>
        <form action={signOutAction}>
          <button aria-label="로그아웃" className="flex h-7 w-7 items-center justify-center rounded hover:bg-accent">
            <LogOut className="h-4 w-4" />
          </button>
        </form>
        <button aria-label="더보기" className="flex h-7 w-7 items-center justify-center rounded hover:bg-accent">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
