/// <reference lib="webworker" />

// 서비스 워커 타입 선언
declare const self: ServiceWorkerGlobalScope

// 캐시할 에셋 목록
const CACHE_NAME = "infobox-cache-v1"
const ASSETS_TO_CACHE = [
  "/",
  "/blog",
  "/about",
  "/offline",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
]

// 서비스 워커 설치 시 에셋 캐싱
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE)
    }),
  )
  // 새 서비스 워커 즉시 활성화
  self.skipWaiting()
})

// 서비스 워커 활성화 시 이전 캐시 정리
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => cacheName !== CACHE_NAME).map((cacheName) => caches.delete(cacheName)),
      )
    }),
  )
  // 새 서비스 워커가 모든 클라이언트 제어
  self.clients.claim()
})

// 네트워크 요청 가로채기
self.addEventListener("fetch", (event) => {
  // API 요청은 캐싱하지 않음
  if (event.request.url.includes("/api/")) {
    return
  }

  // HTML 페이지 요청 처리
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match("/offline")
      }),
    )
    return
  }

  // 이미지 요청 처리
  if (event.request.destination === "image") {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return (
          cachedResponse ||
          fetch(event.request)
            .then((networkResponse) => {
              // 성공적으로 가져온 응답을 캐시에 저장
              if (networkResponse && networkResponse.ok) {
                const cacheCopy = networkResponse.clone()
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, cacheCopy)
                })
              }
              return networkResponse
            })
            .catch(() => {
              // 이미지를 가져올 수 없는 경우 기본 이미지 제공
              return caches.match("/placeholder.svg")
            })
        )
      }),
    )
    return
  }

  // 기타 요청 처리 (스타일, 스크립트 등)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).then((networkResponse) => {
          // 성공적으로 가져온 응답을 캐시에 저장
          if (networkResponse && networkResponse.ok) {
            const cacheCopy = networkResponse.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, cacheCopy)
            })
          }
          return networkResponse
        })
      )
    }),
  )
})

// 푸시 알림 수신 처리
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {}
  const title = data.title || "InfoBox 알림"
  const options = {
    body: data.body || "새로운 소식이 있습니다.",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    data: {
      url: data.url || "/",
    },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// 푸시 알림 클릭 처리
self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const url = event.notification.data?.url || "/"

  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      // 이미 열린 창이 있으면 포커스
      for (const client of clientList) {
        if (client.url === url && "focus" in client) {
          return client.focus()
        }
      }
      // 열린 창이 없으면 새 창 열기
      if (self.clients.openWindow) {
        return self.clients.openWindow(url)
      }
    }),
  )
})

export {}
