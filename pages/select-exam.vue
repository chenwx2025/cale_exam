<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- 欢迎区域 -->
      <div class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          中医考试学习平台
        </h1>
        <p class="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
          专业的 CALE 和 NCCAOM 考试备考系统，助您顺利通过考试
        </p>
      </div>

      <!-- 消息提示 -->
      <Transition name="slide-fade">
        <div v-if="message" class="mb-8 max-w-2xl mx-auto">
          <div :class="[
            'p-4 rounded-xl flex items-center gap-3 shadow-lg',
            message.type === 'success' ? 'bg-green-50 text-green-800 border-2 border-green-200' : 'bg-red-50 text-red-800 border-2 border-red-200'
          ]">
            <svg v-if="message.type === 'success'" class="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <svg v-else class="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <span class="font-medium">{{ message.text }}</span>
          </div>
        </div>
      </Transition>

      <!-- 考试介绍卡片 -->
      <div class="grid lg:grid-cols-2 gap-8 mb-12">
        <!-- CALE 考试卡片 -->
        <div
          class="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
          :class="{ 'ring-4 ring-blue-400': hasExamSubscription('cale') }"
        >
          <!-- 卡片头部 -->
          <div class="relative bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-8 text-white overflow-hidden">
            <!-- 装饰圆圈 -->
            <div class="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
            <div class="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>

            <div class="relative z-10">
              <!-- 标签 -->
              <div class="flex items-center justify-between mb-6">
                <span class="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold tracking-wider">
                  CALE
                </span>
                <Transition name="scale">
                  <span v-if="hasExamSubscription('cale')" class="px-4 py-1.5 bg-green-500 rounded-full text-sm font-bold shadow-lg">
                    ✓ 已订阅
                  </span>
                </Transition>
              </div>

              <!-- 标题 -->
              <h2 class="text-3xl font-bold mb-2">加州中医执照考试</h2>
              <p class="text-blue-100 text-sm mb-4">California Acupuncture Licensing Examination</p>

              <!-- 特色标签 -->
              <div class="flex flex-wrap gap-2">
                <span class="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs">📚 海量题库</span>
                <span class="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs">🎯 真题模拟</span>
                <span class="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs">🤖 AI 辅助</span>
              </div>
            </div>
          </div>

          <!-- 考试公开信息 -->
          <div class="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-blue-100">
            <h3 class="text-sm font-bold text-gray-800 mb-3">考试信息</h3>
            <div class="space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">题目总数</span>
                <span class="font-bold text-blue-700">{{ examInfo.cale?.totalQuestions || 0 }} 题</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">知识点覆盖</span>
                <span class="font-bold text-blue-700">{{ examInfo.cale?.categories || 0 }} 个分类</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">难度分布</span>
                <span class="font-bold text-blue-700">基础/进阶/高级</span>
              </div>
            </div>
          </div>

          <!-- 用户统计数据区（仅已订阅用户可见） -->
          <div v-if="hasExamSubscription('cale')" class="p-6 bg-white border-b border-gray-100">
            <h3 class="text-sm font-bold text-gray-800 mb-3">我的学习数据</h3>
            <div class="grid grid-cols-3 gap-4">
              <div class="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <div class="text-2xl font-bold text-blue-600 mb-1">{{ examStats.cale?.studyPlans || 0 }}</div>
                <div class="text-xs text-gray-600">学习计划</div>
              </div>
              <div class="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <div class="text-2xl font-bold text-blue-600 mb-1">{{ examStats.cale?.exams || 0 }}</div>
                <div class="text-xs text-gray-600">模拟考试</div>
              </div>
              <div class="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <div class="text-2xl font-bold text-blue-600 mb-1">{{ examStats.cale?.wrongQuestions || 0 }}</div>
                <div class="text-xs text-gray-600">错题收藏</div>
              </div>
            </div>
          </div>

          <!-- 考试介绍 -->
          <div class="p-6 bg-gray-50">
            <h3 class="text-sm font-bold text-gray-800 mb-3">平台特色</h3>
            <div class="space-y-3">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-sm text-gray-700">覆盖加州中医执照考试全部知识点</p>
              </div>
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-sm text-gray-700">真题模拟练习，提升应试能力</p>
              </div>
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-sm text-gray-700">智能学习计划，科学备考</p>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="p-6">
            <div v-if="hasExamSubscription('cale')" class="flex gap-3">
              <button
                @click="selectExam('cale')"
                class="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
                进入学习中心
              </button>
              <button
                @click="unsubscribeExam('cale')"
                :disabled="loading"
                class="px-6 py-4 bg-white border-2 border-red-200 text-red-600 rounded-xl font-semibold hover:bg-red-50 hover:border-red-300 transition-all disabled:opacity-50"
                title="退订考试"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <button
              v-else
              @click="subscribeExam('cale')"
              :disabled="loading"
              class="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              {{ loading ? '订阅中...' : '立即订阅' }}
            </button>
          </div>
        </div>

        <!-- NCCAOM 考试卡片 -->
        <div
          class="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
          :class="{ 'ring-4 ring-purple-400': hasExamSubscription('nccaom') }"
        >
          <!-- 卡片头部 -->
          <div class="relative bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-8 text-white overflow-hidden">
            <!-- 装饰圆圈 -->
            <div class="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
            <div class="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>

            <div class="relative z-10">
              <!-- 标签 -->
              <div class="flex items-center justify-between mb-6">
                <span class="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold tracking-wider">
                  NCCAOM
                </span>
                <Transition name="scale">
                  <span v-if="hasExamSubscription('nccaom')" class="px-4 py-1.5 bg-green-500 rounded-full text-sm font-bold shadow-lg">
                    ✓ 已订阅
                  </span>
                </Transition>
              </div>

              <!-- 标题 -->
              <h2 class="text-3xl font-bold mb-2">全国中医针灸认证考试</h2>
              <p class="text-purple-100 text-sm mb-4">National Certification Commission for Acupuncture</p>

              <!-- 特色标签 -->
              <div class="flex flex-wrap gap-2">
                <span class="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs">📚 全面题库</span>
                <span class="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs">🎯 官方标准</span>
                <span class="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs">🤖 智能分析</span>
              </div>
            </div>
          </div>

          <!-- 考试公开信息 -->
          <div class="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-b border-purple-100">
            <h3 class="text-sm font-bold text-gray-800 mb-3">考试信息</h3>
            <div class="space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">题目总数</span>
                <span class="font-bold text-purple-700">{{ examInfo.nccaom?.totalQuestions || 0 }} 题</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">知识点覆盖</span>
                <span class="font-bold text-purple-700">{{ examInfo.nccaom?.categories || 0 }} 个分类</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">难度分布</span>
                <span class="font-bold text-purple-700">基础/进阶/高级</span>
              </div>
            </div>
          </div>

          <!-- 用户统计数据区（仅已订阅用户可见） -->
          <div v-if="hasExamSubscription('nccaom')" class="p-6 bg-white border-b border-gray-100">
            <h3 class="text-sm font-bold text-gray-800 mb-3">我的学习数据</h3>
            <div class="grid grid-cols-3 gap-4">
              <div class="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                <div class="text-2xl font-bold text-purple-600 mb-1">{{ examStats.nccaom?.studyPlans || 0 }}</div>
                <div class="text-xs text-gray-600">学习计划</div>
              </div>
              <div class="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                <div class="text-2xl font-bold text-purple-600 mb-1">{{ examStats.nccaom?.exams || 0 }}</div>
                <div class="text-xs text-gray-600">模拟考试</div>
              </div>
              <div class="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                <div class="text-2xl font-bold text-purple-600 mb-1">{{ examStats.nccaom?.wrongQuestions || 0 }}</div>
                <div class="text-xs text-gray-600">错题收藏</div>
              </div>
            </div>
          </div>

          <!-- 考试介绍 -->
          <div class="p-6 bg-gray-50">
            <h3 class="text-sm font-bold text-gray-800 mb-3">平台特色</h3>
            <div class="space-y-3">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-sm text-gray-700">全国中医针灸权威认证考试</p>
              </div>
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-sm text-gray-700">严格按照官方考试标准设计</p>
              </div>
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-sm text-gray-700">系统化学习，高效备考</p>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="p-6">
            <div v-if="hasExamSubscription('nccaom')" class="flex gap-3">
              <button
                @click="selectExam('nccaom')"
                class="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-bold hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
                进入学习中心
              </button>
              <button
                @click="unsubscribeExam('nccaom')"
                :disabled="loading"
                class="px-6 py-4 bg-white border-2 border-red-200 text-red-600 rounded-xl font-semibold hover:bg-red-50 hover:border-red-300 transition-all disabled:opacity-50"
                title="退订考试"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <button
              v-else
              @click="subscribeExam('nccaom')"
              :disabled="loading"
              class="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-bold hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              {{ loading ? '订阅中...' : '立即订阅' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 功能特色区域 -->
      <div v-if="hasAnySubscription" class="mb-12">
        <h3 class="text-2xl font-bold text-gray-900 text-center mb-8">平台核心功能</h3>
        <div class="grid md:grid-cols-3 gap-6">
          <div class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div class="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
            <h4 class="text-lg font-bold text-gray-900 mb-2">海量题库资源</h4>
            <p class="text-sm text-gray-600">覆盖所有知识点，真题模拟练习，助您全面备考</p>
          </div>

          <div class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div class="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-4 shadow-lg">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
              </svg>
            </div>
            <h4 class="text-lg font-bold text-gray-900 mb-2">AI 智能学习</h4>
            <p class="text-sm text-gray-600">AI 智能规划学习路径，科学高效备考</p>
          </div>

          <div class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div class="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <h4 class="text-lg font-bold text-gray-900 mb-2">数据智能分析</h4>
            <p class="text-sm text-gray-600">详细学习统计，针对性提升薄弱环节</p>
          </div>
        </div>
      </div>

      <!-- 提示信息 -->
      <div v-if="!hasAnySubscription" class="text-center">
        <div class="inline-flex items-center gap-2 px-6 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
          </svg>
          <span class="font-medium">请至少订阅一个考试类型，即可开始学习</span>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <footer class="bg-white border-t border-gray-200 mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p class="text-center text-gray-600">
          © 2025 Cale 加州中医考试系统 - 祝您考试顺利！
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import type { ExamType } from '~/stores/exam'

