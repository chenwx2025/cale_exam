<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p class="mt-4 text-gray-600">{{ $t('common.loading') }}</p>
      </div>

      <!-- Profile Content -->
      <div v-else>
        <!-- Back to Dashboard Button -->
        <div class="mb-6">
          <NuxtLink
            to="/dashboard"
            class="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all group"
          >
            <svg class="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            <span class="font-medium">返回控制台</span>
          </NuxtLink>
        </div>

        <!-- Header Section -->
        <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div class="flex items-center gap-6">
            <!-- Avatar -->
            <div class="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {{ getInitial(userInfo.email) }}
            </div>

            <!-- User Info -->
            <div class="flex-1">
              <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ userInfo.name || $t('profile.student') }}</h1>
              <p class="text-gray-600 mb-4">{{ userInfo.email }}</p>

              <!-- Quick Stats -->
              <div class="flex gap-4">
                <div class="flex items-center gap-2">
                  <span class="text-2xl">🔥</span>
                  <span class="font-semibold text-gray-700">{{ pointsData.stats.streakDays }} {{ $t('profile.days') }}{{ $t('profile.streakStudy') }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-2xl">⭐</span>
                  <span class="font-semibold text-gray-700">{{ pointsData.points.total }} {{ $t('profile.totalPoints') }}</span>
                </div>
              </div>
            </div>

            <!-- Rank Badge -->
            <div class="text-center">
              <div class="w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg mb-2">
                <span class="text-3xl">🏅</span>
              </div>
              <p class="text-sm text-gray-600">{{ $t('profile.rank') }}</p>
              <p class="text-2xl font-bold text-amber-600">#{{ pointsData.points.rank }}</p>
            </div>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Total Points -->
          <div class="bg-white rounded-xl shadow-md p-6 border-2 border-amber-200">
            <div class="flex items-center justify-between mb-4">
              <div>
                <p class="text-sm text-gray-600 mb-1">{{ $t('profile.totalPoints') }}</p>
                <p class="text-3xl font-bold text-amber-600">{{ pointsData.points.total }}</p>
              </div>
              <div class="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center">
                <span class="text-2xl">⭐</span>
              </div>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <span class="text-gray-600">{{ $t('profile.weeklyPoints') }}:</span>
              <span class="font-semibold text-amber-600">{{ pointsData.points.weekly }}</span>
            </div>
          </div>

          <!-- Questions Answered -->
          <div class="bg-white rounded-xl shadow-md p-6 border-2 border-blue-200">
            <div class="flex items-center justify-between mb-4">
              <div>
                <p class="text-sm text-gray-600 mb-1">{{ $t('profile.stats.questionsAnswered') }}</p>
                <p class="text-3xl font-bold text-blue-600">{{ pointsData.stats.questionsAnswered }}</p>
              </div>
              <div class="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                <span class="text-2xl">✍️</span>
              </div>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <span class="text-gray-600">{{ $t('profile.stats.accuracy') }}:</span>
              <span class="font-semibold text-blue-600">{{ accuracy }}%</span>
            </div>
          </div>

          <!-- Study Time -->
          <div class="bg-white rounded-xl shadow-md p-6 border-2 border-green-200">
            <div class="flex items-center justify-between mb-4">
              <div>
                <p class="text-sm text-gray-600 mb-1">{{ $t('profile.stats.totalTime') }}</p>
                <p class="text-3xl font-bold text-green-600">{{ formatStudyTime(pointsData.stats.studyTimeMinutes) }}</p>
              </div>
              <div class="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <span class="text-2xl">📚</span>
              </div>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <span class="text-gray-600">{{ $t('profile.avgPerDay') }}:</span>
              <span class="font-semibold text-green-600">{{ Math.round(pointsData.stats.studyTimeMinutes / Math.max(pointsData.stats.streakDays, 1)) }}{{ $t('profile.minutes') }}</span>
            </div>
          </div>

          <!-- Achievements -->
          <div class="bg-white rounded-xl shadow-md p-6 border-2 border-purple-200">
            <div class="flex items-center justify-between mb-4">
              <div>
                <p class="text-sm text-gray-600 mb-1">{{ $t('profile.achievementCount') }}</p>
                <p class="text-3xl font-bold text-purple-600">{{ achievementStats.unlocked }}</p>
              </div>
              <div class="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                <span class="text-2xl">🏆</span>
              </div>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <span class="text-gray-600">{{ $t('profile.total') }}:</span>
              <span class="font-semibold text-purple-600">{{ achievementStats.total }}</span>
            </div>
          </div>
        </div>

        <!-- Main Content Tabs -->
        <div class="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <!-- Tab Navigation -->
          <div class="flex border-b border-gray-200 mb-6">
            <button
              v-for="tab in tabs"
              :key="tab.value"
              @click="activeTab = tab.value"
              class="px-6 py-3 font-semibold transition-all relative"
              :class="activeTab === tab.value
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'"
            >
              {{ tab.icon }} {{ tab.label }}
              <div
                v-if="activeTab === tab.value"
                class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              ></div>
            </button>
          </div>

          <!-- Tab Content -->
          <div>
            <!-- Achievement Wall Tab -->
            <div v-if="activeTab === 'wall'">
              <AchievementWall :achievements="allAchievements" @share="handleShare" />
            </div>

            <!-- Recent Achievements Tab -->
            <div v-if="activeTab === 'achievements'">
              <div v-if="recentAchievements.length === 0" class="text-center py-12 text-gray-500">
                <span class="text-6xl mb-4 block">🏆</span>
                <p>{{ $t('profile.noAchievements') }}</p>
                <NuxtLink to="/achievements" class="text-blue-600 hover:underline mt-2 inline-block">
                  {{ $t('profile.viewAllAchievements') }} →
                </NuxtLink>
              </div>

              <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="achievement in recentAchievements"
                  :key="achievement.id"
                  class="border rounded-xl p-4 hover:shadow-md transition-shadow"
                  :class="{
                    'border-amber-400 bg-amber-50': achievement.rarity === 'legendary',
                    'border-purple-400 bg-purple-50': achievement.rarity === 'epic',
                    'border-blue-400 bg-blue-50': achievement.rarity === 'rare',
                    'border-gray-200': achievement.rarity === 'common'
                  }"
                >
                  <div class="flex items-start gap-4">
                    <div class="text-4xl">{{ achievement.icon }}</div>
                    <div class="flex-1">
                      <h3 class="font-bold text-gray-900 mb-1">{{ achievement.name }}</h3>
                      <p class="text-sm text-gray-600 mb-2">{{ achievement.description }}</p>
                      <div class="flex items-center justify-between">
                        <span class="text-sm font-semibold text-amber-600">+{{ achievement.points }} {{ $t('profile.points') }}</span>
                        <span class="text-xs text-gray-500">{{ formatDate(achievement.unlockedAt) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="text-center mt-6">
                <NuxtLink
                  to="/achievements"
                  class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  {{ $t('profile.viewAllAchievements') }}
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                  </svg>
                </NuxtLink>
              </div>
            </div>

            <!-- Learning Statistics Tab -->
            <div v-if="activeTab === 'stats'">
              <div class="space-y-6">
                <!-- Study Streak -->
                <div>
                  <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span class="text-2xl">🔥</span>
                    {{ $t('profile.streakDaysTitle') }}
                  </h3>
                  <div class="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6">
                    <div class="text-center">
                      <p class="text-6xl font-bold text-orange-600 mb-2">{{ pointsData.stats.streakDays }}</p>
                      <p class="text-gray-600">{{ $t('profile.streakDays') }}</p>
                      <p class="text-sm text-gray-500 mt-2">{{ $t('profile.keepGoing') }}</p>
                    </div>
                  </div>
                </div>

                <!-- Accuracy Stats -->
                <div>
                  <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span class="text-2xl">🎯</span>
                    {{ $t('profile.accuracyTitle') }}
                  </h3>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="bg-green-50 rounded-xl p-6 text-center">
                      <p class="text-4xl font-bold text-green-600 mb-2">{{ pointsData.stats.correctAnswers }}</p>
                      <p class="text-gray-600">{{ $t('profile.correctAnswers') }}</p>
                    </div>
                    <div class="bg-blue-50 rounded-xl p-6 text-center">
                      <p class="text-4xl font-bold text-blue-600 mb-2">{{ accuracy }}%</p>
                      <p class="text-gray-600">{{ $t('profile.stats.accuracy') }}</p>
                    </div>
                  </div>
                </div>

                <!-- Study Time Distribution -->
                <div>
                  <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span class="text-2xl">⏱️</span>
                    {{ $t('profile.studyTimeStats') }}
                  </h3>
                  <div class="bg-purple-50 rounded-xl p-6">
                    <div class="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p class="text-3xl font-bold text-purple-600 mb-1">{{ formatStudyTime(pointsData.stats.studyTimeMinutes) }}</p>
                        <p class="text-sm text-gray-600">{{ $t('profile.totalStudyTime') }}</p>
                      </div>
                      <div>
                        <p class="text-3xl font-bold text-purple-600 mb-1">{{ Math.round(pointsData.stats.studyTimeMinutes / Math.max(pointsData.stats.streakDays, 1)) }}</p>
                        <p class="text-sm text-gray-600">{{ $t('profile.avgMinutesPerDay') }}</p>
                      </div>
                      <div>
                        <p class="text-3xl font-bold text-purple-600 mb-1">{{ pointsData.stats.questionsAnswered }}</p>
                        <p class="text-sm text-gray-600">{{ $t('profile.totalQuestionsAnswered') }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Leaderboard Tab -->
            <div v-if="activeTab === 'leaderboard'">
              <div>
                <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span class="text-2xl">🏆</span>
                  {{ $t('profile.weeklyLeaderboard') }}
                </h3>

                <div class="space-y-2">
                  <div
                    v-for="(entry, index) in pointsData.weeklyLeaderboard"
                    :key="entry.userId"
                    class="flex items-center gap-4 p-4 rounded-xl transition-all"
                    :class="entry.isCurrentUser
                      ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-blue-400'
                      : 'bg-gray-50 hover:bg-gray-100'"
                  >
                    <!-- Rank -->
                    <div class="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                      :class="{
                        'bg-gradient-to-br from-amber-400 to-yellow-500 text-white': entry.rank === 1,
                        'bg-gradient-to-br from-gray-300 to-gray-400 text-white': entry.rank === 2,
                        'bg-gradient-to-br from-orange-400 to-amber-600 text-white': entry.rank === 3,
                        'bg-gray-200 text-gray-700': entry.rank > 3
                      }"
                    >
                      {{ entry.rank }}
                    </div>

                    <!-- User Info -->
                    <div class="flex-1">
                      <p class="font-semibold text-gray-900">
                        {{ entry.isCurrentUser ? $t('leaderboard.you') : `${$t('profile.user')} ${entry.userId.substring(0, 8)}` }}
                        <span v-if="entry.isCurrentUser" class="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded-full">{{ $t('profile.currentUser') }}</span>
                      </p>
                    </div>

                    <!-- Points -->
                    <div class="text-right">
                      <p class="text-2xl font-bold text-amber-600">{{ entry.points }}</p>
                      <p class="text-xs text-gray-600">{{ $t('profile.weeklyPoints') }}</p>
                    </div>
                  </div>
                </div>

                <div class="text-center mt-6">
                  <NuxtLink
                    to="/leaderboard"
                    class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                  >
                    {{ $t('profile.viewFullLeaderboard') }}
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                    </svg>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <NuxtLink
            to="/exam/config"
            class="bg-white rounded-xl shadow-md hover:shadow-xl p-6 transition-all group"
          >
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <span class="text-2xl">📝</span>
              </div>
              <div>
                <h3 class="font-bold text-gray-900 mb-1">{{ $t('profile.startExam') }}</h3>
                <p class="text-sm text-gray-600">{{ $t('profile.startExamDesc') }}</p>
              </div>
            </div>
          </NuxtLink>

          <NuxtLink
            to="/wrong-questions"
            class="bg-white rounded-xl shadow-md hover:shadow-xl p-6 transition-all group"
          >
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <span class="text-2xl">❌</span>
              </div>
              <div>
                <h3 class="font-bold text-gray-900 mb-1">{{ $t('profile.wrongQuestions') }}</h3>
                <p class="text-sm text-gray-600">{{ $t('profile.wrongQuestionsDesc') }}</p>
              </div>
            </div>
          </NuxtLink>

          <NuxtLink
            to="/achievements"
            class="bg-white rounded-xl shadow-md hover:shadow-xl p-6 transition-all group"
          >
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <span class="text-2xl">🏆</span>
              </div>
              <div>
                <h3 class="font-bold text-gray-900 mb-1">{{ $t('profile.myAchievements') }}</h3>
                <p class="text-sm text-gray-600">{{ $t('profile.myAchievementsDesc') }}</p>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Share Modal -->
      <AchievementShareModal ref="shareModalRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const loading = ref(true)
const activeTab = ref('wall')

// User info
const userInfo = ref({
  email: '',
  name: ''
})

// Points data
const pointsData = ref({
  points: {
    total: 0,
    weekly: 0,
    monthly: 0,
    rank: 0,
    previousRank: 0,
    weeklyRank: 0
  },
  stats: {
    questionsAnswered: 0,
    correctAnswers: 0,
    studyTimeMinutes: 0,
    streakDays: 0,
    lastActivityAt: null
  },
  weeklyLeaderboard: []
})

// Achievement stats
const achievementStats = ref({
  total: 0,
  unlocked: 0,
  points: 0
})

// Recent achievements
const recentAchievements = ref([])

// All achievements
const allAchievements = ref([])

const { t } = useI18n()

// Tabs
const tabs = computed(() => [
  { value: 'wall', label: t('profile.tabs.wall'), icon: '🏆' },
  { value: 'achievements', label: t('profile.tabs.achievements'), icon: '🎖️' },
  { value: 'stats', label: t('profile.tabs.stats'), icon: '📊' },
  { value: 'leaderboard', label: t('profile.tabs.leaderboard'), icon: '🏅' }
])

// Computed
const accuracy = computed(() => {
  if (pointsData.value.stats.questionsAnswered === 0) return 0
  return Math.round((pointsData.value.stats.correctAnswers / pointsData.value.stats.questionsAnswered) * 100)
})

// Methods
const getInitial = (email: string) => {
  return email.charAt(0).toUpperCase()
}

const formatStudyTime = (minutes: number) => {
  if (minutes < 60) return `${minutes}${t('profile.min')}`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}${t('profile.hour')}${mins}${t('profile.min')}` : `${hours}${t('profile.hour')}`
}

const formatDate = (date: string | null) => {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - d.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return t('profile.date.today')
  if (diffDays === 1) return t('profile.date.yesterday')
  if (diffDays < 7) return t('profile.date.daysAgo', { days: diffDays })
  if (diffDays < 30) return t('profile.date.weeksAgo', { weeks: Math.floor(diffDays / 7) })
  return t('profile.date.monthsAgo', { months: Math.floor(diffDays / 30) })
}

// Load data
const loadData = async () => {
  try {
    loading.value = true

    // Get user info from auth store
    const user = authStore.user
    if (user) {
      userInfo.value.email = user.email
      userInfo.value.name = user.name || user.email.split('@')[0]
    }

    // Fetch points data
    const pointsResponse = await $fetch('/api/points', {
      headers: authStore.getAuthHeader() as HeadersInit
    }) as any

    if (pointsResponse.success) {
      pointsData.value = pointsResponse
    }

    // Fetch achievements
    const achievementsResponse = await $fetch('/api/achievements', {
      headers: authStore.getAuthHeader() as HeadersInit
    }) as any

    if (achievementsResponse.success) {
      achievementStats.value = achievementsResponse.stats

      // Store all achievements for the achievement wall
      allAchievements.value = achievementsResponse.achievements

      // Get recent unlocked achievements (last 6)
      recentAchievements.value = achievementsResponse.achievements
        .filter((a: any) => a.isUnlocked)
        .sort((a: any, b: any) => {
          const dateA = new Date(a.unlockedAt || 0).getTime()
          const dateB = new Date(b.unlockedAt || 0).getTime()
          return dateB - dateA
        })
        .slice(0, 6)
    }
  } catch (error: any) {
    console.error(t('profile.loadError'), error)
    alert(t('profile.loadError') + ': ' + (error.data?.message || error.message))
  } finally {
    loading.value = false
  }
}

const shareModalRef = ref(null)

const handleShare = (achievement: any) => {
  if (shareModalRef.value) {
    (shareModalRef.value as any).showShareModal(achievement)
  }
}

onMounted(() => {
  loadData()
})
</script>
