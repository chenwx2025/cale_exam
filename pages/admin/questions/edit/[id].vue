<template>
  <div class="p-6">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">编辑题目</h1>
        <p class="text-gray-600 mt-2">题目 ID: {{ questionId }}</p>
      </div>
      <NuxtLink to="/admin/questions" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        返回列表
      </NuxtLink>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- 编辑表单 -->
    <div v-else-if="question" class="bg-white rounded-xl shadow-md p-8">
      <form @submit.prevent="handleSubmit" class="max-w-4xl mx-auto space-y-6">
        <!-- 错误提示 -->
        <div v-if="error" class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- 成功提示 -->
        <div v-if="success" class="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-green-700">题目更新成功！</p>
            </div>
          </div>
        </div>

        <!-- 基本信息 -->
        <div class="border-b border-gray-200 pb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">基本信息</h3>
          <div class="grid grid-cols-2 gap-4">
            <!-- 考试类型 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                考试类型 <span class="text-red-500">*</span>
              </label>
              <select
                v-model="form.examType"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="cale">CALE</option>
                <option value="nccaom">NCCAOM</option>
              </select>
            </div>

            <!-- 题型 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                题型 <span class="text-red-500">*</span>
              </label>
              <select
                v-model="form.type"
                required
                disabled
                class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
              >
                <option value="multiple_choice">选择题</option>
                <option value="true_false">判断题</option>
                <option value="case_study">案例题</option>
              </select>
              <p class="mt-1 text-xs text-gray-500">题型不可修改</p>
            </div>

            <!-- 难度 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                难度 <span class="text-red-500">*</span>
              </label>
              <select
                v-model="form.difficulty"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="easy">简单</option>
                <option value="medium">中等</option>
                <option value="hard">困难</option>
              </select>
            </div>

            <!-- 分类 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                分类 <span class="text-red-500">*</span>
              </label>
              <select
                v-model="form.categoryId"
                required
                :disabled="loadingCategories"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="" disabled>选择分类</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.code }} - {{ category.name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- 题目内容 -->
        <div class="border-b border-gray-200 pb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">题目内容</h3>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              题目 <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="form.question"
              required
              rows="4"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入题目内容"
            ></textarea>
          </div>
        </div>

        <!-- 选项 -->
        <div class="border-b border-gray-200 pb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">选项</h3>
          <div class="space-y-3">
            <div v-for="(_option, index) in form.options" :key="index" class="flex items-start gap-3">
              <div class="flex-shrink-0 w-8 h-10 flex items-center justify-center">
                <span class="font-bold text-gray-700">{{ String.fromCharCode(65 + index) }}.</span>
              </div>
              <input
                v-model="form.options[index]"
                type="text"
                required
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :placeholder="`选项 ${String.fromCharCode(65 + index)}`"
              />
            </div>
          </div>
        </div>

        <!-- 正确答案 -->
        <div class="border-b border-gray-200 pb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            正确答案 <span class="text-red-500">*</span>
          </h3>
          <div class="flex gap-4">
            <label v-for="letter in ['A', 'B', 'C', 'D']" :key="letter" class="flex items-center cursor-pointer">
              <input
                v-model="form.correctAnswer"
                type="radio"
                :value="letter"
                required
                class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span class="ml-2 text-sm font-medium text-gray-700">{{ letter }}</span>
            </label>
          </div>
        </div>

        <!-- 答案解析 -->
        <div class="border-b border-gray-200 pb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">答案解析（可选）</h3>
          <div>
            <textarea
              v-model="form.explanation"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入答案解析"
            ></textarea>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex items-center justify-between pt-6">
          <button
            type="button"
            @click="navigateTo('/admin/questions')"
            class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            :disabled="submitting"
          >
            取消
          </button>
          <button
            type="submit"
            :disabled="submitting"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="submitting" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
            <span>{{ submitting ? '保存中...' : '保存' }}</span>
          </button>
        </div>
      </form>
    </div>

    <!-- 错误 -->
    <div v-else class="bg-white rounded-xl shadow-md p-12 text-center">
      <h3 class="text-xl font-semibold text-gray-900 mb-2">未找到题目</h3>
      <p class="text-gray-600 mb-4">该题目不存在或已被删除</p>
      <NuxtLink to="/admin/questions" class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        返回列表
      </NuxtLink>
    </div>

    <!-- Toast 通知 -->
    <Transition
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="toast.show"
        class="fixed top-20 right-4 z-50 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden"
      >
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg
                v-if="toast.type === 'success'"
                class="h-6 w-6 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg
                v-else-if="toast.type === 'error'"
                class="h-6 w-6 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div class="ml-3 w-0 flex-1 pt-0.5">
              <p class="text-sm font-medium text-gray-900">{{ toast.title }}</p>
              <p v-if="toast.message" class="mt-1 text-sm text-gray-500">{{ toast.message }}</p>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
              <button
                type="button"
                @click="toast.show = false"
                class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span class="sr-only">关闭</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })

