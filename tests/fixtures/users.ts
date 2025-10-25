/**
 * 测试用户数据
 */
export const testUsers = {
  validUser: {
    email: 'test@example.com',
    password: 'TestPass123',
    name: 'Test User'
  },

  adminUser: {
    email: 'admin@example.com',
    password: 'AdminPass123',
    name: 'Admin User',
    role: 'admin'
  },

  unverifiedUser: {
    email: 'unverified@example.com',
    password: 'TestPass123',
    name: 'Unverified User',
    emailVerified: false
  },

  invalidPasswords: {
    tooShort: 'Test1',
    noUpperCase: 'testpass123',
    noLowerCase: 'TESTPASS123',
    noNumber: 'TestPassword'
  },

  invalidEmails: [
    'invalid',
    'invalid@',
    '@example.com',
    'test@.com'
  ]
}

/**
 * 注册请求数据
 */
export const registerRequests = {
  valid: {
    email: 'newuser@example.com',
    password: 'NewPass123',
    name: 'New User',
    examType: 'cale'
  },

  weakPassword: {
    email: 'weak@example.com',
    password: 'weak',
    name: 'Weak User',
    examType: 'cale'
  },

  invalidEmail: {
    email: 'invalid-email',
    password: 'ValidPass123',
    name: 'Invalid Email User',
    examType: 'cale'
  },

  missingFields: {
    email: 'missing@example.com',
    // 缺少 password
    name: 'Missing Fields',
    examType: 'cale'
  }
}

/**
 * 登录请求数据
 */
export const loginRequests = {
  valid: {
    email: 'test@example.com',
    password: 'TestPass123'
  },

  wrongPassword: {
    email: 'test@example.com',
    password: 'WrongPassword123'
  },

  nonExistentUser: {
    email: 'nonexistent@example.com',
    password: 'TestPass123'
  }
}
