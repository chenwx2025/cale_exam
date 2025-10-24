<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">{{ examStore.currentExam.name }} 考试大纲</h1>

    <!-- 分类统计概览 -->
    <div v-if="contentCategories.length > 0" class="mb-8 bg-white rounded-xl shadow-md p-6">
      <h2 class="text-xl font-bold mb-4">考试内容分布</h2>
      <div class="space-y-3">
        <div v-for="category in contentCategories" :key="category.id" class="flex items-center">
          <div class="flex-1">
            <div class="flex items-center justify-between mb-1">
              <span class="font-semibold text-gray-800">{{ category.name }}</span>
              <div class="flex items-center gap-3">
                <span v-if="category.weight" class="text-sm font-semibold text-blue-600">{{ category.weight }}%</span>
                <span v-if="category.questionCount" class="text-sm text-gray-600">预计 {{ category.questionCount }} 题</span>
                <span class="text-sm text-gray-600">实际 {{ category._count?.questions || 0 }} 题</span>
              </div>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div
                class="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all"
                :style="{ width: category.weight ? `${category.weight}%` : '5%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 官方考试大纲详细分解 TABLE 27 (仅CALE考试显示) -->
    <div v-if="currentExamType === 'cale' && officialOutline" class="mb-8">
      <CompleteOutlineTable :all-domains="officialOutline" />
    </div>

    <!-- Tab 切换 -->
    <div class="mb-6">
      <div class="flex border-b border-gray-200">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          @click="activeTab = tab.value"
          class="pb-4 px-6 font-semibold transition-colors relative"
          :class="activeTab === tab.value
            ? 'text-blue-600'
            : 'text-gray-600 hover:text-gray-900'"
        >
          <span>{{ tab.label }}</span>
          <span v-if="getCategoryCount(tab.value)" class="ml-2 text-sm">
            ({{ getCategoryCount(tab.value) }})
          </span>
          <div
            v-if="activeTab === tab.value"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
          ></div>
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="pending" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">加载中...</p>
    </div>

    <!-- 分类列表 -->
    <div v-else class="space-y-4">
      <div
        v-for="category in filteredCategories"
        :key="category.id"
        class="bg-white rounded-xl shadow-md hover:shadow-lg transition-all"
      >
        <div
          class="p-6 cursor-pointer"
          @click="toggleCategory(category.id)"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <span
                  class="px-3 py-1 rounded-full text-sm font-semibold"
                  :class="getTypeColor(category.type)"
                >
                  {{ category.code }}
                </span>
                <h3 class="text-xl font-bold text-gray-800">{{ category.name }}</h3>
                <span v-if="category.weight" class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  占比 {{ category.weight }}%
                </span>
              </div>

              <p v-if="category.description" class="text-gray-600 mb-2">
                {{ category.description }}
              </p>

              <div v-if="category.detailedInfo" class="text-sm text-gray-500 mb-2">
                {{ category.detailedInfo }}
              </div>

              <!-- 题目统计 -->
              <div class="flex items-center gap-4 text-sm">
                <span class="flex items-center text-gray-600">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  实际题库: {{ category._count?.questions || 0 }} 题
                </span>
                <span v-if="category.questionCount" class="flex items-center text-blue-600">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  预计考试: {{ category.questionCount }} 题
                </span>
              </div>
            </div>

            <svg
              class="w-6 h-6 text-gray-400 transition-transform flex-shrink-0 ml-4"
              :class="{ 'rotate-180': expandedCategories.has(category.id) }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>

        <!-- 展开的详细内容 -->
        <div v-if="expandedCategories.has(category.id)" class="border-t border-gray-100 p-6 bg-gray-50">
          <!-- 重点知识点 -->
          <div v-if="category.keyPoints" class="mb-6">
            <h4 class="font-bold text-gray-800 mb-3 flex items-center">
              <svg class="w-5 h-5 mr-2 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
              重点知识点
            </h4>
            <ul class="space-y-2">
              <li
                v-for="(point, index) in parseKeyPoints(category.keyPoints)"
                :key="index"
                class="flex items-start text-gray-700"
              >
                <svg class="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                <!-- 如果point是字符串，直接显示；如果是对象，显示title -->
                <span v-if="typeof point === 'string'">{{ point }}</span>
                <span v-else-if="typeof point === 'object' && point.title">{{ point.title }}</span>
              </li>
            </ul>
          </div>

          <!-- 学习建议 -->
          <div v-if="category.studyTips" class="mb-6">
            <h4 class="font-bold text-gray-800 mb-3 flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
              学习建议
            </h4>
            <p class="text-gray-700 bg-blue-50 p-4 rounded-lg">{{ category.studyTips }}</p>
          </div>

          <!-- 子分类 -->
          <div v-if="category.children && category.children.length > 0" class="mb-4">
            <h4 class="font-bold text-gray-800 mb-3">子分类</h4>
            <div class="grid md:grid-cols-2 gap-3">
              <div
                v-for="child in category.children"
                :key="child.id"
                class="bg-white rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                @click.stop="goToQuestions(child.id)"
              >
                <div class="flex justify-between items-center">
                  <div>
                    <span class="font-semibold text-gray-800">{{ child.name }}</span>
                    <span class="ml-2 text-sm text-gray-600">{{ child._count?.questions || 0 }} 道题</span>
                  </div>
                  <button class="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                    开始学习 →
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 开始学习按钮 -->
          <div v-if="category._count?.questions > 0">
            <button
              @click.stop="goToQuestions(category.id)"
              class="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>开始学习 ({{ category._count.questions }} 道题)</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredCategories.length === 0" class="text-center py-12 bg-white rounded-xl">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <p class="text-gray-600 text-lg">暂无分类数据</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'exam',
  middleware: ['exam-access' as any]
})

