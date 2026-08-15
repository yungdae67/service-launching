"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronRight, MessageSquarePlus, Smile, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ViewBlock } from "@/lib/blocks"
import type { PageDetail } from "@/lib/services/pages"

function EditableText({
  value,
  onSave,
  className,
  placeholder,
}: {
  value: string
  onSave: (value: string) => void
  className?: string
  placeholder?: string
}) {
  return (
    <div
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      className={cn("min-h-[1.5em] outline-none empty:before:text-muted-foreground/60 empty:before:content-[attr(data-placeholder)]", className)}
      data-placeholder={placeholder}
      onBlur={(e) => {
        const next = e.currentTarget.innerText.replace(/\n$/, "")
        if (next !== value) onSave(next)
      }}
    >
      {value}
    </div>
  )
}

function ToggleBlock({
  block,
  onUpdate,
}: {
  block: Extract<ViewBlock, { type: "toggle" }>
  onUpdate: (input: Partial<ViewBlock>) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="py-0.5">
      <div className="flex w-full items-start gap-1 rounded text-left text-[16px] leading-7 text-foreground hover:bg-accent/60">
        <button onClick={() => setOpen((v) => !v)} aria-label={open ? "접기" : "펼치기"} className="mt-1.5">
          <ChevronRight className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-90")} />
        </button>
        <EditableText value={block.text} onSave={(text) => onUpdate({ text })} className="flex-1" />
      </div>
      {open && (
        <ul className="ml-6 mt-0.5 flex flex-col gap-1 border-l border-border pl-4">
          {block.children.map((child, i) => (
            <li key={i} className="text-[15px] leading-6 text-foreground/90">
              {child}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function TodoBlock({
  block,
  onUpdate,
}: {
  block: Extract<ViewBlock, { type: "todo" }>
  onUpdate: (input: Partial<ViewBlock> & { checked?: boolean }) => void
}) {
  return (
    <label className="flex items-start gap-2 py-0.5 text-[16px] leading-7">
      <input
        type="checkbox"
        checked={!!block.checked}
        onChange={() => onUpdate({ checked: !block.checked })}
        className="mt-1.5 h-4 w-4 shrink-0 accent-[#2383e2]"
      />
      <EditableText
        value={block.text}
        onSave={(text) => onUpdate({ text })}
        className={cn("flex-1 text-foreground", block.checked && "text-muted-foreground line-through")}
      />
    </label>
  )
}

function BlockRenderer({
  block,
  onUpdate,
}: {
  block: ViewBlock
  onUpdate: (input: Partial<ViewBlock> & { checked?: boolean }) => void
}) {
  switch (block.type) {
    case "h1":
      return (
        <EditableText
          value={block.text}
          onSave={(text) => onUpdate({ text })}
          className="mb-1 mt-6 text-3xl font-bold tracking-tight text-foreground text-balance"
        />
      )
    case "h2":
      return (
        <EditableText
          value={block.text}
          onSave={(text) => onUpdate({ text })}
          className="mb-0.5 mt-5 text-2xl font-semibold tracking-tight text-foreground text-balance"
        />
      )
    case "h3":
      return (
        <EditableText
          value={block.text}
          onSave={(text) => onUpdate({ text })}
          className="mb-0.5 mt-4 text-xl font-semibold tracking-tight text-foreground"
        />
      )
    case "text":
      return (
        <EditableText
          value={block.text}
          onSave={(text) => onUpdate({ text })}
          className="py-0.5 text-[16px] leading-7 text-foreground/90"
          placeholder="텍스트를 입력하세요"
        />
      )
    case "bullet":
      return (
        <div className="flex items-start gap-2 py-0.5 text-[16px] leading-7">
          <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />
          <EditableText value={block.text} onSave={(text) => onUpdate({ text })} className="flex-1 text-foreground/90" />
        </div>
      )
    case "number":
      return (
        <div className="flex items-start gap-2 py-0.5 text-[16px] leading-7">
          <span className="w-4 shrink-0 text-foreground/70">{block.index}.</span>
          <EditableText value={block.text} onSave={(text) => onUpdate({ text })} className="flex-1 text-foreground/90" />
        </div>
      )
    case "todo":
      return <TodoBlock block={block} onUpdate={onUpdate} />
    case "toggle":
      return <ToggleBlock block={block} onUpdate={onUpdate} />
    case "quote":
      return (
        <blockquote className="my-1 border-l-[3px] border-foreground pl-4 text-[16px] leading-7 text-foreground">
          <EditableText value={block.text} onSave={(text) => onUpdate({ text })} />
        </blockquote>
      )
    case "callout":
      return (
        <div className="my-2 flex items-start gap-3 rounded-md bg-muted px-4 py-3 text-[15px] leading-6 text-foreground">
          <span className="text-lg leading-none">{block.emoji}</span>
          <EditableText value={block.text} onSave={(text) => onUpdate({ text })} className="flex-1" />
        </div>
      )
    case "divider":
      return <hr className="my-3 border-border" />
    case "image":
      return (
        <figure className="my-3">
          <img src={block.src || "/placeholder.svg"} alt={block.caption ?? ""} className="rounded-md" />
          {block.caption && <figcaption className="mt-1 text-sm text-muted-foreground">{block.caption}</figcaption>}
        </figure>
      )
    default:
      return null
  }
}

export function PageView({
  page,
  onUpdateTitle,
  onUpdateIcon,
  onUpdateCover,
  onUpdateBlock,
  onAddBlock,
}: {
  page: PageDetail
  onUpdateTitle: (title: string) => void
  onUpdateIcon: (icon: string) => void
  onUpdateCover: (cover: string | null) => void
  onUpdateBlock: (blockId: string, input: Partial<ViewBlock> & { checked?: boolean }) => void
  onAddBlock: () => void
}) {
  return (
    <div className="h-full overflow-y-auto">
      {page.cover && (
        <div className="relative h-[30vh] max-h-64 w-full">
          <Image src={page.cover || "/placeholder.svg"} alt="" fill priority className="object-cover" />
        </div>
      )}

      <article className={cn("mx-auto w-full max-w-3xl px-14 pb-40", page.cover ? "pt-0" : "pt-16")}>
        <div className={cn("relative", page.cover ? "-mt-10" : "")}>
          <button
            className="inline-block text-[72px] leading-none"
            onClick={() => {
              const icon = window.prompt("아이콘 이모지를 입력하세요", page.icon)
              if (icon?.trim()) onUpdateIcon(icon.trim())
            }}
          >
            {page.icon}
          </button>
        </div>

        <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground opacity-0 transition-opacity hover:opacity-100">
          <button
            className="flex items-center gap-1.5 rounded px-1.5 py-1 hover:bg-accent"
            onClick={() => {
              const icon = window.prompt("아이콘 이모지를 입력하세요", page.icon)
              if (icon?.trim()) onUpdateIcon(icon.trim())
            }}
          >
            <Smile className="h-4 w-4" /> 아이콘 변경
          </button>
          <button
            className="flex items-center gap-1.5 rounded px-1.5 py-1 hover:bg-accent"
            onClick={() => {
              const cover = window.prompt("커버 이미지 URL", page.cover ?? "")
              if (cover !== null) onUpdateCover(cover.trim() || null)
            }}
          >
            <ImageIcon className="h-4 w-4" /> 커버 추가
          </button>
          <button className="flex items-center gap-1.5 rounded px-1.5 py-1 hover:bg-accent">
            <MessageSquarePlus className="h-4 w-4" /> 댓글
          </button>
        </div>

        <EditableText
          value={page.title}
          onSave={(title) => onUpdateTitle(title.trim() || "제목 없음")}
          className="mt-1 text-[40px] font-bold leading-tight tracking-tight text-foreground text-balance"
          placeholder="제목 없음"
        />
        {page.meta && <p className="mt-1 text-sm text-muted-foreground">최종 편집: {page.meta}</p>}

        <div className="mt-4">
          {page.blocks.map((block) => (
            <BlockRenderer key={block.id} block={block} onUpdate={(input) => onUpdateBlock(block.id, input)} />
          ))}

          <button
            onClick={onAddBlock}
            className="mt-2 w-full cursor-text py-1 text-left text-[16px] leading-7 text-muted-foreground/60"
          >
            {"'/' 를 입력해 명령을 사용하세요…"}
          </button>
        </div>
      </article>
    </div>
  )
}
