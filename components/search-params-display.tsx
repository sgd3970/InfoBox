"use client"

import { useSearchParams } from "next/navigation"

export function SearchParamsDisplay() {
  const searchParams = useSearchParams()

  return (
    <div>
      <h3>Search Parameters:</h3>
      <ul>
        {Array.from(searchParams.entries()).map(([key, value]) => (
          <li key={key}>
            {key}: {value}
          </li>
        ))}
      </ul>
    </div>
  )
}