const authStore = useAuthStore()
const examStore = useExamStore()
const router = useRouter()

interface ExamStats {
  studyPlans: number
  exams: number
  wrongQuestions: number
  totalQuestions?: number
}

interface ExamInfo {
  totalQuestions: number
  categories: number
}

const examStats = ref<{
  cale: ExamStats | null
  nccaom: ExamStats | null
}>({
  cale: null,
  nccaom: null
})

const examInfo = ref<{
  cale: ExamInfo | null
  nccaom: ExamInfo | null
}>({
  cale: null,
  nccaom: null
})

const loading = ref(false)
const message = ref<{ type: 'success' | 'error', text: string } | null>(null)

const hasExamSubscription = (examType: ExamType) => {
  return authStore.user?.subscribedExams?.includes(examType) || false
}

const hasAnySubscription = computed(() => {
  return hasExamSubscription('cale') || hasExamSubscription('nccaom')
})

const selectExam = (examType: ExamType) => {
  examStore.setExamType(examType)
  router.push('/dashboard')
}

// 订阅考试
const subscribeExam = async (examType: ExamType) => {
  loading.value = true
  message.value = null

  try {
    const headers = authStore.getAuthHeader()
    const requestOptions: any = {
      method: 'POST',
      body: { examType }
    }

    if (headers.Authorization) {
      requestOptions.headers = { Authorization: headers.Authorization }
    }

    const response: any = await $fetch('/api/user/subscribe-exam', requestOptions)

    if (response.success) {
      message.value = {
        type: 'success',
        text: `🎉 成功订阅 ${examType.toUpperCase()} 考试！即可开始学习`
      }

      // 更新 authStore
      if (authStore.user && !authStore.user.subscribedExams.includes(examType)) {
        authStore.user.subscribedExams.push(examType)
        if (import.meta.client) {
          localStorage.setItem('user', JSON.stringify(authStore.user))
        }
      }

      // 加载该考试的统计数据
      await loadExamStats(examType)

      setTimeout(() => {
        message.value = null
      }, 3000)
    } else {
      message.value = {
        type: 'error',
        text: response.message || '订阅失败'
      }
    }
  } catch (error: any) {
    console.error('Subscribe exam error:', error)
    message.value = {
      type: 'error',
      text: error.data?.message || '订阅失败，请稍后重试'
    }
  } finally {
    loading.value = false
  }
}

