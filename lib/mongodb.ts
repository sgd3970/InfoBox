import { MongoClient, type MongoClientOptions } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI 환경 변수가 설정되지 않았습니다.")
}

const uri = process.env.MONGODB_URI
const options: MongoClientOptions = {
  maxPoolSize:             10,
  retryWrites:             true,
  w:                       "majority",
  serverSelectionTimeoutMS: 10000,
}

let client: MongoClient | null = null

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

/** 최초 호출 시에만 연결, 이후엔 재사용 */
export async function getMongoClient(): Promise<MongoClient> {
  if (client) {
    try {
      // Check if the client is connected by trying to access a database
      await client.db().admin().ping();
      return client;
    } catch (e) {
      // If ping fails, assume the connection is not valid and create a new client
      client = null;
    }
  }
  client = new MongoClient(uri, options)
  await client.connect()    // ← 여기에만 DNS 조회+연결
  return client
}

/** DB 핸들러 얻어올 때 사용 */
export async function getDatabase() {
  const c = await getMongoClient()
  return c.db()
}

// 유틸리티 함수들 (필요하다면)
export async function getConnectionStatus() {
  try {
    const client = await getMongoClient()
    const admin = client.db().admin()
    const serverStatus = await admin.serverStatus()

    return {
      current: serverStatus.connections?.current || 0,
      available: serverStatus.connections?.available || 0,
      maxPoolSize: options.maxPoolSize,
      serverSelectionTimeoutMS: options.serverSelectionTimeoutMS,
    }
  } catch (error) {
    console.error("연결 상태 가져오기 오류:", error)
    return null
  }
}

export async function closeConnection() {
  if (client) {
    await client.close()
    client = null
    if (process.env.NODE_ENV === "development" && global._mongoClientPromise) {
       global._mongoClientPromise = undefined;
    }
  }
}
