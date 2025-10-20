<template>
  <ClientOnly>
    <div>
      <!-- 密码验证 -->
      <AdminAuth v-if="!isAuthenticated" />

      <!-- 管理后台内容（仅在验证通过后显示） -->
      <div v-if="isAuthenticated" key="admin-content">
      <!-- 考试选择器 -->
      <ExamSelector :showDescription="true" class="mb-8" />

    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">{{ examStore.currentExam.name }} 管理后台</h1>
      <button
        @click="navigateTo('/admin/questions')"
        class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
      >
        📝 题目管理
      </button>
    </div>

    <!-- AI 题目生成 -->
    <div class="mb-6">
      <AIQuestionGenerator :categories="categories" @generated="refreshCategories" />
    </div>

    <div class="grid md:grid-cols-2 gap-6">
      <!-- 上传题目 -->
      <div class="bg-white rounded-xl shadow-md p-6">
        <h2 class="text-xl font-bold mb-4">批量导入题目</h2>

        <div class="mb-4">
          <label class="block font-semibold mb-2">上传文件（支持 Excel/CSV/JSON）</label>
          <input
            ref="fileInput"
            type="file"
            accept=".xlsx,.xls,.csv,.json"
            @change="handleFileSelect"
            class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <!-- 格式说明 - 使用 Tab 切换 -->
        <div class="mb-4">
          <div class="flex border-b border-gray-200 mb-3">
            <button
              v-for="tab in formatTabs"
              :key="tab.value"
              @click="activeFormatTab = tab.value"
              class="px-4 py-2 font-semibold transition-colors"
              :class="activeFormatTab === tab.value
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- Excel/CSV 格式 -->
          <div v-if="activeFormatTab === 'excel'" class="p-4 bg-gray-50 rounded-lg text-sm">
            <h3 class="font-semibold mb-2">Excel/CSV 格式要求：</h3>
            <ul class="list-disc list-inside space-y-1 text-gray-600">
              <li>question: 题目内容（必填）</li>
              <li>categoryCode: 分类代码（必填）</li>
              <li>correctAnswer: 正确答案（必填）</li>
              <li>options: 选项（选填，JSON格式或换行分隔）</li>
              <li>explanation: 答案解析（选填）</li>
              <li>difficulty: 难度 easy/medium/hard（选填）</li>
              <li>type: 题型 multiple_choice（选填）</li>
            </ul>
          </div>

          <!-- JSON 格式 -->
          <div v-if="activeFormatTab === 'json'" class="p-4 bg-gray-50 rounded-lg text-sm">
            <h3 class="font-semibold mb-2">JSON 格式示例：</h3>
            <div class="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs overflow-x-auto">
