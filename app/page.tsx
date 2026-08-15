import { requireUser } from "@/lib/auth"
import { listPages } from "@/lib/services/pages"
import { Workspace } from "@/components/notion/workspace"

export default async function Page() {
  const user = await requireUser()
  const pages = await listPages(user.id)

  return <Workspace user={user} initialPages={pages} />
}