// 退订考试
const unsubscribeExam = async (examType: ExamType) => {
  if (!confirm(`确定要退订 ${examType.toUpperCase()} 考试吗？\n\n退订后您的学习记录将被保留，但无法继续访问该考试的功能。`)) {
    return
  }

  loading.value = true
  message.value = null

  try {
    const headers = authStore.getAuthHeader()
    const requestOptions: any = {
      method: 'POST',
      body: { examType }
    }

    if (headers.Authorization) {
      requestOptions.headers = { Authorization: headers.Authorization }
    }

    const response: any = await $fetch('/api/user/unsubscribe-exam', requestOptions)

    if (response.success) {
      message.value = {
        type: 'success',
        text: `已成功退订 ${examType.toUpperCase()} 考试`
      }

      // 更新 authStore
      if (authStore.user && authStore.user.subscribedExams) {
        authStore.user.subscribedExams = authStore.user.subscribedExams.filter(
          (e: string) => e !== examType
        )
        if (import.meta.client) {
          localStorage.setItem('user', JSON.stringify(authStore.user))
        }
      }

      // 清除统计数据
      if (examType === 'cale') {
        examStats.value.cale = null
      } else {
        examStats.value.nccaom = null
      }

      setTimeout(() => {
        message.value = null
      }, 3000)
    } else {
      message.value = {
        type: 'error',
        text: response.message || '退订失败'
      }
    }
  } catch (error: any) {
    console.error('Unsubscribe exam error:', error)
    message.value = {
      type: 'error',
      text: error.data?.message || '退订失败，请稍后重试'
    }
  } finally {
    loading.value = false
  }
}

