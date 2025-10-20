import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

/**
 * 加密密码
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * 验证密码
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

/**
 * 验证密码强度
 * 至少8位，包含大小写字母和数字
 */
export function validatePasswordStrength(password: string): {
  valid: boolean
  message?: string
} {
  if (password.length < 8) {
    return { valid: false, message: '密码至少需要8个字符' }
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: '密码必须包含小写字母' }
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: '密码必须包含大写字母' }
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: '密码必须包含数字' }
  }

  // 可选：检查特殊字符
  // if (!/[!@#$%^&*]/.test(password)) {
  //   return { valid: false, message: '密码必须包含特殊字符 !@#$%^&*' }
  // }

  return { valid: true }
}

/**
 * 验证邮箱格式
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
