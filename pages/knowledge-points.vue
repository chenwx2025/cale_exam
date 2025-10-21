<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- 页面标题和进度总览 -->
      <div class="mb-8">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h1 class="text-4xl font-bold text-gray-900 mb-2">📚 考试知识点详解</h1>
            <p class="text-gray-600">全面掌握考试要点，高效备考</p>
          </div>
          <div class="bg-white rounded-xl shadow-md p-4 min-w-[200px]">
            <div class="text-sm text-gray-600 mb-1">整体掌握度</div>
            <div class="text-3xl font-bold text-blue-600">{{ overallMasteryRate }}%</div>
            <div class="mt-2 bg-gray-200 rounded-full h-2">
              <div
                class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                :style="{ width: overallMasteryRate + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 搜索栏 -->
      <div class="mb-6">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索知识点..."
            class="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
          <span class="absolute left-4 top-3.5 text-gray-400 text-xl">🔍</span>
        </div>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">加载中...</p>
      </div>

      <!-- 主内容区 -->
      <div v-else class="grid lg:grid-cols-4 gap-6">
        <!-- 左侧：知识点分类导航 -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-md p-4 sticky top-4">
            <h2 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📑</span>
              <span>知识点分类</span>
            </h2>

            <div class="space-y-2">
              <button
                v-for="category in filteredCategories"
                :key="category.id"
                @click="selectedCategory = category"
                :class="[
                  'w-full text-left px-4 py-3 rounded-lg transition-all relative',
                  selectedCategory?.id === category.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                ]"
              >
                <div class="font-semibold text-sm mb-1">{{ category.name }}</div>
                <div class="text-xs opacity-80 flex items-center justify-between">
                  <span>
                    {{ category.questionCount || 0 }} 题
                    <span v-if="category.weight" class="ml-2">• {{ category.weight }}%</span>
                  </span>
                  <span v-if="getCategoryMastery(category) > 0" class="text-xs font-bold">
                    {{ getCategoryMastery(category) }}%
                  </span>
                </div>
                <!-- 进度条 -->
                <div v-if="getCategoryMastery(category) > 0" class="mt-2 bg-white/20 rounded-full h-1">
                  <div
                    class="h-1 rounded-full transition-all duration-300"
                    :class="selectedCategory?.id === category.id ? 'bg-white' : 'bg-gradient-to-r from-blue-500 to-purple-500'"
                    :style="{ width: getCategoryMastery(category) + '%' }"
                  ></div>
                </div>
              </button>
            </div>

            <!-- 统计信息 -->
            <div class="mt-6 pt-4 border-t border-gray-200">
              <div class="text-sm text-gray-600 space-y-2">
                <div class="flex justify-between">
                  <span>总知识点：</span>
                  <span class="font-semibold">{{ categories.length }}</span>
                </div>
                <div class="flex justify-between">
                  <span>总题数：</span>
                  <span class="font-semibold">{{ totalQuestions }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：知识点详细内容 -->
        <div class="lg:col-span-3">
          <div v-if="selectedCategory" class="space-y-6">
            <!-- 知识点标题卡片 -->
            <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <h2 class="text-3xl font-bold mb-2">{{ selectedCategory.name }}</h2>
                  <p v-if="selectedCategory.nameEn" class="text-blue-100 text-lg">{{ selectedCategory.nameEn }}</p>
                </div>
                <div v-if="selectedCategory.weight" class="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <div class="text-2xl font-bold">{{ selectedCategory.weight }}%</div>
                  <div class="text-xs text-blue-100">考试占比</div>
                </div>
              </div>

              <p v-if="selectedCategory.description" class="text-blue-50 leading-relaxed">
                {{ selectedCategory.description }}
              </p>
            </div>

            <!-- 详细信息 -->
            <div v-if="selectedCategory.detailedInfo" class="bg-white rounded-xl shadow-md p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>📋</span>
                <span>详细说明</span>
              </h3>
              <div class="prose prose-blue max-w-none">
                <p class="text-gray-700 whitespace-pre-line">{{ selectedCategory.detailedInfo }}</p>
              </div>
            </div>

            <!-- 快速预览卡片 -->
            <div v-if="keyPointsList.length > 0" class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-md p-6 border-2 border-purple-200">
              <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🎯</span>
                <span>快速记忆卡</span>
              </h3>
              <div class="grid md:grid-cols-2 gap-3">
                <div
                  v-for="(point, index) in keyPointsList"
                  :key="'quick-' + index"
                  class="bg-white/80 backdrop-blur rounded-lg p-3 border border-purple-200 hover:border-purple-400 transition-all cursor-pointer hover:shadow-md"
                  @click="scrollToPoint(index)"
                >
                  <div class="flex items-start gap-2">
                    <span class="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {{ index + 1 }}
                    </span>
                    <span class="text-sm font-semibold text-gray-800">{{ point.title }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 核心知识要点 -->
            <div v-if="keyPointsList.length > 0" class="bg-white rounded-xl shadow-md p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span>⭐</span>
                  <span>核心知识要点</span>
                </h3>
                <div class="flex gap-2">
                  <button
                    @click="expandAll"
                    class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    全部展开
                  </button>
                  <button
                    @click="collapseAll"
                    class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    全部收起
                  </button>
                </div>
              </div>

              <div class="space-y-4">
                <div
                  v-for="(point, index) in keyPointsList"
                  :key="index"
                  :ref="el => pointRefs[index] = el"
                  class="border-2 rounded-lg overflow-hidden transition-all"
                  :class="expandedPoints.has(index) ? 'border-blue-400 shadow-lg' : 'border-gray-200'"
                >
                  <button
                    @click="toggleKeyPoint(index)"
                    class="w-full px-6 py-4 transition-colors flex items-center justify-between"
                    :class="expandedPoints.has(index) ? 'bg-gradient-to-r from-blue-50 to-purple-50' : 'bg-gray-50 hover:bg-gray-100'"
                  >
                    <div class="flex items-center gap-3">
                      <span class="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center font-bold shadow-md">
                        {{ index + 1 }}
                      </span>
                      <span class="font-semibold text-gray-900 text-left">{{ point.title }}</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <button
                        @click.stop="toggleMastered(index)"
                        :class="[
                          'px-3 py-1 rounded-lg text-xs font-semibold transition-all',
                          masteredPoints.has(index)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        ]"
                      >
                        {{ masteredPoints.has(index) ? '✓ 已掌握' : '标记掌握' }}
                      </button>
                      <span class="text-gray-400 text-xl">
                        {{ expandedPoints.has(index) ? '▼' : '▶' }}
                      </span>
                    </div>
                  </button>

                  <div v-if="expandedPoints.has(index)" class="px-6 py-4 bg-white">
                    <p class="text-gray-700 leading-relaxed mb-4 whitespace-pre-line">{{ point.description }}</p>

                    <div v-if="point.examples && point.examples.length > 0" class="mt-4">
                      <h4 class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span>💡</span>
                        <span>典型示例：</span>
                      </h4>
                      <div class="space-y-2">
                        <div
                          v-for="(example, idx) in point.examples"
                          :key="idx"
                          class="bg-amber-50 border-l-4 border-amber-400 px-4 py-2 rounded-r-lg"
                        >
                          <span class="text-gray-700">{{ example }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- 记忆提示 -->
                    <div class="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                      <div class="flex items-start gap-2">
                        <span class="text-xl">🧠</span>
                        <div>
                          <div class="font-semibold text-gray-900 mb-1">记忆技巧</div>
                          <div class="text-sm text-gray-700">
                            {{ getMemoryTip(point.title, index) }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 学习建议 -->
            <div v-if="selectedCategory.studyTips" class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-md p-6 border-l-4 border-amber-500">
              <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>💡</span>
                <span>学习建议</span>
              </h3>
              <p class="text-gray-700 leading-relaxed whitespace-pre-line">{{ selectedCategory.studyTips }}</p>
            </div>

            <!-- 统计与操作 -->
            <div class="bg-white rounded-xl shadow-md p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-4">📊 练习统计</h3>

              <div class="grid md:grid-cols-3 gap-4 mb-6">
                <div class="bg-blue-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div class="text-3xl font-bold text-blue-600">{{ selectedCategory.questionCount || 0 }}</div>
                  <div class="text-sm text-gray-600">题目总数</div>
                </div>
                <div class="bg-green-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div class="text-3xl font-bold text-green-600">{{ stats.correct || 0 }}</div>
                  <div class="text-sm text-gray-600">已掌握</div>
                  <div class="mt-2 bg-white rounded-full h-1.5">
                    <div
                      class="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                      :style="{ width: (stats.total > 0 ? (stats.correct / stats.total * 100) : 0) + '%' }"
                    ></div>
                  </div>
                </div>
                <div class="bg-red-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div class="text-3xl font-bold text-red-600">{{ stats.wrong || 0 }}</div>
                  <div class="text-sm text-gray-600">错题数</div>
                  <div class="mt-2 bg-white rounded-full h-1.5">
                    <div
                      class="bg-red-500 h-1.5 rounded-full transition-all duration-500"
                      :style="{ width: (stats.total > 0 ? (stats.wrong / stats.total * 100) : 0) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>

              <!-- 掌握度可视化 -->
              <div class="mb-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-semibold text-gray-700">本章节掌握度</span>
                  <span class="text-2xl font-bold text-purple-600">
                    {{ stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0 }}%
                  </span>
                </div>
                <div class="relative bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div
                    class="absolute inset-y-0 left-0 bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                    :style="{ width: (stats.total > 0 ? (stats.correct / stats.total * 100) : 0) + '%' }"
                  >
                    <span v-if="stats.correct > 0" class="text-white text-xs font-bold">✓ {{ stats.correct }}</span>
                  </div>
                  <div
                    class="absolute inset-y-0 bg-gradient-to-r from-red-400 to-red-600 rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                    :style="{
                      left: (stats.total > 0 ? (stats.correct / stats.total * 100) : 0) + '%',
                      width: (stats.total > 0 ? (stats.wrong / stats.total * 100) : 0) + '%'
                    }"
                  >
                    <span v-if="stats.wrong > 0" class="text-white text-xs font-bold">✗ {{ stats.wrong }}</span>
                  </div>
                </div>
                <div class="flex items-center justify-between mt-2 text-xs text-gray-600">
                  <span>未练习: {{ stats.total - stats.correct - stats.wrong }}</span>
                  <span>总计: {{ stats.total }} 题</span>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="flex flex-wrap gap-4">
                <button
                  @click="startPractice"
                  class="flex-1 min-w-[200px] bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <span>📝</span>
                  <span>开始练习</span>
                </button>

                <button
                  v-if="keyPointsList.length > 0"
                  @click="startFlashcardMode"
                  class="flex-1 min-w-[200px] bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <span>🎴</span>
                  <span>卡片复习</span>
                </button>

                <button
                  v-if="stats.wrong > 0"
                  @click="viewWrongQuestions"
                  class="flex-1 min-w-[200px] bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <span>❌</span>
                  <span>查看错题 ({{ stats.wrong }})</span>
                </button>
              </div>
            </div>
          </div>

          <!-- 未选择知识点时的提示 -->
          <div v-else class="bg-white rounded-xl shadow-md p-12 text-center">
            <div class="text-6xl mb-4">📚</div>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">选择知识点</h3>
            <p class="text-gray-600">请从左侧选择一个知识点查看详细内容</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 卡片复习模式弹窗 -->
    <div
      v-if="flashcardMode"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="closeFlashcardMode"
    >
      <div class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <!-- 头部 -->
        <div class="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-bold flex items-center gap-2">
              <span>🎴</span>
              <span>卡片复习模式</span>
            </h2>
            <button
              @click="closeFlashcardMode"
              class="text-white/80 hover:text-white text-2xl w-8 h-8 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span>{{ selectedCategory?.name }}</span>
            <span>{{ currentFlashcardIndex + 1 }} / {{ keyPointsList.length }}</span>
          </div>
          <div class="mt-2 bg-white/20 rounded-full h-2">
            <div
              class="bg-white h-2 rounded-full transition-all duration-300"
              :style="{ width: ((currentFlashcardIndex + 1) / keyPointsList.length * 100) + '%' }"
            ></div>
          </div>
        </div>

        <!-- 卡片内容 -->
        <div class="p-8">
          <div
            v-if="keyPointsList[currentFlashcardIndex]"
            class="min-h-[400px] flex flex-col"
          >
            <!-- 卡片翻转区域 -->
            <div
              class="flex-1 cursor-pointer perspective-1000"
              @click="flipCard"
            >
              <div
                :class="[
                  'relative w-full h-full transition-transform duration-500 transform-style-3d',
                  cardFlipped ? 'rotate-y-180' : ''
                ]"
              >
                <!-- 正面 - 问题 -->
                <div
                  :class="[
                    'absolute inset-0 backface-hidden bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-300 p-8 flex flex-col items-center justify-center',
                    cardFlipped ? 'invisible' : 'visible'
                  ]"
                >
                  <div class="text-6xl mb-6">🤔</div>
                  <h3 class="text-3xl font-bold text-gray-900 text-center mb-4">
                    {{ keyPointsList[currentFlashcardIndex].title }}
                  </h3>
                  <p class="text-gray-500 text-sm">点击卡片查看详情</p>
                </div>

                <!-- 背面 - 答案 -->
                <div
                  :class="[
                    'absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-xl border-2 border-purple-300 p-8 overflow-y-auto',
                    cardFlipped ? 'visible' : 'invisible'
                  ]"
                >
                  <div class="text-4xl mb-4">💡</div>
                  <h3 class="text-2xl font-bold text-gray-900 mb-4">
                    {{ keyPointsList[currentFlashcardIndex].title }}
                  </h3>
                  <p class="text-gray-700 leading-relaxed whitespace-pre-line mb-6">
                    {{ keyPointsList[currentFlashcardIndex].description }}
                  </p>

                  <div v-if="keyPointsList[currentFlashcardIndex].examples?.length > 0" class="mb-4">
                    <h4 class="font-semibold text-gray-900 mb-2">💡 示例：</h4>
                    <div class="space-y-2">
                      <div
                        v-for="(example, idx) in keyPointsList[currentFlashcardIndex].examples"
                        :key="idx"
                        class="bg-amber-50 border-l-4 border-amber-400 px-4 py-2 rounded-r-lg text-sm"
                      >
                        {{ example }}
                      </div>
                    </div>
                  </div>

                  <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div class="flex items-start gap-2">
                      <span class="text-xl">🧠</span>
                      <div class="flex-1">
                        <div class="font-semibold text-gray-900 mb-1">记忆技巧</div>
                        <div class="text-sm text-gray-700">
                          {{ getMemoryTip(keyPointsList[currentFlashcardIndex].title, currentFlashcardIndex) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 控制按钮 -->
            <div class="mt-6 flex items-center justify-between gap-4">
              <button
                @click="previousCard"
                :disabled="currentFlashcardIndex === 0"
                :class="[
                  'px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2',
                  currentFlashcardIndex === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                ]"
              >
                <span>←</span>
                <span>上一个</span>
              </button>

              <div class="flex gap-2">
                <button
                  @click="markAsNotMastered"
                  class="px-4 py-3 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-all"
                >
                  ❌ 未掌握
                </button>
                <button
                  @click="markAsMastered"
                  class="px-4 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all"
                >
                  ✓ 已掌握
                </button>
              </div>

              <button
                @click="nextCard"
                :disabled="currentFlashcardIndex >= keyPointsList.length - 1"
                :class="[
                  'px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2',
                  currentFlashcardIndex >= keyPointsList.length - 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                ]"
              >
                <span>下一个</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'exam',
  middleware: ['exam-access' as any]
})

