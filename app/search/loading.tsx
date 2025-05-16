export default function Loading() {
  return (
    <div className="container py-10">
      <h1 className="text-4xl font-bold mb-8">검색</h1>
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    </div>
  )
}
