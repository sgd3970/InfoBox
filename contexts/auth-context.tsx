"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { signIn, signOut, useSession } from "next-auth/react"
import type { AuthState, User } from "@/lib/auth-types"

// 초기 상태
const initialState: AuthState = {
  user: null,
  status: "loading",
}

// 컨텍스트 생성
const AuthContext = createContext<{
  auth: AuthState
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  register: (name: string, email: string, password: string) => Promise<boolean>
}>({
  auth: initialState,
  login: async () => false,
  logout: async () => {},
  register: async () => false,
})

// 인증 제공자 컴포넌트
export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [auth, setAuth] = useState<AuthState>(initialState)

  // 세션 상태 동기화
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
          setAuth({
        user: {
          id: session.user.id,
          name: session.user.name || "",
          email: session.user.email || "",
          role: session.user.role as "user" | "admin",
        },
            status: "authenticated",
          })
    } else if (status === "unauthenticated") {
          setAuth({
            user: null,
            status: "unauthenticated",
          })
        }
  }, [status, session])

  // 로그인 함수 수정
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        })

      if (result?.error) {
        console.error("로그인 실패:", result.error)
        return false
      }

      return result?.ok || false
    } catch (error) {
      console.error("로그인 중 오류 발생:", error)
      return false
    }
  }

  // 로그아웃 함수 수정
  const logout = async (): Promise<void> => {
    try {
      await signOut({ redirect: false })
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error)
    }
  }

  // 회원가입 함수
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      console.log("회원가입 시도:", name, email)

      // 실제 환경에서는 API 호출을 통해 회원가입합니다.
      // 여기서는 시뮬레이션을 위해 간단한 검증을 수행합니다.

      // 이메일 중복 확인 시뮬레이션
      if (email === "admin@example.com" || email === "user@example.com") {
        console.log("회원가입 실패: 이메일 중복")
        return false
      }

      // 회원가입 성공 시뮬레이션
      const user: User = {
        id: Math.random().toString(36).substring(2, 9),
        name,
        email,
        role: "user",
      }

      localStorage.setItem("user", JSON.stringify(user))

      setAuth({
        user,
        status: "authenticated",
      })

      console.log("회원가입 성공")
      return true
    } catch (error) {
      console.error("회원가입 중 오류 발생:", error)
      return false
    }
  }

  return <AuthContext.Provider value={{ auth, login, logout, register }}>{children}</AuthContext.Provider>
}

// 인증 컨텍스트 사용을 위한 훅
export function useAuth() {
  return useContext(AuthContext)
}