import { ref, computed, onMounted } from 'vue'
import { useExamStore } from '~/stores/exam'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'

const examStore = useExamStore()
const authStore = useAuthStore()
const router = useRouter()

const loading = ref(true)
const categories = ref<any[]>([])
const selectedCategory = ref<any>(null)
const searchQuery = ref('')
const expandedPoints = ref(new Set<number>())
const masteredPoints = ref(new Set<number>())
const pointRefs = ref<any[]>([])
const categoryStatsMap = ref(new Map<string, any>())
const stats = ref({
  correct: 0,
  wrong: 0,
  total: 0
})

// 卡片复习模式
const flashcardMode = ref(false)
const currentFlashcardIndex = ref(0)
const cardFlipped = ref(false)

// 解析核心知识要点
const keyPointsList = computed(() => {
  if (!selectedCategory.value?.keyPoints) return []

  try {
    const parsed = JSON.parse(selectedCategory.value.keyPoints)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    return []
  }
})

// 过滤后的分类列表
const filteredCategories = computed(() => {
  if (!searchQuery.value.trim()) {
    return categories.value
  }

  const query = searchQuery.value.toLowerCase()
  return categories.value.filter(cat =>
    cat.name.toLowerCase().includes(query) ||
    cat.nameEn?.toLowerCase().includes(query) ||
    cat.description?.toLowerCase().includes(query)
  )
})

