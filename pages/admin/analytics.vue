<template>
  <div class="p-6">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">数据分析</h1>
      <p class="mt-1 text-sm text-gray-600">系统使用情况和趋势分析</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="py-12 text-center">
      <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      <p class="mt-2 text-gray-600">加载中...</p>
    </div>

    <!-- 数据面板 -->
    <div v-else-if="analytics" class="space-y-6">
      <!-- 用户增长趋势 -->
      <div class="rounded-lg bg-white p-6 shadow-sm">
        <h2 class="mb-4 text-lg font-semibold text-gray-900">用户增长趋势（过去30天）</h2>
        <canvas ref="userGrowthChart"></canvas>
      </div>

      <!-- 每日活跃用户 -->
      <div class="rounded-lg bg-white p-6 shadow-sm">
        <h2 class="mb-4 text-lg font-semibold text-gray-900">每日活跃用户</h2>
        <canvas ref="dailyActiveChart"></canvas>
      </div>

      <!-- 题目分布 -->
      <div class="grid gap-6 md:grid-cols-2">
        <!-- 难度分布 -->
        <div class="rounded-lg bg-white p-6 shadow-sm">
          <h2 class="mb-4 text-lg font-semibold text-gray-900">题目难度分布</h2>
          <canvas ref="difficultyChart"></canvas>
        </div>

        <!-- 订阅分布 -->
        <div class="rounded-lg bg-white p-6 shadow-sm">
          <h2 class="mb-4 text-lg font-semibold text-gray-900">用户订阅分布</h2>
          <canvas ref="subscriptionChart"></canvas>
        </div>
      </div>

      <!-- 分类统计 -->
      <div class="rounded-lg bg-white p-6 shadow-sm">
        <h2 class="mb-4 text-lg font-semibold text-gray-900">题目数量最多的分类（Top 10）</h2>
        <canvas ref="categoryChart"></canvas>
      </div>

      <!-- 每日考试数量 -->
      <div class="rounded-lg bg-white p-6 shadow-sm">
        <h2 class="mb-4 text-lg font-semibold text-gray-900">每日考试数量</h2>
        <canvas ref="dailyExamChart"></canvas>
      </div>

      <!-- 管理员操作统计 -->
      <div class="rounded-lg bg-white p-6 shadow-sm">
        <h2 class="mb-4 text-lg font-semibold text-gray-900">管理员操作统计（过去30天）</h2>
        <canvas ref="adminActivityChart"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Chart, registerables } from 'chart.js'

// 注册 Chart.js 组件
Chart.register(...registerables)

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const loading = ref(true)
const analytics = ref<any>(null)

// Chart 引用
const userGrowthChart = ref<HTMLCanvasElement>()
const dailyActiveChart = ref<HTMLCanvasElement>()
const difficultyChart = ref<HTMLCanvasElement>()
const subscriptionChart = ref<HTMLCanvasElement>()
const categoryChart = ref<HTMLCanvasElement>()
const dailyExamChart = ref<HTMLCanvasElement>()
const adminActivityChart = ref<HTMLCanvasElement>()

// 加载数据
const loadAnalytics = async () => {
  loading.value = true
  try {
    const authStore = useAuthStore()
    const response = await $fetch('/api/admin/analytics', {
      headers: authStore.getAuthHeader()
    })
    console.log('Analytics API response:', response)
    analytics.value = response.data
    console.log('Analytics data set:', analytics.value)
  } catch (error: any) {
    console.error('Failed to load analytics:', error)
    alert('加载分析数据失败: ' + (error.data?.message || error.message))
  } finally {
    loading.value = false
    // 等待 loading 状态更新后 DOM 重新渲染
    await nextTick()
    console.log('Rendering charts...')
    renderCharts()
  }
}

// 存储图表实例
const chartInstances: Chart[] = []

