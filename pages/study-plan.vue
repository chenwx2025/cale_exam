<template>
  <div>
    <!-- 考试选择器 -->
    <ExamSelector :showDescription="true" class="mb-8" />

    <h1 class="text-3xl font-bold mb-8">{{ examStore.currentExam.name }} 复习计划</h1>

    <div class="bg-white rounded-xl shadow-md p-8">
      <h2 class="text-2xl font-bold mb-6">创建个性化学习计划</h2>

      <form @submit.prevent="createPlan" class="space-y-6">
        <div>
          <label class="block font-semibold mb-2">计划名称</label>
          <input
            v-model="planForm.name"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            placeholder="例如：30天考试冲刺计划"
          />
        </div>

        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold mb-2">开始日期</label>
            <input
              v-model="planForm.startDate"
              type="date"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block font-semibold mb-2">结束日期</label>
            <input
              v-model="planForm.endDate"
              type="date"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label class="block font-semibold mb-2">每天学习题目数</label>
          <input
            v-model.number="planForm.questionsPerDay"
            type="number"
            min="5"
            max="100"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>

        <div>
          <label class="block font-semibold mb-2">重点分类（可选）</label>
          <select
            v-model="planForm.focusCategory"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          >
            <option value="">全部分类</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }} ({{ category._count.questions }} 题)
            </option>
          </select>
        </div>

        <div>
          <label class="block font-semibold mb-2">计划描述</label>
          <textarea
            v-model="planForm.description"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            rows="4"
            placeholder="描述你的学习目标和计划..."
          ></textarea>
        </div>

        <button
          type="submit"
          :disabled="creating"
          class="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
        >
          {{ creating ? '创建中...' : '创建学习计划' }}
        </button>
      </form>

      <!-- 计划预览 -->
      <div v-if="planPreview" class="mt-8 p-6 bg-blue-50 rounded-lg">
        <h3 class="font-bold mb-4">计划预览</h3>
        <div class="grid md:grid-cols-3 gap-4 text-center">
          <div>
            <div class="text-2xl font-bold text-blue-600">{{ planPreview.days }}</div>
            <div class="text-gray-600">学习天数</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-green-600">{{ planPreview.totalQuestions }}</div>
            <div class="text-gray-600">总题目数</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-purple-600">{{ planForm.questionsPerDay }}</div>
            <div class="text-gray-600">每天题目</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 学习建议 -->
    <div class="mt-6 grid md:grid-cols-3 gap-6">
      <div class="bg-white rounded-xl shadow-md p-6">
        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 class="font-bold mb-2">循序渐进</h3>
        <p class="text-gray-600 text-sm">
          建议每天稳定学习，从简单到困难逐步提升
        </p>
      </div>

      <div class="bg-white rounded-xl shadow-md p-6">
        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </div>
        <h3 class="font-bold mb-2">重复练习</h3>
        <p class="text-gray-600 text-sm">
          错题要反复练习，直到完全掌握
        </p>
      </div>

      <div class="bg-white rounded-xl shadow-md p-6">
        <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
          </svg>
        </div>
        <h3 class="font-bold mb-2">全面覆盖</h3>
        <p class="text-gray-600 text-sm">
          确保所有考试大纲内容都有涉及
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const examStore = useExamStore()

// 创建响应式引用来避免 Pinia store 序列化问题
const currentExamType = computed(() => examStore.currentExamType)

// 获取分类（根据当前选择的考试类型）
const { data: categories, refresh } = await useFetch('/api/categories', {
  key: () => `study-plan-categories-${currentExamType.value}`,
  query: computed(() => ({ examType: currentExamType.value }))
})

// 当考试类型改变时，重新获取数据
watch(currentExamType, () => {
  refresh()
})

const planForm = ref({
  name: '',
  startDate: '',
  endDate: '',
  questionsPerDay: 20,
  focusCategory: '',
  description: ''
})

const creating = ref(false)

const planPreview = computed(() => {
  if (!planForm.value.startDate || !planForm.value.endDate) return null

  const start = new Date(planForm.value.startDate)
  const end = new Date(planForm.value.endDate)
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

  if (days <= 0) return null

  return {
    days,
    totalQuestions: days * planForm.value.questionsPerDay
  }
})

const createPlan = async () => {
  creating.value = true

  try {
    const plan = await $fetch('/api/study-plans', {
      method: 'POST',
      headers: authStore.getAuthHeader(),
      body: {
        examType: currentExamType.value,
        ...planForm.value
      }
    })

    alert(`学习计划创建成功！\n\n计划名称：${plan.name}\n总题数：${plan.stats.totalQuestions}\n学习天数：${plan.stats.totalDays}\n每天题数：${plan.stats.questionsPerDay}`)

    // 跳转到学习计划列表页面
    navigateTo('/study-plans')
  } catch (error: any) {
    alert('创建失败：' + (error.data?.message || error.message || '未知错误'))
  } finally {
    creating.value = false
  }
}

// 设置默认日期
onMounted(() => {
  const today = new Date()
  const nextMonth = new Date(today)
  nextMonth.setMonth(nextMonth.getMonth() + 1)

  planForm.value.startDate = today.toISOString().split('T')[0]
  planForm.value.endDate = nextMonth.toISOString().split('T')[0]
})
</script>
