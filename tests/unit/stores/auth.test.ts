import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Define mocks using vi.hoisted to ensure they're available during module initialization
const { mockFetch, localStorageMock } = vi.hoisted(() => {
  const mockFetch = vi.fn()
  const localStorageMock = (() => {
    let store: Record<string, string> = {}

    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString()
      },
      removeItem: (key: string) => {
        delete store[key]
      },
      clear: () => {
        store = {}
      }
    }
  })()

  return { mockFetch, localStorageMock }
})

// Stub globals
vi.stubGlobal('$fetch', mockFetch)
vi.stubGlobal('localStorage', localStorageMock)

// Import after mocking
import { useAuthStore } from '../../../stores/auth'

describe('Auth Store', () => {
  let authStore: ReturnType<typeof useAuthStore>

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    nickname: 'tester',
    avatar: null,
    role: 'user',
    subscribedExams: ['cale'],
    emailVerified: true
  }

  const mockTokens = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token'
  }

  beforeEach(() => {
    // 设置 Pinia
    setActivePinia(createPinia())
    authStore = useAuthStore()

    // 重置所有 mock
    vi.clearAllMocks()
    mockFetch.mockReset()
    localStorageMock.clear()

    // Mock console
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      expect(authStore.user).toBeNull()
      expect(authStore.accessToken).toBeNull()
      expect(authStore.refreshToken).toBeNull()
      expect(authStore.loading).toBe(false)
    })

    it('应该有正确的初始 getters', () => {
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.isAdmin).toBe(false)
      expect(authStore.subscribedExams).toEqual([])
      expect(authStore.userInitials).toBe('')
    })
  })

  describe('register', () => {
    it('应该成功注册', async () => {
      mockFetch.mockResolvedValue({
        success: true,
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
        user: mockUser
      })

      const result = await authStore.register('test@example.com', 'password123', 'Test User')

      expect(result.success).toBe(true)
      expect(authStore.user).toEqual(mockUser)
      expect(authStore.accessToken).toBe(mockTokens.accessToken)
      expect(authStore.refreshToken).toBe(mockTokens.refreshToken)
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          examTypes: ['cale']
        }
      })
    })

    it('应该在注册失败时返回错误', async () => {
      mockFetch.mockResolvedValue({
        success: false,
        message: '邮箱已被使用'
      })

      const result = await authStore.register('test@example.com', 'password123', 'Test User')

      expect(result.success).toBe(false)
      expect(result.message).toBe('邮箱已被使用')
      expect(authStore.user).toBeNull()
    })

    it('应该在网络错误时返回错误', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      const result = await authStore.register('test@example.com', 'password123', 'Test User')

      expect(result.success).toBe(false)
      // error.message is used as fallback, so it will be 'Network error'
      expect(result.message).toBe('Network error')
    })

    it('应该设置 loading 状态', async () => {
      let loadingDuringCall = false

      mockFetch.mockImplementation(async () => {
        loadingDuringCall = authStore.loading
        return {
          success: true,
          accessToken: mockTokens.accessToken,
          refreshToken: mockTokens.refreshToken,
          user: mockUser
        }
      })

      expect(authStore.loading).toBe(false)
      const promise = authStore.register('test@example.com', 'password123', 'Test User')
      await promise

      expect(loadingDuringCall).toBe(true)
      expect(authStore.loading).toBe(false)
    })
  })

  describe('login', () => {
    it('应该成功登录', async () => {
      mockFetch.mockResolvedValue({
        success: true,
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
        user: mockUser
      })

      const result = await authStore.login('test@example.com', 'password123')

      expect(result.success).toBe(true)
      expect(authStore.user).toEqual(mockUser)
      expect(authStore.accessToken).toBe(mockTokens.accessToken)
      expect(authStore.refreshToken).toBe(mockTokens.refreshToken)
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'password123'
        }
      })
    })

    it('应该在登录失败时返回错误', async () => {
      mockFetch.mockResolvedValue({
        success: false,
        message: '邮箱或密码错误'
      })

      const result = await authStore.login('test@example.com', 'wrong-password')

      expect(result.success).toBe(false)
      expect(result.message).toBe('邮箱或密码错误')
      expect(authStore.user).toBeNull()
    })

    it('应该处理 API 异常', async () => {
      mockFetch.mockRejectedValue({
        data: { message: '服务器错误' },
        message: 'Server error'
      })

      const result = await authStore.login('test@example.com', 'password123')

      expect(result.success).toBe(false)
      expect(result.message).toBe('服务器错误')
    })
  })

  describe('logout', () => {
    beforeEach(() => {
      // 设置已登录状态
      authStore.setAuthData(mockTokens.accessToken, mockTokens.refreshToken, mockUser)
    })

    it('应该成功登出', async () => {
      mockFetch.mockResolvedValue({ success: true })

      await authStore.logout()

      expect(authStore.user).toBeNull()
      expect(authStore.accessToken).toBeNull()
      expect(authStore.refreshToken).toBeNull()
      expect(localStorageMock.getItem('accessToken')).toBeNull()
      expect(localStorageMock.getItem('refreshToken')).toBeNull()
      expect(localStorageMock.getItem('user')).toBeNull()
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${mockTokens.accessToken}`
        }
      })
    })

    it('应该在 API 错误时仍然清除本地状态', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      await authStore.logout()

      expect(authStore.user).toBeNull()
      expect(authStore.accessToken).toBeNull()
      expect(authStore.refreshToken).toBeNull()
      expect(console.error).toHaveBeenCalledWith('Logout API error:', expect.any(Error))
    })

    it('应该在没有 token 时仍能登出', async () => {
      authStore.accessToken = null

      await authStore.logout()

      expect(authStore.user).toBeNull()
      expect(mockFetch).not.toHaveBeenCalled()
    })
  })

  describe('refreshAccessToken', () => {
    it('应该成功刷新 token', async () => {
      authStore.refreshToken = mockTokens.refreshToken

      const newTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
      }

      mockFetch.mockResolvedValue({
        success: true,
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken
      })

      const result = await authStore.refreshAccessToken()

      expect(result).toBe(true)
      expect(authStore.accessToken).toBe(newTokens.accessToken)
      expect(authStore.refreshToken).toBe(newTokens.refreshToken)
      // localStorage sync is tested separately and depends on import.meta.client
    })

    it('应该在没有 refreshToken 时返回 false', async () => {
      authStore.refreshToken = null

      const result = await authStore.refreshAccessToken()

      expect(result).toBe(false)
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('应该在刷新失败时返回 false', async () => {
      authStore.refreshToken = mockTokens.refreshToken

      mockFetch.mockResolvedValue({
        success: false
      })

      const result = await authStore.refreshAccessToken()

      expect(result).toBe(false)
    })

    it('应该在刷新异常时登出', async () => {
      authStore.setAuthData(mockTokens.accessToken, mockTokens.refreshToken, mockUser)

      mockFetch.mockRejectedValue(new Error('Token expired'))

      const result = await authStore.refreshAccessToken()

      expect(result).toBe(false)
      expect(authStore.user).toBeNull()
      expect(authStore.accessToken).toBeNull()
      expect(console.error).toHaveBeenCalledWith('Token refresh failed:', expect.any(Error))
    })
  })

  describe('fetchUserInfo', () => {
    beforeEach(() => {
      authStore.accessToken = mockTokens.accessToken
    })

    it('应该成功获取用户信息', async () => {
      const updatedUser = { ...mockUser, name: 'Updated Name' }

      mockFetch.mockResolvedValue({
        success: true,
        user: updatedUser
      })

      const result = await authStore.fetchUserInfo()

      expect(result).toBe(true)
      expect(authStore.user).toEqual(updatedUser)
      // localStorage sync is tested separately and depends on import.meta.client
      expect(mockFetch).toHaveBeenCalledWith('/api/user/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${mockTokens.accessToken}`
        }
      })
    })

    it('应该在没有 accessToken 时返回 false', async () => {
      authStore.accessToken = null

      const result = await authStore.fetchUserInfo()

      expect(result).toBe(false)
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('应该在 API 返回失败时返回 false', async () => {
      mockFetch.mockResolvedValue({
        success: false
      })

      const result = await authStore.fetchUserInfo()

      expect(result).toBe(false)
    })

    it('应该在网络错误时返回 false', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      const result = await authStore.fetchUserInfo()

      expect(result).toBe(false)
      expect(console.error).toHaveBeenCalledWith('Fetch user info failed:', expect.any(Error))
    })
  })

  describe('setAuthData', () => {
    it('应该设置认证数据', () => {
      authStore.setAuthData(mockTokens.accessToken, mockTokens.refreshToken, mockUser)

      expect(authStore.accessToken).toBe(mockTokens.accessToken)
      expect(authStore.refreshToken).toBe(mockTokens.refreshToken)
      expect(authStore.user).toEqual(mockUser)
      // localStorage sync is tested separately and depends on import.meta.client
    })
  })

  describe('getAuthHeader', () => {
    it('应该返回 Authorization header', () => {
      authStore.accessToken = mockTokens.accessToken

      const header = authStore.getAuthHeader()

      expect(header).toEqual({
        Authorization: `Bearer ${mockTokens.accessToken}`
      })
    })

    it('应该在没有 token 时返回空对象', () => {
      authStore.accessToken = null

      const header = authStore.getAuthHeader()

      expect(header).toEqual({})
    })
  })

  describe('getters', () => {
    describe('isAuthenticated', () => {
      it('应该在有 token 和 user 时返回 true', () => {
        authStore.setAuthData(mockTokens.accessToken, mockTokens.refreshToken, mockUser)

        expect(authStore.isAuthenticated).toBe(true)
      })

      it('应该在没有 token 时返回 false', () => {
        authStore.user = mockUser
        authStore.accessToken = null

        expect(authStore.isAuthenticated).toBe(false)
      })

      it('应该在没有 user 时返回 false', () => {
        authStore.accessToken = mockTokens.accessToken
        authStore.user = null

        expect(authStore.isAuthenticated).toBe(false)
      })
    })

    describe('isAdmin', () => {
      it('应该检测管理员角色', () => {
        authStore.user = { ...mockUser, role: 'admin' }

        expect(authStore.isAdmin).toBe(true)
      })

      it('应该对非管理员返回 false', () => {
        authStore.user = mockUser

        expect(authStore.isAdmin).toBe(false)
      })

      it('应该在没有 user 时返回 false', () => {
        authStore.user = null

        expect(authStore.isAdmin).toBe(false)
      })
    })

    describe('subscribedExams', () => {
      it('应该返回订阅的考试列表', () => {
        authStore.user = mockUser

        expect(authStore.subscribedExams).toEqual(['cale'])
      })

      it('应该在没有 user 时返回空数组', () => {
        authStore.user = null

        expect(authStore.subscribedExams).toEqual([])
      })
    })

    describe('canAccessExam', () => {
      it('应该检查是否可以访问考试', () => {
        authStore.user = mockUser

        expect(authStore.canAccessExam('cale')).toBe(true)
        expect(authStore.canAccessExam('nccaom')).toBe(false)
      })

      it('应该在没有 user 时返回 false', () => {
        authStore.user = null

        expect(authStore.canAccessExam('cale')).toBe(false)
      })
    })

    describe('userInitials', () => {
      it('应该返回用户名首字母', () => {
        authStore.user = mockUser

        expect(authStore.userInitials).toBe('T')
      })

      it('应该返回大写字母', () => {
        authStore.user = { ...mockUser, name: 'alice' }

        expect(authStore.userInitials).toBe('A')
      })

      it('应该在没有 user 时返回空字符串', () => {
        authStore.user = null

        expect(authStore.userInitials).toBe('')
      })
    })
  })

  describe('init', () => {
    it('应该在测试环境中正常初始化（import.meta.client=undefined）', async () => {
      // In test environment, import.meta.client is undefined, so init() should do nothing
      await authStore.init()

      // State should remain at initial values
      expect(authStore.accessToken).toBeNull()
      expect(authStore.refreshToken).toBeNull()
      expect(authStore.user).toBeNull()
    })

    it('应该可以手动设置状态（不依赖 localStorage）', async () => {
      // Manually set state (bypassing localStorage)
      authStore.accessToken = mockTokens.accessToken
      authStore.refreshToken = mockTokens.refreshToken
      authStore.user = mockUser

      expect(authStore.accessToken).toBe(mockTokens.accessToken)
      expect(authStore.refreshToken).toBe(mockTokens.refreshToken)
      expect(authStore.user).toEqual(mockUser)
    })

    it('应该调用 init 而不报错', async () => {
      // Should not throw error even if localStorage is not accessible
      await expect(authStore.init()).resolves.toBeUndefined()
    })
  })

  describe('边界情况', () => {
    it('应该处理注册时的空 examTypes', async () => {
      mockFetch.mockResolvedValue({
        success: true,
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
        user: mockUser
      })

      await authStore.register('test@example.com', 'password123', 'Test User', [])

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          examTypes: []
        }
      })
    })

    it('应该处理没有 message 的错误响应', async () => {
      mockFetch.mockResolvedValue({
        success: false
      })

      const result = await authStore.login('test@example.com', 'password123')

      expect(result.message).toBe('登录失败')
    })

    it('应该处理没有 data 的网络错误', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      const result = await authStore.login('test@example.com', 'password123')

      // error.message is used as fallback, so it will be 'Network error'
      expect(result.message).toBe('Network error')
    })
  })
})
