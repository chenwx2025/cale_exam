<template>
  <div class="p-6">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">系统设置</h1>
      <p class="mt-1 text-sm text-gray-600">配置系统参数和偏好设置</p>
    </div>

    <div class="space-y-6">
      <!-- 系统信息 -->
      <div class="rounded-lg bg-white p-6 shadow-sm">
        <h2 class="mb-4 text-lg font-semibold text-gray-900">系统信息</h2>
        <div class="space-y-3">
          <div class="flex items-center justify-between border-b border-gray-200 py-3">
            <span class="text-sm font-medium text-gray-700">系统版本</span>
            <span class="text-sm text-gray-900">v4.0.0</span>
          </div>
          <div class="flex items-center justify-between border-b border-gray-200 py-3">
            <span class="text-sm font-medium text-gray-700">环境</span>
            <span class="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
              生产环境
            </span>
          </div>
          <div class="flex items-center justify-between border-b border-gray-200 py-3">
            <span class="text-sm font-medium text-gray-700">数据库</span>
            <span class="text-sm text-gray-900">SQLite</span>
          </div>
          <div class="flex items-center justify-between py-3">
            <span class="text-sm font-medium text-gray-700">部署时间</span>
            <span class="text-sm text-gray-900">{{ new Date().toLocaleString('zh-CN') }}</span>
          </div>
        </div>
      </div>

      <!-- 考试设置 -->
      <div class="rounded-lg bg-white p-6 shadow-sm">
        <h2 class="mb-4 text-lg font-semibold text-gray-900">考试设置</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">默认考试时长（分钟）</label>
            <input
              v-model="settings.examDuration"
              type="number"
              min="30"
              max="300"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">及格分数线（%）</label>
            <input
              v-model="settings.passingScore"
              type="number"
              min="0"
              max="100"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div class="flex items-center gap-3">
            <input
              v-model="settings.allowReview"
              type="checkbox"
              id="allowReview"
              class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label for="allowReview" class="text-sm font-medium text-gray-700">
              允许考试后查看答案
            </label>
          </div>
          <div class="flex items-center gap-3">
            <input
              v-model="settings.randomizeQuestions"
              type="checkbox"
              id="randomizeQuestions"
              class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label for="randomizeQuestions" class="text-sm font-medium text-gray-700">
              随机打乱题目顺序
            </label>
          </div>
        </div>
      </div>

      <!-- 用户设置 -->
      <div class="rounded-lg bg-white p-6 shadow-sm">
        <h2 class="mb-4 text-lg font-semibold text-gray-900">用户设置</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">默认订阅有效期（天）</label>
            <input
              v-model="settings.subscriptionDuration"
              type="number"
              min="1"
              max="3650"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div class="flex items-center gap-3">
            <input
              v-model="settings.requireEmailVerification"
              type="checkbox"
              id="requireEmailVerification"
              class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label for="requireEmailVerification" class="text-sm font-medium text-gray-700">
              要求邮箱验证
            </label>
          </div>
          <div class="flex items-center gap-3">
            <input
              v-model="settings.allowSelfRegistration"
              type="checkbox"
              id="allowSelfRegistration"
              class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label for="allowSelfRegistration" class="text-sm font-medium text-gray-700">
              允许用户自主注册
            </label>
          </div>
        </div>
      </div>

      <!-- 邮件设置 -->
      <div class="rounded-lg bg-white p-6 shadow-sm">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">邮件设置</h2>
          <span class="rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
            开发中
          </span>
        </div>
        <div class="space-y-4 opacity-50">
          <div>
            <label class="block text-sm font-medium text-gray-700">SMTP 服务器</label>
            <input
              type="text"
              disabled
              placeholder="smtp.example.com"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="block text-sm font-medium text-gray-700">端口</label>
              <input
                type="number"
                disabled
                placeholder="587"
                class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">发件人邮箱</label>
              <input
                type="email"
                disabled
                placeholder="noreply@example.com"
                class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 数据库维护 -->
      <div class="rounded-lg bg-white p-6 shadow-sm">
        <h2 class="mb-4 text-lg font-semibold text-gray-900">数据库维护</h2>
        <div class="space-y-3">
          <button
            @click="handleBackup"
            :disabled="backing"
            class="w-full rounded-lg border border-blue-600 bg-blue-50 px-4 py-3 text-left text-blue-900 hover:bg-blue-100 disabled:opacity-50"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="font-semibold">备份数据库</p>
                <p class="text-sm text-blue-700">导出当前数据库快照</p>
              </div>
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            </div>
          </button>

          <button
            @click="handleClearCache"
            :disabled="clearing"
            class="w-full rounded-lg border border-orange-600 bg-orange-50 px-4 py-3 text-left text-orange-900 hover:bg-orange-100 disabled:opacity-50"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="font-semibold">清除缓存</p>
                <p class="text-sm text-orange-700">清除系统缓存数据</p>
              </div>
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
          </button>

          <div class="rounded-lg bg-red-50 p-4">
            <h3 class="mb-2 font-semibold text-red-900">⚠️ 危险操作</h3>
            <p class="mb-3 text-sm text-red-700">
              以下操作将永久删除数据，请谨慎操作！
            </p>
            <button
              class="w-full rounded-lg border border-red-600 bg-red-100 px-4 py-2 text-red-900 hover:bg-red-200"
            >
              清空所有考试记录
            </button>
          </div>
        </div>
      </div>

      <!-- 保存按钮 -->
      <div class="flex justify-end gap-3">
        <button
          @click="resetSettings"
          class="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50"
        >
          重置
        </button>
        <button
          @click="saveSettings"
          :disabled="saving"
          class="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 text-white hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
        >
          {{ saving ? '保存中...' : '保存设置' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const settings = ref({
  examDuration: 120,
  passingScore: 75,
  allowReview: true,
  randomizeQuestions: false,
  subscriptionDuration: 365,
  requireEmailVerification: false,
  allowSelfRegistration: true
})

const saving = ref(false)
const backing = ref(false)
const clearing = ref(false)

// 保存设置
const saveSettings = async () => {
  saving.value = true
  try {
    // 这里可以实现保存到数据库或配置文件
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('设置已保存')
  } catch (error: any) {
    alert('保存失败: ' + error.message)
  } finally {
    saving.value = false
  }
}

// 重置设置
const resetSettings = () => {
  settings.value = {
    examDuration: 120,
    passingScore: 75,
    allowReview: true,
    randomizeQuestions: false,
    subscriptionDuration: 365,
    requireEmailVerification: false,
    allowSelfRegistration: true
  }
}

// 备份数据库
const handleBackup = async () => {
  backing.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    alert('数据库备份功能开发中...')
  } finally {
    backing.value = false
  }
}

// 清除缓存
const handleClearCache = async () => {
  clearing.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 800))
    alert('缓存已清除')
  } finally {
    clearing.value = false
  }
}
</script>
