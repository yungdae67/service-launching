import type { Block as SeedBlock } from "@/lib/notion-data"

export type DbBlockInput = {
  type: string
  content: string
  checked?: boolean | null
  emoji?: string | null
  position: number
}

export type ViewBlock = SeedBlock & { id: string }

type NumberPayload = { text: string; index: number }
type TogglePayload = { text: string; children: string[] }
type ImagePayload = { src: string; caption?: string }

export function seedBlockToRow(block: SeedBlock, position: number): DbBlockInput {
  switch (block.type) {
    case "todo":
      return { type: "todo", content: block.text, checked: !!block.checked, position }
    case "callout":
      return { type: "callout", content: block.text, emoji: block.emoji, position }
    case "number":
      return {
        type: "number",
        content: JSON.stringify({ text: block.text, index: block.index } satisfies NumberPayload),
        position,
      }
    case "toggle":
      return {
        type: "toggle",
        content: JSON.stringify({ text: block.text, children: block.children } satisfies TogglePayload),
        position,
      }
    case "image":
      return {
        type: "image",
        content: JSON.stringify({ src: block.src, caption: block.caption } satisfies ImagePayload),
        position,
      }
    case "divider":
      return { type: "divider", content: "", position }
    default:
      return { type: block.type, content: block.text, position }
  }
}

export function dbBlockToView(block: {
  id: string
  type: string
  content: string
  checked: boolean | null
  emoji: string | null
}): ViewBlock {
  switch (block.type) {
    case "todo":
      return { id: block.id, type: "todo", text: block.content, checked: !!block.checked }
    case "callout":
      return { id: block.id, type: "callout", emoji: block.emoji || "💡", text: block.content }
    case "number": {
      try {
        const parsed = JSON.parse(block.content) as NumberPayload
        return { id: block.id, type: "number", text: parsed.text, index: parsed.index }
      } catch {
        return { id: block.id, type: "number", text: block.content, index: 1 }
      }
    }
    case "toggle": {
      try {
        const parsed = JSON.parse(block.content) as TogglePayload
        return { id: block.id, type: "toggle", text: parsed.text, children: parsed.children ?? [] }
      } catch {
        return { id: block.id, type: "toggle", text: block.content, children: [] }
      }
    }
    case "image": {
      try {
        const parsed = JSON.parse(block.content) as ImagePayload
        return { id: block.id, type: "image", src: parsed.src, caption: parsed.caption }
      } catch {
        return { id: block.id, type: "image", src: block.content }
      }
    }
    case "divider":
      return { id: block.id, type: "divider" }
    case "h1":
    case "h2":
    case "h3":
    case "text":
    case "bullet":
    case "quote":
      return { id: block.id, type: block.type, text: block.content }
    default:
      return { id: block.id, type: "text", text: block.content }
  }
}

export function viewBlockToUpdate(block: ViewBlock): {
  type: string
  content: string
  checked?: boolean | null
  emoji?: string | null
} {
  const row = seedBlockToRow(block, 0)
  return {
    type: row.type,
    content: row.content,
    checked: row.checked ?? null,
    emoji: row.emoji ?? null,
  }
}
