<template>
  <div class="space-y-6">
    <!-- Create Challenge Button -->
    <div class="flex justify-between items-center">
      <h3 class="text-xl font-bold text-gray-800">小组挑战</h3>
      <button
        v-if="canManage"
        @click="$emit('create-challenge')"
        class="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all"
      >
        创建挑战
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loadingChallenges" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
      <p class="mt-2 text-gray-600">加载挑战中...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="challenges.length === 0" class="bg-white rounded-xl shadow-md p-8 text-center">
      <div class="text-6xl mb-4">🏆</div>
      <p class="text-gray-500 mb-4">还没有挑战，创建一个来激励大家学习吧！</p>
      <button
        v-if="canManage"
        @click="$emit('create-challenge')"
        class="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all"
      >
        创建第一个挑战
      </button>
    </div>

    <!-- Challenges List -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="challenge in challenges"
        :key="challenge.id"
        class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
      >
        <!-- Challenge Header -->
        <div class="flex items-start justify-between mb-4">
          <div>
            <h4 class="text-lg font-bold text-gray-800">{{ challenge.name }}</h4>
            <span :class="getChallengeTypeBadgeClass(challenge.type)" class="inline-block px-2 py-1 rounded text-xs font-medium mt-1">
              {{ getChallengeTypeLabel(challenge.type) }}
            </span>
          </div>
          <div :class="getChallengeStatusClass(challenge)" class="px-3 py-1 rounded-lg text-xs font-semibold">
            {{ getChallengeStatus(challenge) }}
          </div>
        </div>

        <!-- Challenge Description -->
        <p v-if="challenge.description" class="text-gray-600 text-sm mb-4">{{ challenge.description }}</p>

        <!-- Challenge Stats -->
        <div class="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">目标</span>
            <span class="font-semibold text-gray-800">{{ challenge.target }} {{ getChallengeTargetUnit(challenge.type) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">参与人数</span>
            <span class="font-semibold text-gray-800">{{ challenge.participantCount || 0 }} 人</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">时间</span>
            <span class="font-semibold text-gray-800">
              {{ formatDateShort(challenge.startDate) }} - {{ formatDateShort(challenge.endDate) }}
            </span>
          </div>
        </div>

        <!-- User Progress -->
        <div v-if="getUserProgress(challenge)" class="mb-4">
          <div class="flex justify-between text-sm mb-1">
            <span class="text-gray-600">我的进度</span>
            <span class="font-semibold text-gray-800">
              {{ getUserProgress(challenge).progress }} / {{ challenge.target }}
            </span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              :style="{ width: `${Math.min((getUserProgress(challenge).progress / challenge.target) * 100, 100)}%` }"
              class="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all"
            ></div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2">
          <button
            v-if="!isParticipating(challenge)"
            @click="joinChallenge(challenge.id)"
            :disabled="isJoining"
            class="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {{ isJoining ? '加入中...' : '参加挑战' }}
          </button>
          <button
            v-else
            @click="leaveChallenge(challenge.id)"
            :disabled="isLeaving"
            class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {{ isLeaving ? '退出中...' : '退出挑战' }}
          </button>
          <button
            @click="viewChallengeDetails(challenge.id)"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
          >
            查看详情
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  groupId: {
    type: String,
    required: true
  },
  canManage: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['create-challenge'])

const authStore = useAuthStore()
const router = useRouter()
const challenges = ref([])
const loadingChallenges = ref(false)
const isJoining = ref(false)
const isLeaving = ref(false)
const currentUser = ref(null)

// Load current user
onMounted(async () => {
  await authStore.init()
  currentUser.value = authStore.user
  await loadChallenges()
})

// Load challenges
async function loadChallenges() {
  loadingChallenges.value = true
  try {
    // 使用扁平路由以避免 Nuxt 嵌套动态路由问题
    console.log('[ChallengesTab] 使用扁平路由 API 加载挑战')
    const response = await $fetch(`/api/study-group-challenges?groupId=${props.groupId}`, {
      headers: authStore.getAuthHeader()
    })
    console.log('[ChallengesTab] API响应:', response)
    if (response && response.data) {
      challenges.value = response.data || []
      console.log('[ChallengesTab] 加载到挑战数量:', challenges.value.length)
    }
  } catch (err) {
    console.error('[ChallengesTab] 加载挑战异常:', err)
    // Don't show alert for empty challenges
  } finally {
    loadingChallenges.value = false
  }
}

// Join challenge
async function joinChallenge(challengeId) {
  isJoining.value = true
  try {
    // 使用扁平路由以避免 Nuxt 嵌套动态路由问题
    console.log('[ChallengesTab] 使用扁平路由 API 参加挑战')
    const response = await $fetch(`/api/challenge-join`, {
      method: 'POST',
      headers: authStore.getAuthHeader(),
      body: {
        groupId: props.groupId,
        challengeId
      }
    })
    console.log('[ChallengesTab] 参加挑战响应:', response)

    if (response && response.success) {
      console.log('[ChallengesTab] 参加挑战成功，重新加载列表')
      await loadChallenges()
    } else {
      alert('加入挑战失败')
    }
  } catch (err) {
    console.error('[ChallengesTab] 加入挑战异常:', err)
    alert('加入挑战失败: ' + (err.data?.message || err.message))
  } finally {
    isJoining.value = false
  }
}

// Leave challenge
async function leaveChallenge(challengeId) {
  if (!confirm('确定要退出这个挑战吗？')) return

  isLeaving.value = true
  try {
    // 使用扁平路由以避免 Nuxt 嵌套动态路由问题
    console.log('[ChallengesTab] 使用扁平路由 API 退出挑战')
    const response = await $fetch(`/api/challenge-leave`, {
      method: 'POST',
      headers: authStore.getAuthHeader(),
      body: {
        groupId: props.groupId,
        challengeId
      }
    })
    console.log('[ChallengesTab] 退出挑战响应:', response)

    if (response && response.success) {
      console.log('[ChallengesTab] 退出挑战成功，重新加载列表')
      await loadChallenges()
    } else {
      alert('退出挑战失败')
    }
  } catch (err) {
    console.error('[ChallengesTab] 退出挑战异常:', err)
    alert('退出挑战失败: ' + (err.data?.message || err.message))
  } finally {
    isLeaving.value = false
  }
}

// View challenge details
function viewChallengeDetails(challengeId) {
  console.log('[ChallengesTab] Viewing challenge details:', challengeId)
  console.log('[ChallengesTab] Navigating to:', `/study-groups/${props.groupId}/challenges/${challengeId}`)
  router.push(`/study-groups/${props.groupId}/challenges/${challengeId}`)
}

// Check if user is participating
function isParticipating(challenge) {
  return challenge.isParticipating || false
}

// Get user progress
function getUserProgress(challenge) {
  if (!challenge.myProgress) return null
  return {
    progress: challenge.myProgress.currentValue || 0
  }
}

// Get challenge type label
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

// Get challenge type badge class
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

// Get challenge status
function getChallengeStatus(challenge) {
  const now = new Date()
  const start = new Date(challenge.startDate)
  const end = new Date(challenge.endDate)

  if (now < start) return '即将开始'
  if (now > end) return '已结束'
  return '进行中'
}

// Get challenge status class
function getChallengeStatusClass(challenge) {
  const status = getChallengeStatus(challenge)
  if (status === '进行中') return 'bg-green-100 text-green-700'
  if (status === '即将开始') return 'bg-blue-100 text-blue-700'
  return 'bg-gray-100 text-gray-700'
}

// Get challenge target unit
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

// Format date
function formatDateShort(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
}

// Expose loadChallenges for parent component
defineExpose({
  loadChallenges
})
</script>