// 加载公共考试信息（所有用户可见）
const loadExamInfo = async (examType: ExamType) => {
  try {
    const headers = authStore.getAuthHeader()
    const requestOptions: any = {
      method: 'GET'
    }

    if (headers.Authorization) {
      requestOptions.headers = { Authorization: headers.Authorization }
    }

    const response = await $fetch<{
      success: boolean
      data: ExamStats
    }>(`/api/stats/exam-summary?examType=${examType}`, requestOptions)

    if (response.success && response.data) {
      const info: ExamInfo = {
        totalQuestions: response.data.totalQuestions || 0,
        categories: 8 // 暂时硬编码，后续可以从API获取
      }

      if (examType === 'cale') {
        examInfo.value.cale = info
      } else {
        examInfo.value.nccaom = info
      }
    }
  } catch (err) {
    console.error(`Failed to load ${examType} info:`, err)
  }
}

// 加载特定考试的统计数据（仅订阅用户）
const loadExamStats = async (examType: ExamType) => {
  try {
    const headers = authStore.getAuthHeader()
    const requestOptions: any = {
      method: 'GET'
    }

    if (headers.Authorization) {
      requestOptions.headers = { Authorization: headers.Authorization }
    }

    const response = await $fetch<{
      success: boolean
      data: ExamStats
    }>(`/api/stats/exam-summary?examType=${examType}`, requestOptions)

    if (response.success) {
      if (examType === 'cale') {
        examStats.value.cale = response.data
      } else {
        examStats.value.nccaom = response.data
      }
    }
  } catch (err) {
    console.error(`Failed to load ${examType} stats:`, err)
    // 使用默认值
    const defaultStats = {
      studyPlans: 0,
      exams: 0,
      wrongQuestions: 0
    }
    if (examType === 'cale') {
      examStats.value.cale = defaultStats
    } else {
      examStats.value.nccaom = defaultStats
    }
  }
}

// 加载统计数据
onMounted(async () => {
  try {
    // 加载公共考试信息（所有用户可见）
    await Promise.all([
      loadExamInfo('cale'),
      loadExamInfo('nccaom')
    ])

    // 加载用户订阅的考试统计数据
    if (hasExamSubscription('cale')) {
      await loadExamStats('cale')
    }

    if (hasExamSubscription('nccaom')) {
      await loadExamStats('nccaom')
    }
  } catch (error) {
    console.error('Failed to load exam data:', error)
  }
})
</script>

<style scoped>
/* 消息提示动画 */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from {
  transform: translateY(-10px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

/* 缩放动画 */
.scale-enter-active,
.scale-leave-active {
  transition: all 0.3s ease;
}

.scale-enter-from,
.scale-leave-to {
  transform: scale(0.8);
  opacity: 0;
}
</style>
