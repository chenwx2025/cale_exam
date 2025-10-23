<template>
  <div class="achievement-wall">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">🏆 成就墙</h2>
        <p class="text-gray-600">
          已解锁 <span class="font-bold text-purple-600">{{ unlockedCount }}</span> / {{ totalCount }} 个成就
        </p>
      </div>

      <!-- Filter buttons -->
      <div class="flex gap-2">
        <button
          v-for="filter in filters"
          :key="filter.value"
          @click="currentFilter = filter.value"
          class="px-4 py-2 rounded-lg font-semibold transition-all"
          :class="currentFilter === filter.value
            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Progress bar -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-semibold text-gray-700">完成进度</span>
        <span class="text-sm font-bold text-purple-600">{{ completionPercentage }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-4 overflow-hidden relative">
        <div
          class="h-4 rounded-full transition-all duration-500 relative overflow-hidden"
          :class="{
            'bg-gradient-to-r from-green-400 to-emerald-500': completionPercentage >= 80,
            'bg-gradient-to-r from-blue-500 to-indigo-600': completionPercentage >= 50 && completionPercentage < 80,
            'bg-gradient-to-r from-purple-500 to-pink-600': completionPercentage < 50
          }"
          :style="{ width: `${completionPercentage}%` }"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
        </div>
      </div>
    </div>

    <!-- Category tabs -->
    <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
      <button
        @click="selectedCategory = 'all'"
        class="px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all"
        :class="selectedCategory === 'all'
          ? 'bg-purple-600 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
      >
        全部 ({{ achievements.length }})
      </button>
      <button
        v-for="category in categories"
        :key="category.value"
        @click="selectedCategory = category.value"
        class="px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all"
        :class="selectedCategory === category.value
          ? 'bg-purple-600 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
      >
        {{ category.icon }} {{ category.label }} ({{ getCategoryCount(category.value) }})
      </button>
    </div>

    <!-- Achievement grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="achievement in filteredAchievements"
        :key="achievement.id"
        class="achievement-card rounded-xl p-5 transition-all duration-300 relative overflow-hidden group"
        :class="achievement.isUnlocked
          ? getUnlockedCardClass(achievement.rarity)
          : 'bg-gray-100 border-2 border-gray-200 opacity-60 hover:opacity-80'"
      >
        <!-- Locked overlay -->
        <div v-if="!achievement.isUnlocked" class="absolute top-3 right-3">
          <div class="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
            <span class="text-white text-lg">🔒</span>
          </div>
        </div>

        <!-- Rarity badge for unlocked achievements -->
        <div v-else class="absolute top-3 right-3">
          <span class="px-2 py-1 rounded-full text-xs font-bold" :class="getRarityBadgeClass(achievement.rarity)">
            {{ getRarityLabel(achievement.rarity) }}
          </span>
        </div>

        <!-- Glow effect for legendary -->
        <div
          v-if="achievement.isUnlocked && achievement.rarity === 'legendary'"
          class="absolute inset-0 bg-gradient-to-br from-yellow-200/30 to-amber-300/30 animate-pulse-slow pointer-events-none"
        ></div>

        <!-- Content -->
        <div class="relative z-10">
          <!-- Icon -->
          <div class="mb-4 transform group-hover:scale-110 transition-transform duration-300">
            <div class="text-6xl text-center" :class="!achievement.isUnlocked && 'grayscale'">
              {{ achievement.icon }}
            </div>
          </div>

          <!-- Name and description -->
          <div class="text-center mb-3">
            <h3 class="font-bold text-lg mb-2" :class="achievement.isUnlocked ? 'text-gray-900' : 'text-gray-500'">
              {{ achievement.name }}
            </h3>
            <p class="text-sm" :class="achievement.isUnlocked ? 'text-gray-600' : 'text-gray-400'">
              {{ achievement.description }}
            </p>
          </div>

          <!-- Progress bar (for locked achievements) -->
          <div v-if="!achievement.isUnlocked && achievement.progress > 0" class="mb-3">
            <div class="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
              <div
                class="h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                :style="{ width: `${achievement.progress}%` }"
              ></div>
            </div>
            <p class="text-xs text-gray-500 text-center mt-1">{{ achievement.progress }}%</p>
          </div>

          <!-- Points -->
          <div class="flex items-center justify-center gap-2 py-2 px-4 rounded-lg"
            :class="achievement.isUnlocked ? 'bg-amber-100' : 'bg-gray-200'">
            <span class="text-xl">⭐</span>
            <span class="font-bold" :class="achievement.isUnlocked ? 'text-amber-600' : 'text-gray-500'">
              {{ achievement.points }} 积分
            </span>
          </div>

          <!-- Unlock date and share button (for unlocked achievements) -->
          <div v-if="achievement.isUnlocked && achievement.unlockedAt" class="mt-3">
            <p class="text-xs text-gray-500 text-center mb-2">
              解锁于 {{ formatDate(achievement.unlockedAt) }}
            </p>
            <button
              @click.stop="shareAchievement(achievement)"
              class="w-full flex items-center justify-center gap-1 px-3 py-2 bg-white/50 hover:bg-white/80 rounded-lg text-xs font-semibold transition-all group/share"
            >
              <svg class="w-4 h-4 group-hover/share:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
              </svg>
              分享
            </button>
          </div>

          <!-- Hint (for locked achievements) -->
          <div v-else class="mt-3 text-center">
            <p class="text-xs text-gray-500">
              {{ getProgressHint(achievement) }}
            </p>
          </div>
        </div>

        <!-- Sparkles for recently unlocked -->
        <div v-if="isRecentlyUnlocked(achievement)" class="absolute top-2 left-2 animate-twinkle">
          <span class="text-yellow-400 text-xl">✨</span>
        </div>
        <div v-if="isRecentlyUnlocked(achievement)" class="absolute bottom-2 right-2 animate-twinkle" style="animation-delay: 0.5s;">
          <span class="text-yellow-400 text-xl">✨</span>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="filteredAchievements.length === 0" class="text-center py-12">
      <div class="text-6xl mb-4">🔍</div>
      <p class="text-gray-500 text-lg">没有找到符合条件的成就</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Achievement {
  id: string
  code: string
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  category: string
  icon: string
  rarity: string
  points: number
  criteria: string
  isUnlocked: boolean
  unlockedAt?: string | null
  progress: number
  currentValue: number
  targetValue: number
}

