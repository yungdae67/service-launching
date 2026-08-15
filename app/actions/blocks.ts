"use server"

import { revalidatePath } from "next/cache"
import { requireUser } from "@/lib/auth"
import { createBlock, deleteBlock, reorderBlocks, updateBlock } from "@/lib/services/blocks"
import type { ViewBlock } from "@/lib/blocks"

export async function createBlockAction(
  pageId: string,
  input?: { type?: string; content?: string; checked?: boolean | null; emoji?: string | null },
) {
  const user = await requireUser()
  const block = await createBlock(pageId, user.id, input)
  revalidatePath("/")
  return block
}

export async function updateBlockAction(
  blockId: string,
  input: Partial<ViewBlock> & { content?: string; checked?: boolean | null; emoji?: string | null; type?: string },
) {
  const user = await requireUser()
  const block = await updateBlock(blockId, user.id, input)
  revalidatePath("/")
  return block
}

export async function deleteBlockAction(blockId: string) {
  const user = await requireUser()
  await deleteBlock(blockId, user.id)
  revalidatePath("/")
}

export async function reorderBlocksAction(pageId: string, orderedIds: string[]) {
  const user = await requireUser()
  await reorderBlocks(pageId, user.id, orderedIds)
  revalidatePath("/")
}
