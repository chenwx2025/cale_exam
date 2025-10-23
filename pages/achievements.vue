<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <div class="container mx-auto px-4 py-8">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ $t('achievements.title') }}</h1>
        <p class="text-gray-600">{{ $t('achievements.subtitle') }}</p>
      </div>

      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- 总成就数 -->
        <div class="bg-white rounded-xl shadow-md p-6 border-2 border-blue-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">{{ $t('achievements.unlocked') }}</p>
              <p class="text-3xl font-bold text-blue-600">
                {{ stats.unlocked }} / {{ stats.total }}
              </p>
            </div>
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-3xl">🏆</span>
            </div>
          </div>
          <div class="mt-4">
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-blue-600 h-2 rounded-full transition-all duration-500"
                :style="{ width: `${(stats.unlocked / stats.total) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- 总积分 -->
        <div class="bg-white rounded-xl shadow-md p-6 border-2 border-amber-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">{{ $t('achievements.points') }}</p>
              <p class="text-3xl font-bold text-amber-600">{{ stats.points }}</p>
            </div>
            <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
              <span class="text-3xl">⭐</span>
            </div>
          </div>
        </div>

        <!-- 完成度 -->
        <div class="bg-white rounded-xl shadow-md p-6 border-2 border-purple-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">{{ $t('achievements.completion') }}</p>
              <p class="text-3xl font-bold text-purple-600">
                {{ Math.round((stats.unlocked / stats.total) * 100) }}%
              </p>
            </div>
            <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <span class="text-3xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 成就分类标签 -->
      <div class="flex flex-wrap gap-2 mb-6">
        <button
          v-for="category in categories"
          :key="category.value"
          @click="selectedCategory = category.value"
          class="px-4 py-2 rounded-lg font-medium transition-all"
          :class="selectedCategory === category.value
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'"
        >
          {{ category.icon }} {{ category.label }}
        </button>
      </div>

      <!-- 成就列表 -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p class="mt-4 text-gray-600">加载中...</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="achievement in filteredAchievements"
          :key="achievement.id"
          class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
          :class="{
            'border-2 border-amber-400': achievement.rarity === 'legendary',
            'border-2 border-purple-400': achievement.rarity === 'epic',
            'border-2 border-blue-400': achievement.rarity === 'rare',
            'border border-gray-200': achievement.rarity === 'common',
            'opacity-60': !achievement.isUnlocked
          }"
        >
          <!-- 稀有度标识 -->
          <div v-if="achievement.rarity !== 'common'" class="h-1"
            :class="{
              'bg-gradient-to-r from-amber-400 to-yellow-500': achievement.rarity === 'legendary',
              'bg-gradient-to-r from-purple-400 to-pink-500': achievement.rarity === 'epic',
              'bg-gradient-to-r from-blue-400 to-cyan-500': achievement.rarity === 'rare'
            }"
          ></div>

          <div class="p-6">
            <!-- 图标和状态 -->
            <div class="flex items-start justify-between mb-4">
              <div class="text-5xl" :class="{ 'grayscale': !achievement.isUnlocked }">
                {{ achievement.icon }}
              </div>
              <div v-if="achievement.isUnlocked" class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <span>✓</span>
                <span>{{ $t('achievements.status.unlocked') }}</span>
              </div>
              <div v-else class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                🔒 {{ $t('achievements.status.locked') }}
              </div>
            </div>

            <!-- 名称和描述 -->
            <h3 class="text-xl font-bold text-gray-900 mb-2">{{ achievement.name }}</h3>
            <p class="text-sm text-gray-600 mb-4">{{ achievement.description }}</p>

            <!-- 积分 -->
            <div class="flex items-center gap-2 mb-4">
              <span class="text-amber-500">⭐</span>
              <span class="text-sm font-medium text-gray-700">+{{ achievement.points }} 积分</span>
            </div>

            <!-- 进度条和提示 -->
            <div v-if="!achievement.isUnlocked">
              <div class="flex items-center justify-between text-sm mb-2">
                <span class="text-gray-600">{{ $t('achievements.progress') }}</span>
                <span class="font-medium" :class="{
                  'text-green-600': achievement.progress >= 80,
                  'text-blue-600': achievement.progress >= 50 && achievement.progress < 80,
                  'text-gray-900': achievement.progress < 50
                }">{{ achievement.progress }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-3 mb-3 overflow-hidden relative">
                <div
                  class="h-3 rounded-full transition-all duration-500 relative overflow-hidden"
                  :class="{
                    'bg-gradient-to-r from-green-400 to-emerald-500': achievement.progress >= 80,
                    'bg-gradient-to-r from-blue-500 to-indigo-600': achievement.progress >= 50 && achievement.progress < 80,
                    'bg-gradient-to-r from-gray-400 to-gray-500': achievement.progress < 50
                  }"
                  :style="{ width: `${achievement.progress}%` }"
                >
                  <!-- 闪光效果 -->
                  <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
                </div>
              </div>
              <!-- 进度提示 -->
              <div class="text-xs text-gray-500">
                <span v-if="achievement.progress >= 80">🔥 即将解锁！</span>
                <span v-else-if="achievement.progress >= 50">💪 继续努力！</span>
                <span v-else-if="achievement.progress > 0">🌱 刚刚开始</span>
                <span v-else>📌 {{ getProgressHint(achievement.criteria) }}</span>
              </div>
            </div>

            <!-- 解锁时间 -->
            <div v-else class="text-sm text-gray-500">
              解锁于 {{ formatDate(achievement.unlockedAt) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && filteredAchievements.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">🎯</div>
        <p class="text-gray-600">该分类暂无成就</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

const loading = ref(true)
const achievements = ref<any[]>([])
const stats = ref({
  total: 0,
  unlocked: 0,
  points: 0
})
const selectedCategory = ref('all')

const { t } = useI18n()

const categories = computed(() => [
  { value: 'all', label: t('achievements.categories.all'), icon: '🎯' },
  { value: 'streak', label: t('achievements.categories.streak'), icon: '🔥' },
  { value: 'questions', label: t('achievements.categories.questions'), icon: '📝' },
  { value: 'exams', label: t('achievements.categories.exams'), icon: '📚' },
  { value: 'accuracy', label: t('achievements.categories.accuracy'), icon: '🎯' }
])

const filteredAchievements = computed(() => {
  if (selectedCategory.value === 'all') {
    return achievements.value
  }
  return achievements.value.filter(a => a.category === selectedCategory.value)
})

const fetchAchievements = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/achievements', {
      headers: authStore.getAuthHeader() as HeadersInit
    }) as any

    achievements.value = response.achievements
    stats.value = response.stats
  } catch (error: any) {
    console.error('获取成就列表失败:', error)
    alert('获取成就列表失败，请重试')
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const getProgressHint = (criteriaString: string) => {
  try {
    const criteria = JSON.parse(criteriaString)
    const type = criteria.type
    const value = criteria.value

    const hints: Record<string, string> = {
      'streak_days': `连续学习${value}天`,
      'questions_answered': `答题${value}题`,
      'correct_answers': `答对${value}题`,
      'study_time': `学习${value}小时`,
      'exams_completed': `完成${value}次考试`,
      'exams_passed': `通过${value}次考试`,
      'perfect_scores': `获得${value}次满分`,
      'accuracy': `正确率达到${value}%`
    }

    return hints[type] || '完成特定任务'
  } catch (error) {
    return '完成特定任务'
  }
}

onMounted(() => {
  fetchAchievements()
})
</script>

<style scoped>
/* 闪光动画 */
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
</style>
