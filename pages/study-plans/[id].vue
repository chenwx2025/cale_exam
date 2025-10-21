<template>
  <div>
    <!-- 加载状态 -->
    <div v-if="pending" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">加载中...</p>
    </div>

    <div v-else-if="plan" class="space-y-6">
      <!-- 返回按钮 -->
      <NuxtLink
        to="/study-plans"
        class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        返回学习计划列表
      </NuxtLink>

      <!-- 计划头部 -->
      <div class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
        <div class="flex items-start justify-between mb-6">
          <div class="flex-1">
            <h1 class="text-3xl font-bold mb-2">{{ plan.name }}</h1>
            <p v-if="plan.description" class="text-blue-100">{{ plan.description }}</p>
          </div>
          <div class="flex items-center gap-3">
            <span
              v-if="plan.isActive"
              class="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold"
            >
              进行中
            </span>
            <button
              @click="deletePlan"
              class="px-4 py-2 bg-red-500/80 hover:bg-red-600 backdrop-blur-sm rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
              title="删除学习计划"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
              删除计划
            </button>
          </div>
        </div>

        <!-- 进度统计 -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <div class="text-3xl font-bold">{{ plan.stats.progress }}%</div>
            <div class="text-sm text-blue-100 mt-1">总进度</div>
          </div>
          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <div class="text-3xl font-bold">{{ plan.stats.completedQuestions }}</div>
            <div class="text-sm text-blue-100 mt-1">已完成</div>
          </div>
          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <div class="text-3xl font-bold">{{ plan.stats.totalQuestions }}</div>
            <div class="text-sm text-blue-100 mt-1">总题数</div>
          </div>
          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <div class="text-3xl font-bold">{{ plan.stats.daysRemaining }}</div>
            <div class="text-sm text-blue-100 mt-1">剩余天数</div>
          </div>
          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <div class="text-3xl font-bold">{{ plan.stats.questionsPerDay }}</div>
            <div class="text-sm text-blue-100 mt-1">每天题数</div>
          </div>
        </div>

        <!-- 进度条 -->
        <div>
          <div class="flex items-center justify-between text-sm mb-2">
            <span>学习进度</span>
            <span>{{ plan.stats.completedQuestions }} / {{ plan.stats.totalQuestions }} 题</span>
          </div>
          <div class="w-full bg-white/20 rounded-full h-3">
            <div
              class="bg-white h-3 rounded-full transition-all"
              :style="{ width: `${plan.stats.progress}%` }"
            ></div>
          </div>
        </div>

        <!-- 进度状态提示 -->
        <div v-if="plan.stats.onTrack" class="mt-4 p-3 bg-green-500/30 rounded-lg flex items-center gap-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
          <span>进度正常，继续保持！</span>
        </div>
        <div v-else class="mt-4 p-3 bg-yellow-500/30 rounded-lg flex items-center gap-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
          <span>学习进度稍慢，建议加把劲！</span>
        </div>
      </div>

      <!-- 按日期查看 / 按分类查看 切换 -->
      <div class="bg-white rounded-xl shadow-md p-6">
        <div class="flex border-b border-gray-200 mb-6">
          <button
            @click="viewMode = 'byDate'"
            class="pb-4 px-6 font-semibold transition-colors relative"
            :class="viewMode === 'byDate' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'"
          >
            <span>按日期查看</span>
            <div v-if="viewMode === 'byDate'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
          </button>
          <button
            @click="viewMode = 'byCategory'"
            class="pb-4 px-6 font-semibold transition-colors relative"
            :class="viewMode === 'byCategory' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'"
          >
            <span>按分类查看</span>
            <div v-if="viewMode === 'byCategory'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
          </button>
        </div>

        <!-- 按日期查看 -->
        <div v-if="viewMode === 'byDate'" class="space-y-6">
          <div v-for="(items, date) in plan.itemsByDate" :key="date" class="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-bold text-gray-900">{{ formatDate(date) }}</h3>
              <span class="text-sm text-gray-600">
                {{ items.filter(i => i.completed).length }} / {{ items.length }} 已完成
              </span>
            </div>

            <div class="grid gap-3">
              <div
                v-for="item in items"
                :key="item.id"
                class="flex items-start gap-3 p-4 rounded-lg border-2 transition-all"
                :class="item.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 hover:border-blue-300'"
              >
                <input
                  type="checkbox"
                  :checked="item.completed"
                  @change="toggleComplete(item.id, !item.completed)"
                  class="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div class="flex-1">
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex-1">
                      <span class="text-sm px-2 py-1 rounded bg-blue-100 text-blue-700 font-semibold">
                        {{ item.question.category.name }}
                      </span>
                    </div>
                  </div>
                  <p class="text-gray-800 leading-relaxed">{{ item.question.question }}</p>
                  <div v-if="item.completed && item.completedAt" class="mt-2 text-xs text-green-600">
                    ✓ 完成于 {{ formatDateTime(item.completedAt) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 按分类查看 -->
        <div v-if="viewMode === 'byCategory'" class="space-y-4">
          <div
            v-for="(stats, catId) in plan.categoryStats"
            :key="catId"
            class="p-4 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold text-gray-900">{{ stats.name }}</h3>
              <span class="text-sm font-semibold text-blue-600">
                {{ stats.completed }} / {{ stats.total }}
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-blue-600 h-2 rounded-full transition-all"
                :style="{ width: `${(stats.completed / stats.total) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else class="bg-white rounded-xl shadow-md p-12 text-center">
      <svg class="w-24 h-24 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <h2 class="text-2xl font-bold text-gray-800 mb-2">学习计划不存在</h2>
      <p class="text-gray-600 mb-6">该学习计划可能已被删除或不存在</p>
      <NuxtLink
        to="/study-plans"
        class="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
      >
        返回列表
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['exam-access' as any],
  layout: 'exam'
})

const route = useRoute()
const planId = route.params.id as string

const viewMode = ref<'byDate' | 'byCategory'>('byDate')

// 获取学习计划详情
const { data: plan, pending, refresh } = await useFetch(`/api/study-plans/${planId}`)

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

const formatDateTime = (date: string | Date) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const toggleComplete = async (itemId: string, completed: boolean) => {
  try {
    await $fetch(`/api/study-plans/items/${itemId}`, {
      method: 'PATCH',
      body: { completed }
    })

    // 刷新数据
    refresh()
  } catch (error: any) {
    alert('更新失败：' + (error.data?.message || error.message || '未知错误'))
  }
}

const authStore = useAuthStore()

const deletePlan = async () => {
  if (!confirm('确定要删除这个学习计划吗？删除后无法恢复。')) {
    return
  }

  try {
    const headers = authStore.getAuthHeader()
    const requestOptions: any = {
      method: 'DELETE'
    }

    if (headers.Authorization) {
      requestOptions.headers = { Authorization: headers.Authorization }
    }

    await $fetch(`/api/study-plans/${planId}`, requestOptions)

    // 删除成功后跳转到学习计划列表
    navigateTo('/study-plans')
  } catch (error: any) {
    console.error('Delete error:', error)
    const errorMessage = error.data?.statusMessage || error.data?.message || error.statusMessage || error.message || '未知错误'
    alert(`删除失败：${errorMessage}\n\n学习计划ID: ${planId}\n状态码: ${error.statusCode || error.status || '未知'}`)
  }
}
</script>
