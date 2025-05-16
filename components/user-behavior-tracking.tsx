"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export function UserBehaviorTracking() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // 페이지 뷰 추적
    const trackPageView = () => {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "")
      console.log(`Page view: ${url}`)

      // 실제 구현에서는 아래와 같이 분석 서비스로 전송
      // window.gtag?.('config', 'G-XXXXXXXXXX', {
      //   page_path: url,
      // });
    }

    // 초기 페이지 뷰 추적
    trackPageView()

    // 사용자 상호작용 추적 설정
    const trackInteraction = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const interactionType = target.tagName
      const interactionText = target.textContent?.trim().substring(0, 50)
      const interactionUrl = (target as HTMLAnchorElement).href

      if (interactionType === "A" || target.closest("a")) {
        console.log(`Link click: ${interactionText || interactionUrl}`)

        // 실제 구현에서는 아래와 같이 분석 서비스로 전송
        // window.gtag?.('event', 'link_click', {
        //   event_category: 'engagement',
        //   event_label: interactionText || interactionUrl,
        // });
      } else if (interactionType === "BUTTON" || target.closest("button")) {
        console.log(`Button click: ${interactionText}`)

        // 실제 구현에서는 아래와 같이 분석 서비스로 전송
        // window.gtag?.('event', 'button_click', {
        //   event_category: 'engagement',
        //   event_label: interactionText,
        // });
      }
    }

    // 스크롤 깊이 추적 설정
    const trackScrollDepth = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = document.documentElement.clientHeight
      const scrollPercentage = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100)

      // 25%, 50%, 75%, 90% 스크롤 깊이에 도달했을 때 이벤트 발생
      const scrollMilestones = [25, 50, 75, 90]

      scrollMilestones.forEach((milestone) => {
        if (scrollPercentage >= milestone && !window.sessionStorage.getItem(`scroll_${milestone}`)) {
          console.log(`Scroll depth: ${milestone}%`)
          window.sessionStorage.setItem(`scroll_${milestone}`, "true")

          // 실제 구현에서는 아래와 같이 분석 서비스로 전송
          // window.gtag?.('event', 'scroll_depth', {
          //   event_category: 'engagement',
          //   event_label: `${milestone}%`,
          //   non_interaction: true,
          // });
        }
      })
    }

    // 체류 시간 추적 설정
    const startTime = Date.now()
    const trackTimeOnPage = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000)
      console.log(`Time on page: ${timeSpent} seconds`)

      // 실제 구현에서는 아래와 같이 분석 서비스로 전송
      // window.gtag?.('event', 'time_on_page', {
      //   event_category: 'engagement',
      //   event_label: pathname,
      //   value: timeSpent,
      //   non_interaction: true,
      // });
    }

    // 이벤트 리스너 등록
    document.addEventListener("click", trackInteraction)
    window.addEventListener("scroll", trackScrollDepth)
    window.addEventListener("beforeunload", trackTimeOnPage)

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      document.removeEventListener("click", trackInteraction)
      window.removeEventListener("scroll", trackScrollDepth)
      window.removeEventListener("beforeunload", trackTimeOnPage)
    }
  }, [pathname, searchParams])

  return null
}
