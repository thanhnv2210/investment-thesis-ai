export const dynamic = "force-dynamic"

import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { JournalList } from "@/components/journal/journal-list"
import { Separator } from "@/components/ui/separator"

export default function JournalPage() {
  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="flex items-center justify-between px-8 mb-6">
        <h1 className="text-lg font-semibold text-foreground">Decision Journal</h1>
        <Link
          href="/new"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline underline-offset-4"
        >
          <PlusCircle className="size-4" />
          New Review
        </Link>
      </div>
      <Separator />
      <JournalList />
    </div>
  )
}
