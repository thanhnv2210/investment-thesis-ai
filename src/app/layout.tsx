import type { Metadata } from "next"
import "./globals.css"
import { Sidebar } from "@/components/nav/sidebar"

export const metadata: Metadata = {
  title: "Investment Thesis AI",
  description: "Stress-test your investment decisions with AI",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark h-full">
      <body className="h-full flex antialiased">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  )
}