interface Props {
  achievements: Achievement[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  share: [achievement: Achievement]
}>()

const currentFilter = ref<'all' | 'unlocked' | 'locked'>('all')
const selectedCategory = ref('all')

const filters = [
  { value: 'all', label: '全部' },
  { value: 'unlocked', label: '已解锁' },
  { value: 'locked', label: '未解锁' }
]

const categories = [
  { value: 'learning', label: '学习成就', icon: '📚' },
  { value: 'exam', label: '考试成就', icon: '📝' },
  { value: 'social', label: '社交成就', icon: '👥' },
  { value: 'special', label: '特殊成就', icon: '🌟' }
]

// Computed
const totalCount = computed(() => props.achievements.length)
const unlockedCount = computed(() => props.achievements.filter(a => a.isUnlocked).length)
const completionPercentage = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.round((unlockedCount.value / totalCount.value) * 100)
})

const filteredAchievements = computed(() => {
  let filtered = props.achievements

  // Filter by unlock status
  if (currentFilter.value === 'unlocked') {
    filtered = filtered.filter(a => a.isUnlocked)
  } else if (currentFilter.value === 'locked') {
    filtered = filtered.filter(a => !a.isUnlocked)
  }

  // Filter by category
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(a => a.category === selectedCategory.value)
  }

  // Sort: unlocked first (by unlock date), then locked by progress
  return filtered.sort((a, b) => {
    if (a.isUnlocked && !b.isUnlocked) return -1
    if (!a.isUnlocked && b.isUnlocked) return 1

    if (a.isUnlocked && b.isUnlocked) {
      const dateA = new Date(a.unlockedAt || 0).getTime()
      const dateB = new Date(b.unlockedAt || 0).getTime()
      return dateB - dateA // Most recent first
    }

    return b.progress - a.progress // Higher progress first
  })
})

// Methods
const getCategoryCount = (category: string) => {
  return props.achievements.filter(a => a.category === category).length
}

const getUnlockedCardClass = (rarity: string) => {
  const classes = {
    'legendary': 'bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-400 shadow-lg hover:shadow-xl',
    'epic': 'bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-400 shadow-md hover:shadow-lg',
    'rare': 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-400 shadow-md hover:shadow-lg',
    'common': 'bg-white border-2 border-gray-300 shadow hover:shadow-md'
  }
  return classes[rarity as keyof typeof classes] || classes.common
}

const getRarityBadgeClass = (rarity: string) => {
  const classes = {
    'legendary': 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white',
    'epic': 'bg-gradient-to-r from-purple-500 to-pink-600 text-white',
    'rare': 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white',
    'common': 'bg-gray-500 text-white'
  }
  return classes[rarity as keyof typeof classes] || classes.common
}

const getRarityLabel = (rarity: string) => {
  const labels = {
    'legendary': '传说',
    'epic': '史诗',
    'rare': '稀有',
    'common': '普通'
  }
  return labels[rarity as keyof typeof labels] || '普通'
}

const formatDate = (date: string | null) => {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - d.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays}天前`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`

  const year = d.getFullYear()
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

const isRecentlyUnlocked = (achievement: Achievement) => {
  if (!achievement.isUnlocked || !achievement.unlockedAt) return false
  const unlockedDate = new Date(achievement.unlockedAt)
  const now = new Date()
  const diffTime = now.getTime() - unlockedDate.getTime()
  const diffDays = diffTime / (1000 * 60 * 60 * 24)
  return diffDays <= 7 // Within last 7 days
}

const getProgressHint = (achievement: Achievement) => {
  if (achievement.progress >= 80) return '🔥 即将解锁！'
  if (achievement.progress >= 50) return '💪 继续努力！'
  if (achievement.progress > 0) return '🌱 刚刚开始'

  try {
    const criteria = JSON.parse(achievement.criteria)
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

const shareAchievement = (achievement: Achievement) => {
  emit('share', achievement)
}
</script>

<style scoped>
.achievement-wall {
  @apply w-full;
}

.achievement-card {
  @apply cursor-default;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
}

.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

.animate-twinkle {
  animation: twinkle 2s ease-in-out infinite;
}

.grayscale {
  filter: grayscale(100%);
}
</style>
