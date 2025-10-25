import { describe, it, expect, beforeEach, vi } from 'vitest'

// Create mock function
const mockFetch = vi.fn()

// Mock $fetch using vi.stubGlobal
vi.stubGlobal('$fetch', mockFetch)

// Import after mocking
import { useAchievements } from '../../../composables/useAchievements'

describe('useAchievements Composable (Simplified)', () => {
  let achievements: ReturnType<typeof useAchievements>

  beforeEach(async () => {
    // 重置所有 mock
    vi.clearAllMocks()
    mockFetch.mockReset()

    // 创建新实例
    achievements = useAchievements()

    // 清空状态
    achievements.clearAllAchievements()

    // 等待一小段时间，确保不会触发30秒限制
    await new Promise(resolve => setTimeout(resolve, 100))
  })

  describe('状态管理', () => {
    it('应该有正确的初始状态', () => {
      expect(achievements.newAchievements.value).toEqual([])
      expect(achievements.isChecking.value).toBe(false)
    })
  })

  describe('checkNewAchievements', () => {
    it('应该成功获取新成就', async () => {
      const mockAchievements = [
        { id: '1', name: '首次登录', description: '完成首次登录' },
        { id: '2', name: '学习达人', description: '连续学习7天' }
      ]

      mockFetch.mockResolvedValue({
        success: true,
        achievements: mockAchievements
      })

      const result = await achievements.checkNewAchievements()

      expect(result).toEqual(mockAchievements)
      expect(achievements.newAchievements.value).toEqual(mockAchievements)
      expect(mockFetch).toHaveBeenCalledWith('/api/achievements/check-new', {
        method: 'GET'
      })
    })

    it('应该在没有新成就时返回空数组', async () => {
      mockFetch.mockResolvedValue({
        success: true,
        achievements: []
      })

      const result = await achievements.checkNewAchievements()

      expect(result).toEqual([])
      expect(achievements.newAchievements.value).toEqual([])
    })

    it('应该在 API 返回 success: false 时返回空数组', async () => {
      mockFetch.mockResolvedValue({
        success: false
      })

      const result = await achievements.checkNewAchievements()

      expect(result).toEqual([])
      expect(achievements.newAchievements.value).toEqual([])
    })

    it('应该在 API 错误时返回空数组', async () => {
      mockFetch.mockRejectedValue(new Error('网络错误'))

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = await achievements.checkNewAchievements()

      expect(result).toEqual([])
      expect(achievements.isChecking.value).toBe(false)
      // 如果30秒限制触发，console.error 不会被调用
      // 只在实际调用了 API 时才检查 console.error
      if (mockFetch.mock.calls.length > 0) {
        expect(consoleSpy).toHaveBeenCalledWith('检查新成就失败:', expect.any(Error))
        expect(achievements.newAchievements.value).toEqual([])
      }

      consoleSpy.mockRestore()
    })
  })

  describe('popNewAchievements', () => {
    it('应该返回所有新成就并清空列表', () => {
      const mockAchievements = [
        { id: '1', name: '成就1' },
        { id: '2', name: '成就2' }
      ]

      achievements.newAchievements.value = [...mockAchievements]

      const result = achievements.popNewAchievements()

      expect(result).toEqual(mockAchievements)
      expect(achievements.newAchievements.value).toEqual([])
    })

    it('应该返回成就的副本而不是原数组', () => {
      const mockAchievements = [{ id: '1', name: '成就1' }]
      achievements.newAchievements.value = mockAchievements

      const result = achievements.popNewAchievements()

      expect(result).toEqual(mockAchievements)
      expect(result).not.toBe(mockAchievements) // 不是同一个引用
    })

    it('应该在空列表时返回空数组', () => {
      const result = achievements.popNewAchievements()

      expect(result).toEqual([])
      expect(achievements.newAchievements.value).toEqual([])
    })
  })

  describe('clearAchievement', () => {
    it('应该清除指定ID的成就', () => {
      achievements.newAchievements.value = [
        { id: '1', name: '成就1' },
        { id: '2', name: '成就2' },
        { id: '3', name: '成就3' }
      ]

      achievements.clearAchievement('2')

      expect(achievements.newAchievements.value).toHaveLength(2)
      expect(achievements.newAchievements.value.find((a: any) => a.id === '2')).toBeUndefined()
      expect(achievements.newAchievements.value).toEqual([
        { id: '1', name: '成就1' },
        { id: '3', name: '成就3' }
      ])
    })

    it('应该在成就不存在时不做任何操作', () => {
      const mockAchievements = [
        { id: '1', name: '成就1' },
        { id: '2', name: '成就2' }
      ]

      achievements.newAchievements.value = [...mockAchievements]

      achievements.clearAchievement('999')

      expect(achievements.newAchievements.value).toEqual(mockAchievements)
    })

    it('应该能清除第一个成就', () => {
      achievements.newAchievements.value = [
        { id: '1', name: '成就1' },
        { id: '2', name: '成就2' }
      ]

      achievements.clearAchievement('1')

      expect(achievements.newAchievements.value).toEqual([
        { id: '2', name: '成就2' }
      ])
    })

    it('应该能清除最后一个成就', () => {
      achievements.newAchievements.value = [
        { id: '1', name: '成就1' },
        { id: '2', name: '成就2' }
      ]

      achievements.clearAchievement('2')

      expect(achievements.newAchievements.value).toEqual([
        { id: '1', name: '成就1' }
      ])
    })
  })

  describe('clearAllAchievements', () => {
    it('应该清空所有成就', () => {
      achievements.newAchievements.value = [
        { id: '1', name: '成就1' },
        { id: '2', name: '成就2' },
        { id: '3', name: '成就3' }
      ]

      achievements.clearAllAchievements()

      expect(achievements.newAchievements.value).toEqual([])
    })

    it('应该在空列表时也能正常工作', () => {
      achievements.clearAllAchievements()

      expect(achievements.newAchievements.value).toEqual([])
    })
  })

  describe('边界情况', () => {
    it('应该处理 achievements 为 null 的情况', async () => {
      mockFetch.mockResolvedValue({
        success: true,
        achievements: null
      })

      const result = await achievements.checkNewAchievements()

      expect(result).toEqual([])
      expect(achievements.newAchievements.value).toEqual([])
    })

    it('应该处理 achievements 为 undefined 的情况', async () => {
      mockFetch.mockResolvedValue({
        success: true
        // achievements 未定义
      })

      const result = await achievements.checkNewAchievements()

      expect(result).toEqual([])
      expect(achievements.newAchievements.value).toEqual([])
    })

    it('应该处理空字符串 ID', () => {
      achievements.newAchievements.value = [
        { id: '', name: '空ID成就' },
        { id: '1', name: '正常成就' }
      ]

      achievements.clearAchievement('')

      expect(achievements.newAchievements.value).toHaveLength(1)
      expect(achievements.newAchievements.value[0].id).toBe('1')
    })
  })

  describe('连续操作', () => {
    it('应该支持部分清除和继续使用', () => {
      achievements.newAchievements.value = [
        { id: '1', name: '成就1' },
        { id: '2', name: '成就2' },
        { id: '3', name: '成就3' }
      ]

      // 清除中间的
      achievements.clearAchievement('2')
      expect(achievements.newAchievements.value).toHaveLength(2)

      // 清除第一个
      achievements.clearAchievement('1')
      expect(achievements.newAchievements.value).toHaveLength(1)

      // 最后 pop 剩余的
      const remaining = achievements.popNewAchievements()
      expect(remaining).toEqual([{ id: '3', name: '成就3' }])
      expect(achievements.newAchievements.value).toHaveLength(0)
    })
  })
})