<pre>[
  {
    "question": "阴阳的基本概念是什么？",
    "categoryCode": "TCM_BASIC",
    "correctAnswer": "A. 对立统一",
    "options": ["A. 对立统一", "B. 完全独立"],
    "explanation": "阴阳是对立统一的两个方面",
    "difficulty": "easy",
    "type": "multiple_choice"
  }
]</pre>
            </div>
            <p class="mt-2 text-gray-600">
              也可以使用对象格式：<code class="bg-gray-200 px-1 rounded">{"questions": [...]}</code>
            </p>
          </div>
        </div>

        <button
          @click="uploadFile"
          :disabled="!selectedFile || uploading"
          class="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
        >
          {{ uploading ? '上传中...' : '上传并导入' }}
        </button>

        <!-- 上传结果 -->
        <div v-if="uploadResult" class="mt-4 p-4 rounded-lg" :class="uploadResult.success > 0 ? 'bg-green-50' : 'bg-red-50'">
          <p class="font-semibold mb-2">{{ uploadResult.message }}</p>
          <div v-if="uploadResult.results.errors.length > 0" class="mt-2">
            <p class="text-sm font-semibold mb-1">错误详情：</p>
            <ul class="text-sm text-red-600 max-h-40 overflow-y-auto">
              <li v-for="(error, index) in uploadResult.results.errors" :key="index">
                {{ error }}
              </li>
            </ul>
          </div>
        </div>

        <!-- 下载模板 -->
        <div class="mt-4 grid grid-cols-2 gap-2">
          <button
            @click="downloadTemplate('csv')"
            class="py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            下载 CSV 模板
          </button>
          <button
            @click="downloadTemplate('json')"
            class="py-2 bg-green-100 text-green-700 rounded-lg font-semibold hover:bg-green-200 transition-colors"
          >
            下载 JSON 模板
          </button>
        </div>
      </div>

      <!-- 管理分类 -->
      <div class="bg-white rounded-xl shadow-md p-6">
        <h2 class="text-xl font-bold mb-4">管理分类</h2>

        <form @submit.prevent="createCategory" class="space-y-4">
          <div>
            <label class="block font-semibold mb-2">分类名称</label>
            <input
              v-model="newCategory.name"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="例如：针灸学"
            />
          </div>

          <div>
            <label class="block font-semibold mb-2">分类代码</label>
            <input
              v-model="newCategory.code"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="例如：ACU"
            />
          </div>

          <div>
            <label class="block font-semibold mb-2">考试类型</label>
            <select
              v-model="newCategory.examType"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="cale">Cale（加州）</option>
              <option value="nccaom">NCCAOM（全国）</option>
            </select>
          </div>

          <div>
            <label class="block font-semibold mb-2">类型</label>
            <select
              v-model="newCategory.type"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="organization">组织部分</option>
              <option value="content">内容部分</option>
              <option value="review">复习部分</option>
            </select>
          </div>

          <div>
            <label class="block font-semibold mb-2">描述（可选）</label>
            <textarea
              v-model="newCategory.description"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              rows="3"
            ></textarea>
          </div>

          <button
            type="submit"
            :disabled="creatingCategory"
            class="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400"
          >
            {{ creatingCategory ? '创建中...' : '创建分类' }}
          </button>
        </form>

        <!-- 现有分类列表 -->
        <div v-if="categories" class="mt-6">
          <h3 class="font-semibold mb-2">现有分类</h3>
          <div class="space-y-2 max-h-60 overflow-y-auto">
            <div
              v-for="category in categories"
              :key="category.id"
              class="p-3 bg-gray-50 rounded-lg flex justify-between items-center"
            >
              <div>
                <span class="font-semibold">{{ category.name }}</span>
                <span class="ml-2 text-sm text-gray-600">({{ category.code }})</span>
              </div>
              <span class="text-sm text-gray-500">{{ category._count?.questions || 0 }} 题</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="mt-6 bg-white rounded-xl shadow-md p-6">
      <h2 class="text-xl font-bold mb-4">系统统计</h2>
      <div v-if="categories" class="grid md:grid-cols-4 gap-4">
        <div class="text-center p-4 bg-blue-50 rounded-lg">
          <div class="text-3xl font-bold text-blue-600">
            {{ categories.reduce((sum: number, c: any) => sum + (c._count?.questions || 0), 0) }}
          </div>
          <div class="text-gray-600">总题目数</div>
        </div>
        <div class="text-center p-4 bg-green-50 rounded-lg">
          <div class="text-3xl font-bold text-green-600">{{ categories.length }}</div>
          <div class="text-gray-600">分类数</div>
        </div>
        <div class="text-center p-4 bg-purple-50 rounded-lg">
          <div class="text-3xl font-bold text-purple-600">
            {{ categories.filter((c: any) => c.type === 'content').length }}
          </div>
          <div class="text-gray-600">内容分类</div>
        </div>
        <div class="text-center p-4 bg-yellow-50 rounded-lg">
          <div class="text-3xl font-bold text-yellow-600">
            {{ categories.filter((c: any) => c.type === 'review').length }}
          </div>
          <div class="text-gray-600">复习分类</div>
        </div>
      </div>
    </div>
    </div>
  </div>
  </ClientOnly>
</template>

<script setup lang="ts">
const examStore = useExamStore()

// 创建响应式引用来避免 Pinia store 序列化问题
const currentExamType = computed(() => examStore.currentExamType)

// 认证状态检查
const checkAuth = () => {
  if (process.client) {
    const auth = localStorage.getItem('admin_auth')
    if (auth) {
      try {
        const data = JSON.parse(auth)
        if (data.timestamp && Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
          return true
        }
      } catch (e) {
        localStorage.removeItem('admin_auth')
      }
    }
  }
  return false
}

const isAuthenticated = ref(false)

