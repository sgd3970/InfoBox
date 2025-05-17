import { MongoClient, type MongoClientOptions } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI 환경 변수가 설정되지 않았습니다.")
}

const uri = process.env.MONGODB_URI
const options: MongoClientOptions = {
  maxPoolSize: 10, // 최대 연결 풀 크기
  minPoolSize: 5, // 최소 연결 풀 크기
  maxIdleTimeMS: 30000, // 최대 유휴 시간 (30초)
  connectTimeoutMS: 10000, // 연결 제한 시간 (10초)
  socketTimeoutMS: 45000, // 소켓 제한 시간 (45초)
  serverSelectionTimeoutMS: 15000, // 서버 선택 제한 시간 (15초로 증가)
  heartbeatFrequencyMS: 10000, // 하트비트 빈도 (10초)
  retryWrites: true, // 쓰기 재시도
  w: "majority", // 쓰기 확인
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

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
    //console.log("MongoDB에 성공적으로 연결되었습니다.")

    // 연결 이벤트 리스너
    client.on("serverHeartbeatFailed", (event) => {
      console.error("MongoDB 서버 하트비트 실패:", event)
    })

    // client.on("serverHeartbeatSucceeded", () => {
    //   console.log("MongoDB 서버 하트비트 성공")
    // })

    client.on("error", (error) => {
      console.error("MongoDB 연결 오류:", error)
    })
  })
  .catch((error) => {
    console.error("MongoDB 연결 실패:", error)
  })

export default clientPromise

// 연결 풀 상태 가져오기
export async function getConnectionStatus() {
  try {
    const client = await clientPromise
    const admin = client.db().admin()

    // 서버 상태 가져오기
    const serverStatus = await admin.serverStatus()

    // 연결 풀 정보 추출
    const connectionInfo = {
      current: serverStatus.connections?.current || 0,
      available: serverStatus.connections?.available || 0,
      totalCreated: serverStatus.connections?.totalCreated || 0,
      active: serverStatus.globalLock?.activeClients?.total || 0,
      maxPoolSize: options.maxPoolSize,
      minPoolSize: options.minPoolSize,
      maxIdleTimeMS: options.maxIdleTimeMS,
      connectTimeoutMS: options.connectTimeoutMS,
    }

    return connectionInfo
  } catch (error) {
    console.error("연결 상태 가져오기 오류:", error)
    return null
  }
}
