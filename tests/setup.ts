import { vi } from 'vitest'
import { ref, computed, readonly, onMounted, watch, watchEffect, reactive } from 'vue'

// Make Vue APIs globally available (Nuxt auto-imports)
;(global as any).ref = ref
;(global as any).computed = computed
;(global as any).readonly = readonly
;(global as any).onMounted = onMounted
;(global as any).watch = watch
;(global as any).watchEffect = watchEffect
;(global as any).reactive = reactive

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key-for-testing-only'
process.env.JWT_EXPIRES_IN = '7d'
process.env.DATABASE_URL = 'file:./test.db'

// Mock import.meta.client for Nuxt client-side checks
Object.defineProperty(import.meta, 'client', {
  value: true,
  writable: true,
  configurable: true
})

// Define createError globally
;(global as any).createError = (error: any) => {
  const err: any = new Error(error.message)
  err.statusCode = error.statusCode
  err.statusMessage = error.statusMessage
  return err
}

// Mock Nuxt server utilities
vi.mock('#imports', () => ({
  defineEventHandler: (handler: any) => handler,
  getQuery: vi.fn(),
  readBody: vi.fn(),
  setResponseStatus: vi.fn(),
  sendError: vi.fn(),
  createError: (global as any).createError,
  getRequestHeader: vi.fn(),
}))

// Global test setup
beforeEach(() => {
  vi.clearAllMocks()
})