// 总题目数
const totalQuestions = computed(() => {
  return categories.value.reduce((sum, cat) => sum + (cat.questionCount || 0), 0)
})

// 整体掌握度
const overallMasteryRate = computed(() => {
  if (categories.value.length === 0) return 0

  let totalQuestions = 0
  let correctQuestions = 0

  categoryStatsMap.value.forEach((stat) => {
    totalQuestions += stat.total || 0
    correctQuestions += stat.correct || 0
  })

  if (totalQuestions === 0) return 0
  return Math.round((correctQuestions / totalQuestions) * 100)
})

// 获取分类掌握度
const getCategoryMastery = (category: any) => {
  const stat = categoryStatsMap.value.get(category.id)
  if (!stat || !stat.total) return 0
  return Math.round((stat.correct / stat.total) * 100)
}

// 切换知识要点展开/折叠
const toggleKeyPoint = (index: number) => {
  if (expandedPoints.value.has(index)) {
    expandedPoints.value.delete(index)
  } else {
    expandedPoints.value.add(index)
  }
}

// 全部展开
const expandAll = () => {
  keyPointsList.value.forEach((_, index) => {
    expandedPoints.value.add(index)
  })
}

// 全部收起
const collapseAll = () => {
  expandedPoints.value.clear()
}

// 切换已掌握状态
const toggleMastered = (index: number) => {
  const key = `${selectedCategory.value.id}-${index}`
  if (masteredPoints.value.has(index)) {
    masteredPoints.value.delete(index)
    localStorage.removeItem(`mastered-${key}`)
  } else {
    masteredPoints.value.add(index)
    localStorage.setItem(`mastered-${key}`, 'true')
  }
}