// 渲染图表
const renderCharts = () => {
  if (!analytics.value) {
    console.log('No analytics data, skipping chart render')
    return
  }

  console.log('Analytics data available:', {
    userGrowth: analytics.value.userGrowth?.length,
    dailyActiveUsers: analytics.value.dailyActiveUsers?.length,
    difficultyDistribution: analytics.value.difficultyDistribution?.length,
    categoryStats: analytics.value.categoryStats?.length
  })

  // 销毁旧的图表实例
  chartInstances.forEach(chart => chart.destroy())
  chartInstances.length = 0

  // 1. 用户增长趋势
  if (userGrowthChart.value) {
    console.log('Creating user growth chart...')
    try {
      const chart = new Chart(userGrowthChart.value, {
        type: 'line',
        data: {
          labels: analytics.value.userGrowth.map((d: any) => d.date),
          datasets: [{
            label: '新注册用户',
            data: analytics.value.userGrowth.map((d: any) => Number(d.count)),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          }
        }
      })
      chartInstances.push(chart)
      console.log('User growth chart created successfully')
    } catch (error) {
      console.error('Error creating user growth chart:', error)
    }
  } else {
    console.log('userGrowthChart ref not found')
  }

  // 2. 每日活跃用户
  if (dailyActiveChart.value) {
    new Chart(dailyActiveChart.value, {
      type: 'bar',
      data: {
        labels: analytics.value.dailyActiveUsers.map((d: any) => d.date),
        datasets: [{
          label: '活跃用户数',
          data: analytics.value.dailyActiveUsers.map((d: any) => Number(d.count)),
          backgroundColor: 'rgba(139, 92, 246, 0.8)',
          borderColor: 'rgb(139, 92, 246)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    })
  }

  // 3. 难度分布
  if (difficultyChart.value) {
    const difficultyData = analytics.value.difficultyDistribution.reduce((acc: any, item: any) => {
      if (!acc[item.difficulty]) {
        acc[item.difficulty] = 0
      }
      acc[item.difficulty] += item._count.id
      return acc
    }, {})

    new Chart(difficultyChart.value, {
      type: 'doughnut',
      data: {
        labels: ['简单', '中等', '困难'],
        datasets: [{
          data: [
            difficultyData.easy || 0,
            difficultyData.medium || 0,
            difficultyData.hard || 0
          ],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(234, 179, 8, 0.8)',
            'rgba(239, 68, 68, 0.8)'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    })
  }

  // 4. 订阅分布
  if (subscriptionChart.value) {
    const subData = analytics.value.subscriptionStats.reduce((acc: any, item: any) => {
      const statusKey = item.isActive ? 'active' : 'inactive'
      const key = `${item.examType}_${statusKey}`
      acc[key] = item._count.id
      return acc
    }, {})

    new Chart(subscriptionChart.value, {
      type: 'pie',
      data: {
        labels: ['CALE 活跃', 'CALE 未激活', 'NCCAOM 活跃', 'NCCAOM 未激活'],
        datasets: [{
          data: [
            subData.cale_active || 0,
            subData.cale_inactive || 0,
            subData.nccaom_active || 0,
            subData.nccaom_inactive || 0
          ],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(156, 163, 175, 0.6)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(156, 163, 175, 0.6)'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    })
  }

  // 5. 分类统计
  if (categoryChart.value) {
    new Chart(categoryChart.value, {
      type: 'bar',
      data: {
        labels: analytics.value.categoryStats.map((c: any) => c.name),
        datasets: [{
          label: '题目数量',
          data: analytics.value.categoryStats.map((c: any) => c.questionCount),
          backgroundColor: analytics.value.categoryStats.map((c: any) =>
            c.examType === 'cale' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(139, 92, 246, 0.8)'
          ),
          borderWidth: 0
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    })
  }

  // 6. 每日考试数量
  if (dailyExamChart.value) {
    new Chart(dailyExamChart.value, {
      type: 'line',
      data: {
        labels: analytics.value.dailyExams.map((d: any) => d.date),
        datasets: [{
          label: '考试数量',
          data: analytics.value.dailyExams.map((d: any) => Number(d.count)),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    })
  }

  // 7. 管理员操作统计
  if (adminActivityChart.value) {
    const actionLabels: any = {
      create_user: '创建用户',
      update_user: '更新用户',
      create_question: '创建题目',
      update_question: '更新题目',
      delete_question: '删除题目',
      create_category: '创建分类',
      update_category: '更新分类',
      delete_category: '删除分类',
      import_questions: '批量导入'
    }

    new Chart(adminActivityChart.value, {
      type: 'bar',
      data: {
        labels: analytics.value.adminActivityStats.map((a: any) => actionLabels[a.action] || a.action),
        datasets: [{
          label: '操作次数',
          data: analytics.value.adminActivityStats.map((a: any) => a._count.id),
          backgroundColor: 'rgba(249, 115, 22, 0.8)',
          borderWidth: 0
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    })
  }
}

// 初始化
onMounted(() => {
  loadAnalytics()
})
</script>
