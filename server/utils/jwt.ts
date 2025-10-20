import jwt from 'jsonwebtoken'

// JWT 密钥配置
const JWT_SECRET = process.env.JWT_SECRET || 'cale-exam-secret-key-change-in-production'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'cale-exam-refresh-secret-key-change-in-production'

// Token 过期时间
const ACCESS_TOKEN_EXPIRES_IN = '2h'  // Access Token: 2小时
const REFRESH_TOKEN_EXPIRES_IN = '7d' // Refresh Token: 7天

export interface JWTPayload {
  userId: string
  email: string
  role: string
  subscribedExams: string[]
}

export interface RefreshTokenPayload {
  userId: string
  tokenVersion: number
}

/**
 * 生成 Access Token
 */
export function signAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN
  })
}

/**
 * 生成 Refresh Token
 */
export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN
  })
}

/**
 * 验证 Access Token
 */
export function verifyAccessToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    throw new Error('Invalid or expired access token')
  }
}

/**
 * 验证 Refresh Token
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload
  } catch (error) {
    throw new Error('Invalid or expired refresh token')
  }
}

/**
 * 解码 Token (不验证)
 */
export function decodeToken(token: string): any {
  return jwt.decode(token)
}
