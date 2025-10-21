import { defineStore } from 'pinia'

interface User {
  id: string
  email: string
  name: string
  nickname?: string | null
  avatar?: string | null
  role: string
  subscribedExams: string[]
  emailVerified?: boolean
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  loading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    loading: false
  }),

  // 禁用 SSR 水合以避免序列化问题
  hydrate(state) {
    // 不从服务端水合，只在客户端初始化
    if (import.meta.client) {
      const accessToken = localStorage.getItem('accessToken')
      const refreshToken = localStorage.getItem('refreshToken')
      const userStr = localStorage.getItem('user')

      if (accessToken && refreshToken && userStr) {
        state.accessToken = accessToken
        state.refreshToken = refreshToken
        try {
          state.user = JSON.parse(userStr)
        } catch (error) {
          console.error('Failed to parse user data:', error)
        }
      }
    }
  },

  getters: {
    isAuthenticated: (state) => !!state.accessToken && !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
    subscribedExams: (state) => state.user?.subscribedExams || [],

    canAccessExam: (state) => (examType: string) => {
      return state.user?.subscribedExams.includes(examType) || false
    },

    userInitials: (state) => {
      if (!state.user) return ''
      return state.user.name.charAt(0).toUpperCase()
    }
  },

  actions: {
    /**
     * 初始化 - 从 localStorage 恢复登录状态
     */
    async init() {
      if (import.meta.client) {
        const accessToken = localStorage.getItem('accessToken')
        const refreshToken = localStorage.getItem('refreshToken')
        const userStr = localStorage.getItem('user')

        if (accessToken && refreshToken && userStr) {
          this.accessToken = accessToken
          this.refreshToken = refreshToken
          try {
            this.user = JSON.parse(userStr)
          } catch (error) {
            console.error('Failed to parse user data:', error)
            this.logout()
          }
        }
      }
    },

    /**
     * 注册
     */
    async register(email: string, password: string, name: string, examTypes: string[] = ['cale']) {
      this.loading = true
      try {
        const response = await $fetch('/api/auth/register', {
          method: 'POST',
          body: {
            email,
            password,
            name,
            examTypes
          }
        })

        if (response.success) {
          this.setAuthData(response.accessToken, response.refreshToken, response.user)
          return { success: true }
        }

        return { success: false, message: response.message || '注册失败' }
      } catch (error: any) {
        console.error('Registration error:', error)
        return {
          success: false,
          message: error.data?.message || error.message || '注册失败，请稍后重试'
        }
      } finally {
        this.loading = false
      }
    },

    /**
     * 登录
     */
    async login(email: string, password: string) {
      this.loading = true
      try {
        const response = await $fetch('/api/auth/login', {
          method: 'POST',
          body: {
            email,
            password
          }
        })

        if (response.success) {
          this.setAuthData(response.accessToken, response.refreshToken, response.user)
          return { success: true }
        }

        return { success: false, message: response.message || '登录失败' }
      } catch (error: any) {
        console.error('Login error:', error)
        return {
          success: false,
          message: error.data?.message || error.message || '登录失败，请稍后重试'
        }
      } finally {
        this.loading = false
      }
    },

    /**
     * 刷新 Token
     */
    async refreshAccessToken() {
      if (!this.refreshToken) {
        return false
      }

      try {
        const response = await $fetch('/api/auth/refresh', {
          method: 'POST',
          body: {
            refreshToken: this.refreshToken
          }
        })

        if (response.success) {
          this.accessToken = response.accessToken
          this.refreshToken = response.refreshToken

          if (import.meta.client) {
            localStorage.setItem('accessToken', response.accessToken)
            localStorage.setItem('refreshToken', response.refreshToken)
          }

          return true
        }

        return false
      } catch (error) {
        console.error('Token refresh failed:', error)
        this.logout()
        return false
      }
    },

    /**
     * 登出
     */
    async logout() {
      // 调用登出 API（使所有 token 失效）
      if (this.accessToken) {
        try {
          await $fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${this.accessToken}`
            }
          })
        } catch (error) {
          console.error('Logout API error:', error)
        }
      }

      // 清除本地状态
      this.user = null
      this.accessToken = null
      this.refreshToken = null

      if (import.meta.client) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      }
    },

    /**
     * 从服务器获取最新的用户信息
     */
    async fetchUserInfo() {
      if (!this.accessToken) {
        return false
      }

      try {
        const response = await $fetch('/api/user/me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.accessToken}`
          }
        })

        if (response.success && response.user) {
          // 更新用户信息
          this.user = response.user

          // 同步到 localStorage
          if (import.meta.client) {
            localStorage.setItem('user', JSON.stringify(response.user))
          }

          return true
        }

        return false
      } catch (error) {
        console.error('Fetch user info failed:', error)
        return false
      }
    },

    /**
     * 设置认证数据
     */
    setAuthData(accessToken: string, refreshToken: string, user: User) {
      this.accessToken = accessToken
      this.refreshToken = refreshToken
      this.user = user

      if (import.meta.client) {
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        localStorage.setItem('user', JSON.stringify(user))
      }
    },

    /**
     * 获取 Authorization Header
     */
    getAuthHeader() {
      return this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}
    }
  }
})
