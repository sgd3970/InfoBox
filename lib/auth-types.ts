export interface User {
  id: string
  name: string
  email: string
  image?: string
  role: "user" | "admin"
}

export interface Session {
  user: User
  expires: string
}

export interface AuthState {
  user: User | null
  status: "loading" | "authenticated" | "unauthenticated"
}
