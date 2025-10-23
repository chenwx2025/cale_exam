import { ref } from 'vue'

/**
 * 成就系统Composable
 * 用于在整个应用中管理成就检查和通知
 */

// 全局状态 - 新解锁的成就列表
const newAchievements = ref<any[]>([])
const isChecking = ref(false)
const lastCheckTime = ref<number>(0)

export const useAchievements = () => {
  /**
   * 检查新解锁的成就
   */
  const checkNewAchievements = async () => {
    // 防止频繁检查（至少间隔30秒）
    const now = Date.now()
    if (isChecking.value || (now - lastCheckTime.value < 30000)) {
      return []
    }

    isChecking.value = true
    lastCheckTime.value = now

    try {
      const response = await $fetch('/api/achievements/check-new', {
        method: 'GET'
      })

      if (response.success && response.achievements && response.achievements.length > 0) {
        // 过滤掉已经显示过的成就
        const newOnes = response.achievements.filter((achievement: any) =>
          !newAchievements.value.some(a => a.id === achievement.id)
        )

        if (newOnes.length > 0) {
          newAchievements.value.push(...newOnes)
          return newOnes
        }
      }

      return []
    } catch (error) {
      console.error('检查新成就失败:', error)
      return []
    } finally {
      isChecking.value = false
    }
  }

  /**
   * 获取并清空新成就列表
   */
  const popNewAchievements = () => {
    const achievements = [...newAchievements.value]
    newAchievements.value = []
    return achievements
  }

  /**
   * 清空特定成就
   */
  const clearAchievement = (achievementId: string) => {
    const index = newAchievements.value.findIndex(a => a.id === achievementId)
    if (index !== -1) {
      newAchievements.value.splice(index, 1)
    }
  }

  /**
   * 清空所有新成就
   */
  const clearAllAchievements = () => {
    newAchievements.value = []
  }

  return {
    newAchievements,
    isChecking,
    checkNewAchievements,
    popNewAchievements,
    clearAchievement,
    clearAllAchievements
  }
}
