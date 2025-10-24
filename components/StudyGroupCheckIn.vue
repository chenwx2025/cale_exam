<template>
  <div class="bg-white rounded-xl shadow-md p-6">
    <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
      <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      学习打卡
    </h2>

    <!-- Today's Check-in Status -->
    <div v-if="todayCheckIn" class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
      <div class="flex items-center gap-2 mb-2">
        <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <span class="font-semibold text-green-900">今天已打卡</span>
      </div>
      <div class="text-sm text-green-700 space-y-1">
        <p>答题数: {{ todayCheckIn.questionsCount }} 题</p>
        <p>学习时长: {{ todayCheckIn.studyMinutes }} 分钟</p>
        <p v-if="todayCheckIn.note" class="italic">"{{ todayCheckIn.note }}"</p>
      </div>
      <div class="mt-3 flex items-center gap-2">
        <span class="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-semibold rounded-full">
          🔥 连续打卡 {{ streakDays }} 天
        </span>
      </div>
    </div>

    <!-- Check-in Form -->
    <div v-else class="space-y-4">
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">今日答题数</label>
        <input
          v-model.number="checkInForm.questionsCount"
          type="number"
          min="0"
          placeholder="今天答了多少题？"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">学习时长（分钟）</label>
        <input
          v-model.number="checkInForm.studyMinutes"
          type="number"
          min="0"
          placeholder="今天学习了多久？"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">学习心得（选填）</label>
        <textarea
          v-model="checkInForm.note"
          placeholder="分享今天的学习心得..."
          rows="3"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        ></textarea>
      </div>

      <button
        @click="submitCheckIn"
        :disabled="submitting"
        class="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ submitting ? '打卡中...' : '✓ 立即打卡' }}
      </button>
    </div>

    <!-- Stats Summary -->
    <div v-if="stats" class="mt-6 pt-6 border-t border-gray-200">
      <h3 class="text-sm font-bold text-gray-700 mb-3">本周打卡统计</h3>
      <div class="grid grid-cols-3 gap-3 text-center">
        <div class="bg-blue-50 rounded-lg p-3">
          <p class="text-2xl font-bold text-blue-600">{{ stats.summary.activeUsers }}</p>
          <p class="text-xs text-gray-600">活跃成员</p>
        </div>
        <div class="bg-purple-50 rounded-lg p-3">
          <p class="text-2xl font-bold text-purple-600">{{ stats.summary.totalCheckIns }}</p>
          <p class="text-xs text-gray-600">总打卡</p>
        </div>
        <div class="bg-green-50 rounded-lg p-3">
          <p class="text-2xl font-bold text-green-600">{{ Math.round(stats.summary.participationRate) }}%</p>
          <p class="text-xs text-gray-600">参与率</p>
        </div>
      </div>

      <!-- Leaderboard Preview -->
      <div v-if="stats.leaderboards?.streak?.length > 0" class="mt-4">
        <h4 class="text-xs font-semibold text-gray-600 mb-2">🔥 连续打卡榜</h4>
        <div class="space-y-2">
          <div
            v-for="(leader, index) in stats.leaderboards.streak.slice(0, 3)"
            :key="leader.userId"
            class="flex items-center gap-2 text-sm"
          >
            <span class="text-lg">{{ index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉' }}</span>
            <span class="flex-1 truncate">{{ leader.user.name || leader.user.email }}</span>
            <span class="font-bold text-amber-600">{{ leader.streakDays }} 天</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  groupId: string
}>()

const authStore = useAuthStore()

// Data
const todayCheckIn = ref<any>(null)
const streakDays = ref(0)
const stats = ref<any>(null)
const submitting = ref(false)
const checkInForm = ref({
  questionsCount: 0,
  studyMinutes: 0,
  note: ''
})

// Load today's check-in status
const loadCheckIn = async () => {
  try {
    const response = await $fetch(`/api/study-groups/${props.groupId}/check-in`, {
      headers: authStore.getAuthHeader() as HeadersInit
    }) as any

    if (response.success && response.data?.checkIns?.length > 0) {
      const today = new Date().toISOString().split('T')[0]
      todayCheckIn.value = response.data.checkIns.find((c: any) => c.checkInDate === today)
      streakDays.value = response.data.streakDays || 0
    }
  } catch (error: any) {
    console.error('加载打卡记录失败:', error)
  }
}

// Load stats
const loadStats = async () => {
  try {
    const response = await $fetch(`/api/study-groups/${props.groupId}/check-in/stats?period=7`, {
      headers: authStore.getAuthHeader() as HeadersInit
    }) as any

    if (response.success) {
      stats.value = response.data
    }
  } catch (error: any) {
    console.error('加载统计失败:', error)
  }
}

// Submit check-in
const submitCheckIn = async () => {
  try {
    submitting.value = true
    const response = await $fetch(`/api/study-groups/${props.groupId}/check-in`, {
      method: 'POST',
      headers: authStore.getAuthHeader() as HeadersInit,
      body: checkInForm.value
    }) as any

    if (response.success) {
      todayCheckIn.value = response.data
      streakDays.value = response.data.streakDays || 0
      checkInForm.value = { questionsCount: 0, studyMinutes: 0, note: '' }
      await loadStats() // Reload stats
    }
  } catch (error: any) {
    console.error('打卡失败:', error)
    alert('打卡失败: ' + (error.data?.message || error.message))
  } finally {
    submitting.value = false
  }
}

// Load data on mount
onMounted(() => {
  loadCheckIn()
  loadStats()
})
</script>
