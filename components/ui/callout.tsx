import type { ReactNode } from "react"
import { AlertCircle, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface CalloutProps {
  children?: ReactNode
  type?: "default" | "warning" | "danger" | "info"
  icon?: ReactNode
  title?: string
}

export function Callout({ children, type = "default", icon, title }: CalloutProps) {
  const IconComponent = {
    default: Info,
    info: Info,
    warning: AlertTriangle,
    danger: AlertCircle,
  }[type]

  return (
    <div
      className={cn(
        "my-6 flex gap-4 rounded-lg border p-4",
        type === "default" &&
          "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100",
        type === "info" &&
          "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100",
        type === "warning" &&
          "border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-100",
        type === "danger" &&
          "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100",
      )}
    >
      <div className="mt-1 flex-shrink-0">{icon || <IconComponent className="h-5 w-5" />}</div>
      <div>
        {title && <p className="font-medium">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  )
}
