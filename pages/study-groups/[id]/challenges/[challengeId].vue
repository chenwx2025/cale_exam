<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
        <p class="mt-4 text-gray-600">加载挑战详情...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-white rounded-xl shadow-md p-8 text-center">
        <div class="text-6xl mb-4">😞</div>
        <p class="text-gray-700 mb-4">{{ error }}</p>
        <button
          @click="navigateTo(`/study-groups/${groupId}`)"
          class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
        >
          返回小组
        </button>
      </div>

      <!-- Challenge Details -->
      <div v-else-if="challenge" class="space-y-6">
        <!-- Header -->
        <div class="bg-white rounded-xl shadow-md p-6">
          <div class="flex items-start justify-between mb-4">
            <div>
              <button
                @click="navigateTo(`/study-groups/${groupId}`)"
                class="text-purple-600 hover:text-purple-700 mb-2 inline-flex items-center"
              >
                <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                返回小组
              </button>
              <h1 class="text-3xl font-bold text-gray-900">{{ challenge.name }}</h1>
              <span :class="getChallengeTypeBadgeClass(challenge.targetType)" class="inline-block px-3 py-1 rounded-lg text-sm font-medium mt-2">
                {{ getChallengeTypeLabel(challenge.targetType) }}
              </span>
            </div>
            <div :class="getChallengeStatusClass(challenge)" class="px-4 py-2 rounded-lg font-semibold">
              {{ getChallengeStatus(challenge) }}
            </div>
          </div>

          <p v-if="challenge.description" class="text-gray-700 text-lg mb-4">{{ challenge.description }}</p>

          <!-- Challenge Stats -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
              <p class="text-purple-600 text-sm font-medium mb-1">目标</p>
              <p class="text-2xl font-bold text-purple-900">{{ challenge.targetValue }} {{ getChallengeTargetUnit(challenge.targetType) }}</p>
            </div>
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <p class="text-blue-600 text-sm font-medium mb-1">参与人数</p>
              <p class="text-2xl font-bold text-blue-900">{{ challenge.participants?.length || 0 }} 人</p>
            </div>
            <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
              <p class="text-green-600 text-sm font-medium mb-1">完成人数</p>
              <p class="text-2xl font-bold text-green-900">{{ completedCount }} 人</p>
            </div>
            <div class="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4">
              <p class="text-pink-600 text-sm font-medium mb-1">奖励积分</p>
              <p class="text-2xl font-bold text-pink-900">{{ challenge.rewardPoints || 0 }}</p>
            </div>
          </div>

          <!-- Time Range -->
          <div class="mt-4 p-4 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-600">
              <span class="font-semibold">挑战时间：</span>
              {{ formatDate(challenge.startDate) }} 至 {{ formatDate(challenge.endDate) }}
            </p>
          </div>

          <!-- Join/Leave Button -->
          <div class="mt-6 flex gap-3">
            <button
              v-if="!isParticipating"
              @click="joinChallenge"
              :disabled="isJoining"
              class="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
            >
              {{ isJoining ? '加入中...' : '参加挑战' }}
            </button>
            <template v-else>
              <div class="px-6 py-3 bg-green-100 text-green-700 rounded-lg font-semibold flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                已参加
              </div>
              <button
                @click="leaveChallenge"
                :disabled="isLeaving"
                class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
              >
                {{ isLeaving ? '退出中...' : '退出挑战' }}
              </button>
            </template>
          </div>
        </div>

        <!-- My Progress -->
        <div v-if="myProgress" class="bg-white rounded-xl shadow-md p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">我的进度</h2>
          <div class="space-y-4">
            <div>
              <div class="flex justify-between text-sm mb-2">
                <span class="text-gray-600">当前进度</span>
                <span class="font-semibold text-gray-800">
                  {{ myProgress.currentValue }} / {{ challenge.targetValue }} {{ getChallengeTargetUnit(challenge.targetType) }}
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-4">
                <div
                  :style="{ width: `${Math.min((myProgress.currentValue / challenge.targetValue) * 100, 100)}%` }"
                  class="bg-gradient-to-r from-purple-500 to-pink-600 h-4 rounded-full transition-all"
                ></div>
              </div>
              <p class="text-sm text-gray-500 mt-2">
                {{ Math.round((myProgress.currentValue / challenge.targetValue) * 100) }}% 完成
              </p>
            </div>

            <div v-if="myProgress.isCompleted" class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-center">
                <svg class="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p class="font-semibold text-green-900">挑战完成！</p>
                  <p class="text-sm text-green-700">完成时间：{{ formatDate(myProgress.completedAt) }}</p>
                  <p class="text-sm text-green-700">获得积分：{{ myProgress.rewardEarned }}</p>
                </div>
              </div>
            </div>

            <div v-if="myProgress.rank" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p class="text-yellow-900">
                <span class="font-semibold">排名：</span> 第 {{ myProgress.rank }} 名
              </p>
            </div>
          </div>
        </div>

        <!-- Leaderboard -->
        <div class="bg-white rounded-xl shadow-md p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">排行榜</h2>

          <div v-if="sortedParticipants.length === 0" class="text-center py-8 text-gray-500">
            还没有参与者
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="(participant, index) in sortedParticipants"
              :key="participant.id"
              :class="[
                'flex items-center justify-between p-4 rounded-lg transition-all',
                participant.userId === currentUser?.userId ? 'bg-purple-50 border-2 border-purple-300' : 'bg-gray-50 hover:bg-gray-100'
              ]"
            >
              <div class="flex items-center gap-4">
                <div :class="getRankBadgeClass(index + 1)" class="w-10 h-10 rounded-full flex items-center justify-center font-bold">
                  {{ index + 1 }}
                </div>
                <div>
                  <p class="font-semibold text-gray-900">{{ participant.user?.name || '用户' }}</p>
                  <p class="text-sm text-gray-600">
                    加入时间：{{ formatDateShort(participant.joinedAt) }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-lg font-bold text-gray-900">
                  {{ participant.currentValue }} / {{ challenge.targetValue }}
                </p>
                <p class="text-sm text-gray-600">
                  {{ Math.round((participant.currentValue / challenge.targetValue) * 100) }}%
                </p>
                <div v-if="participant.isCompleted" class="flex items-center justify-end text-green-600 text-sm mt-1">
                  <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  已完成
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const authStore = useAuthStore()
const groupId = route.params.id
const challengeId = route.params.challengeId

const challenge = ref(null)
const loading = ref(true)
const error = ref(null)
const isJoining = ref(false)
const isLeaving = ref(false)
const currentUser = ref(null)

// Load current user
onMounted(async () => {
  await authStore.init()
  currentUser.value = authStore.user
  await loadChallenge()
})

// Computed properties
const isParticipating = computed(() => {
  if (!challenge.value || !currentUser.value) {
    console.log('[Challenge Details] isParticipating check: missing data', {
      hasChallenge: !!challenge.value,
      hasUser: !!currentUser.value
    })
    return false
  }
  const userId = currentUser.value.userId || currentUser.value.id
  const participating = challenge.value.participants?.some(p => p.userId === userId) || false
  console.log('[Challenge Details] isParticipating:', {
    userId,
    participants: challenge.value.participants?.map(p => ({ userId: p.userId, name: p.user?.name })),
    participating
  })
  return participating
})

const myProgress = computed(() => {
  if (!challenge.value || !currentUser.value) return null
  const userId = currentUser.value.userId || currentUser.value.id
  return challenge.value.participants?.find(p => p.userId === userId) || null
})

const completedCount = computed(() => {
  if (!challenge.value) return 0
  return challenge.value.participants?.filter(p => p.isCompleted).length || 0
})

const sortedParticipants = computed(() => {
  if (!challenge.value || !challenge.value.participants) return []
  return [...challenge.value.participants].sort((a, b) => {
    // Sort by completion first, then by current value
    if (a.isCompleted && !b.isCompleted) return -1
    if (!a.isCompleted && b.isCompleted) return 1
    return b.currentValue - a.currentValue
  })
})

// Load challenge details
async function loadChallenge() {
  loading.value = true
  error.value = null
  try {
    // 使用扁平路由以避免 Nuxt 嵌套动态路由问题
    console.log('[Challenge Details] 使用扁平路由 API 加载挑战详情')
    const response = await $fetch(`/api/challenge-detail?groupId=${groupId}&challengeId=${challengeId}`, {
      headers: authStore.getAuthHeader()
    })
    console.log('[Challenge Details] API响应:', response)

    if (response && response.success) {
      challenge.value = response.data
      console.log('[Challenge Details] 挑战详情加载成功')
    } else {
      error.value = '加载挑战详情失败'
    }
  } catch (err) {
    console.error('[Challenge Details] 加载挑战详情异常:', err)
    error.value = err.data?.message || '加载挑战详情失败'
  } finally {
    loading.value = false
  }
}

// Join challenge
async function joinChallenge() {
  isJoining.value = true
  try {
    // 使用扁平路由以避免 Nuxt 嵌套动态路由问题
    console.log('[Challenge Details] 使用扁平路由 API 参加挑战')
    const response = await $fetch(`/api/challenge-join`, {
      method: 'POST',
      headers: authStore.getAuthHeader(),
      body: {
        groupId,
        challengeId
      }
    })
    console.log('[Challenge Details] 参加挑战响应:', response)

    if (response && response.success) {
      console.log('[Challenge Details] 参加挑战成功，重新加载详情')
      await loadChallenge()
    } else {
      alert('加入挑战失败')
    }
  } catch (err) {
    console.error('[Challenge Details] 加入挑战异常:', err)
    alert('加入挑战失败: ' + (err.data?.message || err.message))
  } finally {
    isJoining.value = false
  }
}

// Leave challenge
async function leaveChallenge() {
  if (!confirm('确定要退出这个挑战吗？')) return

  isLeaving.value = true
  try {
    // 使用扁平路由以避免 Nuxt 嵌套动态路由问题
    console.log('[Challenge Details] 使用扁平路由 API 退出挑战')
    const response = await $fetch(`/api/challenge-leave`, {
      method: 'POST',
      headers: authStore.getAuthHeader(),
      body: {
        groupId,
        challengeId
      }
    })
    console.log('[Challenge Details] 退出挑战响应:', response)

    if (response && response.success) {
      console.log('[Challenge Details] 退出挑战成功，重新加载详情')
      await loadChallenge()
    } else {
      alert('退出挑战失败')
    }
  } catch (err) {
    console.error('[Challenge Details] 退出挑战异常:', err)
    alert('退出挑战失败: ' + (err.data?.message || err.message))
  } finally {
    isLeaving.value = false
  }
}

// Helper functions
function getChallengeTypeLabel(type) {
  const labels = {
    'daily_questions': '每日答题',
    'total_questions': '总题数',
    'accuracy_target': '正确率',
    'knowledge_mastery': '知识点',
    'study_streak': '连续学习'
  }
  return labels[type] || type
}

function getChallengeTypeBadgeClass(type) {
  const classes = {
    'daily_questions': 'bg-blue-100 text-blue-700',
    'total_questions': 'bg-green-100 text-green-700',
    'accuracy_target': 'bg-yellow-100 text-yellow-700',
    'knowledge_mastery': 'bg-purple-100 text-purple-700',
    'study_streak': 'bg-pink-100 text-pink-700'
  }
  return classes[type] || 'bg-gray-100 text-gray-700'
}

function getChallengeStatus(challenge) {
  const now = new Date()
  const start = new Date(challenge.startDate)
  const end = new Date(challenge.endDate)

  if (now < start) return '即将开始'
  if (now > end) return '已结束'
  return '进行中'
}

function getChallengeStatusClass(challenge) {
  const status = getChallengeStatus(challenge)
  if (status === '进行中') return 'bg-green-100 text-green-700'
  if (status === '即将开始') return 'bg-blue-100 text-blue-700'
  return 'bg-gray-100 text-gray-700'
}

function getChallengeTargetUnit(type) {
  const units = {
    'daily_questions': '题/天',
    'total_questions': '题',
    'accuracy_target': '%',
    'knowledge_mastery': '个',
    'study_streak': '天'
  }
  return units[type] || ''
}

function getRankBadgeClass(rank) {
  if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white'
  if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-400 text-white'
  if (rank === 3) return 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
  return 'bg-gray-200 text-gray-700'
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatDateShort(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
}
</script>