const examStore = useExamStore()
const activeTab = ref('content') // 默认显示内容部分
const expandedCategories = ref(new Set<string>())

const tabs = [
  { label: 'a. 考试组织部分', value: 'organization' },
  { label: 'b. 考试内容部分', value: 'content' },
  { label: 'c. 考试复习部分', value: 'review' }
]

// 创建响应式引用来避免 Pinia store 序列化问题
const currentExamType = computed(() => examStore.currentExamType)

// 获取所有分类（根据当前选择的考试类型）
const { data: categories, pending, refresh: refreshCategories } = await useFetch('/api/categories', {
  key: () => `categories-${currentExamType.value}`,
  query: computed(() => ({ examType: currentExamType.value }))
})

// 获取官方考试大纲详细数据
const { data: officialOutline, refresh: refreshOfficialOutline } = await useFetch(
  () => `/api/official-outline/${currentExamType.value}`,
  {
    key: () => `official-outline-${currentExamType.value}`
  }
)

// 当考试类型改变时，重新获取数据
watch(currentExamType, () => {
  refreshCategories()
  refreshOfficialOutline()
  expandedCategories.value.clear()
})

const filteredCategories = computed(() => {
  if (!categories.value) return []
  return categories.value
    .filter((c: any) => c.type === activeTab.value && !c.parentId)
    .sort((a: any, b: any) => a.order - b.order)
})

// 只显示内容部分的分类用于统计
const contentCategories = computed(() => {
  if (!categories.value) return []
  return categories.value
    .filter((c: any) => c.type === 'content' && !c.parentId)
    .sort((a: any, b: any) => a.order - b.order)
})

const getCategoryCount = (type: string) => {
  if (!categories.value) return 0
  return categories.value.filter((c: any) => c.type === type && !c.parentId).length
}

const toggleCategory = (id: string) => {
  if (expandedCategories.value.has(id)) {
    expandedCategories.value.delete(id)
  } else {
    expandedCategories.value.add(id)
  }
}

const goToQuestions = (categoryId: string) => {
  navigateTo(`/practice?category=${categoryId}`)
}

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    organization: 'bg-blue-100 text-blue-700',
    content: 'bg-green-100 text-green-700',
    review: 'bg-purple-100 text-purple-700'
  }
  return colors[type] || 'bg-gray-100 text-gray-700'
}

const parseKeyPoints = (keyPointsJson: string) => {
  try {
    return JSON.parse(keyPointsJson)
  } catch {
    return []
  }
}
</script>
