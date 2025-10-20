<template>
  <div class="container mx-auto px-4 py-8 max-w-3xl">
    <!-- 页面标题 -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">通知设置</h1>
        <p class="mt-2 text-gray-600">自定义您的通知偏好和学习提醒</p>
      </div>
      <NuxtLink
        to="/notifications"
        class="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
      >
        ← 返回消息中心
      </NuxtLink>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="py-12 text-center">
      <div class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      <p class="mt-4 text-gray-600">加载中...</p>
    </div>

    <!-- 设置表单 -->
    <div v-else class="space-y-6">
      <!-- 通知渠道 -->
      <div class="bg-white rounded-lg p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">通知渠道</h2>
        <div class="space-y-4">
          <label class="flex items-center justify-between">
            <div>
              <span class="text-gray-900 font-medium">站内信通知</span>
              <p class="text-sm text-gray-600">在系统内接收通知消息</p>
            </div>
            <input
              v-model="settings.siteEnabled"
              type="checkbox"
              class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </label>

          <label class="flex items-center justify-between">
            <div>
              <span class="text-gray-900 font-medium">邮件通知</span>
              <p class="text-sm text-gray-600">通过邮件接收重要通知</p>
            </div>
            <input
              v-model="settings.emailEnabled"
              type="checkbox"
              class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      <!-- 通知类型 -->
      <div class="bg-white rounded-lg p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">通知类型</h2>
        <div class="space-y-4">
          <label class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-2xl">📚</span>
              <div>
                <span class="text-gray-900 font-medium">学习提醒</span>
                <p class="text-sm text-gray-600">定时提醒您进行学习</p>
              </div>
            </div>
            <input
              v-model="settings.studyReminder"
              type="checkbox"
              class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </label>

          <label class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-2xl">📝</span>
              <div>
                <span class="text-gray-900 font-medium">考试提醒</span>
                <p class="text-sm text-gray-600">即将到来的考试提醒</p>
              </div>
            </div>
            <input
              v-model="settings.examReminder"
              type="checkbox"
              class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </label>

          <label class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-2xl">🏆</span>
              <div>
                <span class="text-gray-900 font-medium">成就通知</span>
                <p class="text-sm text-gray-600">学习成就和里程碑提醒</p>
              </div>
            </div>
            <input
              v-model="settings.achievementAlert"
              type="checkbox"
              class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </label>

          <label class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-2xl">🔔</span>
              <div>
                <span class="text-gray-900 font-medium">系统通知</span>
                <p class="text-sm text-gray-600">系统更新和重要公告</p>
              </div>
            </div>
            <input
              v-model="settings.systemAlert"
              type="checkbox"
              class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      <!-- 学习提醒设置 -->
      <div class="bg-white rounded-lg p-6 shadow-sm" v-if="settings.studyReminder">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">学习提醒设置</h2>
        <div class="space-y-4">
          <!-- 提醒时间 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">提醒时间</label>
            <input
              v-model="settings.reminderTime"
              type="time"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- 提醒频率 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">提醒频率</label>
            <select
              v-model="settings.reminderFrequency"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="daily">每天</option>
              <option value="weekly">每周</option>
              <option value="custom">自定义</option>
            </select>
          </div>

          <!-- 提醒日期（自定义） -->
          <div v-if="settings.reminderFrequency === 'custom'">
            <label class="block text-sm font-medium text-gray-700 mb-3">提醒日期</label>
            <div class="grid grid-cols-7 gap-2">
              <button
                v-for="(day, index) in weekDays"
                :key="index"
                @click="toggleReminderDay(index)"
                :class="[
                  'py-2 rounded-lg text-sm font-medium transition-colors',
                  settings.reminderDays.includes(index)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
              >
                {{ day }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 学习目标 -->
      <div class="bg-white rounded-lg p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">每日学习目标</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              学习时长（分钟）
            </label>
            <input
              v-model.number="settings.dailyGoalMinutes"
              type="number"
              min="0"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              答题数量（道）
            </label>
            <input
              v-model.number="settings.dailyGoalQuestions"
              type="number"
              min="0"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <!-- 保存按钮 -->
      <div class="flex justify-end gap-3">
        <button
          @click="resetSettings"
          class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          重置
        </button>
        <button
          @click="saveSettings"
          :disabled="saving"
          class="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50"
        >
          {{ saving ? '保存中...' : '保存设置' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const loading = ref(true)
const saving = ref(false)

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const settings = ref({
  emailEnabled: true,
  siteEnabled: true,
  studyReminder: true,
  examReminder: true,
  achievementAlert: true,
  systemAlert: true,
  reminderTime: '19:00',
  reminderDays: [1, 2, 3, 4, 5], // 周一到周五
  reminderFrequency: 'daily',
  dailyGoalMinutes: 30,
  dailyGoalQuestions: 20
})

// 加载设置
const loadSettings = async () => {
  loading.value = true

  try {
    const { data } = await $fetch('/api/notifications/settings')
    settings.value = { ...settings.value, ...data }
  } catch (error: any) {
    console.error('Failed to load settings:', error)
  } finally {
    loading.value = false
  }
}

// 保存设置
const saveSettings = async () => {
  saving.value = true

  try {
    await $fetch('/api/notifications/settings', {
      method: 'PUT',
      body: settings.value
    })

    alert('设置已保存')
  } catch (error: any) {
    console.error('Failed to save settings:', error)
    alert('保存失败: ' + (error.data?.message || error.message))
  } finally {
    saving.value = false
  }
}

// 重置设置
const resetSettings = () => {
  settings.value = {
    emailEnabled: true,
    siteEnabled: true,
    studyReminder: true,
    examReminder: true,
    achievementAlert: true,
    systemAlert: true,
    reminderTime: '19:00',
    reminderDays: [1, 2, 3, 4, 5],
    reminderFrequency: 'daily',
    dailyGoalMinutes: 30,
    dailyGoalQuestions: 20
  }
}

// 切换提醒日期
const toggleReminderDay = (day: number) => {
  const index = settings.value.reminderDays.indexOf(day)
  if (index > -1) {
    settings.value.reminderDays.splice(index, 1)
  } else {
    settings.value.reminderDays.push(day)
  }
}

onMounted(() => {
  loadSettings()
})
</script>
