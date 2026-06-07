// Step 8: Replace with decision detail view when implemented
export default async function JournalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div className="p-8">
      <h1 className="text-lg font-semibold text-foreground mb-2">Decision #{id}</h1>
      <p className="text-sm text-muted-foreground">Decision detail view coming soon.</p>
    </div>
  )
}