const route = useRoute()
const authStore = useAuthStore()
const questionId = route.params.id as string

const loading = ref(true)
const loadingCategories = ref(true)
const submitting = ref(false)
const error = ref('')
const success = ref(false)
const question = ref<any>(null)
const categories = ref<any[]>([])

const toast = ref({
  show: false,
  type: 'success' as 'success' | 'error',
  title: '',
  message: ''
})

const form = ref({
  examType: 'cale',
  type: 'multiple_choice',
  difficulty: 'medium',
  categoryId: '',
  question: '',
  options: ['', '', '', ''],
  correctAnswer: '',
  explanation: ''
})

// 显示 toast 通知
const showToast = (type: 'success' | 'error', title: string, message = '') => {
  toast.value = {
    show: true,
    type,
    title,
    message
  }

  // 3秒后自动关闭
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

// 加载题目详情
const loadQuestion = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await $fetch(`/api/admin/questions/${questionId}`, {
      headers: authStore.getAuthHeader() as HeadersInit
    }) as any

    if (response.success && response.question) {
      question.value = response.question

      // 填充表单
      form.value.examType = response.question.examType
      form.value.type = response.question.type
      form.value.difficulty = response.question.difficulty
      form.value.categoryId = response.question.categoryId
      form.value.question = response.question.question
      form.value.explanation = response.question.explanation || ''

      // 解析选项
      if (response.question.options) {
        try {
          const opts = JSON.parse(response.question.options)
          // 去除选项中的 A. B. C. D. 前缀
          form.value.options = opts.map((opt: string) => opt.replace(/^[A-Z]\.\s*/, ''))
        } catch (e) {
          console.error('Failed to parse options:', e)
          form.value.options = ['', '', '', '']
        }
      }

      // 解析正确答案（去除可能的点号和空格，只保留字母）
      const answer = response.question.correctAnswer.trim()
      form.value.correctAnswer = answer.charAt(0).toUpperCase()

      // 加载对应考试类型的分类
      await loadCategories(form.value.examType)
    } else {
      question.value = null
    }
  } catch (err: any) {
    console.error('Failed to load question:', err)
    error.value = '加载题目失败'
    question.value = null
  } finally {
    loading.value = false
  }
}

// 加载分类列表
const loadCategories = async (examType: string) => {
  loadingCategories.value = true
  try {
    const response = await $fetch('/api/admin/categories/list', {
      headers: authStore.getAuthHeader() as HeadersInit,
      params: {
        examType: examType,
        pageSize: 1000
      }
    }) as any

    if (response.success) {
      categories.value = response.categories || []
      console.log('Loaded categories:', categories.value.length)
    }
  } catch (err) {
    console.error('Failed to load categories:', err)
    error.value = '加载分类失败'
  } finally {
    loadingCategories.value = false
  }
}

// 监听考试类型变化，重新加载分类
watch(() => form.value.examType, async (newExamType) => {
  await loadCategories(newExamType)
  // 清空分类选择，因为不同考试类型的分类不同
  form.value.categoryId = ''
})

// 提交表单
const handleSubmit = async () => {
  error.value = ''
  success.value = false

  // 验证
  if (!form.value.question.trim()) {
    error.value = '请输入题目内容'
    return
  }

  if (form.value.options.some(opt => !opt.trim())) {
    error.value = '请填写所有选项'
    return
  }

  if (!form.value.correctAnswer) {
    error.value = '请选择正确答案'
    return
  }

  if (!form.value.categoryId) {
    error.value = '请选择分类'
    return
  }

  submitting.value = true

  try {
    // 准备提交数据
    const submitData = {
      examType: form.value.examType,
      type: form.value.type,
      difficulty: form.value.difficulty,
      categoryId: form.value.categoryId,
      question: form.value.question.trim(),
      // 选项不需要添加前缀，直接发送纯文本
      options: form.value.options.map(opt => opt.trim()),
      // 正确答案只发送字母
      correctAnswer: form.value.correctAnswer,
      explanation: form.value.explanation.trim() || null
    }

    const response = await $fetch(`/api/admin/questions/${questionId}`, {
      method: 'PUT',
      headers: authStore.getAuthHeader() as HeadersInit,
      body: submitData
    }) as any

    if (response.success) {
      success.value = true
      showToast('success', '保存成功', '题目已成功更新')
      // 2秒后返回列表
      setTimeout(() => {
        navigateTo('/admin/questions')
      }, 2000)
    } else {
      error.value = response.message || '更新题目失败'
      showToast('error', '保存失败', response.message || '更新题目失败')
    }
  } catch (err: any) {
    console.error('Failed to update question:', err)
    error.value = err.data?.message || '更新题目失败，请重试'
    showToast('error', '保存失败', err.data?.message || '更新题目失败，请重试')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadQuestion()
})
</script>
