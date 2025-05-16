"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
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
  const [auth, setAuth] = useState<AuthState>(initialState)

  // 세션 확인
  useEffect(() => {
    const checkSession = async () => {
      try {
        // 실제 환경에서는 API 호출을 통해 세션을 확인합니다.
        // 여기서는 로컬 스토리지를 사용하여 시뮬레이션합니다.
        const storedUser = localStorage.getItem("user")

        if (storedUser) {
          const user = JSON.parse(storedUser) as User
          setAuth({
            user,
            status: "authenticated",
          })
        } else {
          setAuth({
            user: null,
            status: "unauthenticated",
          })
        }
      } catch (error) {
        console.error("세션 확인 중 오류 발생:", error)
        setAuth({
          user: null,
          status: "unauthenticated",
        })
      }
    }

    checkSession()
  }, [])

  // 로그인 함수
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("로그인 시도:", email, password)

      // 관리자 계정 시뮬레이션
      if (email === "admin@example.com" && password === "password") {
        const user: User = {
          id: "1",
          name: "관리자",
          email: "admin@example.com",
          role: "admin",
        }

        localStorage.setItem("user", JSON.stringify(user))

        setAuth({
          user,
          status: "authenticated",
        })

        console.log("관리자 로그인 성공")
        return true
      }

      // 일반 사용자 계정 시뮬레이션
      if (email === "user@example.com" && password === "password") {
        const user: User = {
          id: "2",
          name: "사용자",
          email: "user@example.com",
          role: "user",
        }

        localStorage.setItem("user", JSON.stringify(user))

        setAuth({
          user,
          status: "authenticated",
        })

        console.log("사용자 로그인 성공")
        return true
      }

      console.log("로그인 실패: 일치하는 계정 없음")
      return false
    } catch (error) {
      console.error("로그인 중 오류 발생:", error)
      return false
    }
  }

  // 로그아웃 함수
  const logout = async (): Promise<void> => {
    try {
      // 실제 환경에서는 API 호출을 통해 로그아웃합니다.
      // 여기서는 로컬 스토리지를 사용하여 시뮬레이션합니다.
      localStorage.removeItem("user")

      setAuth({
        user: null,
        status: "unauthenticated",
      })
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
