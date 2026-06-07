"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, PlusCircle, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/",    label: "Journal",   icon: LayoutDashboard },
  { href: "/new", label: "New Review", icon: PlusCircle },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-52 shrink-0 flex flex-col border-r border-border bg-card h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-border">
        <BookOpen className="size-5 text-primary" />
        <span className="text-sm font-semibold text-foreground leading-tight">
          Thesis AI
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-2 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
              pathname === href
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border">
        <p className="text-xs text-muted-foreground">Not financial advice.</p>
      </div>
    </aside>
  )
}
