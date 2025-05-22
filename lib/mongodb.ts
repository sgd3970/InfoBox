import { MongoClient, type MongoClientOptions } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI 환경 변수가 설정되지 않았습니다.")
}

const uri = process.env.MONGODB_URI
const options: MongoClientOptions = {
  maxPoolSize: 10,          // 적절한 동시 처리 수용
  retryWrites: true,        // 자동 재시도
  w: "majority",            // 데이터 정합성 보장
  serverSelectionTimeoutMS: 10000,  // 약간 넉넉하게 설정 (기본은 30000)
}

// 전역 변수로 클라이언트 인스턴스 저장
let client: MongoClient | null = null
let clientPromise: Promise<MongoClient> | null = null

// MongoDB 클라이언트를 lazy하게 초기화하는 함수
export async function getMongoClient() {
  if (clientPromise) {
    return clientPromise
  }

  if (process.env.NODE_ENV === "development") {
    // 개발 환경에서는 전역 변수 사용하여 연결 재사용
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>
    }

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options)
      globalWithMongo._mongoClientPromise = client.connect()
    }
    clientPromise = globalWithMongo._mongoClientPromise
  } else {
    // 프로덕션 환경에서는 새 인스턴스 생성
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
  }

  // 연결 상태 모니터링
  clientPromise
    .then((client) => {
      client.on("error", (error) => {
        console.error("MongoDB 연결 오류:", error)
      })
    })
    .catch((error) => {
      console.error("MongoDB 연결 실패:", error)
      // 연결 실패 시 클라이언트 초기화
      client = null
      clientPromise = null
    })

  return clientPromise
}

// 연결 풀 상태 가져오기 (lazy하게 수정)
export async function getConnectionStatus() {
  try {
    const client = await getMongoClient()
    const admin = client.db().admin()

    // 서버 상태 가져오기
    const serverStatus = await admin.serverStatus()

    // 연결 풀 정보 추출 (필수 정보만)
    const connectionInfo = {
      current: serverStatus.connections?.current || 0,
      available: serverStatus.connections?.available || 0,
      maxPoolSize: options.maxPoolSize,
      serverSelectionTimeoutMS: options.serverSelectionTimeoutMS,
    }

    return connectionInfo
  } catch (error) {
    console.error("연결 상태 가져오기 오류:", error)
    return null
  }
}

// 데이터베이스 인스턴스 가져오기 (lazy하게 수정)
export async function getDatabase() {
  const client = await getMongoClient()
  return client.db()
}

// 연결 종료 함수 추가
export async function closeConnection() {
  if (client) {
    await client.close()
    client = null
    clientPromise = null
  }
}