// 滚动到指定知识点
const scrollToPoint = (index: number) => {
  if (!expandedPoints.value.has(index)) {
    expandedPoints.value.add(index)
  }
  setTimeout(() => {
    pointRefs.value[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 100)
}

// 获取记忆提示
const getMemoryTip = (title: string, index: number) => {
  const tips: Record<string, string> = {
    '四诊合参': '记住"望闻问切"四字诀，望神色、闻声息、问症状、切脉象，四诊结合才能准确辨证',
    '舌诊要点': '舌质看虚实寒热，舌苔看邪气盛衰。红为热、淡为虚、紫为瘀',
    '脉诊要点': '寸关尺三部定位：寸候上焦、关候中焦、尺候下焦。浮沉迟数是基础',
    '辨证论治': '辨证是前提，论治是关键。同病异治、异病同治是核心思想',
    '中医病名诊断': '八纲辨证（阴阳表里寒热虚实）是基础，脏腑辨证是核心',
    '证型辨别': '证是疾病某一阶段的病理概括，包括病位、病性、病势',
    '西医诊断基础': '中西医结合，了解常见疾病的西医病名和诊断标准',
    '循经取穴原则': '哪条经络病变就选该经络上的穴位，如胃病选足阳明胃经穴位',
    '辨证配穴方法': '根据辨证结果选择相应穴位，如气虚补气海、血虚补血海',
    '特定穴应用': '五输穴、原穴、络穴、郄穴、背俞穴、募穴等都有特殊治疗作用',
    '远近配穴原则': '局部取穴+远端取穴，如头痛取头部穴位配合四肢穴位',
    '对症选穴方法': '根据主要症状选穴，如失眠选神门、安眠穴',
    '穴位定位方法': '骨度分寸法、体表标志法、指寸法是三大定位方法',
    '针刺角度与深度': '直刺、斜刺、横刺根据穴位部位和治疗需要选择',
    '针刺手法': '提插、捻转是基本手法，补法宜轻缓，泻法宜重快',
    '得气判断': '医者感觉针下沉紧，患者感觉酸麻胀重，说明得气',
    '留针与出针': '一般留针20-30分钟，出针时按压针孔防止出血',
    '灸法应用': '艾灸温阳散寒，适用于虚寒证。化脓灸、温和灸、隔物灸各有特点',
    '拔罐疗法': '拔罐祛风散寒、行气活血，常用于痹证、感冒',
    '电针应用': '电针加强刺激，适用于镇痛、肌肉萎缩',
    '耳穴疗法': '耳为宗脉所聚，全身脏腑在耳郭都有反应点',
    '推拿手法': '推、拿、按、摩、揉、搓、滚、捻等手法各有特点',
    '性味归经': '四气五味功用不同，归经决定作用部位',
    '方剂组成': '君臣佐使配伍，君药主治、臣药辅助、佐药监制、使药引导',
    '常用方剂': '掌握经方、时方的组成、功用、主治',
    '配伍禁忌': '"十八反"、"十九畏"必须牢记',
    '剂量与煎服': '剂量影响疗效，煎煮方法影响药效发挥',
    '职业道德': '以患者为中心，诚信行医是医者根本',
    '知情同意': '治疗前须告知风险、获得患者同意',
    '感染控制': '一针一用，严格消毒，防止交叉感染',
    '急救处理': '晕针、滞针、断针的预防和处理必须掌握',
    '医疗记录': '详细记录诊疗过程，保护医患双方权益',
    '执业范围': '了解针灸师执业范围和限制',
    '法律法规': '遵守所在地区的中医药法律法规'
  }

  return tips[title] || `重点理解"${title}"的核心概念，结合实例记忆，定期复习巩固`
}

// 加载知识点列表
const loadKnowledgePoints = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/knowledge-points/list', {
      headers: authStore.getAuthHeader(),
      params: {
        examType: examStore.currentExamType
      }
    })

    if (response.success) {
      categories.value = response.data

      // 预加载所有分类的统计数据
      await Promise.all(
        categories.value.map(async (cat) => {
          await loadCategoryStats(cat.id)
        })
      )

      // 默认选中第一个分类
      if (categories.value.length > 0) {
        selectedCategory.value = categories.value[0]
        loadMasteredState()
      }
    }
  } catch (error) {
    console.error('加载知识点失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载分类统计信息
const loadCategoryStats = async (categoryId: string) => {
  try {
    const response = await $fetch('/api/knowledge-points/stats', {
      headers: authStore.getAuthHeader(),
      params: {
        categoryId,
        examType: examStore.currentExamType
      }
    })

    if (response.success) {
      categoryStatsMap.value.set(categoryId, response.data)

      // 如果是当前选中的分类，更新stats
      if (selectedCategory.value?.id === categoryId) {
        stats.value = response.data
      }
    }
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

// 加载已掌握状态
const loadMasteredState = () => {
  if (!selectedCategory.value) return

  masteredPoints.value.clear()
  keyPointsList.value.forEach((_, index) => {
    const key = `${selectedCategory.value.id}-${index}`
    if (localStorage.getItem(`mastered-${key}`)) {
      masteredPoints.value.add(index)
    }
  })
}

// 监听分类选择变化
watch(selectedCategory, async (newCat) => {
  if (newCat) {
    expandedPoints.value.clear()
    loadMasteredState()

    // 更新当前统计
    const stat = categoryStatsMap.value.get(newCat.id)
    if (stat) {
      stats.value = stat
    } else {
      await loadCategoryStats(newCat.id)
    }
  }
})

// 开始练习
const startPractice = () => {
  router.push(`/practice?category=${selectedCategory.value.id}`)
}

// 查看错题
const viewWrongQuestions = () => {
  router.push(`/wrong-questions?category=${selectedCategory.value.id}`)
}

// 卡片复习模式函数
const startFlashcardMode = () => {
  flashcardMode.value = true
  currentFlashcardIndex.value = 0
  cardFlipped.value = false
}

const closeFlashcardMode = () => {
  flashcardMode.value = false
  currentFlashcardIndex.value = 0
  cardFlipped.value = false
}

const flipCard = () => {
  cardFlipped.value = !cardFlipped.value
}

const nextCard = () => {
  if (currentFlashcardIndex.value < keyPointsList.value.length - 1) {
    currentFlashcardIndex.value++
    cardFlipped.value = false
  }
}

const previousCard = () => {
  if (currentFlashcardIndex.value > 0) {
    currentFlashcardIndex.value--
    cardFlipped.value = false
  }
}

const markAsMastered = () => {
  toggleMastered(currentFlashcardIndex.value)
  if (currentFlashcardIndex.value < keyPointsList.value.length - 1) {
    nextCard()
  }
}

const markAsNotMastered = () => {
  const key = `${selectedCategory.value.id}-${currentFlashcardIndex.value}`
  masteredPoints.value.delete(currentFlashcardIndex.value)
  localStorage.removeItem(`mastered-${key}`)
  if (currentFlashcardIndex.value < keyPointsList.value.length - 1) {
    nextCard()
  }
}

onMounted(() => {
  loadKnowledgePoints()
})
</script>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}

.transform-style-3d {
  transform-style: preserve-3d;
}

.backface-hidden {
  backface-visibility: hidden;
}

.rotate-y-180 {
  transform: rotateY(180deg);
}
</style>
