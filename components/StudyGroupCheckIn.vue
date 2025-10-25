<template>
  <div :class="hideCard ? '' : 'bg-white rounded-xl shadow-md p-6'">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      <p class="mt-4 text-gray-600">加载中...</p>
    </div>

    <!-- Main Content -->
    <div v-else class="space-y-6">
      <!-- 1. 今日打卡状态区 -->
      <div class="text-center">
        <p class="text-lg text-gray-600 mb-4">📅 {{ currentDate }}</p>

        <!-- 未打卡状态 -->
        <div v-if="!checkInData.todayCheckIn" class="mb-6">
          <button
            @click="doCheckIn"
            :disabled="isCheckingIn"
            class="px-12 py-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xl font-bold rounded-2xl hover:shadow-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <span v-if="!isCheckingIn" class="flex items-center gap-3 justify-center">
              🔥 打 卡
            </span>
            <span v-else class="flex items-center gap-3 justify-center">
              <svg class="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              打卡中...
            </span>
          </button>
          <p class="mt-3 text-sm text-gray-500">💡 今天还未打卡，点击按钮完成打卡</p>
        </div>

        <!-- 已打卡状态 -->
        <div v-else class="mb-6">
          <div class="inline-block bg-gradient-to-r from-green-500 to-emerald-600 text-white px-12 py-6 rounded-2xl">
            <div class="flex items-center gap-3 justify-center text-xl font-bold mb-2">
              ✅ 已打卡
            </div>
            <p class="text-sm">{{ checkInData.todayCheckIn.checkInTime }} 完成打卡</p>
          </div>
          <p class="mt-3 text-sm text-green-600 font-medium">🎉 太棒了！你已完成今日打卡</p>
        </div>
      </div>

      <!-- 2. 个人统计区 -->
      <div v-if="checkInData.stats" class="grid grid-cols-3 gap-4">
        <div class="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4 text-center">
          <div class="text-4xl font-bold text-orange-600 mb-1">🔥 {{ checkInData.stats.streakDays }}</div>
          <div class="text-sm font-semibold text-orange-700">连续天数</div>
        </div>
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 text-center">
          <div class="text-4xl font-bold text-blue-600 mb-1">✓ {{ checkInData.stats.totalCheckIns }}</div>
          <div class="text-sm font-semibold text-blue-700">累计天数</div>
        </div>
        <div class="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 text-center">
          <div class="text-4xl font-bold text-purple-600 mb-1">📊 {{ checkInData.stats.attendanceRate }}%</div>
          <div class="text-sm font-semibold text-purple-700">出勤率</div>
        </div>
      </div>

      <!-- 3. 本周打卡日历 -->
      <div v-if="checkInData.weeklyCalendar" class="bg-gray-50 rounded-xl p-4">
        <h3 class="text-sm font-bold text-gray-700 mb-3">本周打卡记录</h3>
        <div class="grid grid-cols-7 gap-2">
          <div
            v-for="day in checkInData.weeklyCalendar"
            :key="day.date"
            :class="[
              'text-center p-3 rounded-lg transition-all',
              day.isToday ? 'ring-2 ring-blue-500' : '',
              day.checked ? 'bg-green-100 border-2 border-green-400' : 'bg-white border-2 border-gray-200'
            ]"
          >
            <div class="text-xs text-gray-600 mb-1">{{ day.dayOfWeek }}</div>
            <div class="text-lg">{{ day.checked ? '✅' : '' }}</div>
            <div class="text-xs text-gray-500">{{ day.date.split('-')[2] }}</div>
          </div>
        </div>
      </div>

      <!-- 4 & 5. 排行榜和动态 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 小组排行榜 -->
        <div v-if="checkInData.leaderboard" class="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4">
          <h3 class="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            🏆 小组排行榜
            <span class="text-xs text-gray-500">(按连续天数)</span>
          </h3>
          <div class="space-y-2">
            <div
              v-for="(leader, index) in checkInData.leaderboard.slice(0, 5)"
              :key="leader.userId"
              :class="[
                'flex items-center justify-between p-3 rounded-lg transition-all',
                leader.isCurrentUser ? 'bg-blue-100 border-2 border-blue-400 font-bold' : 'bg-white'
              ]"
            >
              <div class="flex items-center gap-2">
                <span class="text-xl">{{ index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.` }}</span>
                <span class="truncate">{{ leader.userName }}</span>
              </div>
              <span class="text-orange-600 font-bold whitespace-nowrap">🔥 {{ leader.streakDays }} 天</span>
            </div>
          </div>
        </div>

        <!-- 今日打卡动态 -->
        <div v-if="checkInData.recentCheckIns" class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
          <h3 class="text-sm font-bold text-gray-700 mb-3">今日小组动态</h3>
          <div v-if="checkInData.recentCheckIns.length > 0" class="space-y-2">
            <div
              v-for="activity in checkInData.recentCheckIns"
              :key="activity.userId"
              class="flex items-center justify-between p-3 bg-white rounded-lg"
            >
              <div class="flex items-center gap-2">
                <span>👤</span>
                <span class="text-sm">{{ activity.userName }}</span>
              </div>
              <span class="text-xs text-gray-500">{{ activity.checkInTime }}</span>
            </div>
            <div class="mt-3 p-3 bg-green-100 rounded-lg text-center">
              <span class="text-sm font-semibold text-green-700">
                🎉 今日已有 {{ checkInData.groupStats.todayCheckInCount }} 人完成打卡
              </span>
            </div>
          </div>
          <div v-else class="text-center py-6 text-gray-500">
            <p class="text-sm">今天还没有人打卡</p>
            <p class="text-xs mt-1">成为第一个打卡的成员吧！</p>
          </div>
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
  hideCard: {
    type: Boolean,
    default: false
  }
})

const authStore = useAuthStore()

// Data
const loading = ref(true)
const isCheckingIn = ref(false)
const checkInData = ref({
  todayCheckIn: null,
  stats: null,
  weeklyCalendar: [],
  leaderboard: [],
  recentCheckIns: [],
  groupStats: {}
})

// 当前日期
const currentDate = computed(() => {
  const now = new Date()
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const date = now.getDate()
  const dayOfWeek = weekDays[now.getDay()]

  return `${year}年${month}月${date}日 ${dayOfWeek}`
})

// Load check-in data
const loadCheckInData = async () => {
  try {
    loading.value = true
    console.log('[StudyGroupCheckIn] 开始加载数据...')
    console.log('[StudyGroupCheckIn] 使用扁平路由 GET API')

    const response = await $fetch(`/api/study-group-check-in?groupId=${props.groupId}`, {
      headers: authStore.getAuthHeader()
    })

    console.log('[StudyGroupCheckIn] API响应:', response)

    if (response.success && response.data) {
      checkInData.value = response.data
      console.log('[StudyGroupCheckIn] 数据加载成功:', {
        todayCheckIn: checkInData.value.todayCheckIn ? '已打卡' : '未打卡',
        streakDays: checkInData.value.stats?.streakDays,
        totalCheckIns: checkInData.value.stats?.totalCheckIns
      })
    }
  } catch (error) {
    console.error('[StudyGroupCheckIn] 加载失败:', error)

    // Check if it's an authentication error
    if (error.statusCode === 401 || error.status === 401) {
      console.error('[StudyGroupCheckIn] 认证失败，token可能已过期')
      alert('您的登录已过期，请重新登录。\n\n系统将在3秒后跳转到登录页面...')
      setTimeout(() => {
        authStore.logout()
        navigateTo('/login')
      }, 3000)
    }
  } finally {
    loading.value = false
  }
}

// Submit check-in (一键打卡)
const doCheckIn = async () => {
  console.log('[StudyGroupCheckIn] ========== 打卡按钮被点击 ==========')
  console.log('[StudyGroupCheckIn] groupId:', props.groupId)
  console.log('[StudyGroupCheckIn] authStore:', authStore)

  try {
    isCheckingIn.value = true
    console.log('[StudyGroupCheckIn] 开始打卡...')
    console.log('[StudyGroupCheckIn] 使用扁平路由 API: /api/study-group-check-in')

    const headers = authStore.getAuthHeader()
    console.log('[StudyGroupCheckIn] Headers:', headers)

    const response = await $fetch(`/api/study-group-check-in?groupId=${props.groupId}`, {
      method: 'POST',
      headers
    })

    console.log('[StudyGroupCheckIn] 打卡响应 - 完整对象:', response)
    console.log('[StudyGroupCheckIn] response.success 的值:', response.success)
    console.log('[StudyGroupCheckIn] response.success 的类型:', typeof response.success)

    if (response.success) {
      // 打卡成功，重新加载数据
      console.log('[StudyGroupCheckIn] ✅ 打卡成功！准备重新加载数据...')
      await loadCheckInData()
      console.log('[StudyGroupCheckIn] ✅ 数据重新加载完成！')
      alert('打卡成功！')
    } else {
      console.error('[StudyGroupCheckIn] ❌ 打卡失败，响应:', response)
      alert(response.message || '打卡失败')
    }
  } catch (error) {
    console.error('[StudyGroupCheckIn] ========== 打卡异常 ==========')
    console.error('[StudyGroupCheckIn] 错误对象:', error)
    console.error('[StudyGroupCheckIn] 错误消息:', error.message)
    console.error('[StudyGroupCheckIn] 错误数据:', error.data)
    console.error('[StudyGroupCheckIn] 完整错误:', JSON.stringify(error, null, 2))

    // Check if it's an authentication error
    if (error.statusCode === 401 || error.status === 401) {
      alert('您的登录已过期，请重新登录后再试。\n\n系统将在3秒后跳转到登录页面...')
      setTimeout(() => {
        // Clear auth store and redirect to login
        authStore.logout()
        navigateTo('/login')
      }, 3000)
    } else if (error.data?.message) {
      alert('打卡失败: ' + error.data.message)
    } else if (error.message) {
      alert('打卡失败: ' + error.message)
    } else {
      alert('打卡失败: 未知错误')
    }
  } finally {
    isCheckingIn.value = false
    console.log('[StudyGroupCheckIn] 打卡流程结束')
  }
}

// Test simple POST
const testSimplePost = async () => {
  console.log('[TEST] 测试简单 POST API...')
  try {
    const response = await $fetch('/api/test-checkin', {
      method: 'POST'
    })
    console.log('[TEST] 响应:', response)
    alert('测试成功！' + JSON.stringify(response))
  } catch (error) {
    console.error('[TEST] 错误:', error)
    alert('测试失败: ' + error.message)
  }
}

// Load data on mount
onMounted(() => {
  console.log('[StudyGroupCheckIn] ========== 组件已挂载 ==========')
  console.log('[StudyGroupCheckIn] groupId:', props.groupId)
  console.log('[StudyGroupCheckIn] hideCard:', props.hideCard)
  console.log('[StudyGroupCheckIn] authStore存在:', !!authStore)
  loadCheckInData()
})

// 组件创建时就输出日志
console.log('[StudyGroupCheckIn] ========== 组件脚本已加载 ==========')
console.log('[StudyGroupCheckIn] Props:', props)
</script>