onMounted(() => {
  isAuthenticated.value = checkAuth()
  // 监听认证状态变化
  const checkInterval = setInterval(() => {
    isAuthenticated.value = checkAuth()
  }, 1000)

  // 清理
  onUnmounted(() => clearInterval(checkInterval))
})

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const uploadResult = ref<any>(null)
const activeFormatTab = ref('excel')

const formatTabs = [
  { label: 'Excel/CSV', value: 'excel' },
  { label: 'JSON', value: 'json' }
]

const newCategory = ref({
  name: '',
  code: '',
  examType: currentExamType.value,
  type: 'content',
  description: ''
})
const creatingCategory = ref(false)

// 获取分类列表（根据当前选择的考试类型）
const { data: categories, refresh: refreshCategories } = await useFetch('/api/categories', {
  key: () => `admin-categories-${currentExamType.value}`,
  query: computed(() => ({ examType: currentExamType.value }))
})

// 当考试类型改变时，重新获取数据并更新表单默认值
watch(currentExamType, () => {
  refreshCategories()
  newCategory.value.examType = currentExamType.value
})

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
    uploadResult.value = null
  }
}

const uploadFile = async () => {
  if (!selectedFile.value) return

  uploading.value = true
  uploadResult.value = null

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)

    const response = await $fetch('/api/upload/questions', {
      method: 'POST',
      body: formData
    })

    uploadResult.value = response

    // 刷新分类列表
    await refreshCategories()

    // 清空文件选择
    selectedFile.value = null
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  } catch (error: any) {
    uploadResult.value = {
      message: '上传失败：' + (error.message || '未知错误'),
      results: { success: 0, failed: 0, errors: [] }
    }
  } finally {
    uploading.value = false
  }
}

const createCategory = async () => {
  creatingCategory.value = true

  try {
    await $fetch('/api/categories', {
      method: 'POST',
      body: newCategory.value
    })

    alert('分类创建成功！')

    // 重置表单
    newCategory.value = {
      name: '',
      code: '',
      type: 'content',
      description: ''
    }

    // 刷新分类列表
    await refreshCategories()
  } catch (error: any) {
    alert('创建失败：' + (error.message || '未知错误'))
  } finally {
    creatingCategory.value = false
  }
}

const downloadTemplate = (format: 'csv' | 'json' = 'csv') => {
  if (format === 'json') {
    // JSON 模板
    const jsonTemplate = [
      {
        question: '中医理论中，阴阳的基本概念是什么？',
        categoryCode: 'TCM_BASIC',
        correctAnswer: 'A. 阴阳是对立统一的两个方面',
        options: [
          'A. 阴阳是对立统一的两个方面',
          'B. 阴阳是完全独立的概念',
          'C. 阴阳只存在于自然界',
          'D. 阴阳是西医概念'
        ],
        explanation: '阴阳学说认为，阴阳是自然界一切事物中对立统一的两个方面，相互依存、相互制约、相互转化。',
        difficulty: 'easy',
        type: 'multiple_choice'
      },
      {
        question: '五脏中，主藏血的是哪一脏？',
        categoryCode: 'TCM_BASIC',
        correctAnswer: 'B. 肝',
        options: ['A. 心', 'B. 肝', 'C. 脾', 'D. 肺'],
        explanation: '中医理论认为"肝主藏血"，肝具有贮藏血液和调节血量的功能。',
        difficulty: 'medium',
        type: 'multiple_choice'
      }
    ]

    const json = JSON.stringify(jsonTemplate, null, 2)
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'cale_questions_template.json'
    link.click()
  } else {
    // CSV 模板
    const template = [
      ['question', 'categoryCode', 'correctAnswer', 'options', 'explanation', 'difficulty', 'type'],
      [
        '针灸的主要作用机制是什么？',
        'ACU',
        'A. 调节经络气血',
        '["A. 调节经络气血", "B. 直接杀菌", "C. 增加血压", "D. 减少体温"]',
        '针灸通过刺激穴位，调节人体经络气血，从而达到治疗疾病的目的。',
        'medium',
        'multiple_choice'
      ]
    ]

    // 转换为 CSV
    const csv = template.map(row => row.join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'cale_questions_template.csv'
    link.click()
  }
}
</script>
