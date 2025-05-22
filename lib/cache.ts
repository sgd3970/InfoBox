import Redis from '@vercel/kv'

// 캐시 키 생성 유틸리티
export function createCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      if (params[key] !== undefined && params[key] !== null) {
        acc[key] = params[key]
      }
      return acc
    }, {} as Record<string, any>)

  return `${prefix}:${JSON.stringify(sortedParams)}`
}

// 캐시된 데이터 가져오기
export async function getCachedData<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = 300 // 기본 5분
): Promise<T> {
  try {
    const cached = await Redis.get(key)
    if (cached) {
      return JSON.parse(cached as string) as T
    }
    const data = await fn()
    await Redis.set(key, JSON.stringify(data), { ex: ttl })
    return data
  } catch (error) {
    console.error('캐시 처리 중 오류:', error)
    return fn()
  }
}

// 캐시 무효화
export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const keys = await Redis.keys(pattern)
    if (keys.length > 0) {
      await Redis.del(...keys)
    }
  } catch (error) {
    console.error('캐시 무효화 중 오류:', error)
  }
}

// 배치 처리 유틸리티
export async function processInBatches<T>(
  items: T[],
  batchSize: number,
  processFn: (batch: T[]) => Promise<void>,
  onProgress?: (progress: number) => void
): Promise<void> {
  const total = items.length
  for (let i = 0; i < total; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    await processFn(batch)
    if (onProgress) {
      const progress = Math.min(100, Math.round((i + batch.length) / total * 100))
      onProgress(progress)
    }
  }
}

// 재시도 유틸리티
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
      }
    }
  }
  throw lastError
}