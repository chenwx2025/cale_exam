<template>
  <div class="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
    <div class="container mx-auto px-4 py-8">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ $t('leaderboard.title') }}</h1>
        <p class="text-gray-600">{{ $t('leaderboard.subtitle') }}</p>
      </div>

      <!-- 时间周期选择 -->
      <div class="flex gap-4 mb-8">
        <button
          v-for="period in periods"
          :key="period.value"
          @click="selectedPeriod = period.value"
          class="px-6 py-3 rounded-xl font-medium transition-all"
          :class="selectedPeriod === period.value
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg transform scale-105'
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'"
        >
          {{ period.icon }} {{ period.label }}
        </button>
      </div>

      <!-- 我的排名卡片 -->
      <div class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6 mb-8 text-white relative overflow-hidden">
        <!-- 背景装饰 -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>

        <div class="flex items-center justify-between relative z-10">
          <div class="flex-1">
            <p class="text-blue-100 mb-2 flex items-center gap-2">
              {{ $t('leaderboard.myRank') }}
              <!-- 自动刷新指示器 -->
              <span v-if="autoRefreshEnabled" class="text-xs bg-white/20 px-2 py-1 rounded-full flex items-center gap-1">
                <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Auto {{ $t('common.refresh') }}
              </span>
            </p>
            <div class="flex items-baseline gap-3">
              <p class="text-4xl font-bold">
                #{{ currentUser.rank || '--' }}
              </p>
              <!-- 排名变化指示器 -->
              <div v-if="rankChange !== 0" class="flex items-center gap-1 text-lg font-semibold">
                <span v-if="rankChange > 0" class="text-green-300 flex items-center">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                  </svg>
                  {{ rankChange }}
                </span>
                <span v-else class="text-red-300 flex items-center">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  {{ Math.abs(rankChange) }}
                </span>
              </div>
            </div>
          </div>
          <div class="flex-1 text-center">
            <p class="text-blue-100 mb-2">{{ $t('leaderboard.columns.points') }}</p>
            <p class="text-4xl font-bold">
              {{ currentUser.points || 0 }}
            </p>
            <!-- 上次刷新时间 -->
            <p v-if="lastRefreshTime" class="text-xs text-blue-200 mt-2">
              {{ lastRefreshTime }}
            </p>
          </div>
          <div class="flex flex-col items-center gap-2">
            <div class="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <span class="text-6xl">🏆</span>
            </div>
            <!-- 刷新按钮 -->
            <button
              @click="toggleAutoRefresh"
              class="px-3 py-1 text-xs bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              :class="{ 'bg-green-500/30': autoRefreshEnabled }"
            >
              {{ autoRefreshEnabled ? '⏸ ' + $t('common.pause') + ' ' + $t('common.refresh') : '▶ Auto ' + $t('common.refresh') }}
            </button>
          </div>
        </div>
      </div>

      <!-- 排行榜列表 -->
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <!-- 加载状态 -->
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          <p class="mt-4 text-gray-600">{{ $t('leaderboard.loading') }}</p>
        </div>

        <!-- 排行榜内容 -->
        <div v-else>
          <!-- 前三名特殊展示 -->
          <div class="bg-gradient-to-r from-amber-50 to-orange-50 p-8">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                v-for="(entry, index) in topThree"
                :key="entry.userId"
                class="bg-white rounded-xl shadow-lg p-6 transform transition-all hover:scale-105"
                :class="{
                  'md:col-start-2 md:row-start-1 md:scale-110': index === 0
                }"
              >
                <!-- 奖牌 -->
                <div class="text-center mb-4">
                  <div class="text-6xl mb-2">
                    {{ index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉' }}
                  </div>
                  <div class="text-3xl font-bold"
                    :class="{
                      'text-amber-600': index === 0,
                      'text-gray-500': index === 1,
                      'text-orange-600': index === 2
                    }"
                  >
                    #{{ entry.rank }}
                  </div>
                </div>

                <!-- 用户信息 -->
                <div class="text-center">
                  <div v-if="entry.avatar" class="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-200 overflow-hidden">
                    <img :src="entry.avatar" :alt="entry.username" class="w-full h-full object-cover" />
                  </div>
                  <div v-else class="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                    {{ entry.username.charAt(0).toUpperCase() }}
                  </div>

                  <h3 class="font-bold text-gray-900 mb-1">{{ entry.username }}</h3>
                  <div class="flex items-center justify-center gap-1 text-amber-600">
                    <span>⭐</span>
                    <span class="font-bold">{{ entry.points }}</span>
                  </div>
                </div>

                <!-- 徽章（如果是当前用户） -->
                <div v-if="entry.isCurrentUser" class="mt-4">
                  <div class="bg-blue-100 text-blue-700 text-center py-1 rounded-full text-sm font-medium">
                    👤 {{ $t('leaderboard.you') }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 其余排名 -->
          <div class="divide-y divide-gray-100">
            <div
              v-for="entry in restOfLeaderboard"
              :key="entry.userId"
              class="p-6 hover:bg-gray-50 transition-colors"
              :class="{ 'bg-blue-50': entry.isCurrentUser }"
            >
              <div class="flex items-center justify-between">
                <!-- 排名和用户信息 -->
                <div class="flex items-center gap-4 flex-1">
                  <!-- 排名 -->
                  <div class="w-12 text-center">
                    <span class="text-2xl font-bold text-gray-600">#{{ entry.rank }}</span>
                  </div>

                  <!-- 头像 -->
                  <div v-if="entry.avatar" class="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                    <img :src="entry.avatar" :alt="entry.username" class="w-full h-full object-cover" />
                  </div>
                  <div v-else class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {{ entry.username.charAt(0).toUpperCase() }}
                  </div>

                  <!-- 用户名 -->
                  <div>
                    <p class="font-bold text-gray-900">{{ entry.username }}</p>
                    <p class="text-sm text-gray-500">
                      {{ $t('leaderboard.columns.questions') }} {{ entry.stats.questionsAnswered }} · {{ $t('achievements.categories.streak') }} {{ entry.stats.streakDays }} {{ $t('profile.days') }}
                    </p>
                  </div>

                  <!-- 当前用户徽章 -->
                  <div v-if="entry.isCurrentUser" class="ml-4">
                    <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                      👤 {{ $t('leaderboard.you') }}
                    </span>
                  </div>
                </div>

                <!-- 积分 -->
                <div class="text-right">
                  <div class="flex items-center gap-2 text-amber-600">
                    <span class="text-xl">⭐</span>
                    <span class="text-2xl font-bold">{{ entry.points }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 加载更多 -->
          <div v-if="hasMore" class="p-6 text-center">
            <button
              @click="loadMore"
              class="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              :disabled="loadingMore"
            >
              <span v-if="loadingMore">{{ $t('leaderboard.loading') }}</span>
              <span v-else>{{ $t('messages.loadMore') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

const loading = ref(true)
const loadingMore = ref(false)
const leaderboard = ref<any[]>([])
const currentUser = ref({
  rank: null as number | null,
  userId: '',
  points: 0
})
const selectedPeriod = ref('all_time')
const pagination = ref({
  limit: 20,
  offset: 0,
  total: 0
})

// 自动刷新相关状态
const autoRefreshEnabled = ref(false)
const lastRefreshTime = ref('')
const rankChange = ref(0)
const previousRank = ref<number | null>(null)
let autoRefreshInterval: NodeJS.Timeout | null = null

const { t } = useI18n()

const periods = computed(() => [
  { value: 'all_time', label: t('leaderboard.tabs.allTime'), icon: '🏆' },
  { value: 'monthly', label: t('leaderboard.tabs.monthly'), icon: '📅' },
  { value: 'weekly', label: t('leaderboard.tabs.weekly'), icon: '📊' }
])

const topThree = computed(() => leaderboard.value.slice(0, 3))
const restOfLeaderboard = computed(() => leaderboard.value.slice(3))
const hasMore = computed(() => leaderboard.value.length < pagination.value.total)

const fetchLeaderboard = async (reset = true) => {
  if (reset) {
    loading.value = true
    pagination.value.offset = 0
    leaderboard.value = []
  } else {
    loadingMore.value = true
  }

  try {
    const response = await $fetch(`/api/leaderboard/${selectedPeriod.value}`, {
      headers: authStore.getAuthHeader() as HeadersInit,
      params: {
        limit: pagination.value.limit,
        offset: pagination.value.offset,
        examType: useExamStore().currentExamType
      }
    }) as any

    if (reset) {
      leaderboard.value = response.leaderboard
    } else {
      leaderboard.value.push(...response.leaderboard)
    }

    // 计算排名变化
    if (previousRank.value !== null && response.currentUser.rank !== null) {
      rankChange.value = previousRank.value - response.currentUser.rank
    }
    previousRank.value = response.currentUser.rank

    currentUser.value = response.currentUser
    pagination.value = response.pagination

    // 更新刷新时间
    const now = new Date()
    lastRefreshTime.value = `${t('common.refresh')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  } catch (error: any) {
    console.error('Failed to fetch leaderboard:', error)
    alert(t('errors.serverError'))
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// 切换自动刷新
const toggleAutoRefresh = () => {
  autoRefreshEnabled.value = !autoRefreshEnabled.value

  if (autoRefreshEnabled.value) {
    // 启动自动刷新（每30秒）
    autoRefreshInterval = setInterval(() => {
      fetchLeaderboard(true)
    }, 30000)
  } else {
    // 停止自动刷新
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval)
      autoRefreshInterval = null
    }
  }
}

const loadMore = () => {
  pagination.value.offset += pagination.value.limit
  fetchLeaderboard(false)
}

watch(selectedPeriod, () => {
  fetchLeaderboard(true)
})

onMounted(() => {
  fetchLeaderboard()
})

onUnmounted(() => {
  // 清理自动刷新定时器
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval)
  }
})
</script>
